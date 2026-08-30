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
 * EXCLUSIONS
 *   Some answered threads shouldn't become permanently-indexed pages even
 *   though they're substantial: billing/access disputes, private correspondence,
 *   thank-you notes, rants. Set {"exclude": "reason"} on the discussion number
 *   in data/ask_overrides.json. They stay visible on /feedback/ either way.
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
const FORCE = process.argv.includes('--force');

/* Ceiling on how many existing pages one run may delete. See the prune guard
   in main() — unbounded deletion is how an archive disappears in a single
   automated commit. Override with --force after eyeballing the list. */
const MAX_PRUNE = 3;

/* Floor on how many discussions a PAT-authenticated fetch must return. A
   successful-but-near-empty response (scope loss, repo rename, API incident)
   would otherwise read as "everything was deleted" and drive the pruner. */
const MIN_DISCUSSIONS = 10;

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
  // No square brackets in the placeholder: `[x]` immediately followed by an
  // attacker-controlled `(...)` is Markdown link syntax, so the previous
  // `[email removed]` let a submission such as
  // `me@x.test(javascript&#58;alert(1))` manufacture a live link out of text
  // that contained no link at all.
  return String(text || '').replace(
    /[\w.+-]+@[\w-]+\.[\w.-]+/g,
    'email removed'
  );
}

/* ── Hardening untrusted question text ────────────────────────────────────────
   The question body is typed by an anonymous stranger into the public form on
   /feedback/, posted to GitHub with the site's own PAT, and then written into a
   generated Markdown file. hugo.toml sets `unsafe = true` on the Goldmark
   renderer and layouts/ask/single.html emits `.Content`, so ANY raw HTML in
   that text becomes live markup on a Google-indexed page under Sush's byline.

   This is not hypothetical. Commit e04b45aa closed a live XSS on the very same
   feedback content, on the client-rendered /feedback/ page. That fix does not
   protect /ask/, because these pages are rendered by Hugo at build time and
   never pass through DOMPurify.

   The live CSP includes `script-src 'unsafe-inline'`, so it does not save us.

   DESIGN RULE, learned the hard way: none of this may depend on knowing which
   parts of the text Goldmark treats as code. The first version skipped escaping
   inside anything that *looked* like a fence or a code span, so every
   disagreement between that guess and Goldmark's real CommonMark lexer was a
   bypass. Two independent reviewers found eight between them: mid-line fences,
   `~~~`, four-backtick fences, backslash-escaped delimiters, indented fences,
   blockquote and list fences, and a CRLF variant. Patching those eight would
   only have produced a ninth.

   So the guards below are unconditional, and rest on properties that hold no
   matter how the text is parsed:
     - an HTML tag cannot open without `<` followed by a name-start character;
     - a numeric character reference cannot form without `&#`;
     - a shortcode cannot open without `{{<` or `{{%`.
   Link destinations are handled separately, and mostly by the site itself: see
   neutraliseCharRefs() for the measurement showing render-link.html already
   renders every scheme payload inert.
   The cost is that a reader's `<div>` inside a code fence renders as `&lt;div>`
   rather than `<div>`. Measured across the whole live corpus that costs nothing
   today: no page body contains a tag other than this generator's own comment. */

/* Numeric character references are neutralised FIRST, before the guards below
   introduce `&` of their own.

   Scope is deliberately narrow, and the narrowing is measured rather than
   assumed. A full Hugo build of eleven scheme-reconstitution payloads
   (`javascript&#58;`, `&#x3a;`, `&colon;`, `&Tab;`, `&NewLine;`, a leading
   `&#106;`, a reference definition, and the literal form) rendered every one of
   them inert *with no hardening at all*: `layouts/_default/_markup/render-link.html`
   builds the href through Go's html/template, which rewrites an unsafe scheme
   to `#ZgotmplZ`. So breaking every entity was buying nothing here.

   It was also costing something real. Escaping named references mangled text
   Sush had deliberately written: `&lt;N&gt;` reached readers as literal
   `&lt;N&gt;`, and `&mdash; &hellip; &rsquo;` as their source spelling. Named
   references are therefore left alone; the corpus uses them (16 occurrences)
   and uses numeric references nowhere (0), so escaping `#` forms costs nothing
   and still closes the classic obfuscation route. `AT&T` is untouched either
   way. assertInert() below decodes both forms regardless, so the backstop stays
   strictly stronger than this guard. */
function neutraliseCharRefs(s) {
  return s.replace(/&(?=#\d|#[xX][0-9a-fA-F])/g, '&amp;');
}

/* An HTML tag cannot start without `<` immediately followed by a letter, `/`,
   `!` or `?`. That is the HTML tokeniser's rule rather than a Markdown one, so
   it holds everywhere and needs no notion of where code begins. `<` before
   anything else is literal text to a browser, so `if (a < b)` and `<3` are
   deliberately left alone. */
function neutraliseRawHtml(s) {
  return s.replace(/<(?=[a-zA-Z/!?])/g, '&lt;');
}

/* Belt and braces for the plainly typed form. neutraliseCharRefs already stops
   an encoded scheme from ever forming; this catches the literal one, which is
   the common case and worth a readable replacement rather than an escape. */
function neutraliseLinkSchemes(s) {
  return s
    .replace(/\]\(\s*(?:javascript|data|vbscript|file):/gi, '](unsafe-scheme-removed:')
    // A CommonMark link label may contain an escaped `\]`, so `[^\]]+` stops one
    // character too early and misses `[a\]b]: javascript:…`. Match either a
    // non-bracket character or any backslash-escaped character.
    .replace(
      /^(\s*\[(?:[^\]\\\n]|\\.)+\]:\s*)(?:javascript|data|vbscript|file):/gim,
      '$1unsafe-scheme-removed:'
    );
}

/* Hugo expands shortcodes BEFORE Markdown runs, and it does so inside fenced
   code blocks too — so this one must apply everywhere, not just outside code.
   An unknown shortcode fails the whole site build (a reader could break the
   build by typing into a form); a real one runs with the site's own template
   privileges. Only `{{<` and `{{%` are shortcode openers, so a bare `{{` used
   in a code sample is left alone. The entity renders as a literal brace. */
function neutraliseShortcodes(s) {
  return s.replace(/\{\{([<%])/g, '&#123;&#123;$1');
}

/* Full treatment for any text that reaches the renderer. Order matters:
   character references are neutralised first, then the guards that emit them. */
function harden(text) {
  let s = String(text || '');
  s = neutraliseCharRefs(s);
  s = neutraliseRawHtml(s);
  s = neutraliseLinkSchemes(s);
  return neutraliseShortcodes(s);
}

/* Fail-closed backstop. The guards above are the fix; this asserts on the bytes
   that are about to be written, so a future edit which weakens or bypasses one
   of them stops the sync instead of publishing. It is deliberately independent
   of every assumption made above, and it is the check that would have caught
   both bypass classes two reviewers found in the first version of this file. */
function assertInert(text, label) {
  const s = String(text || '');
  const problems = [];

  const tag = s.match(/<[a-zA-Z/!?][^\n]{0,40}/);
  if (tag) problems.push(`raw HTML tag ${JSON.stringify(tag[0])}`);
  if (/\{\{[<%]/.test(s)) problems.push('unescaped Hugo shortcode');

  /* Decode what a Markdown parser may decode in a link destination — numeric
     AND named references — then strip the whitespace a browser strips from a
     URL before it parses the scheme. Order is the whole point: an earlier
     version decoded `&Tab;` and `&NewLine;` INTO the middle of the scheme and
     then matched against that, so its own decoding broke its own pattern and
     both genuinely dangerous forms were waved through.

     This is deliberately stricter than harden(), which leaves named references
     alone so that `&mdash;` and friends still render. That asymmetry used to be
     unsafe for a different reason: assertInert is fail-closed, and it ran
     inside a bare .map() over every discussion, so a single rejection aborted
     the run and published nothing at all. Rejections are now quarantined per
     discussion, so the cost of being strict is one page skipped and logged. */
  const NAMED = {
    colon: ':', sol: '/', bsol: '\\', Tab: '\t', NewLine: '\n', semi: ';',
    period: '.', lpar: '(', rpar: ')', num: '#', quest: '?', commat: '@',
    excl: '!', apos: "'", quot: '"', lt: '<', gt: '>', amp: '&',
    nbsp: '\u00a0', sp: ' ',
  };
  const cp = n => (Number.isFinite(n) && n >= 0 && n <= 0x10ffff ? String.fromCodePoint(n) : '');
  const decoded = s
    .replace(/&#(\d{1,7});/g, (_, d) => cp(Number(d)))
    .replace(/&#[xX]([0-9a-fA-F]{1,6});/g, (_, h) => cp(parseInt(h, 16)))
    .replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (m, n) => (n in NAMED ? NAMED[n] : m));

  const SCHEMES = 'javascript|data|vbscript|file';
  // Inline `](scheme:` — all whitespace removed, since none of it can legally
  // appear inside a destination and a browser would ignore it anyway.
  const inline = decoded.replace(/[\u0000-\u0020\u00a0]/g, '');
  // Reference definition `[label]: scheme:` — keep newlines so `^` still means
  // start of line, or the anchor stops distinguishing a definition from prose.
  const perLine = decoded.replace(/[^\S\n]|\u00a0/g, '');
  const scheme =
    inline.match(new RegExp(`\\]\\((?:${SCHEMES}):[^\\n)]{0,40}`, 'i')) ||
    perLine.match(new RegExp(`^\\[(?:[^\\]\\\\\\n]|\\\\.)+\\]:(?:${SCHEMES}):[^\\n]{0,40}`, 'im'));
  if (scheme) problems.push(`dangerous link scheme ${JSON.stringify(scheme[0])}`);

  if (problems.length) {
    throw new Error(`Refusing to publish ${label}: ${problems.join('; ')}`);
  }
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
  let exhausted = false;
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
    if (!conn.pageInfo.hasNextPage) { exhausted = true; break; }
    cursor = conn.pageInfo.endCursor;
  }
  /* Falling out of the loop with more pages left would silently return a
     partial archive, and a partial archive drives the pruner — every unseen
     discussion would look deleted. Fail loudly instead. */
  if (!exhausted) {
    throw new Error(
      'Pagination cap hit (20 pages / 1000 discussions) with more still to fetch. ' +
      'Raise the cap before syncing, or the pruner will delete pages for every ' +
      'discussion beyond the cap.'
    );
  }
  /* comments(first: 20) can hide a later answer. Currently the busiest thread
     has 3, so this is a tripwire for the future rather than a live problem.
     It warns rather than throws: any GitHub account can post 21 comments on a
     public discussion, and a truncated answer window is a content shortfall on
     one page, not a reason to stop publishing every other page. */
  const truncated = all.filter(d => (d.comments?.totalCount || 0) > 20);
  if (truncated.length) {
    console.warn(
      `  ⚠ Discussion(s) ${truncated.map(d => '#' + d.number).join(', ')} have more than 20 ` +
      'comments, so the answer window is truncated. Raise comments(first:) before the next sync.'
    );
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
  // Stranger-supplied: redact, then harden before it can reach the renderer.
  const question = harden(redact(questionRaw.trim()));
  assertInert(question, `question in discussion #${d.number}`);
  const asker = (metaRaw.match(/\*\*From:\*\*\s*([^·\n]+)/) || [])[1]?.trim() || null;

  const answers = (d.comments?.nodes || [])
    .filter(c => c.author?.login === AUTHOR_LOGIN)
    // Hardened on the same terms as the question. This is not about distrusting
    // Sush: one invariant for the whole page is what lets assertInert below be
    // absolute rather than conditional. The measured cost is nil, since no
    // existing answer contains a tag.
    .map(c => ({ body: harden(redact(c.body || '')).trim(), at: c.createdAt }))
    .filter(a => a.body);

  answers.forEach((a, i) =>
    assertInert(a.body, `answer ${i + 1} in discussion #${d.number}`)
  );

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
    excluded: ov.exclude || null,
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

  /* A short-but-successful response is the dangerous case: it looks like a
     clean run while carrying almost no data, and the pruner trusts it. */
  if (pat && raw.length < MIN_DISCUSSIONS) {
    throw new Error(
      `Only ${raw.length} discussion(s) came back, below MIN_DISCUSSIONS=${MIN_DISCUSSIONS}. ` +
      'Treating this as a failed fetch rather than a mass deletion. Check the PAT scopes ' +
      'and the repository before re-running.'
    );
  }

  /* assertInert is fail-closed by design, and toPage runs on every discussion
     before any filter. If a single rejection threw from here it would abort
     main(), so one anonymous form submission could stop every other page from
     being written or updated — an availability hole reachable by a stranger.
     Quarantine the offending discussion instead, and make it loud. */
  const quarantined = [];
  const all = [];
  for (const d of raw) {
    try {
      all.push(toPage(d, overrides));
    } catch (err) {
      quarantined.push({ number: d.number, message: err.message });
    }
  }
  if (quarantined.length) {
    console.warn(`  ⚠ ${quarantined.length} discussion(s) quarantined, not published:`);
    for (const q of quarantined) console.warn(`      #${q.number} — ${q.message}`);
  }
  const excluded = all.filter(p => p.excluded);
  const candidates = all.filter(p => !p.excluded);
  const unanswered = candidates.filter(p => p.answers.length === 0);
  const thin = candidates.filter(
    p => p.answers.length > 0 &&
      p.answers.reduce((n, a) => n + a.body.length, 0) < MIN_ANSWER_CHARS
  );
  const pages = candidates.filter(
    p => p.answers.length > 0 &&
      p.answers.reduce((n, a) => n + a.body.length, 0) >= MIN_ANSWER_CHARS
  );

  console.log(`  ${pages.length} answered with substance → publishable`);
  if (unanswered.length) console.log(`  ${unanswered.length} unanswered → skipped`);
  if (thin.length) {
    console.log(`  ${thin.length} too short (<${MIN_ANSWER_CHARS} chars) → skipped:`);
    for (const p of thin) console.log(`      #${p.number} ${p.title}`);
  }
  if (excluded.length) {
    console.log(`  ${excluded.length} excluded by data/ask_overrides.json:`);
    for (const p of excluded) console.log(`      #${p.number} ${p.title} — ${p.excluded}`);
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
    const stale = (await readdir(OUT_DIR)).filter(
      f => f !== '_index.md' && f.endsWith('.md') && !wanted.has(f)
    );
    /* Deletion was previously unbounded: any bug that shrank `wanted` — an API
       hiccup returning few discussions, a filter regression, a bad override
       file — would delete the entire archive and commit that. A real removal is
       one or two pages, so anything larger is a fault until a human says
       otherwise. */
    if (stale.length > MAX_PRUNE && !FORCE) {
      throw new Error(
        `Refusing to prune ${stale.length} page(s) — more than MAX_PRUNE=${MAX_PRUNE}.\n` +
        `  ${stale.join('\n  ')}\n` +
        'This usually means the fetch was incomplete, not that the answers are gone. ' +
        'Re-run with --force once you have confirmed the deletions are real.'
      );
    }
    for (const f of stale) {
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
