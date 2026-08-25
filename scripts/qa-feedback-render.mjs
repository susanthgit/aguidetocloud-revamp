#!/usr/bin/env node
/**
 * QA guard for how /feedback/ RENDERS discussion bodies.
 *
 * Sibling of qa-feedback.mjs (which verifies the live page's nav/layout).
 * This one serves the built `public/` dir and intercepts /api/discussions with
 * a captured real payload, so it runs offline and deterministically.
 *
 * It asserts three things that have each broken in production:
 *
 *   1. SECURITY  - no attacker-controlled markup or event handler survives.
 *                  A real attribute-injection XSS shipped here: esc() escapes
 *                  for TEXT context and leaves quotes intact, so a crafted URL
 *                  could close href= and open an onmouseover= handler.
 *   2. RENDERING - GitHub tables/headings/rules render as HTML, not as the
 *                  literal pipe-and-hash soup users were seeing.
 *   3. LAYOUT    - a wide table scrolls inside its own box instead of pushing
 *                  the whole page sideways on a phone.
 *
 * Growing guardrail: every future feedback-render bug gets a check added here.
 * Never delete checks - they are the memory of customer-facing bugs.
 *
 *   node scripts/qa-feedback-render.mjs [--fixture <path>] [--headed]
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
// playwright is imported lazily, inside the browser phase only. --static must
// run from a bare `git archive` of the pushed commit, where node_modules does
// not exist; a top-level import would make that impossible.
import os from 'node:os';

// FB_QA_ROOT lets the pre-push hook point the checks at an extracted copy of the
// commit being pushed, instead of the working tree that merely happens to be on
// disk. Gate B round 4: verifying files the push does not contain is theatre.
const ROOT = process.env.FB_QA_ROOT
  ? path.resolve(process.env.FB_QA_ROOT)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');

const argv = process.argv.slice(2);
// --static: contract + source checks only. No browser, no Hugo build, ~200ms.
// This exists so the REAL git pre-push hook can afford to run it. The full
// browser suite lives in scripts/pre-push-check.ps1, which git never invokes —
// a guard nobody is forced to run is already dead (Law of Dead Mechanisms).
const STATIC_ONLY = argv.includes('--static');
const fixtureArg = argv.indexOf('--fixture');
const FIXTURE = fixtureArg !== -1
  ? path.resolve(argv[fixtureArg + 1])
  : path.join(ROOT, 'tests', 'fixtures', 'feedback-discussions.json');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon'
};

let failures = 0, checks = 0;
function check(name, ok, detail) {
  checks++;
  if (ok) console.log(`  \u001b[32mPASS\u001b[0m  ${name}`);
  else { failures++; console.log(`  \u001b[31mFAIL\u001b[0m  ${name}${detail ? '\n        ' + detail : ''}`); }
}

// This suite tests the BUILT output, so a stale `public/` would let it pass
// while the real change is untested - a green bar that means nothing. Refuse to
// run rather than report a false pass.
function assertBuildFresh() {
  const pairs = [
    ['static/js/feedback.js', 'public/js/feedback.js'],
    ['static/css/feedback.css', 'public/css/feedback.css'],
    ['static/js/vendor/purify-3.4.13.min.js', 'public/js/vendor/purify-3.4.13.min.js']
  ];
  const stale = [];
  for (const [src, out] of pairs) {
    const s = path.join(ROOT, src), o = path.join(ROOT, out);
    if (!fs.existsSync(s)) continue;
    if (!fs.existsSync(o)) { stale.push(`${out} is missing`); continue; }
    if (!fs.readFileSync(s).equals(fs.readFileSync(o))) stale.push(`${out} differs from ${src}`);
  }
  if (stale.length) {
    console.error('\u001b[31m\u274c BUILD IS STALE - refusing to report a meaningless pass\u001b[0m');
    stale.forEach(s => console.error('   ' + s));
    console.error('   Run: pwsh -NoProfile -File scripts\\hugo-safe.ps1');
    process.exit(1);
  }
}

function serve(dir) {
  const server = http.createServer((req, res) => {
    const p = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(dir, p);
    try {
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      if (!fs.existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      res.end(fs.readFileSync(file));
    } catch (e) { res.writeHead(500); res.end(String(e)); }
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}

// Markdown-side payloads (exercise the md() fallback renderer).
const HOSTILE_MD = [
  '[hover](https://example.com/"onmouseover="window.__PWNED=1)',
  "[q](https://example.com/'onmouseover='window.__PWNED=1)",
  '[js](javascript:window.__PWNED=1)',
  '<script>window.__PWNED=1<\/script>',
  '<img src=x onerror="window.__PWNED=1">',
  '<iframe src="https://evil.example"></iframe>'
].join('\n\n');

// HTML-side payloads (exercise the DOMPurify path, i.e. "what if GitHub - or
// anything between us and GitHub - returned something hostile in bodyHTML").
const HOSTILE_HTML =
  '<p><a href="https://x.example/" onmouseover="window.__PWNED=1">h</a></p>' +
  '<script>window.__PWNED=1<\/script>' +
  '<img src=x onerror="window.__PWNED=1">' +
  '<iframe src="https://evil.example"></iframe>' +
  '<a href="javascript:window.__PWNED=1">j</a>' +
  // DOM clobbering: an injected id/name can shadow a global or make
  // getElementById return an attacker's node instead of the real one. The page
  // looks up #fb-mine, #fb-mine-list and #fb-list by id, so a body that could
  // carry ids would be able to hijack them. id/name must not survive.
  '<a name="DOMPurify" id="fb-mine-list">clobber</a>' +
  '<p id="fb-list">clobber2</p>' +
  '<form id="fb-form"><input name="attributes"></form>';


async function expandAll(pg) {
  await pg.evaluate(() => document.querySelectorAll('.feedback-acc-header').forEach(h => h.click()));
  await pg.waitForTimeout(400);
}

// Loads a Cloudflare Pages Function as a real module. functions/*.js is written
// as ESM but package.json has no "type":"module", so Node parses it as CJS and
// refuses the import; Cloudflare's own bundler does not care. Copying to a .mjs
// makes Node read the SHIPPED BYTES rather than a re-implementation of them.
async function loadPagesFunction(rel) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const tmp = path.join(os.tmpdir(), `qa-fb-${path.basename(rel, '.js')}-${process.pid}.mjs`);
  fs.writeFileSync(tmp, src);
  try { return await import(pathToFileURL(tmp).href); }
  finally { try { fs.unlinkSync(tmp); } catch { /* best effort */ } }
}

// The browser half of this suite intercepts /api/discussions with a fixture, so
// it can never catch a regression in the server function or in the contract
// between the two. These run first, in-process, against the real source.
async function contractChecks() {
  console.log('\n--- CONTRACT (server + client agree) ---');
  const api = fs.readFileSync(path.join(ROOT, 'functions/api/discussions.js'), 'utf8');
  const form = fs.readFileSync(path.join(ROOT, 'functions/api/feedback.js'), 'utf8');
  const client = fs.readFileSync(path.join(ROOT, 'static/js/feedback.js'), 'utf8');

  // Counting the token across the whole file was worthless: comments and capAll()
  // alone satisfy any threshold, so every GraphQL selection could be deleted and
  // this stayed green while production silently reverted to pipe soup. Assert on
  // the QUERY TEXT instead: strip comments and code, keep the template literals.
  const queries = [...api.matchAll(/`([\s\S]*?)`/g)].map(m => m[1])
    .filter(q => q.includes('repository') && q.includes('discussion'));
  check('at least one GraphQL query block found to inspect',
    queries.length > 0, 'query extraction broke - the checks below prove nothing');
  const gql = queries.join('\n');
  // Every place a body is selected must select the rendered HTML beside it.
  const bodySel = (gql.match(/(?<![\w])body(?![\w(])/g) || []).length;
  const htmlSel = (gql.match(/(?<![\w])bodyHTML(?![\w(])/g) || []).length;
  check('every GraphQL body selection is paired with bodyHTML',
    bodySel > 0 && htmlSel === bodySel,
    `${bodySel} body vs ${htmlSel} bodyHTML in the query text`);
  check('bodyHTML selected on both discussions and their comments',
    /comments\([^)]*\)\s*\{[^}]*bodyHTML/.test(gql),
    'comments are where every table on this board actually lives');

  // Category labels are the anchor the footer stripper keys on. If the server
  // adds or renames one and the client is not updated, that footer leaks.
  // Scoped to the FOOTER_CATEGORIES array specifically: searching the whole
  // client passed even with the array emptied, because the same words appear in
  // the submission form on the same page (Gate B round 4).
  // Exact equality, not substring. Gate B round 5: renaming a server label to
  // '❓ Question Extended' passed, because the old label is a substring of the new
  // one — while the client's footer stripper keys on the exact string, so the
  // generated footer would leak into the rendered post.
  const labels = [...form.matchAll(/label:\s*'([^']+)'/g)].map(m => m[1]);
  const catArray = (client.match(/FOOTER_CATEGORIES\s*=\s*\[([\s\S]*?)\]/) || [, ''])[1];
  const known = [...catArray.matchAll(/'((?:\\.|[^'])*)'/g)]
    .map(m => JSON.parse('"' + m[1].replace(/"/g, '\\"') + '"'));
  const orphans = labels.filter(l => !known.includes(l));
  check('every server category label is known to the client footer stripper',
    labels.length > 0 && known.length > 0 && orphans.length === 0,
    `client does not know: ${orphans.join(' | ') || '(no labels parsed)'}  ||  knows ${known.length}: ${known.join(' | ')}`);

  // Exercise the REAL cap, never a copy. A re-implementation here stayed green
  // while a mutation deleted the aggregate budget from the shipped file, so the
  // check was worthless (verification-method error #14, 26 Aug 2026).
  const MAX_BODY_HTML = 40000, MAX_TOTAL_HTML = 400000;
  check('cap constants in this test match the shipped source',
    api.includes(`MAX_BODY_HTML = ${MAX_BODY_HTML}`) && api.includes(`MAX_TOTAL_HTML = ${MAX_TOTAL_HTML}`),
    'discussions.js constants drifted from this test');

  const mod = await loadPagesFunction('functions/api/discussions.js');
  const capAll = mod.capAll;
  check('the shipped endpoint exports capAll for testing', typeof capAll === 'function',
    'export removed - the two checks below would silently stop testing anything');
  if (typeof capAll !== 'function') return;

  const real = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
  const before = JSON.stringify(real).length;
  capAll([real.pinned, real.discussions]);
  check('cap leaves the real board untouched',
    JSON.stringify(real).length === before, 'a real post was blanked');

  // Gate B's exploit: 300 posts each just under the per-field cap.
  const flood = Array.from({ length: 50 }, () => ({
    bodyHTML: 'x'.repeat(39990),
    comments: { nodes: Array.from({ length: 5 }, () => ({ bodyHTML: 'y'.repeat(39990) })) }
  }));
  capAll([[], flood]);
  const total = flood.reduce((n, d) => n + d.bodyHTML.length +
    d.comments.nodes.reduce((m, c) => m + c.bodyHTML.length, 0), 0);
  check('aggregate budget bounds a flood of just-under-cap posts',
    total <= MAX_TOTAL_HTML, `${total} bytes of HTML survived, budget is ${MAX_TOTAL_HTML}`);

  // Gate B round 4: a hostile board can ship megabytes of raw Markdown even
  // with every bodyHTML blanked, because the cap only looked at the HTML.
  const mdFlood = Array.from({ length: 50 }, () => ({
    body: 'm'.repeat(65536), bodyHTML: 'x'.repeat(39990),
    comments: { nodes: Array.from({ length: 5 }, () => ({ body: 'm'.repeat(65536), bodyHTML: '' })) }
  }));
  capAll([[], mdFlood]);
  check('aggregate budget bounds raw Markdown too, not just HTML',
    JSON.stringify(mdFlood).length < 2_000_000,
    `${JSON.stringify(mdFlood).length} bytes serialized - Markdown is uncapped`);
  // Discriminates the PER-FIELD cap from the aggregate one: 200k is under the
  // total budget, so only the per-field limit can trim it. Without this, deleting
  // the per-field cap left the check above green (caught by mutation, round 4).
  const oneBig = [{ body: 'm'.repeat(200000), bodyHTML: '' }];
  capAll([[], oneBig]);
  check('a single oversized post is trimmed by the per-field Markdown cap',
    oneBig[0].body.length <= 65536,
    `one post kept ${oneBig[0].body.length} chars of Markdown`);

  // These two were rewritten after Gate B round 4 showed the previous versions
  // passed with the behaviour deleted: they searched for variable names, so
  // `const uniqueDiscussions = discussions` (no filtering at all) stayed green.
  // Call the real exported functions instead of reading the source.
  const pinnedIn = [{ number: 44 }, { number: 43 }, { number: 44 }];
  const pinnedOut = mod.dedupeByNumber(pinnedIn);
  check('a thread pinned twice is only pinned once',
    pinnedOut.length === 2 && pinnedOut.map(d => d.number).join() === '44,43',
    `expected [44,43], got [${pinnedOut.map(d => d.number)}]`);
  const recent = mod.dropPinned([{ number: 44 }], [{ number: 44 }, { number: 40 }]);
  check('pinned threads are removed from the recent list server-side',
    recent.length === 1 && recent[0].number === 40,
    `pinned #44 still present in the recent list: [${recent.map(d => d.number)}]`);
  check('the response serializes the deduped list, not the raw one',
    /discussions:\s*uniqueDiscussions/.test(api) &&
    /const uniqueDiscussions\s*=\s*dropPinned\(/.test(api),
    'dedupe computed but the original array was still sent');
}

// Cheap, deterministic checks on the SOURCE — no browser, no build. Run by the
// real git pre-push hook via --static; also the first phase of the full suite.
// Pulls one top-level function out of the shipped client by brace matching, so
// the test exercises the bytes that actually deploy rather than a copy of them.
function extractFn(src, name) {
  const start = src.indexOf(`function ${name}(`);
  if (start < 0) return null;
  let depth = 0;
  for (let j = src.indexOf('{', start); j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}' && --depth === 0) return src.slice(start, j + 1);
  }
  return null;
}

// md() needs only the three escapers and a span whose textContent->innerHTML
// escapes & < > — which is exactly what a browser does, and what esc() relies on.
function markdownSink(client) {
  const parts = ['esc', 'escAttr', 'escQuotes', 'md'].map(n => extractFn(client, n));
  if (parts.some(p => !p)) return null;
  const shim = `const document = { createElement: () => ({ _v: '',
    set textContent(v) { this._v = v == null ? '' : String(v); },
    get textContent() { return this._v; },
    get innerHTML() { return this._v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); } }) };`;
  try { return new Function(`${shim}\n${parts.join('\n')}\nreturn md;`)(); }
  catch { return null; }
}

function staticSourceChecks() {
  console.log('\n--- SOURCE INVARIANTS ---');
  const client = fs.readFileSync(path.join(ROOT, 'static/js/feedback.js'), 'utf8');

  // The original live XSS: esc() escapes for TEXT context and leaves quotes
  // intact, and its output was interpolated into href="…". If a future edit
  // puts a bare esc() back into an attribute, that hole reopens.
  // The layout is the one file that can disable the sanitizer outright, and it
  // triggers this gate — yet nothing verified it (Gate B round 5). Removing the
  // vendor <script>, or ordering it after feedback.js, makes DOMPurify undefined
  // at first paint: every post silently falls back to the pipe-soup renderer and
  // the hardened path is never taken. Both are asserted here.
  const layoutPath = path.join(ROOT, 'layouts/feedback/list.html');
  const layout = fs.existsSync(layoutPath) ? fs.readFileSync(layoutPath, 'utf8') : '';
  const purifyAt = layout.search(/<script[^>]+src="[^"]*purify-[\d.]+\.min\.js/);
  const clientAt = layout.search(/<script[^>]+src="[^"]*\/js\/feedback\.js/);
  check('the feedback layout loads the vendored DOMPurify',
    purifyAt !== -1,
    'no vendored purify <script> in layouts/feedback/list.html - the sanitizer never loads');
  check('DOMPurify is loaded before feedback.js, not after',
    purifyAt !== -1 && clientAt !== -1 && purifyAt < clientAt,
    `purify at ${purifyAt}, feedback.js at ${clientAt} - order decides whether the sanitizer exists`);
  check('the layout references the vendored purify version that is committed',
    (() => {
      const m = layout.match(/purify-([\d.]+)\.min\.js/);
      return !!m && fs.existsSync(path.join(ROOT, `static/js/vendor/purify-${m[1]}.min.js`));
    })(),
    'the layout points at a purify build that does not exist in static/js/vendor');

  const attrEsc = /(?:href|src|title|alt)\s*=\s*(?:\\?["'])\s*\+\s*esc\(/;


  check('no bare esc() interpolated into an HTML attribute',
    !attrEsc.test(client),
    'esc() does not escape quotes - use escAttr()/escQuotes() in attribute context');
  check('the attribute-escaping helpers still exist',
    /function escAttr\(/.test(client) && /function escQuotes\(/.test(client),
    'the XSS fix was removed');
  // Bound to the EXACT allow-list, not to "script is absent". Gate B round 5
  // mutation-tested adding 'img' and all 23 static checks stayed green — yet the
  // whole reason <img> is banned is that an image loads its src even while
  // detached from the document, so one hostile post would harvest every reader's
  // IP address. Naming the forbidden set makes that decision un-droppable.
  const allowedTags = (client.match(/ALLOWED_TAGS:\s*\[([\s\S]*?)\]/) || [, ''])[1];
  const tagSet = [...allowedTags.matchAll(/'([^']+)'/g)].map(m => m[1]);
  const FORBIDDEN_TAGS = ['script', 'img', 'svg', 'iframe', 'style', 'form',
    'input', 'object', 'embed', 'link', 'base', 'math', 'video', 'audio', 'source'];
  const leaked = FORBIDDEN_TAGS.filter(t => tagSet.includes(t));
  check('sanitizer config still forbids every dangerous tag',
    tagSet.length > 0 && leaked.length === 0,
    `these must never be allow-listed: ${leaked.join(', ') || '(allow-list not found)'}`);
  // The attribute list is half of the leak vector and was asserted nowhere.
  // Mutation-testing found this the hard way: allow-listing <img> ALONE changes
  // nothing observable, because DOMPurify strips its src and an image with no
  // source never fetches. It takes a tag AND an attribute — so pin the exact
  // attribute set too, or the pair can be reassembled one harmless-looking
  // commit at a time. src/srcset/style/formaction all fetch or execute.
  const allowedAttr = (client.match(/ALLOWED_ATTR:\s*\[([\s\S]*?)\]/) || [, ''])[1];
  const attrSet = [...allowedAttr.matchAll(/'([^']+)'/g)].map(m => m[1]);
  check('sanitizer allows exactly one attribute, href',
    attrSet.length === 1 && attrSet[0] === 'href',
    `ALLOWED_ATTR must stay ['href']; found [${attrSet.join(', ')}]`);
  check('id/name are not allowed through the sanitizer (DOM clobbering)',
    !/ALLOWED_ATTR[\s\S]{0,300}['"](?:id|name)['"]/.test(client),
    'allowing id/name lets a post hijack document.getElementById lookups');
  // Bound to the CALL SITE, not to the config's existence. Gate B round 4 showed
  // that dropping the second argument — sanitize(html) with DOMPurify's permissive
  // defaults — left every token-matching check green.
  check('the sanitizer is called with the hardened config, not defaults',
    /DOMPurify\.sanitize\(\s*[\w$.]+\s*,\s*PURIFY_CFG\s*\)/.test(client),
    'sanitize() must be passed PURIFY_CFG; its defaults allow far more');

  // ---- behavioural: run the SHIPPED markdown sink against the real exploit ----
  // Everything above is a token search, and Gate B round 4 proved a token search
  // is not enough: replacing escQuotes(url) with url restores the original live
  // XSS while all of it stays green. The pre-push hook only runs these static
  // checks, so the one that matters has to actually execute the code.
  const md = markdownSink(client);
  check('the markdown fallback can be executed for real',
    typeof md === 'function',
    'could not extract esc/escAttr/escQuotes/md - the harness needs updating, not disabling');
  if (typeof md === 'function') {
    const tag = (md('[hover](https://example.com/"onmouseover="window.__PWNED=1)')
      .match(/<a\s[^>]*>/) || [''])[0];
    const parsed = tag.match(/^<a\s+href="([^"]*)"(.*)>$/);
    check('a quote in a link URL cannot break out of the href attribute',
      !!parsed && parsed[2] === ' target="_blank" rel="noopener noreferrer"',
      `link tag carries attributes it should not: ${tag}`);
    check('javascript: URLs are not turned into links',
      !/<a\b/i.test(md('[x](javascript:alert(1))')),
      'only http(s), mailto and site-relative URLs may become links');
    check('an ordinary https link still renders (not over-blocked)',
      /<a\s+href="https:\/\/example\.com\/ok"/.test(md('[ok](https://example.com/ok)')),
      'the escaping broke legitimate links');
  }

  const required = [
    'static/js/vendor/purify-3.4.13.min.js',
    'static/js/feedback.js', 'static/css/feedback.css',
    'tests/fixtures/feedback-discussions.json'
  ];
  const missing = required.filter(f => !fs.existsSync(path.join(ROOT, f)));
  check('every runtime asset the page needs is present',
    missing.length === 0, `missing: ${missing.join(', ')}`);
}

async function main() {
  if (!fs.existsSync(FIXTURE)) { console.error(`fixture not found: ${FIXTURE}`); process.exit(2); }
  staticSourceChecks();
  await contractChecks();
  if (STATIC_ONLY) {
    console.log(`\n${failures ? '\u001b[31m\u274c ' + failures + ' STATIC CHECK(S) FAILED' : '\u001b[32m\u2713 static checks pass'}\u001b[0m  (${checks} checks)`);
    process.exit(failures ? 1 : 0);
  }
  if (!fs.existsSync(PUBLIC)) { console.error('public/ not found - run a Hugo build first.'); process.exit(2); }
  assertBuildFresh();

  const payload = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
  const victim = payload.discussions[0];
  victim.bodyHTML = (victim.bodyHTML || '') + HOSTILE_HTML;
  victim.body = (victim.body || '') + '\n\n' + HOSTILE_MD;
  if (victim.comments?.nodes?.[0]) {
    victim.comments.nodes[0].bodyHTML = (victim.comments.nodes[0].bodyHTML || '') + HOSTILE_HTML;
    victim.comments.nodes[0].body = (victim.comments.nodes[0].body || '') + '\n\n' + HOSTILE_MD;
  }

  // Synthetic threads for the edge cases Gate B found on 2026-08-26. Each one
  // shipped as a real bug in the first cut of this renderer.
  const template = JSON.parse(JSON.stringify(payload.discussions[1]));
  const synth = (n, title, body, bodyHTML) => {
    const d = JSON.parse(JSON.stringify(template));
    d.number = 90000 + n;
    d.title = title;
    d.body = body;
    d.bodyHTML = bodyHTML;
    d.url = `https://github.com/susanthgit/aguidetocloud-feedback/discussions/${d.number}`;
    d.comments = { totalCount: 0, nodes: [] };
    return d;
  };

  // 1. Anonymous submission: the footer has NO "From:" field, only Category.
  //    Anchoring the stripper on "From:" left this visible for every anonymous user.
  payload.discussions.push(synth(1, 'QA anon footer',
    'Anon question body.\n\n---\n**Category:** \u2753 Question',
    '<p>Anon question body.</p><hr><p><strong>Category:</strong> \u2753 Question</p>'));

  // 2. A legitimate horizontal rule followed by prose starting "From:".
  //    Must survive - it is the user's content, not our generated footer.
  payload.discussions.push(synth(2, 'QA legit rule',
    'KEEPTOP content.\n\n---\nFrom: first principles, KEEPBOTTOM.',
    '<p>KEEPTOP content.</p><hr><p>From: first principles, KEEPBOTTOM.</p>'));

  // 3. Image-only body. Images are deliberately not on the allowlist, so
  //    sanitizing succeeds but yields nothing - must fall back to markdown.
  payload.discussions.push(synth(3, 'QA image only',
    'IMAGEFALLBACK text', '<p><img src="https://example.com/a.png" alt="x"></p>'));

  // 4. A user's own "---" mid-body must not truncate the rest of their post.
  payload.discussions.push(synth(4, 'QA mid-body rule',
    'ABOVERULE\n\n---\n\nBELOWRULE\n\n---\n**Category:** \u2753 Question',
    '<p>ABOVERULE</p><hr><p>BELOWRULE</p><hr><p><strong>Category:</strong> \u2753 Question</p>'));

  // 5. A hand-authored post whose last section legitimately starts "**Category:**"
  //    but is NOT one of the seven generated labels. Must be kept.
  payload.discussions.push(synth(5, 'QA authored category',
    'AUTHORTOP\n\n---\n**Category:** Why this matters, AUTHORKEEP',
    '<p>AUTHORTOP</p><hr><p><strong>Category:</strong> Why this matters, AUTHORKEEP</p>'));

  // 6. A submitter whose NAME contains the same separator the footer uses.
  //    Scanning fields with [^·]* failed to match, leaking the whole footer.
  payload.discussions.push(synth(6, 'QA dot name',
    'DOTNAMEBODY\n\n---\n**From:** Jane \u00b7 Doe \u00b7 **Category:** \u2753 Question',
    '<p>DOTNAMEBODY</p><hr><p><strong>From:</strong> Jane \u00b7 Doe \u00b7 <strong>Category:</strong> \u2753 Question</p>'));

  // 7. A table whose only content is an image. Sanitizing empties it, and an
  //    empty <table> used to count as "visible", suppressing the fallback.
  payload.discussions.push(synth(7, 'QA image table',
    'IMGTABLEFALLBACK',
    '<table><thead><tr><th></th></tr></thead><tbody><tr><td><img src="https://e.example/a.png"></td></tr></tbody></table>'));

  // 8. GitHub renders "# X" as <h1>; it was being dropped rather than clamped.
  payload.discussions.push(synth(8, 'QA h1',
    '# H1HEADING\n\ntext', '<h1>H1HEADING</h1><p>text</p>'));

  // 9. A screenshot pasted into GitHub arrives as <a href="…png"><img …></a>.
  // Images are not on the allowlist (an <img> fetches, so a hostile post could
  // use one as a tracking pixel), which used to leave an EMPTY link and lose the
  // evidence silently. The link must survive WITH readable text, and a bare
  // <img> must be recovered too - while still loading nothing.
  payload.discussions.push(synth(9, 'QA image',
    'See the evidence:\n\n![the broken orange box](https://example.invalid/shot.png)',
    '<p>See the evidence:</p><p><a href="https://example.invalid/wrapped.png">' +
    '<img src="https://example.invalid/wrapped.png" alt="the broken orange box"></a></p>' +
    '<p><img src="https://example.invalid/bare-screenshot.png" alt="Image"></p>'));

  // 10. Ordinary links of every shape the board actually contains. Without a
  // POSITIVE assertion, "no javascript: hrefs" and "every link carries rel"
  // both pass when anchors are removed from the allowlist entirely and every
  // link on the page silently becomes plain text (Gate B round 4).
  payload.discussions.push(synth(10, 'QA links',
    'links', '<p><a href="https://example.invalid/deep/page?q=1&amp;r=2">ext</a> ' +
    '<a href="mailto:hi@example.invalid">mail</a> ' +
    '<a href="/guided/">rel</a> <a href="#frag">frag</a></p>'));


  const server = await serve(PUBLIC);
  const base = `http://127.0.0.1:${server.address().port}`;
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: !argv.includes('--headed') });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  // Assert the IP-leak ban at the NETWORK layer, not by looking for <img> in the
  // final DOM (Gate B round 5). A detached image still fetches, and a future
  // implementation using new Image() or a scratch innerHTML would leak every
  // reader's IP to the poster while the DOM assertion stayed green — the element
  // is gone by the time anything inspects it. Only the request log can see that.
  const offsiteRequests = [];
  page.on('request', req => {
    const u = req.url();
    if (!u.startsWith(base) && !u.startsWith('data:') && !u.startsWith('about:')) {
      offsiteRequests.push(u);
    }
  });

  const api = route => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify(payload)
  });
  await page.route('**/api/discussions*', api);
  await page.goto(`${base}/feedback/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.feedback-acc', { timeout: 20000 });
  await expandAll(page);

  const r = await page.evaluate(() => {
    const bodies = [...document.querySelectorAll('.feedback-q-body, .feedback-a-body')];
    const badTags = [], handlers = [];
    bodies.forEach(b => {
      b.querySelectorAll('script,img,svg,iframe,style,form,input,object,embed,link')
        .forEach(n => badTags.push(n.tagName.toLowerCase()));
      b.querySelectorAll('*').forEach(n => [...n.attributes].forEach(a => {
        if (/^on/i.test(a.name)) handlers.push(n.tagName + '[' + a.name + ']');
      }));
    });
    const text = bodies.map(b => b.textContent).join('\n');
    const tables = [...document.querySelectorAll('table.feedback-table')];
    const links = [...document.querySelectorAll('.feedback-q-body a[href], .feedback-a-body a[href]')];
    return {
      pwned: typeof window.__PWNED !== 'undefined',
      purifyLoaded: typeof window.DOMPurify !== 'undefined',
      bodies: bodies.length,
      empty: bodies.filter(b => !(b.textContent || '').trim()).length,
      badTags: [...new Set(badTags)],
      handlers: [...new Set(handlers)],
      tables: tables.length,
      tablesWrapped: tables.filter(t => t.parentElement?.classList.contains('feedback-table-scroll')).length,
      thScoped: tables.every(t => [...t.querySelectorAll('th')].every(th => th.getAttribute('scope') === 'col')),
      h2Leak: document.querySelectorAll('.feedback-q-body h2, .feedback-a-body h2').length,
      h1Leak: document.querySelectorAll('.feedback-q-body h1, .feedback-a-body h1').length,
      h1AsH3: [...document.querySelectorAll('.feedback-q-body h3, .feedback-a-body h3')]
        .some(h => (h.textContent || '').includes('H1HEADING')),
      headings: document.querySelectorAll('.feedback-q-body h3, .feedback-a-body h3').length,
      hrs: document.querySelectorAll('.feedback-q-body hr, .feedback-a-body hr').length,
      pipeSoup: /\|\s*-{3,}\s*\|/.test(text),
      hashSoup: /(^|\n)\s*#{2,6}\s+\S/.test(text),
      // The generated footer renders as "Category: <emoji> <label>" - searching
      // for the Markdown "**From:**" was a false negative: rendered HTML never
      // contains the asterisks, so that assertion could not fail.
      footerLeak: [...document.querySelectorAll('.feedback-q-body')]
        .filter(b => /Category:\s*[\u2753\u{1F4A1}\u{1F3AC}\u{1F41B}\u{1F527}\u{1F4DD}\u{1F4AC}]/u.test(b.textContent || '')
          || /Reply contact provided via form/.test(b.textContent || '')).length,
      bodyText: [...document.querySelectorAll('.feedback-q-body')].map(b => b.textContent || ''),
      qLabels: [...document.querySelectorAll('.feedback-q-label')].map(b => b.textContent || ''),
      noRel: links.filter(a => a.getAttribute('rel') !== 'noopener noreferrer').length,
      jsScheme: links.filter(a => /^javascript:/i.test(a.getAttribute('href') || '')).length,
      // Positive control: the assertions above are all "nothing bad survives",
      // which pass trivially when NOTHING survives. These record what did.
      bodyHrefs: links.map(a => a.getAttribute('href') || ''),
      imgLinkTexts: [...document.querySelectorAll('.feedback-q-body .feedback-img-link')]
        .map(a => (a.textContent || '').trim()),
      deadLinks: links.filter(a => !(a.textContent || '').trim()).length,
      // DOM clobbering: no id/name may survive inside a body, and the page's own
      // element lookups must still resolve to the real containers.
      clobberAttrs: bodies.flatMap(b => [...b.querySelectorAll('*')]
        .filter(n => n.hasAttribute('id') || n.hasAttribute('name'))
        .map(n => n.tagName.toLowerCase() + '#' + (n.getAttribute('id') || n.getAttribute('name')))),
      lookupsIntact: ['fb-mine-list', 'fb-list'].every(id => {
        const el = document.getElementById(id);
        return el === null || !el.closest('.feedback-q-body, .feedback-a-body');
      })
    };
  });

  console.log('\n--- SECURITY ---');
  check('no payload executed (window.__PWNED unset)', r.pwned === false);
  check('no script/img/svg/iframe/style/form in bodies', r.badTags.length === 0, r.badTags.join(', '));
  check('no on* event handlers in bodies', r.handlers.length === 0, r.handlers.join(', '));
  check('no javascript: hrefs survive', r.jsScheme === 0);
  check('every body link carries rel=noopener noreferrer', r.noRel === 0, `${r.noRel} missing`);
  // Positive control for the two checks above. Both are satisfied by an empty
  // set, so a sanitizer regression that strips every anchor would leave them
  // green while silently turning the whole board's links into plain text.
  check('legitimate links of every shape survive sanitizing',
    ['https://example.invalid/deep/page?q=1&r=2', 'mailto:hi@example.invalid',
      '/guided/', '#frag'].every(h => r.bodyHrefs.includes(h)),
    `expected external/mailto/relative/fragment links; got ${r.bodyHrefs.length}: ${r.bodyHrefs.slice(0, 8).join(' , ')}`);
  check('a pasted screenshot survives as a readable link, not an empty one',
    r.imgLinkTexts.includes('the broken orange box') &&
    r.imgLinkTexts.some(t => t === 'bare-screenshot.png') && r.deadLinks === 0,
    `image links: [${r.imgLinkTexts.join(' | ')}], dead links: ${r.deadLinks}`);
  // The network log, not the DOM, is what proves the IP-leak ban holds: a
  // detached <img> or `new Image()` fetches and then vanishes, so by the time
  // any DOM assertion runs there is nothing left to find. example.invalid and
  // evil.example only appear as image/iframe sources in the hostile fixtures,
  // so a single request to either means untrusted content pulled a resource.
  const leaks = offsiteRequests.filter(u =>
    /example\.invalid|evil\.example|tracker\./i.test(u));
  check('untrusted content never causes a network fetch (no IP leak)',
    leaks.length === 0,
    `these were requested from a post body: ${leaks.slice(0, 5).join(' , ')}`);
  check('no id/name survives in a body (DOM clobbering)',
    r.clobberAttrs.length === 0, r.clobberAttrs.join(', '));
  check('page element lookups not hijacked by body content',
    r.lookupsIntact === true, 'getElementById resolved into a rendered body');
  check('no uncaught page errors', pageErrors.length === 0, pageErrors.join(' | '));

  console.log('\n--- RENDERING ---');
  check('DOMPurify vendored and loaded', r.purifyLoaded === true);
  check('threads rendered', r.bodies > 0, `${r.bodies} bodies`);
  check('no body rendered empty', r.empty === 0, `${r.empty} empty`);
  check('markdown tables render as <table>', r.tables > 0, `${r.tables} table(s)`);
  check('every table wrapped in a scroll region', r.tables > 0 && r.tablesWrapped === r.tables,
    `${r.tablesWrapped}/${r.tables}`);
  check('table headers carry scope=col', r.thScoped === true);
  check('no raw "| --- |" pipe soup in rendered text', r.pipeSoup === false);
  check('no raw "###" heading soup in rendered text', r.hashSoup === false);
  check('headings clamped to h3 (no h2 leak)', r.h2Leak === 0, `${r.h2Leak} h2`);
  check('thematic breaks render as <hr>', r.hrs > 0, `${r.hrs} hr`);
  check('generated footer stripped, incl. anonymous (no From: field)',
    r.footerLeak === 0, `${r.footerLeak} body(s) still show the footer`);

  const all = r.bodyText.join('\n');
  check('legitimate "---" + "From: …" prose preserved',
    all.includes('KEEPTOP') && all.includes('KEEPBOTTOM'),
    'a real horizontal rule followed by "From:" was mistaken for our footer');
  check('user\'s own mid-body "---" does not truncate the post',
    all.includes('ABOVERULE') && all.includes('BELOWRULE'),
    'content after the first separator was dropped');
  check('image-only body falls back to markdown instead of rendering empty',
    all.includes('IMAGEFALLBACK'),
    'sanitizing removed the only element and no fallback ran');
  check('hand-authored "**Category:** …" section is not mistaken for our footer',
    all.includes('AUTHORTOP') && all.includes('AUTHORKEEP'),
    'a real trailing section was eaten by the footer stripper');
  check('footer stripped even when the name contains the field separator',
    all.includes('DOTNAMEBODY') && !/Jane\s*\u00b7\s*Doe/.test(all),
    'a name containing "·" defeated the footer match');
  // Stripping the footer and ATTRIBUTING the post are two different regexes.
  // The first was fixed for dotted names and the second was not, so the post
  // rendered "from Jane" — a real person credited by half their name.
  const labels = (r.qLabels || []).join('\n');
  check('a name containing the separator is attributed in full',
    /from\s+Jane\s*\u00b7\s*Doe/.test(labels),
    `asker label truncated at the separator: ${labels.replace(/\s+/g, ' ').slice(0, 200)}`);
  check('image-only TABLE falls back too (empty table is not content)',
    all.includes('IMGTABLEFALLBACK'),
    'an empty sanitized table counted as visible and suppressed the fallback');
  check('GitHub h1 is clamped to h3, not dropped',
    r.h1Leak === 0 && all.includes('H1HEADING') && r.h1AsH3 === true,
    `h1 leak=${r.h1Leak}, clamped=${r.h1AsH3}`);

  console.log('\n--- LAYOUT (390px) ---');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(350);
  const m = await page.evaluate(() => {
    const de = document.documentElement;
    const wraps = [...document.querySelectorAll('.feedback-table-scroll')];
    return {
      overflow: de.scrollWidth - de.clientWidth,
      wraps: wraps.length,
      anyScrolls: wraps.some(w => w.scrollWidth > w.clientWidth + 1)
    };
  });
  check('page does not scroll sideways', m.overflow <= 1, `overflow ${m.overflow}px`);
  check('a wide table scrolls inside its own box', m.wraps === 0 || m.anyScrolls === true);

  console.log('\n--- PERSISTED STORAGE (fb_my_threads) ---');
  // A past XSS on this origin outlives the hole that created it: it can leave a
  // payload in localStorage that re-executes on every later visit. So the stored
  // value is untrusted input too, and must be validated on the way OUT.
  const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p3 = await ctx3.newPage();
  await p3.route('**/api/discussions*', api);
  await p3.addInitScript(() => {
    localStorage.setItem('fb_my_threads', JSON.stringify([
      { number: '<img src=x onerror="window.__PWNED=1">', url: 'https://github.com/a/b/discussions/1', title: 'x' },
      { number: 1, url: 'javascript:window.__PWNED=1', title: 'js url' },
      { number: 2, url: 'https://evil.example/discussions/2', title: 'wrong host' },
      { number: 3, url: 'https://github.com/a/b/discussions/999', title: 'number mismatch' },
      // Well-formed in every respect EXCEPT the repo: the phishing vector. A
      // look-alike board under an attacker's account would otherwise render as
      // a trusted "your thread" link.
      { number: 7, url: 'https://github.com/eviluser/aguidetocloud-feedback/discussions/7', title: 'WRONGREPO' },
      { number: 8, url: 'https://github.com/susanthgit/aguidetocloud-feedback-evil/discussions/8', title: 'WRONGREPOSUFFIX' },
      { number: 44, url: 'https://github.com/susanthgit/aguidetocloud-feedback/discussions/44', title: 'LEGITTHREAD' }
    ]));
  });
  await p3.goto(`${base}/feedback/`, { waitUntil: 'domcontentloaded' });
  await p3.waitForSelector('.feedback-acc', { timeout: 20000 });
  await p3.waitForTimeout(400);
  const s = await p3.evaluate(() => {
    const items = [...document.querySelectorAll('.feedback-mine-item')];
    return {
      seeded: (localStorage.getItem('fb_my_threads') || '').includes('onerror'),
      pwned: typeof window.__PWNED !== 'undefined',
      count: items.length,
      titles: items.map(a => a.textContent || '').join(' | '),
      hrefs: items.map(a => a.getAttribute('href') || ''),
      strayImg: document.querySelectorAll('#fb-mine-list img').length
    };
  });
  check('hostile storage genuinely seeded (negative control)', s.seeded === true);
  check('no payload executed from localStorage', s.pwned === false);
  check('no element injected from stored value', s.strayImg === 0);
  check('invalid stored entries discarded', s.count === 1, `${s.count} rendered: ${s.titles}`);
  check('only the real board\'s https discussion URLs survive',
    s.hrefs.length > 0 && s.hrefs.every(h =>
      /^https:\/\/github\.com\/susanthgit\/aguidetocloud-feedback\/discussions\/\d+$/.test(h)),
    s.hrefs.join(', '));
  check('look-alike board entries discarded (phishing)',
    !s.titles.includes('WRONGREPO') && !s.titles.includes('WRONGREPOSUFFIX'),
    s.titles);
  check('the legitimate entry still renders', s.titles.includes('LEGITTHREAD'));

  console.log('\n--- FALLBACK (DOMPurify unavailable) ---');
  // Fresh context: a page in the same context can serve purify from the
  // in-memory HTTP cache, which route() never sees, silently defeating the block.
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p2 = await ctx2.newPage();
  const errs2 = [];
  p2.on('pageerror', e => errs2.push(e.message));
  // Glob '**/vendor/purify-*.js' does NOT match the cache-busted URL
  // (.../purify-3.4.13.min.js?v=…), so use a regex. The negative control
  // below exists precisely because that silently made this test a no-op.
  await p2.route(/\/js\/vendor\/purify-/, route => route.abort());
  await p2.route('**/api/discussions*', api);
  await p2.goto(`${base}/feedback/`, { waitUntil: 'domcontentloaded' });
  await p2.waitForSelector('.feedback-acc', { timeout: 20000 });
  await expandAll(p2);
  const f = await p2.evaluate(() => {
    const bodies = [...document.querySelectorAll('.feedback-q-body, .feedback-a-body')];
    let handlers = 0;
    bodies.forEach(b => b.querySelectorAll('*').forEach(n =>
      [...n.attributes].forEach(a => { if (/^on/i.test(a.name)) handlers++; })));
    return {
      purify: typeof window.DOMPurify !== 'undefined',
      pwned: typeof window.__PWNED !== 'undefined',
      rendered: bodies.filter(b => (b.textContent || '').trim()).length,
      handlers
    };
  });
  check('DOMPurify genuinely blocked (negative control)', f.purify === false);
  check('degrades to markdown renderer, still shows content', f.rendered > 0, `${f.rendered} bodies`);
  check('fallback path is still inert (no payload executed)', f.pwned === false);
  check('fallback path emits no on* handlers', f.handlers === 0);
  check('fallback path throws no page errors', errs2.length === 0, errs2.join(' | '));

  await browser.close();
  server.close();

  console.log(`\n${failures === 0 ? '\u001b[32m🟢 ALL CHECKS PASS\u001b[0m' : '\u001b[31m🔴 FAILURES\u001b[0m'}  (${checks - failures}/${checks})`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });
