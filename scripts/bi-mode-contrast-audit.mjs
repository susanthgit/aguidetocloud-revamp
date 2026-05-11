// Bi-mode contrast audit — samples SAME elements in light + dark, flags asymmetries
// Output: audit-output/bi-mode-contrast.json + summary printed
//
// Usage:
//   node scripts/bi-mode-contrast-audit.mjs                         # 17-page full audit (~3min)
//   node scripts/bi-mode-contrast-audit.mjs https://cloudflare-preview-url/  # against specific URL
//   BIMODE_QUICK=1 node scripts/bi-mode-contrast-audit.mjs          # quick 3-page sanity (~45s)
//
// Lesson 63 (set 11 May 2026): dark-mode-first design accumulates light-mode debt
// invisibly because most devs work in dark mode. Run this regularly.
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OUT = path.join(REPO_ROOT, 'audit-output', 'bi-mode-contrast.json');

// Representative pages: tools across categories + blog + cert + homepage
// QUICK mode (BIMODE_QUICK=1) runs only 3 pages for fast pre-push sanity check
const ALL_PAGES = [
  // High-traffic / customer-facing
  ['/', 'home'],
  ['/free-tools/', 'tools-hub'],
  ['/blog/', 'blog-index'],
  ['/study-guides/', 'sg-index'],
  // Tools (one from each "shape")
  ['/copilot-matrix/', 'copilot-matrix'],
  ['/roi-calculator/', 'roi-calc'],
  ['/m365-roadmap/', 'roadmap'],
  ['/ai-news/', 'ainews'],
  ['/service-health/', 'service-health'],
  ['/cert-tracker/', 'cert-tracker'],
  ['/world-clock/', 'world-clock'],
  ['/color-palette/', 'color-palette'],
  ['/site-analytics/', 'site-analytics'],
  // Blog post (sample)
  ['/blog/microsoft-365-copilot-explained/', 'blog-post'],
  // Cert page (sample)
  ['/cert-tracker/az-900/', 'cert-page'],
  // Licence picker / Mind map
  ['/licence-picker/', 'licence-picker'],
  ['/copilot-readiness/', 'readiness'],
];
const QUICK_PAGES = [
  ['/', 'home'],
  ['/free-tools/', 'tools-hub'],
  ['/blog/microsoft-365-copilot-explained/', 'blog-post'],
];
const PAGES = process.env.BIMODE_QUICK ? QUICK_PAGES : ALL_PAGES;

const BASE = process.argv[2] || 'https://www.aguidetocloud.com';

const SAMPLE_FN = `
(() => {
  const all = [...document.querySelectorAll('*')];
  // Leaf text nodes only — actual rendered text
  const leaves = all.filter(el => {
    if (!el.textContent || !el.textContent.trim()) return false;
    if (el.children.length > 0) return false;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    if (r.top < -100 || r.top > window.innerHeight + 2000) return false;
    return true;
  });
  // Pick 60 evenly across leaves (deterministic — same DOM produces same sample)
  let sample;
  if (leaves.length <= 60) sample = leaves;
  else {
    sample = [];
    const stride = leaves.length / 60;
    for (let i = 0; i < 60; i++) sample.push(leaves[Math.floor(i * stride)]);
  }
  const parseRgb = s => {
    const m = s.match(/(\\d+(\\.\\d+)?)/g);
    if (!m) return null;
    return [parseFloat(m[0]), parseFloat(m[1]), parseFloat(m[2]), m[3] !== undefined ? parseFloat(m[3]) : 1];
  };
  const luminance = ([r,g,b]) => {
    const lin = c => { c = c/255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); };
    return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
  };
  const findBg = el => {
    let cur = el;
    while (cur && cur !== document.body.parentElement) {
      const cs = getComputedStyle(cur);
      const bg = cs.backgroundColor;
      const rgb = parseRgb(bg);
      if (rgb && rgb[3] > 0.5) return rgb;
      cur = cur.parentElement;
    }
    return [255, 255, 255, 1];
  };
  // Build stable identity key for each sampled element (so light + dark match up)
  const keyFor = el => {
    const path = [];
    let cur = el;
    while (cur && cur !== document.body && path.length < 6) {
      let part = cur.tagName.toLowerCase();
      if (cur.id) part += '#' + cur.id;
      else if (cur.className && typeof cur.className === 'string') {
        const cl = cur.className.split(/\\s+/).filter(Boolean).slice(0, 2).join('.');
        if (cl) part += '.' + cl;
      }
      // sibling index for disambiguation
      if (cur.parentElement) {
        const sibs = [...cur.parentElement.children].filter(s => s.tagName === cur.tagName);
        if (sibs.length > 1) part += ':nth(' + sibs.indexOf(cur) + ')';
      }
      path.unshift(part);
      cur = cur.parentElement;
    }
    return path.join(' > ');
  };
  const results = [];
  for (const el of sample) {
    const cs = getComputedStyle(el);
    const fg = parseRgb(cs.color);
    if (!fg) continue;
    const bg = findBg(el);
    const l1 = luminance(fg);
    const l2 = luminance(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    results.push({
      key: keyFor(el),
      tag: el.tagName,
      cls: (el.className || '').toString().slice(0, 60),
      text: el.textContent.trim().slice(0, 50),
      fg: cs.color,
      bg: 'rgb(' + bg.slice(0,3).join(',') + ')',
      ratio: Math.round(ratio * 100) / 100,
    });
  }
  return results;
})()
`;

async function capture(ctx, url, theme) {
  const page = await ctx.newPage();
  await page.addInitScript((t) => {
    try { localStorage.setItem('theme', t); } catch {}
  }, theme);
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch {}
    await page.waitForTimeout(1500);
    const data = await page.evaluate(SAMPLE_FN);
    await page.close();
    return data;
  } catch (e) {
    await page.close();
    return { error: String(e.message || e) };
  }
}

(async () => {
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  const browser = await chromium.launch();
  const all = {};
  const summary = [];

  for (const [route, slug] of PAGES) {
    const url = BASE.replace(/\/$/, '') + route;
    process.stdout.write(`[${slug.padEnd(18)}] ${route.padEnd(40)}`);
    const ctxL = await browser.newContext({ colorScheme: 'light', viewport: { width: 390, height: 844 } });
    const ctxD = await browser.newContext({ colorScheme: 'dark', viewport: { width: 390, height: 844 } });
    const [light, dark] = await Promise.all([
      capture(ctxL, url, 'light'),
      capture(ctxD, url, 'dark'),
    ]);
    await ctxL.close();
    await ctxD.close();

    if (light.error || dark.error) {
      console.log(` ❌ ${light.error || dark.error}`);
      summary.push({ slug, route, error: light.error || dark.error });
      continue;
    }

    // Match elements by stable key
    const darkMap = new Map(dark.map(d => [d.key, d]));
    const compared = [];
    let asymmetric = 0, bothFail = 0, lightOnly = 0, darkOnly = 0, critical = 0;
    for (const l of light) {
      const d = darkMap.get(l.key);
      if (!d) continue;
      const lFail = l.ratio < 4.5;
      const dFail = d.ratio < 4.5;
      const lCrit = l.ratio < 3;
      const dCrit = d.ratio < 3;
      if (lCrit || dCrit) critical++;
      if (lFail && dFail) { bothFail++; }
      else if (lFail && !dFail) { lightOnly++; asymmetric++; }
      else if (!lFail && dFail) { darkOnly++; asymmetric++; }
      if (lFail || dFail) {
        compared.push({
          key: l.key.slice(-100),
          text: l.text.slice(0, 40),
          light: { fg: l.fg, bg: l.bg, ratio: l.ratio, fail: lFail },
          dark: { fg: d.fg, bg: d.bg, ratio: d.ratio, fail: dFail },
          shape: lFail && dFail ? 'both-fail' : (lFail ? 'light-only' : 'dark-only'),
        });
      }
    }
    all[slug] = { route, totalSampled: light.length, matched: compared.length, compared };
    summary.push({ slug, route, sampled: light.length, lightOnly, darkOnly, bothFail, critical });
    console.log(` L-only:${lightOnly}  D-only:${darkOnly}  both:${bothFail}  crit:${critical}`);
  }

  await browser.close();
  await fs.writeFile(OUT, JSON.stringify({ generated: new Date().toISOString(), base: BASE, summary, details: all }, null, 2));
  console.log('\\nWrote ' + OUT);
  console.log('\\nTotals across all pages:');
  const tot = summary.reduce((a, b) => ({
    lightOnly: a.lightOnly + (b.lightOnly || 0),
    darkOnly: a.darkOnly + (b.darkOnly || 0),
    bothFail: a.bothFail + (b.bothFail || 0),
    critical: a.critical + (b.critical || 0),
  }), { lightOnly: 0, darkOnly: 0, bothFail: 0, critical: 0 });
  console.log(`  Light-only fails (visible dark, invisible light): ${tot.lightOnly}`);
  console.log(`  Dark-only fails (visible light, invisible dark):  ${tot.darkOnly}`);
  console.log(`  Both-mode fails (always broken):                  ${tot.bothFail}`);
  console.log(`  Critical (<3 ratio in either mode):               ${tot.critical}`);
})();
