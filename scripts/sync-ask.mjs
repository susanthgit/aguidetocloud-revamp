#!/usr/bin/env node
/**
 * sync-ask.mjs — turn answered GitHub Discussions into indexable /ask/ pages.
 *
 * WHY THIS EXISTS
 * ───────────────
 * The /feedback/ page fetches discussions client-side and renders them into one
 * page. That means ~30 substantial, genuinely useful answers have no individual
 * URL, so Google indexes none of them and nobody can link to a single answer.
 * This script mirrors each ANSWERED discussion into content/ask/<slug>.md so
 * Hugo builds a real, static, indexable page per answer.
 *
 * Only answered discussions are published — an unanswered question is a thin
 * page and would dilute the section rather than help it.
 *
 * USAGE
 *   node scripts/sync-ask.mjs            # sync (PAT from env, else public API)
 *   node scripts/sync-ask.mjs --dry-run  # report only, write nothing
 *
 * TITLES
 *   Askers title their own threads, so some are too terse to work as a page
 *   title ("AZ-400", "SC-900"). data/ask_overrides.json lets you set a better
 *   title/slug per discussion number without touching the generated files.
 *
 * ENV
 *   GITHUB_FEEDBACK_PAT — GitHub PAT with read access to Discussions.
 *     With it: every discussion, paginated.
 *     Without it: falls back to the public /api/discussions endpoint, which
 *     returns only the 15 most recent. Fine for local dev, NOT for CI.
 */

import { writeFile, readFile, readdir, unlink, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'content', 'ask');
const OVERRIDES_FILE = path.join(ROOT, 'data', 'ask_overrides.json');
const OWNER = 'susanthgit';
const REPO = 'aguidetocloud-feedback';
const AUTHOR_LOGIN = 'susanthgit';
const PUBLIC_FALLBACK = 'https://www.aguidetocloud.com/api/discussions';
const DRY = process.argv.includes('--dry-run');

/* Quality gate. A reply shorter than this is conversational ("thanks!", "fixed,
   cheers") rather than an answer worth its own indexed page. Thin pages dilute
   the section, so they stay on /feedback/ only. */
const MIN_ANSWER_CHARS = 400;

/* ── Category prefix in titles, e.g. "[💬 General] Real title" ────────────── */
const TITLE_PREFIX = /^\[([^\]]+)\]\s*/;

/* Strip the emoji from "💬 General" → "General" */
function cleanCategory(raw) {
  return (raw || 'General').replace(/[^\p{L}\p{N}\s&-]/gu, '').trim() || 'General';
}

/* Defensive: discussion bodies should never contain an email (the API layer
   deliberately omits it), but a user can type one into their own message. These
   pages become Google-indexable, so redact rather than trust. */
function redact(text) {
  return String(text || '').replace(
    /[\w.+-]+@[\w-]+\.[\w.-]+/g,
    '[email removed]'
  );
}

function slugify(title, number) {
  const base = title
    .replace(TITLE_PREFIX, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .split('-')
    .slice(0, 10)
    .join('-');
  return base || `question-${number}`;
}

/* Markdown → plain text, for meta descriptions. */
function plain(md) {
  return String(md || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function describe(text, max = 155) {
  const s = plain(text);
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s]+$/, '') + '…';
}

/* YAML double-quoted scalar — safe for arbitrary user text. */
function yq(s) {
  return '"' + String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/[\r\n]+/g, ' ')
    .trim() + '"';
}

/* ── Fetching ─────────────────────────────────────────────────────────────── */

const DISCUSSION_FIELDS = `
  title url number createdAt
  category { name }
  body
  labels(first: 10) { nodes { name } }
  comments(first: 20) {
    totalCount
    nodes { body createdAt author { login } }
  }`;

async function fetchViaGraphql(pat) {
  const all = [];
  let cursor = null;
  for (let page = 0; page < 20; page++) {
    const query = `{
      repository(owner: "${OWNER}", name: "${REPO}") {
        discussions(first: 50, orderBy: {field: CREATED_AT, direction: DESC}
          ${cursor ? `, after: "${cursor}"` : ''}) {
          pageInfo { hasNextPage endCursor }
          nodes { ${DISCUSSION_FIELDS} }
        }
      }
    }`;
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${pat}`,
        'Content-Type': 'application/json',
        'User-Agent': 'aguidetocloud-ask-sync',
      },
      body: JSON.stringify({ query }),
    });
    const json = await res.json();
    if (json.errors) throw new Error('GitHub GraphQL: ' + JSON.stringify(json.errors));
    const conn = json.data?.repository?.discussions;
    if (!conn) throw new Error('Unexpected GraphQL shape — no discussions connection');
    all.push(...conn.nodes);
    if (!conn.pageInfo.hasNextPage) break;
    cursor = conn.pageInfo.endCursor;
  }
  return all;
}

async function fetchViaPublicApi() {
  const res = await fetch(PUBLIC_FALLBACK, { headers: { 'User-Agent': 'aguidetocloud-ask-sync' } });
  if (!res.ok) throw new Error(`Public API returned ${res.status}`);
  const json = await res.json();
  return json.discussions || [];
}

/* ── Transform ────────────────────────────────────────────────────────────── */

function toPage(d, overrides) {
  const titleRaw = d.title || '';
  const m = titleRaw.match(TITLE_PREFIX);
  const ov = overrides[String(d.number)] || {};
  const title = ov.title || titleRaw.replace(TITLE_PREFIX, '').trim() || `Question #${d.number}`;
  const category = cleanCategory(m ? m[1] : d.category?.name);

  // Body = question, then a "**From:** Name · ..." metadata footer after `---`.
  const [questionRaw = '', metaRaw = ''] = String(d.body || '').split(/\n---\n/);
  const question = redact(questionRaw.trim());
  const asker = (metaRaw.match(/\*\*From:\*\*\s*([^·\n]+)/) || [])[1]?.trim() || null;

  const answers = (d.comments?.nodes || [])
    .filter(c => c.author?.login === AUTHOR_LOGIN)
    .map(c => ({ body: redact(c.body || '').trim(), at: c.createdAt }))
    .filter(a => a.body);

  const status = (d.labels?.nodes || [])
    .map(l => l.name.toLowerCase())
    .find(n => ['shipped', 'planned', 'in-progress', 'wont-fix'].includes(n)) || null;

  return {
    number: d.number,
    slug: ov.slug || slugify(ov.title || titleRaw, d.number),
    title,
    category,
    asker,
    question,
    answers,
    status,
    createdAt: d.createdAt,
    answeredAt: answers[0]?.at || d.createdAt,
    url: d.url,
  };
}

function renderMarkdown(p) {
  const fm = [
    '---',
    `title: ${yq(p.title)}`,
    `description: ${yq(describe(p.answers[0].body))}`,
    `date: ${new Date(p.createdAt).toISOString()}`,
    `lastmod: ${new Date(p.answeredAt).toISOString()}`,
    `slug: ${yq(p.slug)}`,
    `ask_number: ${p.number}`,
    `ask_category: ${yq(p.category)}`,
    p.asker ? `ask_asker: ${yq(p.asker)}` : null,
    p.status ? `ask_status: ${yq(p.status)}` : null,
    `ask_discussion_url: ${yq(p.url)}`,
    `ask_question: ${yq(plain(p.question))}`,
    `ask_answer_count: ${p.answers.length}`,
    // Plain-text answer for QAPage schema — the rendered body also contains the
    // question, and acceptedAnswer.text must be the answer alone.
    `ask_answer_plain: ${yq(plain(p.answers.map(a => a.body).join(' ')).slice(0, 5000))}`,
    'sitemap:',
    '  priority: 0.6',
    '  changefreq: "monthly"',
    '---',
  ].filter(Boolean).join('\n');

  const body = [
    '## The question',
    '',
    p.question || '_(no detail given)_',
    '',
    '## The answer',
    '',
    p.answers.map(a => a.body).join('\n\n'),
    '',
  ].join('\n');

  // Generated file — never hand-edit; sync-ask.mjs overwrites it.
  return `${fm}\n<!-- generated by scripts/sync-ask.mjs — do not edit by hand -->\n\n${body}`;
}

/* ── Main ─────────────────────────────────────────────────────────────────── */

async function main() {
  const pat = process.env.GITHUB_FEEDBACK_PAT;
  let raw;

  let overrides = {};
  if (existsSync(OVERRIDES_FILE)) {
    try {
      overrides = JSON.parse(await readFile(OVERRIDES_FILE, 'utf8'));
    } catch (e) {
      throw new Error(`data/ask_overrides.json is not valid JSON: ${e.message}`);
    }
  }

  if (pat) {
    console.log('→ Fetching all discussions via GitHub GraphQL…');
    raw = await fetchViaGraphql(pat);
  } else {
    console.warn('⚠ GITHUB_FEEDBACK_PAT not set — falling back to the public API');
    console.warn('  (only the 15 most recent discussions; do NOT rely on this in CI)');
    raw = await fetchViaPublicApi();
  }
  console.log(`  ${raw.length} discussion(s) fetched`);

  const all = raw.map(d => toPage(d, overrides));
  const unanswered = all.filter(p => p.answers.length === 0);
  const thin = all.filter(
    p => p.answers.length > 0 &&
      p.answers.reduce((n, a) => n + a.body.length, 0) < MIN_ANSWER_CHARS
  );
  const pages = all.filter(
    p => p.answers.length > 0 &&
      p.answers.reduce((n, a) => n + a.body.length, 0) >= MIN_ANSWER_CHARS
  );

  console.log(`  ${pages.length} answered with substance → publishable`);
  if (unanswered.length) console.log(`  ${unanswered.length} unanswered → skipped`);
  if (thin.length) {
    console.log(`  ${thin.length} too short (<${MIN_ANSWER_CHARS} chars) → skipped:`);
    for (const p of thin) console.log(`      #${p.number} ${p.title}`);
  }

  // Resolve slug collisions deterministically by discussion number.
  const seen = new Map();
  for (const p of pages) {
    if (seen.has(p.slug)) p.slug = `${p.slug}-${p.number}`;
    seen.set(p.slug, p.number);
  }

  if (DRY) {
    for (const p of pages) console.log(`  · /ask/${p.slug}/  ← #${p.number} ${p.title}`);
    console.log('\nDry run — nothing written.');
    return;
  }

  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });

  const wanted = new Set(pages.map(p => `${p.slug}.md`));
  let written = 0;
  for (const p of pages) {
    await writeFile(path.join(OUT_DIR, `${p.slug}.md`), renderMarkdown(p), 'utf8');
    written++;
  }

  // Prune pages whose discussion was deleted or lost its answer. Never prune
  // when running off the public API — it only returns a 15-item window, so
  // everything older would look "deleted" and get wiped.
  let pruned = 0;
  if (pat) {
    for (const f of await readdir(OUT_DIR)) {
      if (f === '_index.md' || !f.endsWith('.md') || wanted.has(f)) continue;
      await unlink(path.join(OUT_DIR, f));
      pruned++;
    }
  }

  console.log(`\n✓ ${written} page(s) written${pruned ? `, ${pruned} pruned` : ''} → content/ask/`);
}

main().catch(err => {
  console.error('✗ sync-ask failed:', err.message);
  process.exit(1);
});
