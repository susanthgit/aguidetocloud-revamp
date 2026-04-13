/**
 * GET /api/stats — Public analytics stats endpoint
 * Returns aggregated tool usage counts for the dashboard and homepage counters.
 * Cached for 5 minutes via response header.
 */

const fs = require('fs');
const path = require('path');

const STATS_FILE = path.join(__dirname, '..', '_data', 'analytics.json');

// Cache in memory for 5 minutes (reduces file reads)
let cache = null;
let cacheTime = 0;
const CACHE_TTL = 300000; // 5 minutes

function loadStats() {
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_TTL) return cache;
  try {
    if (fs.existsSync(STATS_FILE)) {
      cache = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
      cacheTime = now;
      return cache;
    }
  } catch (e) { /* return defaults */ }
  return { tools: {}, events: {}, searches: {}, daily: {}, updated: null };
}

function roundCount(n) {
  if (n < 100) return n;
  if (n < 1000) return Math.round(n / 10) * 10;
  if (n < 10000) return (n / 1000).toFixed(1) + 'K';
  return Math.round(n / 1000) + 'K';
}

module.exports = async function (context, req) {
  const origin = req.headers.origin || '';
  const allowed = origin.includes('aguidetocloud.com') || origin.includes('localhost');

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowed ? origin : '*',
    'Cache-Control': 'public, max-age=300'
  };

  const stats = loadStats();

  // Build tool leaderboard
  const leaderboard = Object.entries(stats.tools || {})
    .map(([tool, data]) => ({
      tool,
      views: data.views || 0,
      actions: data.actions || 0,
      total: (data.views || 0) + (data.actions || 0)
    }))
    .sort((a, b) => b.total - a.total);

  // Total counts
  const totalViews = leaderboard.reduce((s, t) => s + t.views, 0);
  const totalActions = leaderboard.reduce((s, t) => s + t.actions, 0);

  // Today's stats
  const today = new Date().toISOString().split('T')[0];
  const todayStats = stats.daily?.[today] || { views: 0, actions: 0 };

  // Last 7 days trend
  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const day = stats.daily?.[key] || { views: 0, actions: 0 };
    trend.push({ date: key, views: day.views, actions: day.actions });
  }

  // Top searches
  const topSearches = Object.entries(stats.searches || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([query, count]) => ({ query, count }));

  const response = {
    totals: {
      views: totalViews,
      actions: totalActions,
      views_display: roundCount(totalViews),
      actions_display: roundCount(totalActions)
    },
    today: todayStats,
    leaderboard,
    trend,
    top_searches: topSearches,
    updated: stats.updated
  };

  context.res = { status: 200, headers, body: JSON.stringify(response) };
};
