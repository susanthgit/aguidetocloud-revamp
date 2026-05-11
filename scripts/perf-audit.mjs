// Performance audit — broader than tool-quality. Captures:
//   • LCP (Largest Contentful Paint)
//   • CLS (Cumulative Layout Shift)
//   • TBT (Total Blocking Time approximation)
//   • TTFB (Time to First Byte)
//   • DOMContentLoaded + load timing
//   • Total page weight by resource type
//   • Number of render-blocking <link rel=stylesheet> in <head>
//   • Number of <script src=...> in <head> without async/defer
//   • Top 5 heaviest resources
//   • Total resource count
//
// Output: audit-output/perf.json + console table
// Usage: node scripts/perf-audit.mjs [--only slug1,slug2]

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OUT = path.join(REPO_ROOT, 'audit-output', 'perf.json');

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

async function auditPage(browser, url, slug) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (PerfAudit) Chrome/120',
  });
  const page = await ctx.newPage();

  const resources = [];
  page.on('response', async resp => {
    try {
      const req = resp.request();
      const headers = resp.headers();
      const ct = (headers['content-type'] || '').toLowerCase();
      const cl = parseInt(headers['content-length'] || '0', 10);
      const cacheControl = headers['cache-control'] || '';
      let type = 'other';
      if (ct.includes('html')) type = 'html';
      else if (ct.includes('css')) type = 'css';
      else if (ct.includes('javascript') || ct.includes('json')) type = ct.includes('json') ? 'json' : 'js';
      else if (ct.includes('image')) type = 'img';
      else if (ct.includes('font')) type = 'font';
      resources.push({
        url: resp.url().slice(0, 140),
        type, bytes: cl || 0, status: resp.status(),
        sameOrigin: resp.url().includes('aguidetocloud.com'),
        cacheControl: cacheControl.slice(0, 60),
      });
    } catch (e) {}
  });

  await page.addInitScript(() => {
    window.__cls = 0;
    window.__lcp = 0;
    window.__longTasks = [];
    try {
      const lcpObs = new PerformanceObserver(list => {
        const entries = list.getEntries();
        if (entries.length) window.__lcp = entries[entries.length - 1].startTime;
      });
      lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });

      const clsObs = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__cls += entry.value;
        }
      });
      clsObs.observe({ type: 'layout-shift', buffered: true });

      const ltObs = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          window.__longTasks.push({ start: entry.startTime, duration: entry.duration });
        }
      });
      ltObs.observe({ type: 'longtask', buffered: true });
    } catch (e) {}
  });

  try {
    const start = Date.now();
    const navResp = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    try { await page.waitForLoadState('networkidle', { timeout: 6000 }); } catch (e) {}
    await page.waitForTimeout(2000);
    const loadMs = Date.now() - start;

    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] || {};
      const blockingLinks = Array.from(document.querySelectorAll('head link[rel="stylesheet"]')).length;
      const syncScripts = Array.from(document.querySelectorAll('head script[src]')).filter(s => !s.async && !s.defer).length;
      const totalScripts = Array.from(document.querySelectorAll('script[src]')).length;
      const totalImages = Array.from(document.querySelectorAll('img')).length;
      const imagesWithoutLazy = Array.from(document.querySelectorAll('img')).filter(i => i.loading !== 'lazy' && !i.hasAttribute('fetchpriority')).length;
      // TBT — sum of (long-task duration - 50ms) within the first 5 seconds
      const tbt = (window.__longTasks || [])
        .filter(t => t.start < 5000)
        .reduce((sum, t) => sum + Math.max(0, t.duration - 50), 0);
      return {
        lcp: Math.round(window.__lcp || 0),
        cls: Number((window.__cls || 0).toFixed(4)),
        tbt: Math.round(tbt),
        longTasksCount: (window.__longTasks || []).length,
        ttfb: Math.round(nav.responseStart || 0),
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
        loadEventEnd: Math.round(nav.loadEventEnd || 0),
        domNodeCount: document.querySelectorAll('*').length,
        blockingLinks,
        syncScripts,
        totalScripts,
        totalImages,
        imagesWithoutLazy,
      };
    });

    await ctx.close();

    // Aggregate resources
    const byType = { html: 0, css: 0, js: 0, img: 0, font: 0, json: 0, other: 0 };
    let totalBytes = 0;
    for (const r of resources) {
      byType[r.type] = (byType[r.type] || 0) + r.bytes;
      totalBytes += r.bytes;
    }
    const top5 = [...resources].sort((a, b) => b.bytes - a.bytes).slice(0, 5).map(r => ({
      url: r.url.replace(/^https?:\/\/[^/]+/, ''),
      kb: Math.round(r.bytes / 1024 * 10) / 10,
      type: r.type,
    }));

    return {
      slug, url, loadMs,
      metrics,
      byType,
      totalKB: Math.round(totalBytes / 1024),
      requestCount: resources.length,
      top5,
    };
  } catch (e) {
    try { await ctx.close(); } catch {}
    return { slug, url, error: String(e.message || e) };
  }
}

(async () => {
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  const browser = await chromium.launch();
  const results = [];

  console.log('slug                LCP    CLS    TBT  TTFB  DOM   loadMs  weight reqs  blk  syncJS  imgs');
  console.log('-'.repeat(105));
  for (const [route, slug] of TARGETS) {
    const url = BASE + route;
    const r = await auditPage(browser, url, slug);
    if (r.error) {
      console.log(slug.padEnd(18), '❌', r.error);
    } else {
      const m = r.metrics;
      console.log(
        slug.padEnd(18),
        String(m.lcp).padStart(5) + 'ms',
        String(m.cls).padStart(6),
        String(m.tbt).padStart(4) + 'ms',
        String(m.ttfb).padStart(4) + 'ms',
        String(m.domNodeCount).padStart(4),
        String(r.loadMs).padStart(6),
        String(r.totalKB).padStart(5) + 'kb',
        String(r.requestCount).padStart(4),
        String(m.blockingLinks).padStart(4),
        String(m.syncScripts).padStart(6),
        String(m.totalImages).padStart(5),
      );
    }
    results.push(r);
  }

  await browser.close();
  await fs.writeFile(OUT, JSON.stringify({ generated: new Date().toISOString(), base: BASE, results }, null, 2));
  console.log('\nWrote ' + OUT);

  // Print problem rows
  console.log('\n=== ⚠️ PERFORMANCE FLAGS ===');
  for (const r of results) {
    if (r.error) continue;
    const flags = [];
    if (r.metrics.lcp > 2500) flags.push(`LCP=${r.metrics.lcp}ms (>2500 = needs improvement)`);
    if (r.metrics.cls > 0.1) flags.push(`CLS=${r.metrics.cls} (>0.1 = needs improvement)`);
    if (r.metrics.tbt > 200) flags.push(`TBT=${r.metrics.tbt}ms (>200 = blocking main thread)`);
    if (r.metrics.blockingLinks > 8) flags.push(`${r.metrics.blockingLinks} render-blocking stylesheets`);
    if (r.metrics.syncScripts > 0) flags.push(`${r.metrics.syncScripts} sync scripts in <head>`);
    if (r.totalKB > 500) flags.push(`weight=${r.totalKB}kb (>500kb is heavy)`);
    if (r.metrics.domNodeCount > 1500) flags.push(`${r.metrics.domNodeCount} DOM nodes (>1500 hurts paint)`);
    if (flags.length) console.log(`  ${r.slug.padEnd(20)} ${flags.join(' · ')}`);
  }
})();
