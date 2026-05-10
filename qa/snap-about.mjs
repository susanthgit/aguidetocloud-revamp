// snap-about.mjs — baseline screenshots of /about/ in 4 modes
// Usage: cd guided && node ../aguidetocloud-revamp/qa/snap-about.mjs [BASE_URL] [OUT_DIR]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE = process.argv[2] || 'https://www.aguidetocloud.com';
const OUT  = resolve(process.argv[3] || 'C:/ssClawy/aguidetocloud-revamp/qa/baseline-about');
mkdirSync(OUT, { recursive: true });

const url = BASE.replace(/\/$/, '') + '/about/';
const viewports = [
  { name: 'desktop', w: 1440, h: 900 },
  { name: 'mobile',  w: 390,  h: 844 },
];
const themes = ['light', 'dark'];

const browser = await chromium.launch();
for (const vp of viewports) {
  for (const theme of themes) {
    const ctx = await browser.newContext({
      viewport: { width: vp.w, height: vp.h },
      colorScheme: theme,
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    // Block cosmos-bar.js so screenshots don't depend on remote latency
    await page.route('**/cosmos-bar.js', r => r.abort());
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.evaluate((t) => {
      try { document.documentElement.dataset.theme = t; } catch {}
      try { localStorage.setItem('theme', t); } catch {}
    }, theme);
    await page.waitForTimeout(400);
    const file = `${OUT}/about__${vp.name}__${theme}.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log('shot:', file);
    await ctx.close();
  }
}
await browser.close();
console.log('done.');
