/**
 * Azure Function — POST /api/feedback
 * Receives feedback form submissions and creates GitHub Discussions
 * via the GitHub GraphQL API.
 *
 * Environment variables:
 *   GITHUB_FEEDBACK_PAT — GitHub PAT with `discussions:write` scope
 *   GITHUB_REPO_ID      — GraphQL node ID of the feedback repo
 */

// Maps our UI categories → display names + GitHub Discussion categories
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

// Simple in-memory rate limiter (per IP, 3 submissions per 10 min)
const RATE_LIMIT = new Map();
const RATE_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_MAX = 3;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = RATE_LIMIT.get(ip);
  if (!entry) {
    RATE_LIMIT.set(ip, { count: 1, start: now });
    return false;
  }
  if (now - entry.start > RATE_WINDOW) {
    RATE_LIMIT.set(ip, { count: 1, start: now });
    return false;
  }
  entry.count++;
  return entry.count > RATE_MAX;
}

module.exports = async function (context, req) {
  // Only accept POST with JSON body
  if (req.method !== 'POST') {
    context.res = { status: 405, body: { error: 'Method not allowed' } };
    return;
  }

  // Origin check — only accept from our own site
  const origin = req.headers['origin'] || req.headers['referer'] || '';
  if (!origin.includes('aguidetocloud.com') && !origin.includes('localhost')) {
    context.res = { status: 403, body: { error: 'Forbidden' } };
    return;
  }

  // Server-side rate limiting
  const clientIp = req.headers['x-forwarded-for'] || req.headers['x-client-ip'] || 'unknown';
  if (isRateLimited(clientIp)) {
    context.res = { status: 429, body: { error: 'Too many submissions. Please try again later.' } };
    return;
  }

  const body = req.body;
  if (!body) {
    context.res = { status: 400, body: { error: 'Missing request body' } };
    return;
  }

  // Honeypot check
  if (body.website) {
    context.res = { status: 200, body: { ok: true } }; // Silently accept to fool bots
    return;
  }

  // Validate required fields
  const { category, subject, message, name, email, tool } = body;

  if (!category || !CATEGORY_MAP[category]) {
    context.res = { status: 400, body: { error: 'Invalid category' } };
    return;
  }
  if (!subject || subject.trim().length < 5) {
    context.res = { status: 400, body: { error: 'Subject must be at least 5 characters' } };
    return;
  }
  if (!message || message.trim().length < 10) {
    context.res = { status: 400, body: { error: 'Message must be at least 10 characters' } };
    return;
  }

  // Build discussion body
  const catInfo = CATEGORY_MAP[category];
  const toolLabel = tool ? TOOL_LABELS[tool] || tool : null;

  // Prefix title with category label for easy scanning
  const discussionTitle = `[${catInfo.label}] ${subject.trim()}`;
  let discussionBody = message.trim();

  // Add metadata footer
  const metaParts = [];
  if (name) metaParts.push(`**From:** ${name.trim()}`);
  if (email) metaParts.push(`**Email:** ${email.trim()}`);
  if (toolLabel) metaParts.push(`**Related Tool:** ${toolLabel}`);
  metaParts.push(`**Category:** ${catInfo.label}`);

  if (metaParts.length > 0) {
    discussionBody += '\n\n---\n' + metaParts.join(' · ');
  }

  // Fetch repo + category IDs from GitHub
  const pat = process.env.GITHUB_FEEDBACK_PAT;
  const repoId = process.env.GITHUB_REPO_ID;

  if (!pat || !repoId) {
    context.log.error('Missing GITHUB_FEEDBACK_PAT or GITHUB_REPO_ID env vars');
    context.res = { status: 500, body: { error: 'Server configuration error' } };
    return;
  }

  try {
    // Get the GitHub Discussion category ID (maps to default categories)
    const categoryId = await getCategoryId(pat, catInfo.ghCategory);
    if (!categoryId) {
      context.res = { status: 500, body: { error: 'Could not find discussion category' } };
      return;
    }

    // Create the discussion
    const result = await createDiscussion(pat, repoId, categoryId, discussionTitle, discussionBody);

    if (result.errors) {
      context.log.error('GitHub API errors:', JSON.stringify(result.errors));
      context.res = { status: 500, body: { error: 'Failed to create discussion' } };
      return;
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        ok: true,
        url: result.data?.createDiscussion?.discussion?.url,
      },
    };
  } catch (err) {
    context.log.error('Error creating discussion:', err.message);
    context.res = { status: 500, body: { error: 'Internal server error' } };
  }
};

async function getCategoryId(pat, categoryName) {
  const query = `
    query {
      repository(owner: "susanthgit", name: "aguidetocloud-feedback") {
        discussionCategories(first: 20) {
          nodes { id name }
        }
      }
    }
  `;

  const res = await graphql(pat, query);
  const categories = res.data?.repository?.discussionCategories?.nodes || [];
  const match = categories.find(c => c.name === categoryName);
  return match?.id || null;
}

async function createDiscussion(pat, repoId, categoryId, title, body) {
  const mutation = `
    mutation($repoId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
      createDiscussion(input: {
        repositoryId: $repoId,
        categoryId: $categoryId,
        title: $title,
        body: $body
      }) {
        discussion { url }
      }
    }
  `;

  return graphql(pat, mutation, { repoId, categoryId, title, body });
}

async function graphql(pat, query, variables = {}) {
  const https = require('https');
  const postData = JSON.stringify({ query, variables });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Authorization': `bearer ${pat}`,
        'Content-Type': 'application/json',
        'User-Agent': 'aguidetocloud-feedback',
        'Content-Length': Buffer.byteLength(postData),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Failed to parse GitHub response')); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}
