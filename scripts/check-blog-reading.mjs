#!/usr/bin/env node
/**
 * check-blog-reading.mjs — reading-experience invariants for the notebook blog.
 *
 * WHY THIS EXISTS
 * Five waves of typography work on 21 Aug 2026 produced five regressions that a
 * human "looks fine to me" pass did not catch. Every assertion below is one of
 * them. Per Rule #14b, a rule nobody runs is already dead — so this is a static
 * parse (milliseconds, no browser, no dev server) that can run on every push.
 *
 * DESIGN RULE learned the hard way this session: absence is never proof.
 * An earlier verifier asserted `border === null || correct`, so "no image found"
 * silently counted as a pass — which is exactly how 22 ghost-bordered images
 * shipped through a green run. Here, a missing subject is an explicit FAIL,
 * because if the selector stops matching, the guard has stopped guarding.
 *
 *   node scripts/check-blog-reading.mjs
 *   node scripts/check-blog-reading.mjs --live https://www.aguidetocloud.com
 *
 * Exit 0 = all invariants hold. Exit 1 = at least one regressed.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cssPath = path.join(root, 'static', 'css', 'zt-notebook.css');

if (!fs.existsSync(cssPath)) {
  console.error(`BLOCKED — zt-notebook.css not found at ${cssPath}`);
  process.exit(1);
}
const css = fs.readFileSync(cssPath, 'utf8');
// Comments carry the rationale for every rule here and are full of example
// values ("previously 600", "16px -> 90 chars"). Parsing them would produce
// confident nonsense, so strip them before asserting anything.
const live = css.replace(/\/\*[\s\S]*?\*\//g, '');

const results = [];
const warnings = [];   // non-blocking: latent hazards that render correctly today
const check = (name, fn, why) => {
  try {
    const r = fn();
    results.push({ name, ok: r === true, detail: r === true ? '' : r, why });
  } catch (e) {
    results.push({ name, ok: false, detail: `check threw: ${e.message}`, why });
  }
};

/* ── contrast maths (WCAG 2.1 relative luminance) ── */
const hex2rgb = h => {
  const s = h.replace('#', '');
  const f = s.length === 3 ? s.split('').map(c => c + c).join('') : s;
  return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16));
};
const lum = rgb => {
  const [r, g, b] = rgb.map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(hex2rgb(a)), lum(hex2rgb(b))].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

/* ── 1. Font size has ONE home ──────────────────────────────────────────
   The original bug: size was declared in FOUR places and JS wrote a fifth as
   an inline style, so editing the CSS did nothing at all. */
check('size scale lives in exactly one place', () => {
  const decls = [...live.matchAll(/--reading-font-size\s*:\s*([^;]+);/g)].map(m => m[1].trim());
  const px = decls.filter(d => /^\d+px$/.test(d));
  if (px.length === 0) return 'no px --reading-font-size found — the scale block was removed or renamed';
  if (px.length !== 3) {
    return `expected exactly 3 px declarations (base + s + l), found ${px.length}: ${px.join(', ')}. ` +
           `Duplicated sizes are why editing the CSS once did nothing.`;
  }
  const want = ['18px', '16px', '20px'];
  const missing = want.filter(w => !px.includes(w));
  return missing.length ? `expected ${want.join('/')}, got ${px.join('/')}` : true;
}, 'JS once wrote an inline --reading-font-size that beat every stylesheet rule');

check('both s and l size states exist', () => {
  const s = /\[data-reading-size="s"\]/.test(live);
  const l = /\[data-reading-size="l"\]/.test(live);
  if (!s || !l) return `missing state selector(s): ${!s ? 's ' : ''}${!l ? 'l' : ''}`;
  return true;
}, 'the size control is semantic state; losing a state silently breaks the A/A/A buttons');

/* ── 2. Emphasis must stay visible ──────────────────────────────────────
   Wave 2 softened strong to 600 to mask over-bolding. Measured on production:
   Inter 600 IS a real semibold, but the step was enough that emphasis became
   invisible to the author. Reading experience is the priority, so 700 stands.
   The fix for too many bolds is fewer bolds, never weaker bolds. */
check('strong is 700, not softened', () => {
  const block = live.match(/\.zt-reading--notebook[^{]*strong[^{]*\{([^}]*)\}/);
  if (!block) return 'the notebook strong rule is gone — emphasis is unstyled';
  const w = block[1].match(/font-weight\s*:\s*(\d+)/);
  if (!w) return 'strong rule exists but sets no font-weight';
  return w[1] === '700' ? true
    : `strong is ${w[1]}, must be 700. Softening every bold to fix bold DENSITY ` +
      `degrades legitimate emphasis everywhere. Strip bolds instead (scripts/debold-propose.mjs).`;
}, 'shipped at 600 once; the author could no longer see emphasis at all');

/* ── 3. Link colour must pass AA on paper ───────────────────────────────
   The Zen accent #6366F1 measures 3.89 on cream — it FAILS AA, and no reviewer
   caught it. Anything that lands in --link has to be measured, not eyeballed. */
check('blog link colour passes AA on notebook paper', () => {
  const linkM = live.match(/--link\s*:\s*(#[0-9a-fA-F]{3,6})\s*;/);
  if (!linkM) return 'no --link colour found in the notebook theme';
  const paperM = live.match(/--paper\s*:\s*(#[0-9a-fA-F]{3,6})\s*;/);
  const paper = paperM ? paperM[1] : '#F4EFE3';
  const r = ratio(linkM[1], paper);
  return r >= 4.5 ? true
    : `${linkM[1]} on ${paper} = ${r.toFixed(2)}:1, below the 4.5 AA floor. ` +
      `#6366F1 (the Zen accent) measures 3.89 here — use #4F46E5 (5.48).`;
}, 'the site accent fails AA on cream; only the blog has been fixed');

/* ── 4. Heading rules hug their text ────────────────────────────────────
   An h2/h3 is block-level, so width:100% on the ::after resolves to the whole
   720px column and the rule overshoots the words. inline-block + max-width:100%
   makes the box shrink-to-fit, so 100% resolves to the TEXT width. */
for (const tag of ['h2', 'h3']) {
  check(`${tag} underline hugs the heading text`, () => {
    const re = new RegExp(`\\.zt-reading--notebook[^{}]*\\b${tag}\\b[^{}]*\\{([^}]*)\\}`, 'g');
    const blocks = [...live.matchAll(re)].map(m => m[1]);
    if (!blocks.length) return `no notebook ${tag} rule found — the underline system was removed`;
    const hug = blocks.find(b => /display\s*:\s*inline-block/.test(b) && /max-width\s*:\s*100%/.test(b));
    return hug ? true
      : `no ${tag} rule carries BOTH display:inline-block and max-width:100%. ` +
        `Without shrink-to-fit the rule runs the full column and overshoots the words.`;
  }, 'shipped overshooting once; the mechanism is shrink-to-fit, not a width guess');
}

/* ── 5. No hyphens:auto in the reading column ───────────────────────────
   auto hyphenation on a 720px measure produced "reas-oning", "gov-ernance".

   The first version of this check asserted that the STRING `hyphens: auto`
   was absent, and it failed on its first run — wrongly. A stale `auto` sits
   at ~L788 on `.nb-body p, li`, but an identical-specificity `none` at ~L1090
   comes later and wins. The rendered page was always correct.

   That naive assertion is the same defect class this whole file guards
   against: testing for a string instead of the value that actually applies.
   So: assert the EFFECTIVE value (last declaration wins at equal
   specificity), and report a contradictory earlier declaration as a warning
   — because a dead `auto` above a live `none` is exactly how the mobile-grid
   bug hid for two months (a later rule quietly winning on source order). */
check('body text effectively resolves to hyphens: none', () => {
  const decls = [...live.matchAll(/([^{}]+)\{([^}]*hyphens\s*:\s*([a-z]+)[^}]*)\}/g)]
    .map(m => ({ sel: m[1].trim(), value: m[3] }))
    .filter(d => /\.nb-body\s+(p|li)\b/.test(d.sel));   // the reading column only

  if (!decls.length) return 'no hyphens declaration targets .nb-body p/li — the line-breaking rule was removed';

  const effective = decls[decls.length - 1];            // equal specificity: source order decides
  if (effective.value !== 'none') {
    return `the LAST hyphens declaration on the reading column is '${effective.value}', ` +
           `so that is what renders. Auto hyphenation breaks words on a 720px measure.`;
  }
  const contradictions = decls.slice(0, -1).filter(d => d.value !== 'none');
  if (contradictions.length) {
    warnings.push(
      `dead CSS: ${contradictions.length} earlier 'hyphens: ${contradictions[0].value}' declaration(s) on the ` +
      `same .nb-body p/li selectors, overridden by the later 'none'. Renders correctly today, but it is ` +
      `one reorder away from silently returning — the mobile-grid bug class.`);
  }
  return true;
}, 'auto hyphenation broke words mid-line on the reading measure');

/* ── 6. Image frames must be themed, never a ghost grey ─────────────────
   Hardcoded light greys measured 1.10:1 on cream — invisible in light mode and
   wrong in dark. 22 images shipped like this and passed a green verifier. */
check('no ghost-grey image borders in the notebook theme', () => {
  const ghosts = ['#e5e5e5', '#eeeeee', '#eee', '#dddddd', '#ddd', '#f0f0f0'];
  const hits = [];
  for (const m of live.matchAll(/border[^;{}]*:\s*[^;{}]*?(#[0-9a-fA-F]{3,6})[^;{}]*;/g)) {
    if (ghosts.includes(m[1].toLowerCase())) hits.push(m[1]);
  }
  return hits.length === 0 ? true
    : `hardcoded ghost border colour(s): ${[...new Set(hits)].join(', ')} — ` +
      `these measure ~1.1:1 on cream and do not invert. Use a theme token.`;
}, '22 images were invisibly framed on live and passed a green test run');

/* ── report ── */
const failed = results.filter(r => !r.ok);
console.log('\nBlog reading invariants\n' + '─'.repeat(64));
for (const r of results) {
  console.log(`${r.ok ? '  ok  ' : ' FAIL '} ${r.name}`);
  if (!r.ok) {
    console.log(`        ${r.detail}`);
    console.log(`        why it is guarded: ${r.why}`);
  }
}
console.log('─'.repeat(64));

if (warnings.length) {
  console.log(`\n${warnings.length} advisory warning(s) — these render correctly today:`);
  warnings.forEach(w => console.log(`  !  ${w}`));
}

if (failed.length) {
  console.log(`${failed.length} of ${results.length} invariants regressed.\n`);
  process.exit(1);
}
console.log(`All ${results.length} reading invariants hold.\n`);

/* ── optional live pass (post-deploy, advisory) ── */
const liveIdx = process.argv.indexOf('--live');
if (liveIdx !== -1) {
  const base = process.argv[liveIdx + 1] || 'https://www.aguidetocloud.com';
  const { chromium } = await import('playwright');
  const url = `${base}/blog/microsoft-365-copilot-july-2026-updates/?cb=${Date.now()}`;
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(1000);

  const r = await page.evaluate(() => {
    const body = document.querySelector('.nb-body');
    if (!body) return { error: 'no .nb-body — the notebook layout did not render' };
    const strong = document.querySelector('.nb-body p strong, .nb-body li strong');
    const imgs = [...document.querySelectorAll('.nb-body img')];
    const ghost = imgs.filter(i => {
      const c = getComputedStyle(i).borderTopColor.match(/\d+/g);
      if (!c || parseFloat(getComputedStyle(i).borderTopWidth) === 0) return false;
      return +c[0] > 220 && +c[1] > 220 && +c[2] > 220;  // near-white frame on cream
    }).length;
    return {
      size: parseFloat(getComputedStyle(body).fontSize),
      state: document.querySelector('.zt-reading')?.dataset.readingSize ?? null,
      strongWeight: strong ? getComputedStyle(strong).fontWeight : 'NO-STRONG-FOUND',
      imgTotal: imgs.length, ghost,
    };
  });

  console.log(`Live pass — ${base}`);
  if (r.error) { console.log(`  FAIL  ${r.error}`); await b.close(); process.exit(1); }
  const liveFail = [];
  if (r.size !== 18) liveFail.push(`body renders ${r.size}px, expected 18`);
  if (r.strongWeight === 'NO-STRONG-FOUND') liveFail.push('no <strong> on the page to verify');
  else if (r.strongWeight !== '700') liveFail.push(`strong renders ${r.strongWeight}, expected 700`);
  if (r.imgTotal === 0) liveFail.push('no images found — the frame check could not run (absence is not proof)');
  else if (r.ghost > 0) liveFail.push(`${r.ghost} of ${r.imgTotal} images have a near-white ghost frame`);

  console.log(`  body ${r.size}px · state "${r.state}" · strong ${r.strongWeight} · ${r.imgTotal} images, ${r.ghost} ghost-framed`);
  await b.close();
  if (liveFail.length) { liveFail.forEach(f => console.log(`  FAIL  ${f}`)); process.exit(1); }
  console.log('  ok    live matches the source invariants\n');
}
