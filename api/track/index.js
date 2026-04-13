/**
 * POST /api/track — Anonymous event tracking endpoint
 * Accepts: { event: "page_view"|"prompt_copy"|"tool_complete"|"search_query", tool: "ai-news", meta?: "search term" }
 * Stores aggregated counts in-memory (persisted to file on SWA managed functions).
 * No PII collected or stored.
 */

// In-memory store — SWA managed functions are short-lived, so we use a JSON file for persistence
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '_data');
const STATS_FILE = path.join(DATA_DIR, 'analytics.json');
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // max events per IP per minute
const DEDUPE_WINDOW = 30000; // 30 seconds

// Valid event types
const VALID_EVENTS = ['page_view', 'prompt_copy', 'tool_complete', 'search_query'];

// Known bot patterns
const BOT_PATTERNS = /bot|crawler|spider|crawling|headless|phantom|selenium|puppeteer|lighthouse/i;

// In-memory rate limit + dedupe (resets when function cold-starts, which is fine)
const rateLimits = {};
const recentEvents = {};

function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  if (!rateLimits[ip]) rateLimits[ip] = [];
  rateLimits[ip] = rateLimits[ip].filter(t => now - t < RATE_LIMIT_WINDOW);
  if (rateLimits[ip].length >= RATE_LIMIT_MAX) return true;
  rateLimits[ip].push(now);
  return false;
}

function isDuplicate(ip, event, tool) {
  const key = `${ip}:${event}:${tool}`;
  const now = Date.now();
  if (recentEvents[key] && now - recentEvents[key] < DEDUPE_WINDOW) return true;
  recentEvents[key] = now;
  return false;
}

function loadStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      return JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
    }
  } catch (e) { /* start fresh */ }
  return { tools: {}, events: {}, searches: {}, daily: {}, updated: null };
}

function saveStats(stats) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    stats.updated = new Date().toISOString();
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats), 'utf8');
  } catch (e) { /* best effort */ }
}

module.exports = async function (context, req) {
  // CORS
  const origin = req.headers.origin || '';
  const allowed = origin.includes('aguidetocloud.com') || origin.includes('localhost');

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowed ? origin : 'https://www.aguidetocloud.com',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Bot filter
  const ua = req.headers['user-agent'] || '';
  if (BOT_PATTERNS.test(ua)) {
    context.res = { status: 204, headers, body: '' };
    return;
  }

  const ip = getClientIP(req);

  // Rate limit
  if (isRateLimited(ip)) {
    context.res = { status: 429, headers, body: JSON.stringify({ error: 'rate_limited' }) };
    return;
  }

  // Parse body
  const body = req.body || {};
  const { event, tool, meta } = body;

  // Validate
  if (!event || !VALID_EVENTS.includes(event)) {
    context.res = { status: 400, headers, body: JSON.stringify({ error: 'invalid_event' }) };
    return;
  }

  if (!tool || typeof tool !== 'string' || tool.length > 50) {
    context.res = { status: 400, headers, body: JSON.stringify({ error: 'invalid_tool' }) };
    return;
  }

  // Dedupe
  if (isDuplicate(ip, event, tool)) {
    context.res = { status: 204, headers, body: '' };
    return;
  }

  // Record
  const stats = loadStats();
  const today = new Date().toISOString().split('T')[0];

  // Tool totals
  if (!stats.tools[tool]) stats.tools[tool] = { views: 0, actions: 0 };
  if (event === 'page_view') {
    stats.tools[tool].views++;
  } else {
    stats.tools[tool].actions++;
  }

  // Event totals
  if (!stats.events[event]) stats.events[event] = 0;
  stats.events[event]++;

  // Daily totals
  if (!stats.daily[today]) stats.daily[today] = { views: 0, actions: 0 };
  if (event === 'page_view') {
    stats.daily[today].views++;
  } else {
    stats.daily[today].actions++;
  }

  // Search queries (top 100)
  if (event === 'search_query' && meta && typeof meta === 'string') {
    const q = meta.toLowerCase().trim().substring(0, 100);
    if (q) {
      if (!stats.searches[q]) stats.searches[q] = 0;
      stats.searches[q]++;
      // Keep only top 100 queries
      const sorted = Object.entries(stats.searches).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 100) {
        stats.searches = Object.fromEntries(sorted.slice(0, 100));
      }
    }
  }

  saveStats(stats);

  context.res = { status: 204, headers, body: '' };
};
