/**
 * GET /api/stats — Analytics intelligence endpoint
 * Supports date ranges: ?range=7d|30d|90d|all|custom&start=YYYY-MM-DD&end=YYYY-MM-DD
 * Includes: GA4 traffic, GSC queries, per-tool sparklines, weekly aggregation
 * Cached per range for 5 minutes.
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const STATS_FILE = path.join(__dirname, '..', '_data', 'analytics.json');
const GA4_PROPERTY = process.env.GA4_PROPERTY_ID || '530486519';
const GSC_SITE = process.env.GSC_SITE_URL || 'https://www.aguidetocloud.com/';
const INCEPTION_DATE = '2026-03-30';

// Per-range response cache (5 min TTL)
const cacheStore = {};
const CACHE_TTL = 300000;

function getRangeDates(range, start, end) {
  if (range === 'custom' && start && end) return { startDate: start, endDate: end };
  if (range === 'all') return { startDate: INCEPTION_DATE, endDate: 'today' };
  if (range === '7d') return { startDate: '7daysAgo', endDate: 'today' };
  if (range === '90d') return { startDate: '90daysAgo', endDate: 'today' };
  return { startDate: '30daysAgo', endDate: 'today' };
}

function getCacheKey(range, start, end) {
  if (range === 'custom') return 'custom_' + start + '_' + end;
  return range || '30d';
}

function resolveDate(dateStr) {
  if (dateStr === 'today') return formatDate(0);
  if (dateStr === 'yesterday') return formatDate(1);
  var m = dateStr.match(/^(\d+)daysAgo$/);
  if (m) return formatDate(parseInt(m[1]));
  return dateStr;
}

function formatDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function getMonday(d) {
  d = new Date(d);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

function aggregateWeekly(trend) {
  const weeks = {};
  for (const day of trend) {
    const d = new Date(day.date + 'T12:00:00Z');
    const monday = getMonday(d);
    const weekKey = monday.toISOString().split('T')[0];
    if (!weeks[weekKey]) {
      const sunday = new Date(monday);
      sunday.setUTCDate(monday.getUTCDate() + 6);
      weeks[weekKey] = { start: weekKey, end: sunday.toISOString().split('T')[0], views: 0, users: 0, sessions: 0, days: 0 };
    }
    weeks[weekKey].views += day.views;
    weeks[weekKey].users += day.users;
    weeks[weekKey].sessions += day.sessions || 0;
    weeks[weekKey].days++;
  }
  return Object.values(weeks).sort((a, b) => a.start.localeCompare(b.start));
}

function getAuthClient() {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!b64) return null;
  const keyJson = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  return new google.auth.GoogleAuth({
    credentials: keyJson,
    scopes: [
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/webmasters.readonly'
    ]
  });
}

async function fetchGA4Data(auth, dateRange) {
  try {
    const analyticsdata = google.analyticsdata({ version: 'v1beta', auth });
    const sd = dateRange.startDate;
    const ed = dateRange.endDate;

    // Range-dependent queries
    const pagesRes = await analyticsdata.properties.runReport({
      property: `properties/${GA4_PROPERTY}`,
      requestBody: {
        dateRanges: [{ startDate: sd, endDate: ed }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 50
      }
    });

    const trendRes = await analyticsdata.properties.runReport({
      property: `properties/${GA4_PROPERTY}`,
      requestBody: {
        dateRanges: [{ startDate: sd, endDate: ed }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'sessions' }],
        orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }]
      }
    });

    const summaryRes = await analyticsdata.properties.runReport({
      property: `properties/${GA4_PROPERTY}`,
      requestBody: {
        dateRanges: [{ startDate: sd, endDate: ed }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'sessions' }]
      }
    });

    const geoRes = await analyticsdata.properties.runReport({
      property: `properties/${GA4_PROPERTY}`,
      requestBody: {
        dateRanges: [{ startDate: sd, endDate: ed }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 15
      }
    });

    const deviceRes = await analyticsdata.properties.runReport({
      property: `properties/${GA4_PROPERTY}`,
      requestBody: {
        dateRanges: [{ startDate: sd, endDate: ed }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'activeUsers' }]
      }
    });

    const sourceRes = await analyticsdata.properties.runReport({
      property: `properties/${GA4_PROPERTY}`,
      requestBody: {
        dateRanges: [{ startDate: sd, endDate: ed }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10
      }
    });

    // Fixed-date queries (always current)
    const wowRes = await analyticsdata.properties.runReport({
      property: `properties/${GA4_PROPERTY}`,
      requestBody: {
        dateRanges: [
          { startDate: '7daysAgo', endDate: 'today', name: 'thisWeek' },
          { startDate: '14daysAgo', endDate: '8daysAgo', name: 'lastWeek' }
        ],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'sessions' }]
      }
    });

    const todayRes = await analyticsdata.properties.runReport({
      property: `properties/${GA4_PROPERTY}`,
      requestBody: {
        dateRanges: [{ startDate: 'today', endDate: 'today' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'sessions' }]
      }
    });

    return { pagesRes, trendRes, todayRes, summaryRes, geoRes, deviceRes, sourceRes, wowRes };
  } catch (e) {
    console.error('GA4 error:', e.message);
    return null;
  }
}

async function fetchToolTrends(auth, dateRange) {
  try {
    const analyticsdata = google.analyticsdata({ version: 'v1beta', auth });
    const res = await analyticsdata.properties.runReport({
      property: `properties/${GA4_PROPERTY}`,
      requestBody: {
        dateRanges: [{ startDate: dateRange.startDate, endDate: dateRange.endDate }],
        dimensions: [{ name: 'pagePath' }, { name: 'date' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
        limit: 10000
      }
    });
    return res;
  } catch (e) {
    console.error('Tool trends error:', e.message);
    return null;
  }
}

async function fetchGSCData(auth, dateRange) {
  try {
    const searchconsole = google.searchconsole({ version: 'v1', auth });
    const res = await searchconsole.searchanalytics.query({
      siteUrl: GSC_SITE,
      requestBody: {
        startDate: resolveDate(dateRange.startDate),
        endDate: resolveDate(dateRange.endDate),
        dimensions: ['query'],
        rowLimit: 50,
        type: 'web'
      }
    });
    return res.data.rows || [];
  } catch (e) {
    console.error('GSC error:', e.message);
    return [];
  }
}

function parseRows(res) {
  if (!res?.data?.rows) return [];
  return res.data.rows.map(r => ({
    dimensions: r.dimensionValues?.map(d => d.value) || [],
    metrics: r.metricValues?.map(m => parseInt(m.value) || 0) || []
  }));
}

const TOOL_PATHS = {
  '/ai-news/': 'ai-news', '/m365-roadmap/': 'm365-roadmap', '/prompts/': 'prompt-library',
  '/licensing/': 'licensing', '/prompt-polisher/': 'prompt-polisher', '/copilot-readiness/': 'copilot-readiness',
  '/copilot-matrix/': 'copilot-matrix', '/deprecation-timeline/': 'deprecation-timeline',
  '/service-health/': 'service-health', '/cert-tracker/': 'cert-tracker', '/roi-calculator/': 'roi-calculator',
  '/ai-mapper/': 'ai-mapper', '/ai-showdown/': 'ai-showdown', '/ps-builder/': 'ps-builder',
  '/migration-planner/': 'migration-planner', '/prompt-guide/': 'prompt-guide',
  '/ca-builder/': 'ca-builder', '/world-clock/': 'meeting-planner', '/feedback/': 'feedback',
  '/site-analytics/': 'site-analytics',
  '/qr-generator/': 'qr-generator', '/wifi-qr/': 'wifi-qr',
  '/password-generator/': 'password-generator', '/image-compressor/': 'image-compressor',
  '/typing-test/': 'typing-test', '/countdown/': 'countdown',
  '/color-palette/': 'color-palette', '/pomodoro/': 'pomodoro'
};

function loadCustomStats() {
  try {
    if (fs.existsSync(STATS_FILE)) return JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
  } catch (e) { /* fresh */ }
  return { tools: {}, events: {}, searches: {}, daily: {}, updated: null };
}

module.exports = async function (context, req) {
  const origin = req.headers.origin || '';
  const allowed = origin.includes('aguidetocloud.com') || origin.includes('localhost');
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowed ? origin : '*',
    'Cache-Control': 'public, max-age=300'
  };

  // Parse range
  const range = req.query.range || '30d';
  const now = Date.now();

  // Quick realtime-only response (no cache, lightweight)
  if (req.query.realtime === '1') {
    const auth = getAuthClient();
    if (!auth) { context.res = { status: 200, headers: { ...headers, 'Cache-Control': 'no-cache' }, body: '{"active":0,"pages":[]}' }; return; }
    try {
      const analyticsdata = google.analyticsdata({ version: 'v1beta', auth });
      const res = await analyticsdata.properties.runRealtimeReport({
        property: `properties/${GA4_PROPERTY}`,
        requestBody: {
          dimensions: [{ name: 'unifiedScreenName' }],
          metrics: [{ name: 'activeUsers' }],
          limit: 10
        }
      });
      const rows = res?.data?.rows || [];
      const pages = rows.map(r => ({ page: r.dimensionValues?.[0]?.value || '', users: parseInt(r.metricValues?.[0]?.value) || 0 }));
      const total = pages.reduce((s, p) => s + p.users, 0);
      context.res = { status: 200, headers: { ...headers, 'Cache-Control': 'no-cache' }, body: JSON.stringify({ active: total, pages }) };
    } catch(e) {
      context.res = { status: 200, headers: { ...headers, 'Cache-Control': 'no-cache' }, body: JSON.stringify({ active: 0, pages: [] }) };
    }
    return;
  }

  // YouTube Intelligence (6-hour cache, OAuth2 for analytics)
  if (req.query.youtube === '1') {
    const ytCacheKey = 'youtube_v2';
    if (cacheStore[ytCacheKey] && now - cacheStore[ytCacheKey].time < 21600000) {
      context.res = { status: 200, headers, body: JSON.stringify(cacheStore[ytCacheKey].data) };
      return;
    }
    const ytApiKey = process.env.YOUTUBE_API_KEY;
    const ytClientId = process.env.YOUTUBE_OAUTH_CLIENT_ID;
    const ytClientSecret = process.env.YOUTUBE_OAUTH_CLIENT_SECRET;
    const ytRefreshToken = process.env.YOUTUBE_OAUTH_REFRESH_TOKEN;
    if (!ytApiKey) { context.res = { status: 200, headers, body: '{"error":"No YouTube API key"}' }; return; }
    try {
      const youtube = google.youtube({ version: 'v3' });
      const MAIN_CH = 'UCYN12Rlv9hgZlWJa1XPfdyg';
      const BITES_CH = 'UCg8OCdG1yeiSPFDyqQDxHnw';

      // Channel stats (1 API unit)
      const chRes = await youtube.channels.list({ id: [MAIN_CH, BITES_CH].join(','), part: ['statistics', 'snippet'], key: ytApiKey });
      const channels = {};
      for (const ch of (chRes.data.items || [])) {
        const s = ch.statistics || {};
        channels[ch.id] = { name: ch.snippet?.title || '', subscribers: parseInt(s.subscriberCount) || 0, totalViews: parseInt(s.viewCount) || 0, videoCount: parseInt(s.videoCount) || 0 };
      }

      // Main channel: ALL videos by date (2 search + 2 videos.list calls = ~204 units)
      let allMainIds = [];
      let nextPage = null;
      do {
        const sr = await youtube.search.list({ channelId: MAIN_CH, order: 'date', type: ['video'], maxResults: 50, part: ['id'], key: ytApiKey, pageToken: nextPage || undefined });
        allMainIds = allMainIds.concat((sr.data.items || []).map(i => i.id?.videoId).filter(Boolean));
        nextPage = sr.data.nextPageToken;
      } while (nextPage && allMainIds.length < 100);

      // Bites: top 50 by views (100 + 1 units)
      const bitesSr = await youtube.search.list({ channelId: BITES_CH, order: 'viewCount', type: ['video'], maxResults: 50, part: ['id'], key: ytApiKey });
      const bitesIds = (bitesSr.data.items || []).map(i => i.id?.videoId).filter(Boolean);

      // Fetch full stats for all videos
      async function fetchVideoDetails(ids) {
        if (!ids.length) return [];
        const results = [];
        for (let i = 0; i < ids.length; i += 50) {
          const batch = ids.slice(i, i + 50);
          const vr = await youtube.videos.list({ id: batch.join(','), part: ['statistics', 'snippet', 'contentDetails'], key: ytApiKey });
          results.push(...(vr.data.items || []));
        }
        return results;
      }

      const mainVideos = await fetchVideoDetails(allMainIds);
      const bitesVideos = await fetchVideoDetails(bitesIds);

      // Enrich with computed metrics
      function enrichVideos(videos) {
        const n = Date.now();
        return videos.map(v => {
          const pub = new Date(v.snippet?.publishedAt || 0).getTime();
          const days = Math.max(1, (n - pub) / 86400000);
          const views = parseInt(v.statistics?.viewCount) || 0;
          const likes = parseInt(v.statistics?.likeCount) || 0;
          const comments = parseInt(v.statistics?.commentCount) || 0;
          return {
            id: v.id, title: v.snippet?.title || '', published: (v.snippet?.publishedAt || '').slice(0, 10),
            publishDay: new Date(v.snippet?.publishedAt || 0).getUTCDay(),
            thumbnail: v.snippet?.thumbnails?.medium?.url || '',
            views, likes, comments,
            viewsPerDay: Math.round(views / days * 10) / 10,
            engagement: views > 0 ? Math.round((likes + comments) / views * 10000) / 100 : 0,
            daysSince: Math.round(days)
          };
        }).sort((a, b) => b.views - a.views);
      }

      const mainEnriched = enrichVideos(mainVideos);
      const bitesEnriched = enrichVideos(bitesVideos);

      // Analytics: best publish day, word patterns, underperformers
      function analyzeVideos(vids) {
        if (!vids.length) return {};
        const dayDist = [0,0,0,0,0,0,0];
        const wordFreq = {};
        vids.forEach(v => {
          dayDist[v.publishDay]++;
          v.title.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).forEach(w => {
            if (w.length > 3 && !['guide','2024','2025','2026','from','with','your','what','this','that','will','have','about'].includes(w))
              wordFreq[w] = (wordFreq[w] || 0) + 1;
          });
        });
        const avgViews = Math.round(vids.reduce((s, v) => s + v.views, 0) / vids.length);
        const avgEng = Math.round(vids.reduce((s, v) => s + v.engagement, 0) / vids.length * 100) / 100;
        const topByVelocity = vids.slice().sort((a, b) => b.viewsPerDay - a.viewsPerDay).slice(0, 10);
        const underperformers = vids.filter(v => v.daysSince > 30 && v.viewsPerDay < (avgViews / vids[0].daysSince) * 0.3).slice(0, 5);
        const topWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 15).map(e => ({ word: e[0], count: e[1] }));
        const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const bestDay = dayDist.indexOf(Math.max(...dayDist));
        return { dayDist, bestDay: dayNames[bestDay], avgViews, avgEng, topByVelocity, underperformers, topWords };
      }

      const mainAnalysis = analyzeVideos(mainEnriched);
      const bitesAnalysis = analyzeVideos(bitesEnriched);

      // YouTube Analytics API (OAuth2) — watch time, CTR, impressions (last 28 days)
      let ytAnalytics = null;
      if (ytClientId && ytClientSecret && ytRefreshToken) {
        try {
          const oauth2Client = new google.auth.OAuth2(ytClientId, ytClientSecret);
          oauth2Client.setCredentials({ refresh_token: ytRefreshToken });
          const youtubeAnalytics = google.youtubeAnalytics({ version: 'v2', auth: oauth2Client });
          const endDate = new Date().toISOString().split('T')[0];
          const startDate = new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0];
          // Channel-level analytics (last 28 days)
          const aRes = await youtubeAnalytics.reports.query({
            ids: 'channel==MINE',
            startDate, endDate,
            metrics: 'views,estimatedMinutesWatched,averageViewDuration,likes,subscribersGained,subscribersLost,impressions,impressionClickThroughRate',
            dimensions: 'day',
            sort: 'day'
          });
          // Per-video analytics (top 20 by views, last 28 days)
          const vRes = await youtubeAnalytics.reports.query({
            ids: 'channel==MINE',
            startDate, endDate,
            metrics: 'views,estimatedMinutesWatched,averageViewDuration,impressions,impressionClickThroughRate,likes,subscribersGained',
            dimensions: 'video',
            sort: '-views',
            maxResults: 20
          });
          // Traffic sources
          const tRes = await youtubeAnalytics.reports.query({
            ids: 'channel==MINE',
            startDate, endDate,
            metrics: 'views,estimatedMinutesWatched',
            dimensions: 'insightTrafficSourceType',
            sort: '-views'
          });
          ytAnalytics = {
            daily: (aRes.data.rows || []).map(r => ({
              date: r[0], views: r[1], watchMinutes: Math.round(r[2]), avgDuration: Math.round(r[3]),
              likes: r[4], subsGained: r[5], subsLost: r[6], impressions: r[7], ctr: Math.round(r[8] * 10000) / 100
            })),
            topVideos: (vRes.data.rows || []).map(r => ({
              videoId: r[0], views: r[1], watchMinutes: Math.round(r[2]), avgDuration: Math.round(r[3]),
              impressions: r[4], ctr: Math.round(r[5] * 10000) / 100, likes: r[6], subsGained: r[7]
            })),
            trafficSources: (tRes.data.rows || []).map(r => ({
              source: r[0], views: r[1], watchMinutes: Math.round(r[2])
            }))
          };
        } catch(e) {
          ytAnalytics = { error: e.message };
        }
      }

      // Recommendations engine
      const recs = [];
      if (mainAnalysis.bestDay) recs.push({ icon: '\uD83D\uDCC5', text: 'Your best publish day is ' + mainAnalysis.bestDay + ' — schedule uploads accordingly' });
      if (mainAnalysis.topWords && mainAnalysis.topWords.length) {
        const hot = mainAnalysis.topWords.slice(0, 3).map(w => w.word).join(', ');
        recs.push({ icon: '\uD83D\uDD25', text: 'Top-performing topics: ' + hot + ' — create more content around these' });
      }
      if (mainAnalysis.underperformers && mainAnalysis.underperformers.length) {
        recs.push({ icon: '\uD83D\uDCA1', text: mainAnalysis.underperformers.length + ' video(s) underperforming — consider updating titles/thumbnails' });
      }
      if (ytAnalytics && !ytAnalytics.error && ytAnalytics.daily && ytAnalytics.daily.length) {
        const avgCtr = ytAnalytics.daily.reduce((s, d) => s + d.ctr, 0) / ytAnalytics.daily.length;
        if (avgCtr < 5) recs.push({ icon: '\uD83C\uDFA8', text: 'Avg CTR is ' + avgCtr.toFixed(1) + '% — thumbnails and titles need improvement (aim for 5-10%)' });
        const totalSubsGained = ytAnalytics.daily.reduce((s, d) => s + d.subsGained, 0);
        const totalSubsLost = ytAnalytics.daily.reduce((s, d) => s + d.subsLost, 0);
        recs.push({ icon: '\uD83D\uDC65', text: 'Net subscribers (28d): +' + (totalSubsGained - totalSubsLost) + ' (' + totalSubsGained + ' gained, ' + totalSubsLost + ' lost)' });
      }

      // Title Scorecards — score each video title
      const POWER_WORDS = ['free','complete','ultimate','step','how','why','what','best','top','new','secret','easy','fast','2026','2025','guide','tutorial','learn','master','beginner','advanced','pro','hack','trick','mistake','review','comparison','explained','simple','powerful'];
      const titleScores = mainEnriched.map(v => {
        let score = 50;
        const t = v.title.toLowerCase();
        const words = t.replace(/[^\w\s]/g, '').split(/\s+/);
        // Length: 40-65 chars is optimal
        if (v.title.length >= 40 && v.title.length <= 65) score += 15;
        else if (v.title.length >= 30 && v.title.length <= 75) score += 8;
        else score -= 5;
        // Power words
        const pwCount = words.filter(w => POWER_WORDS.includes(w)).length;
        score += Math.min(pwCount * 8, 20);
        // Number in title (specificity)
        if (/\d/.test(v.title)) score += 5;
        // Pipes/dashes (common in SEO titles)
        if (/[|—–]/.test(v.title)) score += 3;
        // Curiosity gap (questions)
        if (/\?|how |why |what |can you/i.test(v.title)) score += 7;
        // Too long = penalty
        if (v.title.length > 80) score -= 10;
        // All caps words = clickbait penalty
        if (/[A-Z]{5,}/.test(v.title)) score -= 5;
        score = Math.max(0, Math.min(100, score));
        const issues = [];
        if (v.title.length < 30) issues.push('Too short — aim for 40-65 chars');
        if (v.title.length > 75) issues.push('Too long — trim to 65 chars');
        if (pwCount === 0) issues.push('No power words — add: complete, guide, free, step-by-step');
        if (!/\d/.test(v.title)) issues.push('No numbers — add specificity (year, count, steps)');
        if (!/[|—–]/.test(v.title)) issues.push('No separator — use | or — to structure title');
        return { id: v.id, title: v.title, score, issues, views: v.views, engagement: v.engagement };
      }).sort((a, b) => a.score - b.score);

      // Subscriber Milestone Projector
      let milestoneProjections = null;
      const currentSubs = (channels[MAIN_CH]?.subscribers || 0) + (channels[BITES_CH]?.subscribers || 0);
      if (ytAnalytics && !ytAnalytics.error && ytAnalytics.daily && ytAnalytics.daily.length > 7) {
        const subsGained28 = ytAnalytics.daily.reduce((s, d) => s + (d.subsGained || 0), 0);
        const subsLost28 = ytAnalytics.daily.reduce((s, d) => s + (d.subsLost || 0), 0);
        const netPerDay = (subsGained28 - subsLost28) / ytAnalytics.daily.length;
        const targets = [100000, 250000, 500000, 1000000];
        milestoneProjections = {
          currentTotal: currentSubs,
          netPerDay: Math.round(netPerDay * 10) / 10,
          netPerMonth: Math.round(netPerDay * 30),
          targets: targets.filter(t => t > currentSubs).map(t => {
            const daysNeeded = netPerDay > 0 ? Math.ceil((t - currentSubs) / netPerDay) : null;
            const date = daysNeeded ? new Date(Date.now() + daysNeeded * 86400000).toISOString().split('T')[0] : null;
            return { target: t, daysNeeded, date, reachable: daysNeeded !== null && daysNeeded < 3650 };
          })
        };
      }

      // Weekly Content Scorecard (last 7 days vs prior 7)
      let weeklyScorecard = null;
      if (ytAnalytics && !ytAnalytics.error && ytAnalytics.daily && ytAnalytics.daily.length >= 14) {
        const d = ytAnalytics.daily;
        const thisWeek = d.slice(-7);
        const lastWeek = d.slice(-14, -7);
        const sum = (arr, key) => arr.reduce((s, r) => s + (r[key] || 0), 0);
        const tw = { views: sum(thisWeek, 'views'), watch: sum(thisWeek, 'watchMinutes'), subs: sum(thisWeek, 'subsGained') - sum(thisWeek, 'subsLost'), impressions: sum(thisWeek, 'impressions'), avgCtr: thisWeek.reduce((s, r) => s + r.ctr, 0) / 7 };
        const lw = { views: sum(lastWeek, 'views'), watch: sum(lastWeek, 'watchMinutes'), subs: sum(lastWeek, 'subsGained') - sum(lastWeek, 'subsLost'), impressions: sum(lastWeek, 'impressions'), avgCtr: lastWeek.reduce((s, r) => s + r.ctr, 0) / 7 };
        const pct = (a, b) => b > 0 ? Math.round(((a - b) / b) * 100) : 0;
        // Grade: A+ (everything up >20%), A (most up), B (mixed), C (mostly down), D (everything down)
        const changes = [pct(tw.views, lw.views), pct(tw.watch, lw.watch), pct(tw.subs, lw.subs), pct(tw.impressions, lw.impressions)];
        const upCount = changes.filter(c => c > 5).length;
        const grade = upCount >= 4 ? 'A+' : upCount >= 3 ? 'A' : upCount >= 2 ? 'B' : upCount >= 1 ? 'C' : 'D';
        weeklyScorecard = { thisWeek: tw, lastWeek: lw, changes: { views: pct(tw.views, lw.views), watch: pct(tw.watch, lw.watch), subs: pct(tw.subs, lw.subs), impressions: pct(tw.impressions, lw.impressions), ctr: Math.round((tw.avgCtr - lw.avgCtr) * 100) / 100 }, grade };
      }

      const ytResponse = {
        main: channels[MAIN_CH] || null, bites: channels[BITES_CH] || null,
        mainVideos: mainEnriched, bitesVideos: bitesEnriched.slice(0, 20),
        mainAnalysis, bitesAnalysis,
        analytics: ytAnalytics,
        recommendations: recs,
        titleScores: titleScores.slice(0, 20),
        milestoneProjections,
        weeklyScorecard,
        uploadFrequency: {
          mainPerMonth: Math.round((channels[MAIN_CH]?.videoCount || 0) / Math.max(1, Math.round((Date.now() - new Date('2021-12-01').getTime()) / 2592000000))),
          bitesPerMonth: Math.round((channels[BITES_CH]?.videoCount || 0) / Math.max(1, Math.round((Date.now() - new Date('2021-12-01').getTime()) / 2592000000))),
          totalVideos: (channels[MAIN_CH]?.videoCount || 0) + (channels[BITES_CH]?.videoCount || 0)
        }
      };
      cacheStore[ytCacheKey] = { data: ytResponse, time: now };
      context.res = { status: 200, headers, body: JSON.stringify(ytResponse) };
    } catch(e) {
      context.res = { status: 200, headers, body: JSON.stringify({ error: e.message }) };
    }
    return;
  }
  const dateRange = getRangeDates(range, req.query.start, req.query.end);
  const cacheKey = getCacheKey(range, req.query.start, req.query.end);

  // Return cached response if fresh
  if (cacheStore[cacheKey] && now - cacheStore[cacheKey].time < CACHE_TTL) {
    context.res = { status: 200, headers, body: JSON.stringify(cacheStore[cacheKey].data) };
    return;
  }

  const auth = getAuthClient();
  let ga4 = null, gscRows = [], toolTrendRes = null;

  if (auth) {
    [ga4, gscRows, toolTrendRes] = await Promise.all([
      fetchGA4Data(auth, dateRange),
      fetchGSCData(auth, dateRange),
      fetchToolTrends(auth, dateRange)
    ]);
  }

  const custom = loadCustomStats();
  const response = { ga4: null, gsc: null, custom: null, range: range, updated: new Date().toISOString() };

  if (ga4) {
    const summaryRows = parseRows(ga4.summaryRes);
    const todayRows = parseRows(ga4.todayRes);

    const pageRows = parseRows(ga4.pagesRes);
    const toolStats = {};
    const topPages = [];
    for (const r of pageRows) {
      const pagePath = r.dimensions[0];
      const views = r.metrics[0];
      const users = r.metrics[1];
      topPages.push({ path: pagePath, views, users });
      for (const [prefix, toolId] of Object.entries(TOOL_PATHS)) {
        if (pagePath === prefix || pagePath.startsWith(prefix)) {
          if (!toolStats[toolId]) toolStats[toolId] = { views: 0, users: 0 };
          toolStats[toolId].views += views;
          toolStats[toolId].users += users;
          break;
        }
      }
    }

    const leaderboard = Object.entries(toolStats)
      .map(([tool, d]) => ({ tool, views: d.views, users: d.users, total: d.views }))
      .sort((a, b) => b.total - a.total);

    // Daily trend (now includes sessions)
    const trendRows = parseRows(ga4.trendRes);
    const trend = trendRows.map(r => {
      const raw = r.dimensions[0];
      const date = `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`;
      return { date, views: r.metrics[0], users: r.metrics[1], sessions: r.metrics[2] || 0 };
    });

    // Weekly aggregation
    const weekly = aggregateWeekly(trend);

    // Geography, devices, sources
    const geoRows = parseRows(ga4.geoRes);
    const countries = geoRows.map(r => ({ country: r.dimensions[0], users: r.metrics[0] }));
    const deviceRows = parseRows(ga4.deviceRes);
    const devices = deviceRows.map(r => ({ device: r.dimensions[0], users: r.metrics[0] }));
    const sourceRows = parseRows(ga4.sourceRes);
    const sources = sourceRows.map(r => ({ source: r.dimensions[0], sessions: r.metrics[0] }));

    // Week-over-week
    const wowRows = parseRows(ga4.wowRes);
    let wow = null;
    if (wowRows.length >= 1) {
      const thisWeek = { views: wowRows[0]?.metrics[0] || 0, users: wowRows[0]?.metrics[1] || 0, sessions: wowRows[0]?.metrics[2] || 0 };
      const lastWeek = { views: wowRows[1]?.metrics[0] || 0, users: wowRows[1]?.metrics[1] || 0, sessions: wowRows[1]?.metrics[2] || 0 };
      const pct = (curr, prev) => prev > 0 ? Math.round(((curr - prev) / prev) * 100) : (curr > 0 ? 100 : 0);
      wow = { thisWeek, lastWeek, change: { views: pct(thisWeek.views, lastWeek.views), users: pct(thisWeek.users, lastWeek.users), sessions: pct(thisWeek.sessions, lastWeek.sessions) } };
    }

    // Blog pages
    const blogPages = topPages.filter(p => p.path.startsWith('/blog/')).slice(0, 15);

    // Tool sparklines (top 10 from leaderboard)
    const toolTrends = {};
    if (toolTrendRes) {
      const ttRows = parseRows(toolTrendRes);
      for (const r of ttRows) {
        const pagePath = r.dimensions[0];
        const rawDate = r.dimensions[1];
        const views = r.metrics[0];
        const date = `${rawDate.slice(0,4)}-${rawDate.slice(4,6)}-${rawDate.slice(6,8)}`;
        for (const [prefix, toolId] of Object.entries(TOOL_PATHS)) {
          if (pagePath === prefix || pagePath.startsWith(prefix)) {
            if (!toolTrends[toolId]) toolTrends[toolId] = {};
            if (!toolTrends[toolId][date]) toolTrends[toolId][date] = 0;
            toolTrends[toolId][date] += views;
            break;
          }
        }
      }
    }
    const top10 = leaderboard.slice(0, 10).map(t => t.tool);
    const tool_trends = {};
    for (const toolId of top10) {
      if (toolTrends[toolId]) {
        const sorted = Object.keys(toolTrends[toolId]).sort();
        tool_trends[toolId] = sorted.map(d => toolTrends[toolId][d]);
      }
    }

    response.ga4 = {
      totals: { views: summaryRows[0]?.metrics[0] || 0, users: summaryRows[0]?.metrics[1] || 0, sessions: summaryRows[0]?.metrics[2] || 0 },
      today: { views: todayRows[0]?.metrics[0] || 0, users: todayRows[0]?.metrics[1] || 0 },
      leaderboard, trend, weekly, tool_trends,
      top_pages: topPages.slice(0, 30),
      blog_pages: blogPages,
      countries, devices, sources, wow
    };
  }

  if (gscRows.length > 0) {
    response.gsc = {
      queries: gscRows.map(r => ({
        query: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: Math.round(r.ctr * 1000) / 10,
        position: Math.round(r.position * 10) / 10
      }))
    };
  }

  const customLeaderboard = Object.entries(custom.tools || {})
    .map(([tool, d]) => ({ tool, views: d.views || 0, actions: d.actions || 0 }))
    .sort((a, b) => (b.views + b.actions) - (a.views + a.actions));

  response.custom = {
    leaderboard: customLeaderboard,
    top_searches: Object.entries(custom.searches || {})
      .sort((a, b) => b[1] - a[1]).slice(0, 20)
      .map(([query, count]) => ({ query, count }))
  };

  cacheStore[cacheKey] = { data: response, time: now };
  context.res = { status: 200, headers, body: JSON.stringify(response) };
};