// ════════════════════════════════════════════════════════════════════════
// Brain Bar — UX audit (Playwright)
// ────────────────────────────────────────────────────────────────────────
// Loads the site as a first-time user, tests every interaction surface,
// captures screenshots, and writes a structured report to qa/report.json.
// ════════════════════════════════════════════════════════════════════════

import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = 'http://127.0.0.1:1316';
const QA = path.resolve('.');
const SHOTS = path.join(QA, 'screenshots');
await mkdir(SHOTS, { recursive: true });

const browser = await chromium.launch({ headless: true });
const findings = [];
const note = (severity, where, what) => findings.push({ severity, where, what });

async function shot(page, name, opts = {}) {
  const file = path.join(SHOTS, `${name}.png`);
  await page.screenshot({ path: file, fullPage: opts.fullPage ?? true });
  return file;
}

async function audit() {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();

  // Capture console errors / warnings
  const consoleIssues = [];
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) {
      consoleIssues.push({ type: msg.type(), text: msg.text() });
    }
  });
  page.on('pageerror', (err) => {
    consoleIssues.push({ type: 'pageerror', text: err.message });
  });

  // ── HOMEPAGE — DARK ──────────────────────────────────────────────────
  const t0 = Date.now();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const loadMs = Date.now() - t0;

  await shot(page, '01-home-dark');
  const tag = (sev, what) => note(sev, '/', what);

  // Structural checks
  const launcher = await page.locator('#bb-input').count();
  if (launcher === 0) tag('blocker', 'launcher input missing');

  // Is the input auto-focused on page load?
  const focused = await page.evaluate(() =>
    document.activeElement && document.activeElement.id === 'bb-input'
  );
  if (!focused) tag('high', 'input is NOT auto-focused on page load — first-time users have to click into it before typing. Easy win.');

  // Is the launcher visible above the fold?
  const launcherBox = await page.locator('#bb-input').boundingBox();
  if (launcherBox && launcherBox.y > 800) {
    tag('high', `launcher input is below the fold at y=${Math.round(launcherBox.y)} on a 1280×800 viewport — first-time users will scroll past it`);
  }

  // ── HOMEPAGE — LIGHT MODE ────────────────────────────────────────────
  await page.evaluate(() => {
    document.cookie = 'aguidetocloud_theme=light; path=/; max-age=31536000';
    document.documentElement.setAttribute('data-theme', 'light');
  });
  await page.waitForTimeout(150);
  await shot(page, '02-home-light');

  // ── CONTRAST CHECK (light mode) ──────────────────────────────────────
  const lightContrast = await page.evaluate(() => {
    const get = (el, prop) => getComputedStyle(el).getPropertyValue(prop);
    const sample = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      return { sel, color: get(el, 'color'), bg: get(el, 'background-color') };
    };
    return [
      sample('.bb-launcher-input'),
      sample('.bb-eg-cmd'),
      sample('.bb-keyword'),
      sample('.bb-result-meta'),
    ].filter(Boolean);
  });

  // ── LAUNCHER INTERACTION ─────────────────────────────────────────────
  await page.evaluate(() => {
    document.cookie = 'aguidetocloud_theme=dark; path=/; max-age=31536000';
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  await page.locator('#bb-input').click();
  await page.locator('#bb-input').fill('mde');
  await page.waitForTimeout(300);
  await shot(page, '03-launcher-typing-mde');

  const resultCount = await page.locator('#bb-results .bb-result').count();
  if (resultCount < 1) tag('blocker', 'typing "mde" returned no results — launcher broken');

  // Auto-open on Enter for tier 1
  await page.locator('#bb-input').press('Enter');
  await page.waitForLoadState('networkidle');
  if (!page.url().includes('/mde')) {
    tag('blocker', `pressing Enter on tier-1 match did not navigate to /mde/ — went to ${page.url()}`);
  }

  // ── ENTRY PAGE — /mde/ ───────────────────────────────────────────────
  await shot(page, '04-entry-mde-dark');

  // Check that entry page has a path back to home or to launcher
  const hasBackToHome = await page.locator('a[href="/"]').count();
  if (hasBackToHome === 0) tag('medium', '/mde/ has no obvious link back to home or launcher beyond the brand mark');

  const hasRelated = await page.locator('.bb-related, .bb-aliases').count();
  if (hasRelated === 0) tag('medium', '/mde/ has no related entries / aliases panel');

  // ── DISAMBIGUATION PAGE ──────────────────────────────────────────────
  await page.goto(`${BASE}/defender/`, { waitUntil: 'networkidle' });
  await shot(page, '05-disambig-defender-dark');
  const disambigOptions = await page.locator('.bb-disambig-option').count();
  if (disambigOptions < 3) tag('medium', `/defender/ disambig only has ${disambigOptions} options visible`);

  // ── WISHLIST ─────────────────────────────────────────────────────────
  // Use domcontentloaded — wishlist fetches /api/popular-misses which is a
  // Pages Function (404 on Hugo dev server), so networkidle never resolves.
  await page.goto(`${BASE}/wishlist/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await shot(page, '06-wishlist-dark');

  // ── /all/ CATALOGUE PAGE (NEW) ───────────────────────────────────────
  await page.goto(`${BASE}/all/`, { waitUntil: 'networkidle' });
  await shot(page, '11-all-catalogue-dark');
  const catRows = await page.locator('.bb-catalogue-row').count();
  if (catRows < 30) tag('medium', `/all/ shows only ${catRows} entries — expected 35+`);

  // ── HOMEPAGE — RANDOM EXAMPLES (NEW) ─────────────────────────────────
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(150);
  await shot(page, '12-home-random-examples');

  // ── HOMEPAGE — VERIFY AUTO-FOCUS (NEW) ───────────────────────────────
  const refocused = await page.evaluate(() =>
    document.activeElement && document.activeElement.id === 'bb-input'
  );
  if (!refocused) tag('high', 'STILL not auto-focused');

  // ── EMPTY-STATE / NO MATCH ───────────────────────────────────────────
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);
  await page.locator('#bb-input').click();
  await page.locator('#bb-input').fill('xyzzy12345');
  await page.waitForTimeout(300);
  await shot(page, '07-empty-state-no-match');

  // ── MOBILE VIEWPORT ──────────────────────────────────────────────────
  await ctx.close();
  const mctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mpage = await mctx.newPage();
  await mpage.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await shot(mpage, '08-mobile-home', { fullPage: true });

  await mpage.locator('#bb-input').click();
  await mpage.locator('#bb-input').fill('e3');
  await mpage.waitForTimeout(300);
  await shot(mpage, '09-mobile-launcher-typing');

  await mpage.goto(`${BASE}/mde/`, { waitUntil: 'networkidle' });
  await shot(mpage, '10-mobile-entry-mde');

  // Mobile-specific checks
  const overflowsX = await mpage.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  );
  if (overflowsX) tag('high', 'mobile viewport has horizontal overflow — content extends beyond the screen');

  await mctx.close();

  // ── REPORT ───────────────────────────────────────────────────────────
  const report = {
    timestamp: new Date().toISOString(),
    base_url: BASE,
    home_load_ms: loadMs,
    findings: findings.sort((a, b) => {
      const order = { blocker: 0, high: 1, medium: 2, low: 3 };
      return order[a.severity] - order[b.severity];
    }),
    console_issues: consoleIssues,
    light_mode_contrast_samples: lightContrast,
    screenshot_count: 10,
  };
  await writeFile(path.join(QA, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

try {
  await audit();
} finally {
  await browser.close();
}
