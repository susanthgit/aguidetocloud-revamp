/**
 * GET /api/cosmos-summary — Cosmos-wide intelligence summary
 *
 * Gated. Auth: Authorization: Bearer <plaintext-cc-password>.
 * Caches result in KV (binding: COSMOS_SUMMARY_KV). Stale-while-revalidate.
 *
 * Returns a single JSON document with:
 *   - cosmos.{users,sessions,views,engagement_avg_sec,wow.*}  (last complete week vs previous, NZT Mon–Sun)
 *   - planets[]  (per-planet KPIs + 30d sparkline)
 *   - top_pages_engagement[]  (cosmos-wide star pages)
 *   - signals[]  (rule-based "things worth looking at" — confidence-gated)
 *   - generated_at, range, freshness_hours, warm_up
 *
 * Design notes (post-rubber-duck):
 *  - Conservative GA4 queries: only event-scoped dims + event-level metrics.
 *  - Throttled to 3 concurrent (avoids GA4 Data API 429s).
 *  - NZT Mon–Sun week boundaries via Intl.DateTimeFormat with timeZone.
 *  - Page identity = hostName + pagePath (avoids '/' ambiguity across planets).
 *  - Confidence gating: low-volume planets get "warming up", not 🔥/📉.
 *  - SWR: fresh (<24h) returns immediately. Stale (<36h) returns + waitUntil regen.
 *    Cold (no cache) returns 202 + spawn background regen.
 *  - Soft KV lock (summary:lock, 120s TTL) prevents duplicate regens on dashboard
 *    refresh storms.
 *  - planet-semantics bundled inline (no runtime FS read).
 */

import {
  isAuthedAsAdmin,
  cosmosJsonRes,
  corsPreflight,
  COSMOS_PLANETS,
  COSMOS_PLANET_KINDS,
  PLANET_SEMANTICS,
  nztWeekRanges,
  throttled,
  HOST_TO_PLANETS,
  resolvePlanet,
} from './_cosmos-shared.js';

const GA4_PROPERTY = '530486519';
const KV_KEY = 'summary:current';
const KV_LOCK = 'summary:lock';
const FRESH_HOURS = 24;
const STALE_HOURS = 36;
const LOCK_TTL_S = 120;
const GA4_CONCURRENCY = 3;

// ── GA4 service account auth (mirrors stats.js — kept simple) ──

function base64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function pemToArrayBuffer(pem) {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}
async function getServiceAccountToken(keyJson) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: keyJson.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600
  };
  const headerB64 = base64url(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64url(new TextEncoder().encode(JSON.stringify(payload)));
  const unsigned = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    'pkcs8', pemToArrayBuffer(keyJson.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${base64url(sig)}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  const data = await res.json();
  return data.access_token;
}

async function getToken(env) {
  const b64 = env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!b64) return null;
  try {
    return await getServiceAccountToken(JSON.parse(atob(b64)));
  } catch (e) { console.error('SA auth:', e.message); return null; }
}

async function ga4Report(token, body) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

function parseRows(res) {
  if (!res?.rows) return [];
  return res.rows.map(r => ({
    dims: (r.dimensionValues || []).map(d => d.value),
    metrics: (r.metricValues || []).map(m => parseFloat(m.value) || 0),
  }));
}

// ── Helpers ───────────────────────────────────────────────────

function pct(a, b) {
  if (!b) return null; // no previous-period base → no WoW
  return Math.round(((a - b) / b) * 1000) / 10; // 1 decimal
}

// Build a 30-day daily-zeros array indexed by date string.
function buildSpark30(rowsByDate, end) {
  const result = [];
  const endDate = new Date(end + 'T00:00:00Z');
  for (let i = 29; i >= 0; i--) {
    const d = new Date(endDate);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().split('T')[0].replace(/-/g, '');
    result.push(rowsByDate[key] || 0);
  }
  return result;
}

// ── GA4 query builders ────────────────────────────────────────

function qCosmosTotals(start, end) {
  return {
    dateRanges: [{ startDate: start, endDate: end }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'userEngagementDuration' }
    ]
  };
}

function qPerPlanetWeekTotals(start, end) {
  return {
    dateRanges: [{ startDate: start, endDate: end }],
    dimensions: [{ name: 'customEvent:cosmos_planet' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'userEngagementDuration' }
    ],
    limit: 50
  };
}

function qPerPlanetDailySpark(start, end) {
  // 30-day daily series per planet. May return many rows (30 * 9 = ~270 max).
  return {
    dateRanges: [{ startDate: start, endDate: end }],
    dimensions: [
      { name: 'customEvent:cosmos_planet' },
      { name: 'date' }
    ],
    metrics: [{ name: 'activeUsers' }],
    limit: 1000
  };
}

function qTopPagesByEngagement(start, end) {
  // hostName + pagePath disambiguates '/' across planets.
  // No customEvent:cosmos_planet — we resolve planet client-side from hostName+path.
  return {
    dateRanges: [{ startDate: start, endDate: end }],
    dimensions: [
      { name: 'hostName' },
      { name: 'pagePath' }
    ],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'activeUsers' },
      { name: 'userEngagementDuration' }
    ],
    orderBys: [{ metric: { metricName: 'userEngagementDuration' }, desc: true }],
    limit: 40
  };
}

// ── Signals engine ────────────────────────────────────────────

function buildSignals(planets, topPages) {
  const signals = [];

  // Growth (🔥): only when meaningful volume on both periods
  for (const p of planets) {
    if (p.users_week >= 50 && p.users_prev_week >= 20 && p.wow_pct !== null && p.wow_pct > 25) {
      signals.push({
        type: 'growth',
        planet: p.slug,
        planet_name: p.name,
        headline: `${p.name} grew ${p.wow_pct.toFixed(1)}% WoW (${p.users_prev_week}→${p.users_week} users)`,
        metric: 'users_wow',
        confidence: 'high',
        action_mode: p.action_mode,
        suggestion: 'What shipped in the last 14 days? Worth a closer look at top entry pages.'
      });
    }
  }

  // Drop (📉): planet had meaningful volume last week + dropped >15%
  for (const p of planets) {
    if (p.users_prev_week >= 50 && p.wow_pct !== null && p.wow_pct < -15) {
      signals.push({
        type: 'drop',
        planet: p.slug,
        planet_name: p.name,
        headline: `${p.name} dropped ${Math.abs(p.wow_pct).toFixed(1)}% WoW (${p.users_prev_week}→${p.users_week} users)`,
        metric: 'users_wow',
        confidence: p.users_prev_week >= 200 ? 'high' : 'medium',
        action_mode: p.action_mode,
        suggestion: 'Check Search Console for query drops + recent commits to this planet.'
      });
    }
  }

  // Quiet (😴): live planet with <10 weekly users, unless it's commons mode
  for (const p of planets) {
    if (p.users_week < 10 && p.action_mode !== 'commons' && p.action_mode !== 'hub') {
      signals.push({
        type: 'quiet',
        planet: p.slug,
        planet_name: p.name,
        headline: `${p.name} has ${p.users_week} weekly users`,
        metric: 'users_week',
        confidence: 'medium',
        action_mode: p.action_mode,
        suggestion: 'Either needs marketing/links from Earth, or content is too narrow. Note: low confidence if cosmos_planet dimension is still warming up.'
      });
    }
  }

  // Star pages (🌟): top 3 by engagement-per-user where views are meaningful
  const scored = topPages
    .filter(tp => tp.views >= 50 && tp.users >= 30)
    .map(tp => ({
      ...tp,
      avg_engagement_sec: tp.users > 0 ? Math.round(tp.user_engagement_duration / tp.users) : 0
    }))
    .filter(tp => tp.avg_engagement_sec >= 30)
    .sort((a, b) => b.avg_engagement_sec - a.avg_engagement_sec)
    .slice(0, 3);
  for (const sp of scored) {
    signals.push({
      type: 'star_page',
      planet: sp.planet || 'unknown',
      planet_name: (PLANET_SEMANTICS[sp.planet]?.name) || sp.planet,
      headline: `${sp.path} (${sp.host}) — ${sp.avg_engagement_sec}s avg engagement, ${sp.users} users`,
      metric: 'engagement_per_user',
      confidence: 'high',
      action_mode: PLANET_SEMANTICS[sp.planet]?.actionMode || 'editorial',
      suggestion: 'What pattern made this work? Replicate the structure on sister pages.'
    });
  }

  // Cap at 8 — keep dashboard scannable
  return signals.slice(0, 8);
}

// ── Summary builder ───────────────────────────────────────────

async function buildSummary(env) {
  const token = await getToken(env);
  if (!token) return { error: 'no-ga4-auth', generated_at: new Date().toISOString() };

  const { thisWeek, prevWeek } = nztWeekRanges();
  const thirtyDaysAgoStr = (() => {
    const d = new Date(Date.parse(thisWeek.end));
    d.setUTCDate(d.getUTCDate() - 29);
    return d.toISOString().split('T')[0];
  })();

  // Throttled queries (max 3 in flight) — avoids GA4 concurrency 429s
  const tasks = [
    () => ga4Report(token, qCosmosTotals(thisWeek.start, thisWeek.end)),       // 0
    () => ga4Report(token, qCosmosTotals(prevWeek.start, prevWeek.end)),       // 1
    () => ga4Report(token, qPerPlanetWeekTotals(thisWeek.start, thisWeek.end)),// 2
    () => ga4Report(token, qPerPlanetWeekTotals(prevWeek.start, prevWeek.end)),// 3
    () => ga4Report(token, qPerPlanetDailySpark(thirtyDaysAgoStr, thisWeek.end)),// 4
    () => ga4Report(token, qTopPagesByEngagement(thisWeek.start, thisWeek.end)),// 5
  ];

  const results = await throttled(tasks, GA4_CONCURRENCY);

  const cosmosNow = results[0].ok ? parseRows(results[0].value)[0] : null;
  const cosmosPrev = results[1].ok ? parseRows(results[1].value)[0] : null;
  const perPlanetNow = results[2].ok ? parseRows(results[2].value) : [];
  const perPlanetPrev = results[3].ok ? parseRows(results[3].value) : [];
  const perPlanetDaily = results[4].ok ? parseRows(results[4].value) : [];
  const topPagesRaw = results[5].ok ? parseRows(results[5].value) : [];

  // ── Cosmos totals + WoW ──
  const cosmos = (() => {
    const m = (r, i) => r ? r.metrics[i] || 0 : 0;
    const users_week = m(cosmosNow, 0);
    const sessions_week = m(cosmosNow, 1);
    const views_week = m(cosmosNow, 2);
    const eng_dur_week = m(cosmosNow, 3);
    const users_prev = m(cosmosPrev, 0);
    const sessions_prev = m(cosmosPrev, 1);
    const views_prev = m(cosmosPrev, 2);
    const eng_dur_prev = m(cosmosPrev, 3);
    return {
      users_week,
      sessions_week,
      views_week,
      engagement_avg_sec: users_week > 0 ? Math.round(eng_dur_week / users_week) : 0,
      wow: {
        users_pct:    pct(users_week, users_prev),
        sessions_pct: pct(sessions_week, sessions_prev),
        views_pct:    pct(views_week, views_prev),
        engagement_avg_pct: users_week > 0 && users_prev > 0
          ? pct(eng_dur_week / users_week, eng_dur_prev / users_prev)
          : null
      }
    };
  })();

  // ── Per-planet aggregation ──
  const planetMap = {};
  for (const slug of COSMOS_PLANETS) {
    const s = PLANET_SEMANTICS[slug];
    planetMap[slug] = {
      slug,
      name: s.name,
      kind: COSMOS_PLANET_KINDS[slug] || 'planet',
      action_mode: s.actionMode,
      bounce_interpretation: s.bounceInterpretation || 'default',
      goal: s.goal,
      users_week: 0, sessions_week: 0, views_week: 0, user_engagement_duration_week: 0,
      users_prev_week: 0,
      wow_pct: null,
      engagement_avg_sec: 0,
      spark: new Array(30).fill(0)
    };
  }
  for (const row of perPlanetNow) {
    const slug = (row.dims[0] || '').trim();
    if (!planetMap[slug]) continue;
    planetMap[slug].users_week = row.metrics[0];
    planetMap[slug].sessions_week = row.metrics[1];
    planetMap[slug].views_week = row.metrics[2];
    planetMap[slug].user_engagement_duration_week = row.metrics[3];
    planetMap[slug].engagement_avg_sec = row.metrics[0] > 0
      ? Math.round(row.metrics[3] / row.metrics[0]) : 0;
  }
  for (const row of perPlanetPrev) {
    const slug = (row.dims[0] || '').trim();
    if (!planetMap[slug]) continue;
    planetMap[slug].users_prev_week = row.metrics[0];
    planetMap[slug].wow_pct = pct(planetMap[slug].users_week, row.metrics[0]);
  }
  // Sparkline: bucket by date
  const sparkByPlanet = {};
  for (const row of perPlanetDaily) {
    const slug = (row.dims[0] || '').trim();
    const date = row.dims[1] || ''; // YYYYMMDD
    if (!planetMap[slug] || !date) continue;
    sparkByPlanet[slug] = sparkByPlanet[slug] || {};
    sparkByPlanet[slug][date] = row.metrics[0];
  }
  for (const slug of COSMOS_PLANETS) {
    planetMap[slug].spark = buildSpark30(sparkByPlanet[slug] || {}, thisWeek.end);
  }

  // ── Top pages (cosmos-wide, by avg engagement) ──
  const topPages = topPagesRaw
    .map(row => {
      const host = row.dims[0] || '';
      const path = row.dims[1] || '/';
      const planet = resolvePlanet(host, path);
      return {
        host, path, planet,
        views: row.metrics[0],
        users: row.metrics[1],
        user_engagement_duration: row.metrics[2]
      };
    })
    .filter(p => p.planet) // drop unmappable
    .slice(0, 25);

  // ── Signals (rule-based, confidence-gated) ──
  const planetsArray = COSMOS_PLANETS.map(s => planetMap[s])
    .sort((a, b) => b.users_week - a.users_week);
  const signals = buildSignals(planetsArray, topPages);

  // ── Warm-up state: if cosmos-wide users for the week is below this floor
  //    OR all planets have <10 users, we're still in the GA4 dimension
  //    propagation window (first 48-72h after dimension registration).
  const warmUp = cosmos.users_week < 50 ||
    planetsArray.every(p => p.users_week < 10);

  return {
    generated_at: new Date().toISOString(),
    range: {
      this_week: thisWeek,
      prev_week: prevWeek,
      thirty_day_start: thirtyDaysAgoStr,
      thirty_day_end: thisWeek.end
    },
    warm_up: warmUp,
    cosmos,
    planets: planetsArray,
    top_pages_engagement: topPages,
    signals,
    query_errors: results.filter(r => !r.ok).map(r => r.error)
  };
}

async function buildAndStore(env) {
  try {
    const summary = await buildSummary(env);
    if (env.COSMOS_SUMMARY_KV) {
      // 30-day TTL: lets stale fallback work; app uses generated_at for freshness
      await env.COSMOS_SUMMARY_KV.put(KV_KEY, JSON.stringify(summary), { expirationTtl: 60 * 60 * 24 * 30 });
      await env.COSMOS_SUMMARY_KV.delete(KV_LOCK);
    }
    return summary;
  } catch (e) {
    console.error('buildAndStore failed:', e?.message || e);
    if (env.COSMOS_SUMMARY_KV) await env.COSMOS_SUMMARY_KV.delete(KV_LOCK);
    throw e;
  }
}

// ── HTTP handlers ─────────────────────────────────────────────

export async function onRequestGet(context) {
  const { request, env } = context;

  if (!(await isAuthedAsAdmin(request, env))) {
    return cosmosJsonRes({ error: 'Unauthorized' }, 401, 'no-cache');
  }

  const kv = env.COSMOS_SUMMARY_KV;
  if (!kv) {
    return cosmosJsonRes({ error: 'KV not bound (COSMOS_SUMMARY_KV)' }, 500, 'no-cache');
  }

  // Force refresh: ?refresh=1 (synchronous, for debugging)
  const url = new URL(request.url);
  if (url.searchParams.get('refresh') === '1') {
    try {
      const summary = await buildSummary(env);
      await kv.put(KV_KEY, JSON.stringify(summary), { expirationTtl: 60 * 60 * 24 * 30 });
      return cosmosJsonRes(summary, 200, 'no-cache');
    } catch (e) {
      return cosmosJsonRes({ error: 'build-failed', message: e?.message }, 500, 'no-cache');
    }
  }

  const raw = await kv.get(KV_KEY, 'json');
  const now = Date.now();
  const ageH = raw?.generated_at
    ? (now - Date.parse(raw.generated_at)) / 3.6e6
    : Infinity;

  // Fresh — return as-is, with shorter browser cache (data refreshes daily)
  if (raw && ageH < FRESH_HOURS) {
    return cosmosJsonRes({ ...raw, freshness_hours: Math.round(ageH), stale: false }, 200, 'public, max-age=1800');
  }

  // Stale-but-readable — return + revalidate in background
  if (raw && ageH < STALE_HOURS) {
    const lock = await kv.get(KV_LOCK);
    if (!lock) {
      await kv.put(KV_LOCK, String(Date.now()), { expirationTtl: LOCK_TTL_S });
      context.waitUntil(buildAndStore(env));
    }
    return cosmosJsonRes({ ...raw, freshness_hours: Math.round(ageH), stale: true, regenerating: !lock }, 200, 'no-cache');
  }

  // No cache or very stale — try to regen
  const lock = await kv.get(KV_LOCK);
  if (lock && raw) {
    return cosmosJsonRes({ ...raw, freshness_hours: Math.round(ageH), stale: true, regenerating: true }, 200, 'no-cache');
  }

  if (!lock) {
    await kv.put(KV_LOCK, String(Date.now()), { expirationTtl: LOCK_TTL_S });
    context.waitUntil(buildAndStore(env));
  }

  return cosmosJsonRes(
    {
      status: 'generating',
      message: 'Building first cosmos summary in background. Refresh in 30-60s.',
      generated_at: null
    },
    202,
    'no-cache'
  );
}

export async function onRequestOptions() {
  return corsPreflight();
}
