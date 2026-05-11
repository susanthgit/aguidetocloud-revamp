/**
 * functions/api/_cosmos-shared.js
 *
 * Shared auth + planet-semantics constants for cosmos-* endpoints.
 * Files prefixed with `_` are not auto-routed by Cloudflare Pages.
 *
 * Imported by:
 *   - functions/api/stats.js (handleRealtimeCosmos)
 *   - functions/api/cosmos-summary.js (nightly summary worker)
 */

// ── Auth ───────────────────────────────────────────────────────

export async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Constant-time string equality — defeats timing attacks on auth comparison.
export function timingSafeStrEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let acc = 0;
  for (let i = 0; i < a.length; i++) {
    acc |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return acc === 0;
}

// REJECTS pre-hashed Bearer values because the SHA-256 hash is embedded in
// the public /cc/list.html (line 502 — the existing CC password gate).
// Accepting hashes would let anyone scrape that public hex and replay it.
// Plaintext only → forces possession of the actual password.
export async function isAuthedAsAdmin(request, env) {
  if (!env.ADMIN_PASSWORD_HASH) return false;
  const auth = request.headers.get('Authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return false;
  const plaintext = m[1].trim();
  if (!plaintext) return false;
  const hash = await sha256Hex(plaintext);
  return timingSafeStrEqual(hash.toLowerCase(), env.ADMIN_PASSWORD_HASH.toLowerCase());
}

// ── JSON response with cosmos CORS ────────────────────────────

export function cosmosJsonRes(data, status = 200, cache = 'public, max-age=45') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': cache,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Vary': 'Authorization'
    }
  });
}

export function corsPreflight() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// ── Cosmos taxonomy (mirrors src/data/atlas.json + planet-semantics.json) ──

export const COSMOS_PLANETS = ['earth','guided','brainbar','shift','plainai','curriculum','agentic','claw','cosmos'];

export const COSMOS_PLANET_KINDS = {
  earth: 'planet', guided: 'moon', brainbar: 'planet', shift: 'planet',
  plainai: 'planet', curriculum: 'moon', agentic: 'planet', claw: 'planet',
  cosmos: 'hub'
};

// hostName → list of (pathPrefix, slug). Resolved in order. Last entry is the
// fallback (no prefix match → planet-level slug).
export const HOST_TO_PLANETS = {
  'www.aguidetocloud.com': [
    { prefix: '/guided/', slug: 'guided' },
    { prefix: '/',        slug: 'earth' }
  ],
  'aguidetocloud.com': [
    { prefix: '/guided/', slug: 'guided' },
    { prefix: '/',        slug: 'earth' }
  ],
  'plainai.aguidetocloud.com': [
    { prefix: '/learn',   slug: 'curriculum' },  // matches /learn AND /learn/* (post-A1-fix)
    { prefix: '/',        slug: 'plainai' }
  ],
  'cmd.aguidetocloud.com':    [{ prefix: '/', slug: 'brainbar' }],
  'shift.aguidetocloud.com':  [{ prefix: '/', slug: 'shift' }],
  'agents.aguidetocloud.com': [{ prefix: '/', slug: 'agentic' }],
  'claw.aguidetocloud.com':   [{ prefix: '/', slug: 'claw' }],
  'cosmos.aguidetocloud.com': [{ prefix: '/', slug: 'cosmos' }]
};

export function resolvePlanet(hostName, pagePath) {
  const rules = HOST_TO_PLANETS[hostName];
  if (!rules) return null;
  for (const r of rules) {
    if (pagePath === r.prefix.replace(/\/$/, '')) return r.slug;     // exact match
    if (pagePath.startsWith(r.prefix)) return r.slug;
  }
  return null;
}

// ── Planet semantics (per-planet success criteria + action modes) ──
// Bundled inline rather than reading planet-semantics.json at runtime so
// Pages Functions doesn't depend on filesystem (which varies in workers).
// Mirror of session-state/files/planet-semantics.json. Keep in sync.
export const PLANET_SEMANTICS = {
  earth:      { name:'Earth',               kind:'planet', actionMode:'editorial',
                bounceInterpretation:'default',
                goal:'Home base + discovery surface for the wider cosmos' },
  guided:     { name:'Guided',              kind:'moon',   parent:'earth', actionMode:'conversion',
                bounceInterpretation:'default',
                goal:'Cert-prep funnel — revenue surface' },
  brainbar:   { name:'Brain Bar',           kind:'planet', actionMode:'utility',
                bounceInterpretation:'single-answer visits are normal — high bounce is the success state',
                goal:'Microsoft jargon lookup utility' },
  shift:      { name:'Shift',               kind:'planet', actionMode:'editorial',
                bounceInterpretation:'default',
                goal:'Weekly newsletter — the wire' },
  plainai:    { name:'Plain AI',            kind:'planet', actionMode:'editorial',
                bounceInterpretation:'long single-page reads are good — high bounce with long engagement is success',
                goal:'AI in plain English — calm, slow reading surface' },
  curriculum: { name:'Plain AI Curriculum', kind:'moon',   parent:'plainai', actionMode:'commons',
                bounceInterpretation:'irrelevant — commons does not optimise for engagement',
                suppressGrowthPrompts:true, suppressConversionPrompts:true,
                goal:'Voluntary commons — free-forever lessons' },
  agentic:    { name:'Agentic',             kind:'planet', actionMode:'editorial',
                bounceInterpretation:'default',
                goal:'Technical reference cockpit for agent builders' },
  claw:       { name:'Claw',                kind:'planet', actionMode:'editorial',
                bounceInterpretation:'long single-page reads are good — reference reading is success',
                goal:'OpenClaw study reference' },
  cosmos:     { name:'Cosmos Atlas',        kind:'hub',    actionMode:'hub',
                bounceInterpretation:'default',
                goal:'Navigation hub — atlas of the universe' }
};

// ── NZT week boundary helpers ─────────────────────────────────

// Compute the last COMPLETE Mon–Sun week and the one before it, in
// Pacific/Auckland. Returns 4 ISO date strings (YYYY-MM-DD).
//
// Implementation note: we compute NZT "today" using Intl.DateTimeFormat
// with timeZone, then find the Monday of last complete week (i.e. the
// Monday before this week's Monday).
export function nztWeekRanges(now = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric', month: '2-digit', day: '2-digit',
    weekday: 'short'
  });
  const parts = fmt.formatToParts(now);
  const get = (t) => parts.find(p => p.type === t)?.value;
  const nztToday = `${get('year')}-${get('month')}-${get('day')}`; // 'YYYY-MM-DD' in NZT
  const wd = get('weekday'); // 'Mon'..'Sun'
  // Days since Monday (Mon=0..Sun=6) in NZT
  const wdMap = { Mon:0, Tue:1, Wed:2, Thu:3, Fri:4, Sat:5, Sun:6 };
  const daysSinceMon = wdMap[wd] ?? 0;
  // This week's Monday in NZT
  const [y, m, d] = nztToday.split('-').map(Number);
  // Use UTC math to subtract days, then format back
  const base = Date.UTC(y, m - 1, d);
  const lastCompleteSunday = new Date(base - (daysSinceMon + 1) * 86400000);
  const lastCompleteMonday = new Date(base - (daysSinceMon + 7) * 86400000);
  const prevWeekSunday     = new Date(base - (daysSinceMon + 8) * 86400000);
  const prevWeekMonday     = new Date(base - (daysSinceMon + 14) * 86400000);
  const iso = (d) => d.toISOString().split('T')[0];
  return {
    thisWeek: { start: iso(lastCompleteMonday), end: iso(lastCompleteSunday) },
    prevWeek: { start: iso(prevWeekMonday),     end: iso(prevWeekSunday) }
  };
}

// ── Generic throttled-parallel runner ─────────────────────────

// Run `tasks` (array of () => Promise) with at most `concurrency` in flight.
// Returns array of settled results in original order.
export async function throttled(tasks, concurrency = 3) {
  const results = new Array(tasks.length);
  let idx = 0;
  const workers = new Array(Math.min(concurrency, tasks.length)).fill(0).map(async () => {
    while (true) {
      const my = idx++;
      if (my >= tasks.length) return;
      try { results[my] = { ok: true, value: await tasks[my]() }; }
      catch (e) { results[my] = { ok: false, error: e?.message || String(e) }; }
    }
  });
  await Promise.all(workers);
  return results;
}
