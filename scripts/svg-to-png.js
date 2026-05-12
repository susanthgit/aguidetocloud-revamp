#!/usr/bin/env node
// Render an SVG file to PNG using Playwright (headless Chromium).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node svg-to-png.js <input.svg> <output.png> [scale=2]');
  process.exit(1);
}
const [inputPath, outputPath, scaleArg] = args;
const scale = scaleArg ? parseFloat(scaleArg) : 2;

(async () => {
  const svg = fs.readFileSync(inputPath, 'utf8');

  // Extract width/height from viewBox or attributes
  const wMatch = svg.match(/<svg[^>]*\swidth="(\d+(?:\.\d+)?)"/);
  const hMatch = svg.match(/<svg[^>]*\sheight="(\d+(?:\.\d+)?)"/);
  const w = wMatch ? parseFloat(wMatch[1]) : 1200;
  const h = hMatch ? parseFloat(hMatch[1]) : 1050;
  console.log(`SVG dimensions: ${w} x ${h}, rendering at ${scale}x = ${w * scale} x ${h * scale}`);

  // Wrap SVG in a minimal HTML page
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
html, body { margin: 0; padding: 0; background: #ffffff; }
svg { display: block; }
</style></head><body>${svg}</body></html>`;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: Math.ceil(w), height: Math.ceil(h) },
    deviceScaleFactor: scale,
  });
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500); // allow font rendering

  // Screenshot just the SVG element to avoid scrollbars / extra space
  const svgEl = page.locator('svg').first();
  await svgEl.screenshot({ path: outputPath, omitBackground: false });
  await browser.close();
  console.log(`Wrote ${outputPath}`);
})().catch((err) => {
  console.error('Render failed:', err);
  process.exit(1);
});
