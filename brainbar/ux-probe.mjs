// UX visual probe — captures screenshots + automated checks across:
//   - home (Compaq desk — no theme toggle)
//   - entry pages (light + dark)
//   - decode pages (light + dark)
//   - about page (light + dark)
//   - 3 viewports: 360, 768, 1440
//   - all major terminal verb outputs (run on home, screenshot)
//
// Outputs:
//   - .session-state/files/ux-screenshots/*.png
//   - findings printed at end (alignment, overflow, line breaks, contrast)
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'http://localhost:1315/';
const SCREENSHOT_DIR = 'C:/Users/ssutheesh/.copilot/session-state/9c1abb70-c1d8-4e38-9366-d9f668688c67/files/ux-screenshots';
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: 'mobile-360',  width: 360, height: 800 },
  { name: 'tablet-768',  width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

const findings = [];
function record(severity, category, finding, repro) {
  findings.push({ severity, category, finding, repro });
}

const browser = await chromium.launch({ headless: true });

async function shoot(page, label) {
  const path = join(SCREENSHOT_DIR, label + '.png');
  await page.screenshot({ path, fullPage: true });
}

async function checkOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const docW = document.documentElement.scrollWidth;
    const winW = window.innerWidth;
    return docW > winW + 5 ? { docW, winW, diff: docW - winW } : null;
  });
  if (overflow) {
    record('substantive', 'overflow', `${label} has horizontal overflow: ${overflow.diff}px`, label);
  }
}

async function checkContrast(page, label) {
  // Look for text elements with poor contrast against their bg.
  // (Coarse check — flags anything obviously wrong at runtime.)
  const findings = await page.evaluate(() => {
    function relLum(rgb) {
      const [r, g, b] = rgb.map(v => {
        v = v / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    function parseRgb(s) {
      const m = s.match(/rgba?\((\d+)\D+(\d+)\D+(\d+)/);
      return m ? [+m[1], +m[2], +m[3]] : null;
    }
    function effectiveBg(el) {
      let cur = el;
      while (cur && cur !== document.body) {
        const bg = getComputedStyle(cur).backgroundColor;
        const rgb = parseRgb(bg);
        if (rgb && rgb.length === 3 && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return rgb;
        cur = cur.parentElement;
      }
      const bodyBg = parseRgb(getComputedStyle(document.body).backgroundColor);
      return bodyBg || [255, 255, 255];
    }
    const issues = [];
    const els = document.querySelectorAll('h1, h2, h3, p, a, span, code, dt, dd, button');
    let i = 0;
    for (const el of els) {
      if (i++ > 200) break; // bound work
      const r = el.getBoundingClientRect();
      if (r.width < 5 || r.height < 5) continue;
      if (!el.innerText || !el.innerText.trim()) continue;
      const cs = getComputedStyle(el);
      const fg = parseRgb(cs.color);
      const bg = effectiveBg(el);
      if (!fg || !bg) continue;
      const l1 = relLum(fg);
      const l2 = relLum(bg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      if (ratio < 4.5 && el.innerText.trim().length > 1) {
        issues.push({
          tag: el.tagName.toLowerCase(),
          text: el.innerText.trim().slice(0, 50),
          fg: cs.color,
          bg: 'rgb(' + bg.join(',') + ')',
          ratio: Math.round(ratio * 10) / 10,
        });
      }
    }
    return issues;
  });
  for (const f of findings.slice(0, 5)) {
    record('substantive', 'contrast', `${label} contrast ${f.ratio}:1 (need 4.5) on ${f.tag} "${f.text}" fg=${f.fg} bg=${f.bg}`, label);
  }
}

async function setTheme(page, theme) {
  // The cmd site uses a cookie scoped to .aguidetocloud.com (won't work on
  // localhost). Toggle via localStorage instead.
  await page.evaluate((t) => {
    try { localStorage.setItem('theme', t); } catch (_) {}
    document.documentElement.setAttribute('data-theme', t);
  }, theme);
}

// Pages to test (path → whether theme toggle applies)
const PAGES = [
  { path: '/',              label: 'home',              theme: false }, // Compaq desk only
  { path: '/mde/',          label: 'entry-mde',         theme: true },
  { path: '/m365-e5/',      label: 'entry-m365-e5',     theme: true },
  { path: '/decode/',       label: 'decode-list',       theme: true },
  { path: '/decode/aadsts50105/', label: 'decode-aadsts50105', theme: true },
  { path: '/about/',        label: 'about',             theme: true },
  { path: '/all/',          label: 'all-list',          theme: true },
];

console.log('═══ Multi-viewport, multi-theme screenshot pass ═══\n');

for (const vp of VIEWPORTS) {
  for (const pg of PAGES) {
    const themesToTest = pg.theme ? ['light', 'dark'] : ['default'];
    for (const theme of themesToTest) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(String(e)));
      page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
      try {
        await page.goto(BASE.replace(/\/$/, '') + pg.path, { waitUntil: 'networkidle' });
        if (theme !== 'default') await setTheme(page, theme);
        await page.waitForTimeout(800);
        const label = `${vp.name}__${pg.label}__${theme}`;
        process.stdout.write(`  ${label}\n`);
        await shoot(page, label);
        await checkOverflow(page, label);
        if (errors.length) record('substantive', 'console-error', `${label}: ${errors[0].slice(0, 200)}`, label);
        // Contrast check only on a few representative captures (slow)
        if (vp.name === 'desktop-1440') await checkContrast(page, label);
      } catch (e) {
        record('blocker', 'page-load', `${pg.path} (${theme}, ${vp.name}) failed: ${e.message}`, pg.path);
      } finally {
        await ctx.close();
      }
    }
  }
}

// ─── Terminal verb outputs (capture each on home + check overflow) ────────
console.log('\n═══ Terminal verb output capture ═══\n');
const VERBS = [
  { cmd: 'samples', label: 'verb-samples' },
  { cmd: 'tree m365-e5', label: 'verb-tree-e5' },
  { cmd: 'tree mde', label: 'verb-tree-mde' },
  { cmd: 'why mde', label: 'verb-why-mde' },
  { cmd: 'man mde', label: 'verb-man-mde' },
  { cmd: 'man m365-e5', label: 'verb-man-e5' },
  { cmd: 'compare e3 e5', label: 'verb-compare-e3e5' },
  { cmd: 'help', label: 'verb-help' },
  { cmd: 'help pipes', label: 'verb-help-pipes' },
  { cmd: 'help decode', label: 'verb-help-decode' },
  { cmd: 'decode AADSTS50105', label: 'verb-decode-aadsts' },
  { cmd: 'decode 0x80070005', label: 'verb-decode-hresult' },
  { cmd: 'decode AADSTS99999', label: 'verb-decode-fallback' },
  { cmd: 'decode resource-id /subscriptions/06ebc4ee-1bb5-47dd-8120-11324bc54e06/resourceGroups/rg-prod/providers/Microsoft.Web/sites/myapp', label: 'verb-decode-resource-id' },
  { cmd: 'decode graph https://graph.microsoft.com/v1.0/users', label: 'verb-decode-graph' },
  { cmd: 'freshness', label: 'verb-freshness' },
  { cmd: 'ls jargon', label: 'verb-ls-jargon' },
  { cmd: 'ls jargon | sort | head 5', label: 'verb-pipe-sort-head' },
  { cmd: 'ls jargon | wc', label: 'verb-pipe-wc' },
  { cmd: 'man mde | json', label: 'verb-pipe-json' },
  { cmd: 'man mde | csv', label: 'verb-pipe-csv' },
  { cmd: 'whoami', label: 'verb-whoami' },
];

for (const vp of [{ name: 'mobile-360', width: 360, height: 800 }, { name: 'desktop-1440', width: 1440, height: 900 }]) {
  for (const v of VERBS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    try {
      await page.goto(BASE + '?q=' + encodeURIComponent(v.cmd), { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      const label = `${vp.name}__${v.label}`;
      process.stdout.write(`  ${label}\n`);
      await shoot(page, label);
      await checkOverflow(page, label);
      if (errors.length) record('substantive', 'console-error', `${label}: ${errors[0].slice(0, 200)}`, v.cmd);
    } catch (e) {
      record('blocker', 'verb-failure', `verb "${v.cmd}" failed at ${vp.name}: ${e.message}`, v.cmd);
    } finally {
      await ctx.close();
    }
  }
}

await browser.close();

// Summary
console.log('\n══════════════════════════════════════════════════════');
console.log(`Screenshots saved to: ${SCREENSHOT_DIR}`);
console.log(`Findings: ${findings.length}`);
const bySev = { blocker: [], substantive: [], advisory: [] };
for (const f of findings) bySev[f.severity].push(f);
console.log(`  blockers: ${bySev.blocker.length}`);
console.log(`  substantive: ${bySev.substantive.length}`);
console.log(`  advisory: ${bySev.advisory.length}`);
for (const sev of ['blocker', 'substantive', 'advisory']) {
  for (const f of bySev[sev]) {
    console.log(`[${sev.toUpperCase()}] [${f.category}] ${f.finding}`);
  }
}
// Save findings as JSON for later analysis
writeFileSync(join(SCREENSHOT_DIR, '_findings.json'), JSON.stringify(findings, null, 2));
console.log(`\nFindings JSON: ${join(SCREENSHOT_DIR, '_findings.json')}`);
process.exit(0);
