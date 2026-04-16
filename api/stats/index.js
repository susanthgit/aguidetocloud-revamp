/**
 * GET /api/stats — Public analytics stats endpoint
 * Merges data from: GA4 (traffic), Google Search Console (queries), and custom tracking (tool events).
 * Cached for 5 minutes.
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const STATS_FILE = path.join(__dirname, '..', '_data', 'analytics.json');
const GA4_PROPERTY = process.env.GA4_PROPERTY_ID || '530486519';
const GSC_SITE = process.env.GSC_SITE_URL || 'https://www.aguidetocloud.com/';

// Full response cache (5 min)
let fullCache = null;
let fullCacheTime = 0;
const CACHE_TTL = 300000;

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

async function fetchGA4Data(auth) {
  try {
    const analyticsdata = google.analyticsdata({ version: 'v1beta', auth });

    // Last 30 days top pages
    const pagesRes = await analyticsdata.properties.runReport({
      property: `properties/${GA4_PROPERTY}`,
      requestBody: {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 50
      }
    });

    // Last 30 days daily trend
    const trendRes = await analyticsdata.properties.runReport({
      property: `properties/${GA4_PROPERTY}`,
      requestBody: {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
        orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }]
      }
    });

    // Week-over-week comparison
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

    // Today's totals
    const todayRes = await analyticsdata.properties.runReport({
      property: `properties/${GA4_PROPERTY}`,
      requestBody: {
        dateRanges: [{ startDate: 'today', endDate: 'today' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'sessions' }]
      }
    });

    // Total 30-day summary
    const summaryRes = await analyticsdata.properties.runReport({
      property: `properties/${GA4_PROPERTY}`,
      requestBody: {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'sessions' }]
      }
    });

    // Country breakdown
    const geoRes = await analyticsdata.properties.runReport({
      property: `properties/${GA4_PROPERTY}`,
      requestBody: {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 15
      }
    });

    // Device category
    const deviceRes = await analyticsdata.properties.runReport({
      property: `properties/${GA4_PROPERTY}`,
      requestBody: {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'activeUsers' }]
      }
    });

    // Traffic sources
    const sourceRes = await analyticsdata.properties.runReport({
      property: `properties/${GA4_PROPERTY}`,
      requestBody: {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10
      }
    });

    return { pagesRes, trendRes, todayRes, summaryRes, geoRes, deviceRes, sourceRes, wowRes };
  } catch (e) {
    console.error('GA4 error:', e.message);
    return null;
  }
}

async function fetchGSCData(auth) {
  try {
    const searchconsole = google.searchconsole({ version: 'v1', auth });
    const res = await searchconsole.searchanalytics.query({
      siteUrl: GSC_SITE,
      requestBody: {
        startDate: formatDate(30),
        endDate: formatDate(0),
        dimensions: ['query'],
        rowLimit: 25,
        type: 'web'
      }
    });
    return res.data.rows || [];
  } catch (e) {
    console.error('GSC error:', e.message);
    return [];
  }
}

function formatDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function parseRows(res) {
  if (!res?.data?.rows) return [];
  return res.data.rows.map(r => ({
    dimensions: r.dimensionValues?.map(d => d.value) || [],
    metrics: r.metricValues?.map(m => parseInt(m.value) || 0) || []
  }));
}

// Tool path mapping
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

  // Return cached response if fresh
  const now = Date.now();
  if (fullCache && now - fullCacheTime < CACHE_TTL) {
    context.res = { status: 200, headers, body: JSON.stringify(fullCache) };
    return;
  }

  const auth = getAuthClient();
  let ga4 = null, gscRows = [];

  if (auth) {
    [ga4, gscRows] = await Promise.all([fetchGA4Data(auth), fetchGSCData(auth)]);
  }

  const custom = loadCustomStats();

  // Build response
  const response = { ga4: null, gsc: null, custom: null, updated: new Date().toISOString() };

  // --- GA4 data ---
  if (ga4) {
    const summaryRows = parseRows(ga4.summaryRes);
    const todayRows = parseRows(ga4.todayRes);

    // Top pages → tool leaderboard
    const pageRows = parseRows(ga4.pagesRes);
    const toolStats = {};
    const topPages = [];
    for (const r of pageRows) {
      const pagePath = r.dimensions[0];
      const views = r.metrics[0];
      const users = r.metrics[1];
      topPages.push({ path: pagePath, views, users });

      // Match to tool
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

    // Daily trend
    const trendRows = parseRows(ga4.trendRes);
    const trend = trendRows.map(r => {
      const raw = r.dimensions[0]; // YYYYMMDD
      const date = `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`;
      return { date, views: r.metrics[0], users: r.metrics[1] };
    });

    // Geography
    const geoRows = parseRows(ga4.geoRes);
    const countries = geoRows.map(r => ({ country: r.dimensions[0], users: r.metrics[0] }));

    // Devices
    const deviceRows = parseRows(ga4.deviceRes);
    const devices = deviceRows.map(r => ({ device: r.dimensions[0], users: r.metrics[0] }));

    // Sources
    const sourceRows = parseRows(ga4.sourceRes);
    const sources = sourceRows.map(r => ({ source: r.dimensions[0], sessions: r.metrics[0] }));

    // Week-over-week comparison
    const wowRows = parseRows(ga4.wowRes);
    let wow = null;
    if (wowRows.length >= 1) {
      const thisWeek = { views: wowRows[0]?.metrics[0] || 0, users: wowRows[0]?.metrics[1] || 0, sessions: wowRows[0]?.metrics[2] || 0 };
      const lastWeek = { views: wowRows[1]?.metrics[0] || 0, users: wowRows[1]?.metrics[1] || 0, sessions: wowRows[1]?.metrics[2] || 0 };
      const pct = (curr, prev) => prev > 0 ? Math.round(((curr - prev) / prev) * 100) : (curr > 0 ? 100 : 0);
      wow = {
        thisWeek, lastWeek,
        change: { views: pct(thisWeek.views, lastWeek.views), users: pct(thisWeek.users, lastWeek.users), sessions: pct(thisWeek.sessions, lastWeek.sessions) }
      };
    }

    // Blog pages (filter from top pages)
    const blogPages = topPages.filter(p => p.path.startsWith('/blog/')).slice(0, 15);

    response.ga4 = {
      totals: {
        views: summaryRows[0]?.metrics[0] || 0,
        users: summaryRows[0]?.metrics[1] || 0,
        sessions: summaryRows[0]?.metrics[2] || 0
      },
      today: {
        views: todayRows[0]?.metrics[0] || 0,
        users: todayRows[0]?.metrics[1] || 0
      },
      leaderboard,
      trend,
      top_pages: topPages.slice(0, 30),
      blog_pages: blogPages,
      countries,
      devices,
      sources,
      wow
    };
  }

  // --- GSC data ---
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

  // --- Custom tracking data ---
  const customLeaderboard = Object.entries(custom.tools || {})
    .map(([tool, d]) => ({ tool, views: d.views || 0, actions: d.actions || 0 }))
    .sort((a, b) => (b.views + b.actions) - (a.views + a.actions));

  response.custom = {
    leaderboard: customLeaderboard,
    top_searches: Object.entries(custom.searches || {})
      .sort((a, b) => b[1] - a[1]).slice(0, 20)
      .map(([query, count]) => ({ query, count }))
  };

  // Cache
  fullCache = response;
  fullCacheTime = now;

  context.res = { status: 200, headers, body: JSON.stringify(response) };
};

