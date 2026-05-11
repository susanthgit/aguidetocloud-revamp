// Tool Quality Audit — beyond contrast. Catches:
//   - Console errors / warnings
//   - JS page errors (uncaught exceptions)
//   - Failed network requests (404 / 5xx on tool assets)
//   - Missing alt text on images
//   - Buttons/links without accessible name
//   - Form inputs without label
//   - Touch targets < 40x40px (mobile only)
//   - Largest Contentful Paint timing
//   - Page weight (HTML + CSS + JS bytes)
//
// Output: audit-output/tool-quality.json + console summary
//
// Usage:
//   node scripts/tool-quality-audit.mjs              # 17 representative pages (~5min)
//   node scripts/tool-quality-audit.mjs --only home,roi-calc  # filter

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OUT = path.join(REPO_ROOT, 'audit-output', 'tool-quality.json');

const PAGES = [
  ['/', 'home'],
  ['/free-tools/', 'tools-hub'],
  ['/blog/', 'blog-index'],
  ['/copilot-matrix/', 'copilot-matrix'],
  ['/roi-calculator/', 'roi-calc'],
  ['/licence-picker/', 'licence-picker'],
  ['/m365-roadmap/', 'roadmap'],
  ['/ai-news/', 'ainews'],
  ['/service-health/', 'service-health'],
  ['/cert-tracker/', 'cert-tracker'],
  ['/cert-tracker/az-900/', 'cert-page-az900'],
  ['/world-clock/', 'world-clock'],
  ['/color-palette/', 'color-palette'],
  ['/site-analytics/', 'site-analytics'],
  ['/copilot-readiness/', 'readiness'],
  ['/blog/how-microsoft-365-copilot-works-layer-by-layer/', 'blog-post'],
  ['/study-guides/', 'sg-index'],
];

const args = process.argv.slice(2);
const onlyIdx = args.indexOf('--only');
const ONLY = onlyIdx >= 0 && args[onlyIdx + 1] ? new Set(args[onlyIdx + 1].split(',').map(s => s.trim())) : null;
const TARGETS = ONLY ? PAGES.filter(([_, slug]) => ONLY.has(slug)) : PAGES;
const BASE = 'https://www.aguidetocloud.com';

const PROBE_FN = `
(() => {
  const out = {
    imgsNoAlt: [],
    btnsNoLabel: [],
    linksNoText: [],
    inputsNoLabel: [],
    smallTargets: [],
    mobileOverflow: 0,
  };
  const vw = window.innerWidth;
  // Images without alt (but skip decorative role="presentation" / aria-hidden)
  document.querySelectorAll('img').forEach(img => {
    if (img.getAttribute('alt') === null && img.getAttribute('role') !== 'presentation' && img.getAttribute('aria-hidden') !== 'true') {
      out.imgsNoAlt.push({
        src: (img.src || '').slice(0, 80),
        cls: (img.className || '').toString().slice(0, 40),
      });
    }
  });
  // Buttons without accessible name (text content OR aria-label OR aria-labelledby)
  document.querySelectorAll('button').forEach(btn => {
    const text = (btn.textContent || '').trim();
    const ariaLabel = btn.getAttribute('aria-label');
    const ariaBy = btn.getAttribute('aria-labelledby');
    const title = btn.getAttribute('title');
    if (!text && !ariaLabel && !ariaBy && !title) {
      out.btnsNoLabel.push({
        id: btn.id || '',
        cls: (btn.className || '').toString().slice(0, 50),
        hasIconChild: !!btn.querySelector('svg, img'),
      });
    }
  });
  // Links without text or accessible label
  document.querySelectorAll('a').forEach(a => {
    const text = (a.textContent || '').trim();
    const ariaLabel = a.getAttribute('aria-label');
    const title = a.getAttribute('title');
    if (!text && !ariaLabel && !title) {
      out.linksNoText.push({
        href: (a.getAttribute('href') || '').slice(0, 80),
        cls: (a.className || '').toString().slice(0, 50),
      });
    }
  });
  // Form inputs without label
  document.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]), textarea, select').forEach(inp => {
    const id = inp.id;
    const ariaLabel = inp.getAttribute('aria-label');
    const ariaBy = inp.getAttribute('aria-labelledby');
    const placeholder = inp.getAttribute('placeholder');
    const hasLabel = id ? !!document.querySelector('label[for="' + CSS.escape(id) + '"]') : false;
    if (!hasLabel && !ariaLabel && !ariaBy) {
      out.inputsNoLabel.push({
        type: inp.type || inp.tagName.toLowerCase(),
        id: id || '',
        placeholder: placeholder ? placeholder.slice(0, 40) : '',
      });
    }
  });
  // Touch targets < 40x40px (interactive elements, mobile only)
  if (vw < 600) {
    const interactive = document.querySelectorAll('button, a, input[type=checkbox], input[type=radio], [role=button], [tabindex="0"]');
    interactive.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && (r.width < 40 || r.height < 40)) {
        // Skip if inside scrollable container (icons in nav often acceptable)
        // Also skip very small "x" close buttons in dialogs
        const text = (el.textContent || '').trim();
        if (text === '×' || text === '✕' || text === '✖') return;
        out.smallTargets.push({
          tag: el.tagName,
          cls: (el.className || '').toString().slice(0, 40),
          text: text.slice(0, 30),
          w: Math.round(r.width),
          h: Math.round(r.height),
        });
      }
    });
  }
  // Mobile overflow
  if (vw < 600) {
    const all = document.querySelectorAll('*');
    for (const el of all) {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 4) {
        let cur = el;
        let exempt = false;
        while (cur && cur !== document.body) {
          if (cur.tagName === 'CANVAS') { exempt = true; break; }
          const pcs = getComputedStyle(cur);
          if (pcs.overflowX === 'auto' || pcs.overflowX === 'scroll') { exempt = true; break; }
          cur = cur.parentElement;
        }
        if (!exempt) out.mobileOverflow++;
      }
    }
  }
  return out;
})()
`;

async function auditPage(browser, url, slug) {
  const consoleErrors = [];
  const consoleWarns = [];
  const pageErrors = [];
  const failedRequests = [];
  const requestSizes = { html: 0, css: 0, js: 0, img: 0, font: 0, json: 0, other: 0 };
  let lcp = null;

  const ctx = await browser.newContext({ colorScheme: 'dark', viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text().slice(0, 200);
    if (type === 'error' && !text.includes('favicon')) consoleErrors.push(text);
    else if (type === 'warning' && !text.includes('preload')) consoleWarns.push(text);
  });
  page.on('pageerror', err => { pageErrors.push(String(err.message || err).slice(0, 200)); });
  page.on('response', resp => {
    const status = resp.status();
    const ru = resp.url();
    // Track failed requests
    if (status >= 400 && !ru.includes('favicon') && !ru.includes('analytics')) {
      failedRequests.push({ status, url: ru.slice(0, 120) });
    }
    // Estimate weight from same-origin assets
    if (ru.includes('aguidetocloud.com')) {
      const ct = (resp.headers()['content-type'] || '').toLowerCase();
      const cl = parseInt(resp.headers()['content-length'] || '0', 10);
      if (!cl) return;
      if (ct.includes('html')) requestSizes.html += cl;
      else if (ct.includes('css')) requestSizes.css += cl;
      else if (ct.includes('javascript')) requestSizes.js += cl;
      else if (ct.includes('image')) requestSizes.img += cl;
      else if (ct.includes('font')) requestSizes.font += cl;
      else if (ct.includes('json')) requestSizes.json += cl;
      else requestSizes.other += cl;
    }
  });

  await page.addInitScript(() => {
    try { localStorage.setItem('theme', 'dark'); } catch {}
    // Capture LCP
    if ('PerformanceObserver' in window) {
      window.__lcp = 0;
      const po = new PerformanceObserver(list => {
        const entries = list.getEntries();
        if (entries.length > 0) window.__lcp = entries[entries.length - 1].startTime;
      });
      try { po.observe({ type: 'largest-contentful-paint', buffered: true }); } catch {}
    }
  });

  try {
    const start = Date.now();
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch {}
    await page.waitForTimeout(1500);
    const loadMs = Date.now() - start;
    lcp = await page.evaluate(() => window.__lcp || 0);
    const probe = await page.evaluate(PROBE_FN);
    await ctx.close();
    return {
      slug, url, loadMs, lcp,
      consoleErrors, consoleWarns: consoleWarns.slice(0, 5),
      pageErrors, failedRequests,
      sizes: requestSizes,
      probe,
    };
  } catch (e) {
    await ctx.close();
    return { slug, url, error: String(e.message || e) };
  }
}

(async () => {
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  const browser = await chromium.launch();
  const results = [];

  for (const [route, slug] of TARGETS) {
    const url = BASE + route;
    process.stdout.write(`[${slug.padEnd(18)}] `);
    const r = await auditPage(browser, url, slug);
    if (r.error) {
      console.log(`❌ ${r.error}`);
    } else {
      const cnt = (r.consoleErrors.length + r.pageErrors.length).toString().padStart(2);
      const f404 = r.failedRequests.length.toString().padStart(2);
      const noalt = r.probe.imgsNoAlt.length.toString().padStart(2);
      const tap = r.probe.smallTargets.length.toString().padStart(3);
      const lcpMs = Math.round(r.lcp || 0).toString().padStart(5);
      const wKB = Math.round((r.sizes.html + r.sizes.css + r.sizes.js + r.sizes.img + r.sizes.json) / 1024).toString().padStart(5);
      console.log(`err:${cnt}  4xx:${f404}  noalt:${noalt}  tap<40:${tap}  LCP:${lcpMs}ms  ${wKB}KB`);
    }
    results.push(r);
  }

  await browser.close();
  await fs.writeFile(OUT, JSON.stringify({ generated: new Date().toISOString(), base: BASE, results }, null, 2));
  console.log('\nWrote ' + OUT);

  // ── Summary ──
  console.log('\n=== ISSUE COUNTS ACROSS ALL PAGES ===');
  const tot = {
    consoleErrors: 0, pageErrors: 0, failedRequests: 0,
    imgsNoAlt: 0, btnsNoLabel: 0, linksNoText: 0, inputsNoLabel: 0,
    smallTargets: 0, mobileOverflow: 0,
  };
  for (const r of results) {
    if (r.error) continue;
    tot.consoleErrors += r.consoleErrors.length;
    tot.pageErrors += r.pageErrors.length;
    tot.failedRequests += r.failedRequests.length;
    tot.imgsNoAlt += r.probe.imgsNoAlt.length;
    tot.btnsNoLabel += r.probe.btnsNoLabel.length;
    tot.linksNoText += r.probe.linksNoText.length;
    tot.inputsNoLabel += r.probe.inputsNoLabel.length;
    tot.smallTargets += r.probe.smallTargets.length;
    tot.mobileOverflow += r.probe.mobileOverflow;
  }
  for (const [k, v] of Object.entries(tot)) {
    console.log('  ' + k.padEnd(22) + ' ' + v);
  }

  // Pages with worst LCP
  const slowest = [...results].filter(r => !r.error).sort((a, b) => (b.lcp || 0) - (a.lcp || 0)).slice(0, 5);
  console.log('\n=== TOP 5 SLOWEST LCP ===');
  for (const r of slowest) {
    console.log('  ' + (r.slug || '').padEnd(20) + ' LCP=' + Math.round(r.lcp || 0) + 'ms  weight=' +
      Math.round((r.sizes.html + r.sizes.css + r.sizes.js + r.sizes.img + r.sizes.json) / 1024) + 'KB');
  }
})();
