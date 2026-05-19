// One-off script: capture clean Instruction Builder screenshots for the blog.
// Targets the live production site to grab v5 polish + mobile-pill-collapse.
// Manually clips to the tool's bounding box (excludes cosmos bar + sidebars +
// navbar + extra padding that `element.screenshot()` sometimes captures).
// Outputs WebP via sharp.

import { chromium } from 'playwright';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const URL = 'https://www.aguidetocloud.com/instruct-builder/';
const OUT_DIR = path.resolve('static/images/blog/m365-agent-builder');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function snapClip(page, sel, outBase, opts = {}) {
  // Compute bbox via page.evaluate so we honour transforms / sticky offsets etc.
  const bbox = await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: r.left + window.scrollX,
      y: r.top  + window.scrollY,
      width:  r.width,
      height: r.height,
    };
  }, sel);
  if (!bbox) throw new Error('Selector not found: ' + sel);
  const maxH = opts.maxHeight || 9999;
  const clip = {
    x: Math.max(0, Math.round(bbox.x - 8)),
    y: Math.max(0, Math.round(bbox.y - 8)),
    width:  Math.round(bbox.width + 16),
    height: Math.min(Math.round(bbox.height + 16), maxH),
  };
  const png = await page.screenshot({ fullPage: true, clip, type: 'png' });
  await sharp(png).webp({ quality: 80 }).toFile(path.join(OUT_DIR, outBase + '.webp'));
  console.log('  ✓', outBase + '.webp', `(clip ${clip.width}x${clip.height})`);
}

async function killStickyChrome(page) {
  // Remove any fixed/sticky/overlay elements so they don't bleed into the screenshot.
  await page.addStyleTag({ content: `
    .cosmos-bar, cosmos-bar, .feedback-fab, .zt-fullscreen-btn, .skip-link,
    nav.zen-nav, .zen-nav, header.zen-header, .zen-header,
    .zt-sidebar, .zt-companion, .cosmos-footer { display: none !important; }
    /* Collapse the 3-column tool layout so the tool occupies full width */
    .zt-reading.zt-reading--tool-detail { display: block !important; }
    .zt-tool-center { max-width: none !important; padding: 0 !important; }
    body { padding-top: 0 !important; margin-top: 0 !important; }
  ` });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}

(async () => {
  const browser = await chromium.launch();

  // ── Desktop: split-pane in action (form + output) ──
  const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const desktop = await desktopCtx.newPage();

  console.log('Desktop empty state →');
  await desktop.goto(URL);
  await desktop.waitForTimeout(1500);
  await killStickyChrome(desktop);
  await snapClip(desktop, '.instruct-page', '15-instruct-builder-empty', { maxHeight: 1500 });

  console.log('Desktop loaded state →');
  await desktop.click('.instruct-tab[data-tab="templates"]');
  await desktop.waitForTimeout(400);
  await desktop.click('.instruct-tpl-card[data-tpl="daily-email-digest"]');
  await desktop.waitForTimeout(900);
  // Re-apply the chrome killer because the tab/template switch may have re-styled
  await killStickyChrome(desktop);
  await snapClip(desktop, '.instruct-page', '16-instruct-builder-loaded', { maxHeight: 1300 });

  // ── Mobile: compact pills + quickstart bar ──
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 1400 }, deviceScaleFactor: 2 });
  const mobile = await mobileCtx.newPage();
  console.log('Mobile empty state →');
  await mobile.goto(URL);
  await mobile.waitForTimeout(1500);
  await killStickyChrome(mobile);
  await snapClip(mobile, '.instruct-page', '17-instruct-builder-mobile', { maxHeight: 1300 });

  await browser.close();
  console.log('Done. Files in', OUT_DIR);
})();

