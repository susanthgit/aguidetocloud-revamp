#!/usr/bin/env node
/**
 * check-mobile-grid.mjs — guards the .zt-reading mobile layout invariant.
 *
 * WHY THIS EXISTS (2026-08-17)
 * ---------------------------------------------------------------------------
 * zt-reading.css:8 sets the desktop grid:
 *     .zt-reading { grid-template-columns: 250px 1fr 280px; }
 * and zt-reading.css:1525 resets it for phones:
 *     @media (max-width:1024px){ .zt-reading { grid-template-columns: 1fr } }
 *
 * On 2026-06-19 commit 0bcc363e appended, ~3400 lines LOWER in the same file:
 *     .zt-reading--tool-main { grid-template-columns: 250px minmax(0,1fr); }
 *
 * Both selectors are specificity (0,1,0). Media queries add NO specificity, so
 * at equal specificity source order decides — the later desktop rule beat the
 * earlier mobile reset. Every one of the 56 tool pages kept a 250px sidebar
 * track on a 390px phone: content squeezed to 250px, a dead 140px track beside
 * it, form inputs overflowing their container. It shipped silently and stayed
 * broken on production for ~2 months.
 *
 * A code comment cannot prevent the next person appending another variant.
 * This check can. It is intentionally a STATIC parse: no browser, no dev
 * server, runs in milliseconds, so it can block every push.
 *
 * THE INVARIANT
 * ---------------------------------------------------------------------------
 * Any grid-template-columns on a .zt-reading wrapper that declares MORE THAN
 * ONE track (or a track list we cannot statically resolve) must be beaten, for
 * every screen width from 0 to 1024px inclusive, by a single-track rule that
 * actually wins the cascade (!important, then specificity, then source order).
 *
 * Guards must be UNCONDITIONAL within their width range: no @supports/@layer/
 * @container wrapper, no print-only media, no extra media features, and the
 * selector must be a bare compound of .zt-reading / .zt-reading--* classes so
 * we know it really matches the production wrapper.
 *
 * A compound `.zt-reading.zt-reading--<variant>` (0,2,0) is the recommended
 * form: zt-reading.css loads in <head>, but per-tool stylesheets (feedback.css
 * etc.) load later in <body>, so being last in THIS file does not by itself
 * guarantee winning the cascade.
 *
 * FAIL-CLOSED: anything this parser cannot resolve (var(), repeat(auto-fill),
 * unknown at-rules) is treated as a potential regression, not waved through.
 *
 * Usage:
 *   node scripts/check-mobile-grid.mjs                    # static invariant
 *   node scripts/check-mobile-grid.mjs --live <baseUrl>   # behavioural (playwright)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const cssArg = process.argv.indexOf('--css');
const CSS_PATH = cssArg !== -1
  ? path.resolve(process.argv[cssArg + 1])
  : path.join(repoRoot, 'static', 'css', 'zt-reading.css');
const MOBILE_MAX = 1024;

const RED = '\x1b[31m', GREEN = '\x1b[32m', YELLOW = '\x1b[33m', DIM = '\x1b[2m', RESET = '\x1b[0m';

/* ── tiny CSS block parser ── */
function stripComments(s) { return s.replace(/\/\*[\s\S]*?\*\//g, ''); }

function parseBlocks(css, base = 0) {
  const out = [];
  let depth = 0, start = 0, bodyStart = 0;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === '{') {
      if (depth === 0) bodyStart = i + 1;
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0) {
        out.push({
          prelude: css.slice(start, bodyStart - 1).trim(),
          body: css.slice(bodyStart, i),
          idx: base + start,
          bodyStart: base + bodyStart
        });
        start = i + 1;
      }
    }
  }
  return out;
}

/** Split a value on top-level whitespace, respecting () and []. */
function splitTopLevel(v) {
  const out = [];
  let depth = 0, cur = '';
  for (const c of v) {
    if (c === '(' || c === '[') depth++;
    if (c === ')' || c === ']') depth--;
    if (depth === 0 && /\s/.test(c)) { if (cur) { out.push(cur); cur = ''; } continue; }
    cur += c;
  }
  if (cur) out.push(cur);
  return out;
}

/**
 * Count grid tracks. Returns -1 when the list cannot be statically resolved,
 * which callers must treat as "possibly multi-track" (fail closed).
 */
function countTracks(value) {
  const v = String(value).replace(/!important/ig, '').trim();
  if (!v || /^(none|initial|inherit|unset|revert)$/i.test(v)) return 0;
  if (/\bvar\s*\(/i.test(v)) return -1;              // custom property — unresolvable
  if (/\b(subgrid|masonry)\b/i.test(v)) return -1;   // inherited / experimental track list
  let n = 0;
  for (const tok of splitTopLevel(v)) {
    if (/^\[.*\]$/.test(tok)) continue;              // [line-name] is not a track
    const m = /^repeat\s*\(\s*([^,]+),([\s\S]*)\)$/i.exec(tok);
    if (m) {
      const count = m[1].trim();
      if (!/^\d+$/.test(count)) return -1;           // auto-fill / auto-fit
      const inner = countTracks(m[2]);
      if (inner < 0) return -1;
      n += Number(count) * inner;
      continue;
    }
    n++;
  }
  return n;
}

/** Rightmost compound selector — the element the rule actually targets. */
function subjectOf(sel) {
  const parts = sel.trim().split(/\s*[>+~]\s*|\s+/).filter(Boolean);
  return parts[parts.length - 1] || '';
}

const WRAPPER_RE = /\.zt-reading(?:--[a-z0-9-]+)?(?![a-z0-9_-])/gi;
function variantsIn(compound) {
  const found = new Set();
  for (const m of compound.matchAll(WRAPPER_RE)) {
    found.add(m[0].startsWith('.zt-reading--') ? m[0].slice('.zt-reading--'.length) : '__base__');
  }
  return found;
}
function targetsWrapper(compound) { return variantsIn(compound).size > 0; }

/** Approximate CSS specificity as a single comparable number. */
function specificityOf(sel) {
  const s = sel.trim();
  const ids = (s.match(/#[\w-]+/g) || []).length;
  const classes = (s.match(/\.[\w-]+/g) || []).length
    + (s.match(/\[[^\]]*\]/g) || []).length
    + (s.match(/(?<!:):(?!:)[\w-]+/g) || []).length;
  const elements = (s.match(/::[\w-]+/g) || []).length;
  return ids * 10000 + classes * 100 + elements;
}

/**
 * Reduce a stack of at-rule preludes to a width range + applicability flags.
 * `extra` means "carries a condition we cannot reason about" — such a rule may
 * still be risky, but can never be trusted as a guard.
 */
function analyzeConditions(preludes) {
  let minW = 0, maxW = Infinity, extra = false, printOnly = false;
  for (const p of preludes) {
    const q = String(p).toLowerCase();
    if (!/^@media/.test(q)) { extra = true; continue; }  // @supports / @layer / @container
    if (/\bprint\b/.test(q) && !/\bscreen\b/.test(q)) printOnly = true;
    if (q.includes(',')) extra = true;                   // media query list — ambiguous
    if (/\bnot\b/.test(q)) extra = true;
    for (const m of q.matchAll(/min-width\s*:\s*(\d+)px/g)) minW = Math.max(minW, Number(m[1]));
    for (const m of q.matchAll(/max-width\s*:\s*(\d+)px/g)) maxW = Math.min(maxW, Number(m[1]));
    const rest = q
      .replace(/@media/g, '')
      .replace(/\(\s*(?:min|max)-width\s*:\s*\d+px\s*\)/g, '')
      .replace(/\b(screen|all|only|and)\b/g, '')
      .trim();
    if (rest) extra = true;                              // orientation, hover, prefers-*, ...
  }
  return { minW, maxW, extra, printOnly };
}

/* ── collect every grid-template-columns declaration on a .zt-reading wrapper ── */
function collect(css) {
  const decls = [];
  const walk = (text, preludes, base) => {
    for (const blk of parseBlocks(text, base)) {
      if (/^@(media|supports|layer|container|scope)/i.test(blk.prelude)) {
        walk(blk.body, [...preludes, blk.prelude], blk.bodyStart);
        continue;
      }
      if (/^@/.test(blk.prelude)) continue;              // @keyframes / @font-face
      const gtc = [...blk.body.matchAll(/(?:^|;)\s*grid-template-columns\s*:\s*([^;}]+)/gi)].pop();
      if (!gtc) continue;
      const value = gtc[1].trim();
      const cond = analyzeConditions(preludes);
      for (const sel of blk.prelude.split(',')) {
        const raw = sel.trim();
        if (!raw) continue;
        const compound = subjectOf(raw);
        if (!targetsWrapper(compound)) continue;
        decls.push({
          selector: raw, compound, value,
          tracks: countTracks(value),
          important: /!important/i.test(value),
          idx: blk.idx,
          spec: specificityOf(raw),
          hasCombinator: compound !== raw,
          variants: variantsIn(compound),
          media: preludes.join(' and ') || null,
          ...cond
        });
      }
    }
  };
  walk(css, [], 0);
  return decls;
}

/** A guard selector must be a bare compound of .zt-reading / .zt-reading--* classes. */
function guardSelectorOk(d, variant) {
  if (d.hasCombinator) return false;
  if (/[#[:]/.test(d.compound)) return false;            // ids, attributes, pseudo-classes
  const classes = d.compound.match(/\.[a-z0-9_-]+/gi) || [];
  if (!classes.length) return false;
  if (!classes.every(c => /^\.zt-reading(--[a-z0-9-]+)?$/i.test(c))) return false;
  if (!d.variants.has(variant)) return false;
  // Must not require any OTHER variant class: `.zt-reading.zt-reading--tool-main`
  // cannot guard a bare `.zt-reading` element that lacks that modifier.
  for (const v of d.variants) if (v !== '__base__' && v !== variant) return false;
  return true;
}

/** Does guard g beat risky rule r in the cascade? */
function guardWins(g, r) {
  if (g.important !== r.important) return g.important;
  if (g.spec !== r.spec) return g.spec > r.spec;
  return g.idx > r.idx;
}

/** Do the [lo,hi] intervals cover every integer px from lo..hi? */
function coversRange(intervals, lo, hi) {
  if (lo > hi) return true;
  let cur = lo;
  for (const [a, b] of [...intervals].sort((x, y) => x[0] - y[0])) {
    if (a > cur) break;
    if (b >= cur) cur = b + 1;
    if (cur > hi) return true;
  }
  return cur > hi;
}

function runStatic() {
  if (!fs.existsSync(CSS_PATH)) {
    console.error(`${RED}✗ not found: ${CSS_PATH}${RESET}`);
    process.exit(1);
  }
  const decls = collect(stripComments(fs.readFileSync(CSS_PATH, 'utf8')));

  // Risky: >1 track (or unresolvable), reaches the screen, range overlaps 0..1024.
  const risky = decls.filter(d =>
    (d.tracks > 1 || d.tracks === -1) && !d.printOnly && d.minW <= MOBILE_MAX
  );

  // Guard candidates: exactly one track, unconditional, screen-applicable.
  const guards = decls.filter(d =>
    d.tracks === 1 && !d.printOnly && !d.extra && d.minW <= MOBILE_MAX
  );

  const errors = [];
  for (const r of risky) {
    for (const variant of r.variants) {
      const lo = Math.max(0, r.minW);
      const hi = Math.min(MOBILE_MAX, r.maxW);
      const covering = guards
        .filter(g => guardSelectorOk(g, variant) && guardWins(g, r))
        .map(g => [Math.max(0, g.minW), Math.min(MOBILE_MAX, g.maxW)])
        .filter(([a, b]) => b >= a);
      if (coversRange(covering, lo, hi)) continue;

      const name = variant === '__base__' ? '.zt-reading' : `.zt-reading--${variant}`;
      const fix = variant === '__base__' ? '.zt-reading' : `.zt-reading.zt-reading--${variant}`;
      const why = r.tracks === -1
        ? `an unresolvable track list ("${r.value}")`
        : `${r.tracks} grid tracks ("${r.value}")`;
      const gap = covering.length
        ? `only ${covering.map(([a, b]) => `${a}-${b}px`).join(', ')} covered of ${lo}-${hi}px`
        : `nothing collapses it between ${lo}px and ${hi}px`;
      errors.push(
        `${name} sets ${why} — ${gap}.\n` +
        `      ${DIM}rule: ${r.selector} { grid-template-columns: ${r.value} }${RESET}\n` +
        `      ${YELLOW}Fix — add AFTER that rule:${RESET}\n` +
        `        @media (max-width: ${MOBILE_MAX}px) {\n` +
        `          ${fix} { grid-template-columns: minmax(0, 1fr); }\n` +
        `        }\n` +
        `      ${DIM}Compound selector (0,2,0) is recommended — per-tool stylesheets load after this file.${RESET}`
      );
    }
  }

  console.log(`\n🔍 Mobile grid invariant (.zt-reading @ <=${MOBILE_MAX}px)`);
  console.log(`${DIM}   ${decls.length} wrapper grid declarations · ${risky.length} multi-track reaching mobile · ${guards.length} eligible collapse rules${RESET}`);

  if (errors.length) {
    console.error(`\n${RED}❌ ${errors.length} unguarded variant(s):${RESET}`);
    errors.forEach((e, i) => console.error(`\n  ${i + 1}. ${e}`));
    console.error(`\n${RED}This is the 2026-06-19 regression class: a late variant silently beats the shared mobile reset.${RESET}\n`);
    process.exit(1);
  }
  console.log(`${GREEN}✓ every multi-column .zt-reading variant collapses to one column on mobile${RESET}\n`);
}

/* ── optional behavioural mode ── */
/**
 * Pages with horizontal overflow that predates — and is independent of — the
 * grid invariant, so a green run stays meaningful. Each entry needs evidence.
 *
 *  /cert-tracker/  measured 2026-08-17 at 390px on BOTH the fixed local build
 *                  (grid 390px) and live production without the fix (grid
 *                  250px 140px): identical scrollWidth 592 vs client 390,
 *                  508 overflowing elements, all `a.cert-card` at width 560.
 *                  Root cause is a fixed-width card, not the grid. Tracked
 *                  separately — do NOT extend this list to hide new breakage.
 */
const KNOWN_OVERFLOW = new Set(['/cert-tracker/']);

async function runLive(baseUrl) {
  const { chromium } = await import('playwright');
  const toml = fs.readFileSync(path.join(repoRoot, 'data', 'toolkit_nav.toml'), 'utf8');
  const all = [...new Set([...toml.matchAll(/^\s*url\s*=\s*"([^"]+)"/gm)].map(m => m[1]))];
  // Only same-site paths: toolkit_nav.toml also lists absolute URLs for the
  // sibling properties (cmd.aguidetocloud.com), which this invariant doesn't own.
  const urls = all.filter(u => u.startsWith('/'));
  const skipped = all.length - urls.length;
  console.log(`\n🔍 Live mobile grid check — ${urls.length} tool pages @ ${baseUrl}${skipped ? ` ${DIM}(${skipped} external skipped)${RESET}` : ''}`);

  const b = await chromium.launch();
  const fails = [];
  const warns = [];
  for (const [label, vp, mobile] of [['mobile-390', 390, true], ['desktop-1280', 1280, false]]) {
    const ctx = await b.newContext({ viewport: { width: vp, height: 900 } });
    const p = await ctx.newPage();
    for (const u of urls) {
      const full = baseUrl.replace(/\/$/, '') + u;
      try {
        const resp = await p.goto(full, { waitUntil: 'load', timeout: 45000 });
        if (!resp || resp.status() >= 400) {
          fails.push(`${label} ${u}: HTTP ${resp ? resp.status() : 'no response'}`);
          continue;
        }
        // Several tool pages render their cards/tables from JS. Measuring at
        // domcontentloaded silently under-reports overflow — a false green.
        await p.waitForTimeout(600);
        const r = await p.evaluate(() => {
          const g = document.querySelector('.zt-reading');
          if (!g) return null;
          const gs = getComputedStyle(g);
          const c = document.querySelector('.zt-reading-content');
          return {
            cls: g.className,
            tracks: gs.gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length,
            cols: gs.gridTemplateColumns,
            contentW: c ? Math.round(c.getBoundingClientRect().width) : 0,
            gridW: Math.round(g.getBoundingClientRect().width),
            hScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
          };
        });
        if (!r) { fails.push(`${label} ${u}: no .zt-reading wrapper found`); continue; }
        if (mobile) {
          if (r.tracks !== 1) fails.push(`${label} ${u}: ${r.tracks} tracks (${r.cols})`);
          else if (r.contentW < r.gridW - 8) fails.push(`${label} ${u}: content ${r.contentW} << grid ${r.gridW}`);
          if (r.hScroll) {
            if (KNOWN_OVERFLOW.has(u)) warns.push(`${label} ${u}: horizontal scroll (known, pre-dates the grid fix)`);
            else fails.push(`${label} ${u}: horizontal scroll`);
          }
        } else {
          if (/zt-reading--tool-main/.test(r.cls) && r.tracks < 2) {
            fails.push(`${label} ${u}: expected >=2 tracks on desktop, got ${r.tracks} (${r.cols})`);
          }
          // Desktop overflow is a separate, pre-existing concern (e.g. /cert-tracker/
          // wide cards). Surface it, but don't fail this invariant on it.
          if (r.hScroll) warns.push(`${label} ${u}: horizontal scroll (not this invariant)`);
        }
      } catch (e) { fails.push(`${label} ${u}: ${e.message.slice(0, 60)}`); }
    }
    await ctx.close();
  }
  await b.close();
  if (warns.length) {
    console.log(`\n${YELLOW}⚠ ${warns.length} advisory:${RESET}`);
    warns.forEach(w => console.log(`   ${w}`));
  }
  if (fails.length) {
    console.error(`\n${RED}❌ ${fails.length} failure(s):${RESET}`);
    fails.forEach(f => console.error(`   ${f}`));
    process.exit(1);
  }
  console.log(`${GREEN}✓ all tool pages single-column on mobile, sidebar intact on desktop${RESET}\n`);
}

const liveIdx = process.argv.indexOf('--live');
if (liveIdx !== -1) await runLive(process.argv[liveIdx + 1] || 'https://www.aguidetocloud.com');
else runStatic();
