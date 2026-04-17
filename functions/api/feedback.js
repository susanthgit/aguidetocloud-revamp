/**
 * POST /api/feedback — Cloudflare Pages Function
 * Creates GitHub Discussions from feedback form submissions.
 * Ported from Azure Function as part of Cloudflare migration.
 *
 * Environment variables (set in CF Pages dashboard):
 *   GITHUB_FEEDBACK_PAT — GitHub PAT with discussions:write scope
 *   GITHUB_REPO_ID      — GraphQL node ID of the feedback repo
 */

const CATEGORY_MAP = {
  'questions':        { label: '❓ Question',        ghCategory: 'Q&A' },
  'feature-requests': { label: '💡 Feature Request', ghCategory: 'Ideas' },
  'video-requests':   { label: '🎬 Video Request',   ghCategory: 'Ideas' },
  'bug-reports':      { label: '🐛 Bug Report',      ghCategory: 'General' },
  'tool-feedback':    { label: '🔧 Tool Feedback',   ghCategory: 'General' },
  'content-ideas':    { label: '📝 Content Idea',    ghCategory: 'Ideas' },
  'general':          { label: '💬 General',          ghCategory: 'General' },
};

const TOOL_LABELS = {
  'ai-news': 'AI News',
  'm365-roadmap': 'M365 Roadmap Tracker',
  'prompts': 'AI Prompt Library',
  'prompt-polisher': 'Prompt Polisher',
  'cert-tracker': 'Cert Study Guides',
  'licensing': 'Licensing Simplifier',
  'service-health': 'Service Health Tracker',
  'copilot-readiness': 'Copilot Readiness Checker',
  'copilot-matrix': 'Copilot Feature Matrix',
};

// In-memory rate limiter (resets on cold start — acceptable for CF Functions)
const RATE_LIMIT = new Map();
const RATE_WINDOW = 10 * 60 * 1000;
const RATE_MAX = 3;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = RATE_LIMIT.get(ip);
  if (!entry) { RATE_LIMIT.set(ip, { count: 1, start: now }); return false; }
  if (now - entry.start > RATE_WINDOW) { RATE_LIMIT.set(ip, { count: 1, start: now }); return false; }
  entry.count++;
  return entry.count > RATE_MAX;
}

async function graphql(pat, query, variables = {}) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${pat}`,
      'Content-Type': 'application/json',
      'User-Agent': 'aguidetocloud-feedback',
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

async function getCategoryId(pat, categoryName) {
  const query = `{
    repository(owner: "susanthgit", name: "aguidetocloud-feedback") {
      discussionCategories(first: 20) { nodes { id name } }
    }
  }`;
  const res = await graphql(pat, query);
  const categories = res.data?.repository?.discussionCategories?.nodes || [];
  return categories.find(c => c.name === categoryName)?.id || null;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Origin check
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = ['https://www.aguidetocloud.com', 'https://aguidetocloud.com'];
  const isLocalhost = origin.startsWith('http://localhost');
  if (!allowedOrigins.includes(origin) && !isLocalhost) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  // Rate limit
  const clientIp = request.headers.get('cf-connecting-ip') || 'unknown';
  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: 'Too many submissions.' }), { status: 429 });
  }

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  // Honeypot
  if (body.website) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const { category, subject, message, name, email, tool } = body;

  if (!category || !CATEGORY_MAP[category]) {
    return new Response(JSON.stringify({ error: 'Invalid category' }), { status: 400 });
  }
  if (!subject || subject.trim().length < 5) {
    return new Response(JSON.stringify({ error: 'Subject must be at least 5 characters' }), { status: 400 });
  }
  if (!message || message.trim().length < 10) {
    return new Response(JSON.stringify({ error: 'Message must be at least 10 characters' }), { status: 400 });
  }

  const pat = env.GITHUB_FEEDBACK_PAT;
  const repoId = env.GITHUB_REPO_ID;
  if (!pat || !repoId) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  try {
    const catInfo = CATEGORY_MAP[category];
    const toolLabel = tool ? TOOL_LABELS[tool] || tool : null;
    const discussionTitle = `[${catInfo.label}] ${subject.trim()}`;

    let discussionBody = message.trim();
    const metaParts = [];
    if (name) metaParts.push(`**From:** ${name.trim()}`);
    if (email) metaParts.push(`**Email:** ${email.trim()}`);
    if (toolLabel) metaParts.push(`**Related Tool:** ${toolLabel}`);
    metaParts.push(`**Category:** ${catInfo.label}`);
    if (metaParts.length) discussionBody += '\n\n---\n' + metaParts.join(' · ');

    const categoryId = await getCategoryId(pat, catInfo.ghCategory);
    if (!categoryId) {
      return new Response(JSON.stringify({ error: 'Could not find discussion category' }), { status: 500 });
    }

    const mutation = `mutation($repoId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
      createDiscussion(input: { repositoryId: $repoId, categoryId: $categoryId, title: $title, body: $body }) {
        discussion { url }
      }
    }`;

    const result = await graphql(pat, mutation, { repoId, categoryId, title: discussionTitle, body: discussionBody });

    if (result.errors) {
      console.error('GitHub API errors:', JSON.stringify(result.errors));
      return new Response(JSON.stringify({ error: 'Failed to create discussion' }), { status: 500 });
    }

    return new Response(JSON.stringify({
      ok: true,
      url: result.data?.createDiscussion?.discussion?.url,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error creating discussion:', err.message);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
