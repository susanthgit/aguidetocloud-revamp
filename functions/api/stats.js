/**
 * GET /api/stats — Cloudflare Pages Function
 * Ported from Azure Function. Uses direct fetch() to Google APIs
 * instead of the googleapis npm package (too heavy for CF Workers).
 *
 * Auth: Google Service Account JWT (Web Crypto API) + YouTube OAuth2 refresh.
 * Env vars: GOOGLE_SERVICE_ACCOUNT_KEY, GA4_PROPERTY_ID,
 *           YOUTUBE_API_KEY, YOUTUBE_OAUTH_CLIENT_ID,
 *           YOUTUBE_OAUTH_CLIENT_SECRET, YOUTUBE_OAUTH_REFRESH_TOKEN
 */

const GA4_PROPERTY = '530486519';
const GSC_SITE = 'https://www.aguidetocloud.com/';
const INCEPTION_DATE = '2026-03-30';
const MAIN_CH = 'UCYN12Rlv9hgZlWJa1XPfdyg';
const BITES_CH = 'UCg8OCdG1yeiSPFDyqQDxHnw';

const cacheStore = {};
const CACHE_TTL = 300000;

// ── Google Service Account JWT Auth ──────────────────────────────

function base64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function str2ab(str) {
  return new TextEncoder().encode(str);
}

function pemToArrayBuffer(pem) {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

async function getServiceAccountToken(keyJson, scopes) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: keyJson.client_email,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  };

  const headerB64 = base64url(str2ab(JSON.stringify(header)));
  const payloadB64 = base64url(str2ab(JSON.stringify(payload)));
  const unsigned = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    'pkcs8', pemToArrayBuffer(keyJson.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, str2ab(unsigned));
  const jwt = `${unsigned}.${base64url(sig)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  const data = await res.json();
  return data.access_token;
}

async function refreshOAuth2Token(clientId, clientSecret, refreshToken) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `client_id=${clientId}&client_secret=${clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`
  });
  const data = await res.json();
  return data.access_token;
}

// ── Google API Helpers ───────────────────────────────────────────

async function ga4RunReport(token, requestBody) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY}:runReport`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
  return res.json();
}

async function ga4RunRealtimeReport(token, requestBody) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY}:runRealtimeReport`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
  return res.json();
}

async function gscQuery(token, requestBody) {
  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/searchAnalytics/query`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
  return res.json();
}

async function ytApi(path, params, apiKey) {
  const qs = new URLSearchParams({ ...params, key: apiKey }).toString();
  const res = await fetch(`https://www.googleapis.com/youtube/v3/${path}?${qs}`);
  return res.json();
}

async function ytAnalyticsQuery(token, params) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?${qs}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

// ── Utility functions ────────────────────────────────────────────

function parseRows(res) {
  if (!res?.rows) return [];
  return res.rows.map(r => ({
    dimensions: (r.dimensionValues || []).map(d => d.value),
    metrics: (r.metricValues || []).map(m => parseInt(m.value) || 0)
  }));
}

function resolveDate(dateStr) {
  if (dateStr === 'today') return fmtDate(0);
  if (dateStr === 'yesterday') return fmtDate(1);
  const m = dateStr.match(/^(\d+)daysAgo$/);
  if (m) return fmtDate(parseInt(m[1]));
  return dateStr;
}

function fmtDate(daysAgo) {
  const d = new Date(); d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function getRangeDates(range, start, end) {
  if (range === 'custom' && start && end) return { startDate: start, endDate: end };
  if (range === 'all') return { startDate: INCEPTION_DATE, endDate: 'today' };
  if (range === '7d') return { startDate: '7daysAgo', endDate: 'today' };
  if (range === '90d') return { startDate: '90daysAgo', endDate: 'today' };
  return { startDate: '30daysAgo', endDate: 'today' };
}

function getMonday(d) {
  d = new Date(d); const day = d.getUTCDay(); const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff); return d;
}

function aggregateWeekly(trend) {
  const weeks = {};
  for (const day of trend) {
    const d = new Date(day.date + 'T12:00:00Z');
    const monday = getMonday(d);
    const weekKey = monday.toISOString().split('T')[0];
    if (!weeks[weekKey]) {
      const sunday = new Date(monday); sunday.setUTCDate(monday.getUTCDate() + 6);
      weeks[weekKey] = { start: weekKey, end: sunday.toISOString().split('T')[0], views: 0, users: 0, sessions: 0, days: 0 };
    }
    weeks[weekKey].views += day.views; weeks[weekKey].users += day.users;
    weeks[weekKey].sessions += day.sessions || 0; weeks[weekKey].days++;
  }
  return Object.values(weeks).sort((a, b) => a.start.localeCompare(b.start));
}

const numFmt = n => n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n);

const TOOL_PATHS = {
  '/ai-news/': 'ai-news', '/m365-roadmap/': 'm365-roadmap', '/prompts/': 'prompt-library',
  '/licensing/': 'licensing', '/prompt-polisher/': 'prompt-polisher', '/copilot-readiness/': 'copilot-readiness',
  '/copilot-matrix/': 'copilot-matrix', '/deprecation-timeline/': 'deprecation-timeline',
  '/service-health/': 'service-health', '/cert-tracker/': 'cert-tracker', '/roi-calculator/': 'roi-calculator',
  '/ai-mapper/': 'ai-mapper', '/ai-showdown/': 'ai-showdown', '/ps-builder/': 'ps-builder',
  '/migration-planner/': 'migration-planner', '/prompt-guide/': 'prompt-guide',
  '/ca-builder/': 'ca-builder', '/world-clock/': 'meeting-planner', '/feedback/': 'feedback',
  '/site-analytics/': 'site-analytics', '/qr-generator/': 'qr-generator', '/wifi-qr/': 'wifi-qr',
  '/password-generator/': 'password-generator', '/image-compressor/': 'image-compressor',
  '/typing-test/': 'typing-test', '/countdown/': 'countdown',
  '/color-palette/': 'color-palette', '/pomodoro/': 'pomodoro'
};

function jsonRes(data, status = 200, cache = 'public, max-age=300') {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json', 'Cache-Control': cache,
      'Access-Control-Allow-Origin': '*' }
  });
}

// ── Auth helper ──────────────────────────────────────────────────

async function getToken(env) {
  const b64 = env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!b64) return null;
  try {
    const keyJson = JSON.parse(atob(b64));
    return await getServiceAccountToken(keyJson, [
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/webmasters.readonly'
    ]);
  } catch (e) { console.error('Auth error:', e.message); return null; }
}

// ── Endpoint: Realtime ───────────────────────────────────────────

async function handleRealtime(env) {
  const token = await getToken(env);
  if (!token) return jsonRes({ active: 0, pages: [] }, 200, 'no-cache');
  try {
    const res = await ga4RunRealtimeReport(token, {
      dimensions: [{ name: 'unifiedScreenName' }],
      metrics: [{ name: 'activeUsers' }], limit: 10
    });
    const rows = (res.rows || []).map(r => ({
      page: r.dimensionValues?.[0]?.value || '', users: parseInt(r.metricValues?.[0]?.value) || 0
    }));
    return jsonRes({ active: rows.reduce((s, p) => s + p.users, 0), pages: rows }, 200, 'no-cache');
  } catch { return jsonRes({ active: 0, pages: [] }, 200, 'no-cache'); }
}

// ── Endpoint: Latest Video ───────────────────────────────────────

async function handleLatestVideo(env) {
  const now = Date.now();
  if (cacheStore.latestvideo && now - cacheStore.latestvideo.time < 21600000)
    return jsonRes(cacheStore.latestvideo.data);
  const key = env.YOUTUBE_API_KEY;
  if (!key) return jsonRes({ error: 'No API key' });
  try {
    const sr = await ytApi('search', { channelId: MAIN_CH, order: 'date', type: 'video', maxResults: 1, part: 'snippet' }, key);
    const item = (sr.items || [])[0];
    if (!item) return jsonRes({ error: 'No videos' });
    const data = { id: item.id?.videoId || '', title: item.snippet?.title || '',
      published: (item.snippet?.publishedAt || '').slice(0, 10),
      thumbnail: item.snippet?.thumbnails?.high?.url || '' };
    cacheStore.latestvideo = { data, time: now };
    return jsonRes(data);
  } catch (e) { return jsonRes({ error: e.message }); }
}

// ── Endpoint: Bio Links ──────────────────────────────────────────

async function handleBioLinks(env) {
  const now = Date.now();
  if (cacheStore.biolinks && now - cacheStore.biolinks.time < CACHE_TTL)
    return jsonRes(cacheStore.biolinks.data);
  const token = await getToken(env);
  if (!token) return jsonRes({ error: 'No auth' });
  try {
    const dimFilter = { filter: { fieldName: 'eventName', stringFilter: { value: 'bio_link_click' } } };
    const [clicksRes, sectionRes, trendRes, pageRes, wowRes] = await Promise.all([
      ga4RunReport(token, { dateRanges: [{ startDate: INCEPTION_DATE, endDate: 'today' }],
        dimensions: [{ name: 'customEvent:link_id' }], metrics: [{ name: 'eventCount' }],
        dimensionFilter: dimFilter, orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }], limit: 50 }),
      ga4RunReport(token, { dateRanges: [{ startDate: INCEPTION_DATE, endDate: 'today' }],
        dimensions: [{ name: 'customEvent:link_section' }], metrics: [{ name: 'eventCount' }],
        dimensionFilter: dimFilter, orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }] }),
      ga4RunReport(token, { dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }], metrics: [{ name: 'eventCount' }],
        dimensionFilter: dimFilter, orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }] }),
      ga4RunReport(token, { dateRanges: [{ startDate: INCEPTION_DATE, endDate: 'today' }, { startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
        dimensionFilter: { filter: { fieldName: 'pagePath', stringFilter: { matchType: 'BEGINS_WITH', value: '/links' } } } }),
      ga4RunReport(token, { dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }, { startDate: '14daysAgo', endDate: '8daysAgo' }],
        metrics: [{ name: 'eventCount' }], dimensionFilter: dimFilter })
    ]);

    const clicks = parseRows(clicksRes).map(r => ({ link_id: r.dimensions[0], clicks: r.metrics[0] }));
    const sections = parseRows(sectionRes).map(r => ({ section: r.dimensions[0], clicks: r.metrics[0] }));
    const trend = parseRows(trendRes).map(r => {
      const raw = r.dimensions[0];
      return { date: `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`, clicks: r.metrics[0] };
    });
    const totalClicks = clicks.reduce((s, c) => s + c.clicks, 0);

    const pgRows = pageRes?.rows || [];
    let pageViews = 0, pageUsers = 0;
    for (const r of pgRows) {
      pageViews += parseInt(r.metricValues?.[0]?.value) || 0;
      pageUsers += parseInt(r.metricValues?.[1]?.value) || 0;
    }

    const wowData = wowRes?.rows || [];
    const thisWeekClicks = parseInt(wowData[0]?.metricValues?.[0]?.value) || 0;
    const lastWeekClicks = parseInt(wowData[0]?.metricValues?.[1]?.value) || 0;
    const wowPct = lastWeekClicks > 0 ? Math.round(((thisWeekClicks - lastWeekClicks) / lastWeekClicks) * 100) : (thisWeekClicks > 0 ? 100 : 0);
    const ctr = pageViews > 0 ? Math.round((totalClicks / pageViews) * 1000) / 10 : 0;

    const data = { totalClicks, ctr, pageViews, pageUsers, clicks, sections, trend,
      wow: { thisWeek: thisWeekClicks, lastWeek: lastWeekClicks, change: wowPct },
      updated: new Date().toISOString() };
    cacheStore.biolinks = { data, time: now };
    return jsonRes(data);
  } catch (e) { return jsonRes({ error: e.message }); }
}

// ── Endpoint: YouTube Intelligence ───────────────────────────────

async function handleYouTube(env) {
  const now = Date.now();
  if (cacheStore.youtube && now - cacheStore.youtube.time < 21600000)
    return jsonRes(cacheStore.youtube.data);
  const apiKey = env.YOUTUBE_API_KEY;
  if (!apiKey) return jsonRes({ error: 'No YouTube API key' });
  try {
    const chRes = await ytApi('channels', { id: [MAIN_CH, BITES_CH].join(','), part: 'statistics,snippet' }, apiKey);
    const channels = {};
    for (const ch of (chRes.items || [])) {
      const s = ch.statistics || {};
      channels[ch.id] = { name: ch.snippet?.title || '', subscribers: parseInt(s.subscriberCount) || 0,
        totalViews: parseInt(s.viewCount) || 0, videoCount: parseInt(s.videoCount) || 0 };
    }

    let allMainIds = [], nextPage = null;
    do {
      const params = { channelId: MAIN_CH, order: 'date', type: 'video', maxResults: 50, part: 'id' };
      if (nextPage) params.pageToken = nextPage;
      const sr = await ytApi('search', params, apiKey);
      allMainIds = allMainIds.concat((sr.items || []).map(i => i.id?.videoId).filter(Boolean));
      nextPage = sr.nextPageToken;
    } while (nextPage && allMainIds.length < 100);

    const bitesSr = await ytApi('search', { channelId: BITES_CH, order: 'viewCount', type: 'video', maxResults: 50, part: 'id' }, apiKey);
    const bitesIds = (bitesSr.items || []).map(i => i.id?.videoId).filter(Boolean);

    async function fetchVideoDetails(ids) {
      if (!ids.length) return [];
      const results = [];
      for (let i = 0; i < ids.length; i += 50) {
        const batch = ids.slice(i, i + 50);
        const vr = await ytApi('videos', { id: batch.join(','), part: 'statistics,snippet,contentDetails' }, apiKey);
        results.push(...(vr.items || []));
      }
      return results;
    }

    const mainVideos = await fetchVideoDetails(allMainIds);
    const bitesVideos = await fetchVideoDetails(bitesIds);

    function enrichVideos(videos) {
      const n = Date.now();
      return videos.map(v => {
        const pub = new Date(v.snippet?.publishedAt || 0).getTime();
        const days = Math.max(1, (n - pub) / 86400000);
        const views = parseInt(v.statistics?.viewCount) || 0;
        const likes = parseInt(v.statistics?.likeCount) || 0;
        const comments = parseInt(v.statistics?.commentCount) || 0;
        return { id: v.id, title: v.snippet?.title || '', published: (v.snippet?.publishedAt || '').slice(0, 10),
          publishDay: new Date(v.snippet?.publishedAt || 0).getUTCDay(),
          thumbnail: v.snippet?.thumbnails?.medium?.url || '', views, likes, comments,
          viewsPerDay: Math.round(views / days * 10) / 10,
          engagement: views > 0 ? Math.round((likes + comments) / views * 10000) / 100 : 0,
          daysSince: Math.round(days) };
      }).sort((a, b) => b.views - a.views);
    }

    const mainEnriched = enrichVideos(mainVideos);
    const bitesEnriched = enrichVideos(bitesVideos);

    function analyzeVideos(vids) {
      if (!vids.length) return {};
      const dayDist = [0,0,0,0,0,0,0], wordFreq = {};
      vids.forEach(v => { dayDist[v.publishDay]++;
        v.title.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).forEach(w => {
          if (w.length > 3 && !['guide','2024','2025','2026','from','with','your','what','this','that','will','have','about'].includes(w))
            wordFreq[w] = (wordFreq[w] || 0) + 1; }); });
      const avgViews = Math.round(vids.reduce((s, v) => s + v.views, 0) / vids.length);
      const avgEng = Math.round(vids.reduce((s, v) => s + v.engagement, 0) / vids.length * 100) / 100;
      const topByVelocity = vids.slice().sort((a, b) => b.viewsPerDay - a.viewsPerDay).slice(0, 10);
      const underperformers = vids.filter(v => v.daysSince > 30 && v.viewsPerDay < (avgViews / vids[0].daysSince) * 0.3).slice(0, 5);
      const topWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 15).map(e => ({ word: e[0], count: e[1] }));
      const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      return { dayDist, bestDay: dayNames[dayDist.indexOf(Math.max(...dayDist))], avgViews, avgEng, topByVelocity, underperformers, topWords };
    }

    const mainAnalysis = analyzeVideos(mainEnriched);
    const bitesAnalysis = analyzeVideos(bitesEnriched);

    let ytAnalytics = null;
    if (env.YOUTUBE_OAUTH_CLIENT_ID && env.YOUTUBE_OAUTH_CLIENT_SECRET && env.YOUTUBE_OAUTH_REFRESH_TOKEN) {
      try {
        const oauthToken = await refreshOAuth2Token(env.YOUTUBE_OAUTH_CLIENT_ID, env.YOUTUBE_OAUTH_CLIENT_SECRET, env.YOUTUBE_OAUTH_REFRESH_TOKEN);
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0];
        const channelId = 'channel==' + MAIN_CH;
        const [aRes, vRes, tRes] = await Promise.all([
          ytAnalyticsQuery(oauthToken, { ids: channelId, startDate, endDate,
            metrics: 'views,estimatedMinutesWatched,averageViewDuration,likes,subscribersGained,subscribersLost',
            dimensions: 'day', sort: 'day' }),
          ytAnalyticsQuery(oauthToken, { ids: channelId, startDate, endDate,
            metrics: 'views,estimatedMinutesWatched,averageViewDuration,likes,subscribersGained',
            dimensions: 'video', sort: '-views', maxResults: 20 }),
          ytAnalyticsQuery(oauthToken, { ids: channelId, startDate, endDate,
            metrics: 'views,estimatedMinutesWatched', dimensions: 'insightTrafficSourceType', sort: '-views' })
        ]);
        ytAnalytics = {
          daily: (aRes.rows || []).map(r => ({ date: r[0], views: r[1], watchMinutes: Math.round(r[2]), avgDuration: Math.round(r[3]), likes: r[4], subsGained: r[5], subsLost: r[6] })),
          topVideos: (vRes.rows || []).map(r => ({ videoId: r[0], views: r[1], watchMinutes: Math.round(r[2]), avgDuration: Math.round(r[3]), likes: r[4], subsGained: r[5] })),
          trafficSources: (tRes.rows || []).map(r => ({ source: r[0], views: r[1], watchMinutes: Math.round(r[2]) }))
        };
      } catch (e) { ytAnalytics = { error: e.message }; }
    }

    const recs = [];
    if (mainAnalysis.bestDay) recs.push({ icon: '📅', text: 'Your best publish day is ' + mainAnalysis.bestDay });
    if (mainAnalysis.topWords?.length) recs.push({ icon: '🔥', text: 'Top topics: ' + mainAnalysis.topWords.slice(0, 3).map(w => w.word).join(', ') });
    if (mainAnalysis.underperformers?.length) recs.push({ icon: '💡', text: mainAnalysis.underperformers.length + ' video(s) underperforming' });
    if (ytAnalytics && !ytAnalytics.error && ytAnalytics.daily?.length) {
      const totalSubsGained = ytAnalytics.daily.reduce((s, d) => s + (d.subsGained || 0), 0);
      const totalSubsLost = ytAnalytics.daily.reduce((s, d) => s + (d.subsLost || 0), 0);
      recs.push({ icon: '👥', text: 'Net subs (28d): +' + (totalSubsGained - totalSubsLost) });
      const totalWatch = ytAnalytics.daily.reduce((s, d) => s + d.watchMinutes, 0);
      recs.push({ icon: '⏱', text: 'Avg ' + Math.round(totalWatch / ytAnalytics.daily.length) + ' min/day watch time' });
    }

    // Title scorecards
    const POWER_WORDS = ['free','complete','ultimate','step','how','why','what','best','top','new','secret','easy','fast','2026','2025','guide','tutorial','learn','master','beginner','advanced','pro'];
    const titleScores = mainEnriched.map(v => {
      let score = 50; const t = v.title.toLowerCase(); const words = t.replace(/[^\w\s]/g, '').split(/\s+/);
      if (v.title.length >= 40 && v.title.length <= 65) score += 15; else if (v.title.length >= 30 && v.title.length <= 75) score += 8; else score -= 5;
      score += Math.min(words.filter(w => POWER_WORDS.includes(w)).length * 8, 20);
      if (/\d/.test(v.title)) score += 5; if (/[|—–]/.test(v.title)) score += 3;
      if (/\?|how |why |what /i.test(v.title)) score += 7; if (v.title.length > 80) score -= 10;
      score = Math.max(0, Math.min(100, score));
      const issues = [];
      if (v.title.length < 30) issues.push('Too short'); if (v.title.length > 75) issues.push('Too long');
      if (!words.some(w => POWER_WORDS.includes(w))) issues.push('No power words');
      return { id: v.id, title: v.title, score, issues, views: v.views, engagement: v.engagement };
    }).sort((a, b) => a.score - b.score);

    // Milestone projections
    let milestoneProjections = null;
    const currentSubs = (channels[MAIN_CH]?.subscribers || 0) + (channels[BITES_CH]?.subscribers || 0);
    if (ytAnalytics && !ytAnalytics.error && ytAnalytics.daily?.length > 7) {
      const net = ytAnalytics.daily.reduce((s, d) => s + (d.subsGained || 0) - (d.subsLost || 0), 0);
      const netPerDay = net / ytAnalytics.daily.length;
      milestoneProjections = { currentTotal: currentSubs, netPerDay: Math.round(netPerDay * 10) / 10, netPerMonth: Math.round(netPerDay * 30),
        targets: [100000, 250000, 500000, 1000000].filter(t => t > currentSubs).map(t => {
          const days = netPerDay > 0 ? Math.ceil((t - currentSubs) / netPerDay) : null;
          return { target: t, daysNeeded: days, date: days ? new Date(Date.now() + days * 86400000).toISOString().split('T')[0] : null, reachable: days !== null && days < 3650 };
        }) };
    }

    // Weekly scorecard
    let weeklyScorecard = null;
    if (ytAnalytics && !ytAnalytics.error && ytAnalytics.daily?.length >= 14) {
      const d = ytAnalytics.daily; const thisWeek = d.slice(-7); const lastWeek = d.slice(-14, -7);
      const sum = (arr, key) => arr.reduce((s, r) => s + (r[key] || 0), 0);
      const tw = { views: sum(thisWeek, 'views'), watch: sum(thisWeek, 'watchMinutes'), subs: sum(thisWeek, 'subsGained') - sum(thisWeek, 'subsLost'), likes: sum(thisWeek, 'likes') };
      const lw = { views: sum(lastWeek, 'views'), watch: sum(lastWeek, 'watchMinutes'), subs: sum(lastWeek, 'subsGained') - sum(lastWeek, 'subsLost'), likes: sum(lastWeek, 'likes') };
      const pct = (a, b) => b > 0 ? Math.round(((a - b) / b) * 100) : 0;
      const changes = { views: pct(tw.views, lw.views), watch: pct(tw.watch, lw.watch), subs: pct(tw.subs, lw.subs), likes: pct(tw.likes, lw.likes) };
      const upCount = Object.values(changes).filter(c => c > 5).length;
      weeklyScorecard = { thisWeek: tw, lastWeek: lw, changes, grade: upCount >= 4 ? 'A+' : upCount >= 3 ? 'A' : upCount >= 2 ? 'B' : upCount >= 1 ? 'C' : 'D' };
    }

    const data = { main: channels[MAIN_CH] || null, bites: channels[BITES_CH] || null,
      mainVideos: mainEnriched, bitesVideos: bitesEnriched.slice(0, 20),
      mainAnalysis, bitesAnalysis, analytics: ytAnalytics, recommendations: recs,
      titleScores: titleScores.slice(0, 20), milestoneProjections, weeklyScorecard,
      uploadFrequency: {
        mainPerMonth: Math.round((channels[MAIN_CH]?.videoCount || 0) / Math.max(1, Math.round((Date.now() - new Date('2021-12-01').getTime()) / 2592000000))),
        bitesPerMonth: Math.round((channels[BITES_CH]?.videoCount || 0) / Math.max(1, Math.round((Date.now() - new Date('2021-12-01').getTime()) / 2592000000))),
        totalVideos: (channels[MAIN_CH]?.videoCount || 0) + (channels[BITES_CH]?.videoCount || 0)
      } };
    cacheStore.youtube = { data, time: now };
    return jsonRes(data);
  } catch (e) { return jsonRes({ error: e.message }); }
}

// ── Endpoint: Main Analytics ─────────────────────────────────────

async function handleMainStats(env, url) {
  const range = url.searchParams.get('range') || '30d';
  const now = Date.now();
  const cacheKey = range === 'custom' ? `custom_${url.searchParams.get('start')}_${url.searchParams.get('end')}` : range;
  if (cacheStore[cacheKey] && now - cacheStore[cacheKey].time < CACHE_TTL)
    return jsonRes(cacheStore[cacheKey].data);

  const dateRange = getRangeDates(range, url.searchParams.get('start'), url.searchParams.get('end'));
  const token = await getToken(env);
  const response = { ga4: null, gsc: null, custom: null, range, updated: new Date().toISOString() };

  if (token) {
    const sd = dateRange.startDate, ed = dateRange.endDate;
    const [pagesRes, trendRes, summaryRes, geoRes, deviceRes, sourceRes, wowRes, todayRes, toolTrendRes, gscRes] = await Promise.all([
      ga4RunReport(token, { dateRanges: [{ startDate: sd, endDate: ed }], dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: 50 }),
      ga4RunReport(token, { dateRanges: [{ startDate: sd, endDate: ed }], dimensions: [{ name: 'date' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'sessions' }],
        orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }] }),
      ga4RunReport(token, { dateRanges: [{ startDate: sd, endDate: ed }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'sessions' }] }),
      ga4RunReport(token, { dateRanges: [{ startDate: sd, endDate: ed }], dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }], orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }], limit: 15 }),
      ga4RunReport(token, { dateRanges: [{ startDate: sd, endDate: ed }], dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'activeUsers' }] }),
      ga4RunReport(token, { dateRanges: [{ startDate: sd, endDate: ed }], dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 10 }),
      ga4RunReport(token, { dateRanges: [{ startDate: '7daysAgo', endDate: 'today', name: 'thisWeek' },
        { startDate: '14daysAgo', endDate: '8daysAgo', name: 'lastWeek' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'sessions' }] }),
      ga4RunReport(token, { dateRanges: [{ startDate: 'today', endDate: 'today' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'sessions' }] }),
      ga4RunReport(token, { dateRanges: [{ startDate: sd, endDate: ed }], dimensions: [{ name: 'pagePath' }, { name: 'date' }],
        metrics: [{ name: 'screenPageViews' }], orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }], limit: 10000 }),
      gscQuery(token, { startDate: resolveDate(sd), endDate: resolveDate(ed), dimensions: ['query'], rowLimit: 50, type: 'web' }).catch(() => ({ rows: [] }))
    ]);

    const pageRows = parseRows(pagesRes);
    const toolStats = {}, topPages = [];
    for (const r of pageRows) {
      const pagePath = r.dimensions[0], views = r.metrics[0], users = r.metrics[1];
      topPages.push({ path: pagePath, views, users });
      for (const [prefix, toolId] of Object.entries(TOOL_PATHS)) {
        if (pagePath === prefix || pagePath.startsWith(prefix)) {
          if (!toolStats[toolId]) toolStats[toolId] = { views: 0, users: 0 };
          toolStats[toolId].views += views; toolStats[toolId].users += users; break;
        }
      }
    }

    const leaderboard = Object.entries(toolStats).map(([tool, d]) => ({ tool, views: d.views, users: d.users, total: d.views })).sort((a, b) => b.total - a.total);
    const trend = parseRows(trendRes).map(r => { const raw = r.dimensions[0]; return { date: `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`, views: r.metrics[0], users: r.metrics[1], sessions: r.metrics[2] || 0 }; });
    const weekly = aggregateWeekly(trend);
    const summaryRows = parseRows(summaryRes), todayRows = parseRows(todayRes);

    const wowRows = parseRows(wowRes);
    let wow = null;
    if (wowRows.length >= 1) {
      const tw = { views: wowRows[0]?.metrics[0] || 0, users: wowRows[0]?.metrics[1] || 0, sessions: wowRows[0]?.metrics[2] || 0 };
      const lw = { views: wowRows[1]?.metrics[0] || 0, users: wowRows[1]?.metrics[1] || 0, sessions: wowRows[1]?.metrics[2] || 0 };
      const pct = (c, p) => p > 0 ? Math.round(((c - p) / p) * 100) : (c > 0 ? 100 : 0);
      wow = { thisWeek: tw, lastWeek: lw, change: { views: pct(tw.views, lw.views), users: pct(tw.users, lw.users), sessions: pct(tw.sessions, lw.sessions) } };
    }

    // Tool sparklines
    const toolTrends = {};
    for (const r of parseRows(toolTrendRes)) {
      const pagePath = r.dimensions[0], rawDate = r.dimensions[1], views = r.metrics[0];
      const date = `${rawDate.slice(0,4)}-${rawDate.slice(4,6)}-${rawDate.slice(6,8)}`;
      for (const [prefix, toolId] of Object.entries(TOOL_PATHS)) {
        if (pagePath === prefix || pagePath.startsWith(prefix)) {
          if (!toolTrends[toolId]) toolTrends[toolId] = {};
          toolTrends[toolId][date] = (toolTrends[toolId][date] || 0) + views; break;
        }
      }
    }
    const tool_trends = {};
    for (const toolId of leaderboard.slice(0, 10).map(t => t.tool)) {
      if (toolTrends[toolId]) { const sorted = Object.keys(toolTrends[toolId]).sort(); tool_trends[toolId] = sorted.map(d => toolTrends[toolId][d]); }
    }

    response.ga4 = {
      totals: { views: summaryRows[0]?.metrics[0] || 0, users: summaryRows[0]?.metrics[1] || 0, sessions: summaryRows[0]?.metrics[2] || 0 },
      today: { views: todayRows[0]?.metrics[0] || 0, users: todayRows[0]?.metrics[1] || 0 },
      leaderboard, trend, weekly, tool_trends,
      top_pages: topPages.slice(0, 30),
      blog_pages: topPages.filter(p => p.path.startsWith('/blog/')).slice(0, 15),
      countries: parseRows(geoRes).map(r => ({ country: r.dimensions[0], users: r.metrics[0] })),
      devices: parseRows(deviceRes).map(r => ({ device: r.dimensions[0], users: r.metrics[0] })),
      sources: parseRows(sourceRes).map(r => ({ source: r.dimensions[0], sessions: r.metrics[0] })),
      wow
    };

    const gscRows = gscRes.rows || [];
    if (gscRows.length) {
      response.gsc = { queries: gscRows.map(r => ({ query: r.keys[0], clicks: r.clicks, impressions: r.impressions,
        ctr: Math.round(r.ctr * 1000) / 10, position: Math.round(r.position * 10) / 10 })) };
    }
  }

  response.custom = { leaderboard: [], top_searches: [] };
  cacheStore[cacheKey] = { data: response, time: now };
  return jsonRes(response);
}

// ── Main Handler ─────────────────────────────────────────────────

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  try {
    if (url.searchParams.get('realtime') === '1') return await handleRealtime(env);
    if (url.searchParams.get('latestvideo') === '1') return await handleLatestVideo(env);
    if (url.searchParams.get('biolinks') === '1') return await handleBioLinks(env);
    if (url.searchParams.get('youtube') === '1') return await handleYouTube(env);
    return await handleMainStats(env, url);
  } catch (e) {
    console.error('Stats error:', e.message, e.stack);
    return jsonRes({ error: e.message }, 500);
  }
}
