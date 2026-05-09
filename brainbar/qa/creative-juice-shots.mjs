// ════════════════════════════════════════════════════════════════════════
// cmd portal — Creative-Juice walkthrough (Sat 10 May 2026)
// Captures live cmd.aguidetocloud.com on desktop+mobile, dark+light,
// across 4 high-traffic pages so I can ground the redesign in real pixels.
// ════════════════════════════════════════════════════════════════════════
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.CMD_BASE || 'https://cmd.aguidetocloud.com';
const OUT = process.env.CMD_OUT
  ? path.resolve(process.env.CMD_OUT)
  : path.resolve('qa/creative-shots');
await mkdir(OUT, { recursive: true });

const PAGES = [
  { slug: 'home',       url: '/' },
  { slug: 'entry-mde',  url: '/mde/' },
  { slug: 'all',        url: '/all/' },
  { slug: 'about',      url: '/about/' },
  { slug: 'decode',     url: '/decode/' },
];

const VIEWPORTS = [
  { name: 'desktop', w: 1440, h: 900 },
  { name: 'mobile',  w: 390,  h: 844 },
];

const THEMES = ['dark', 'light'];

const browser = await chromium.launch({ headless: true });

for (const vp of VIEWPORTS) {
  for (const theme of THEMES) {
    const ctx = await browser.newContext({
      viewport: { width: vp.w, height: vp.h },
      deviceScaleFactor: 1,
      isMobile: vp.name === 'mobile',
      hasTouch: vp.name === 'mobile',
    });
    // Block cosmos-bar.js when running against localhost — it's fetched from
    // cosmos.aguidetocloud.com and will hang local capture without affecting
    // cmd page rendering (the placeholder ✦ cosmos shows and that's fine).
    if (BASE.startsWith('http://')) {
      await ctx.route('**/cosmos-bar.js', (route) => route.abort());
      await ctx.route('**/atlas-bar.json', (route) => route.abort());
    }
    // Set theme cookie BEFORE first navigation. Localhost needs the literal
    // hostname; production uses the .aguidetocloud.com universe scope.
    const isLocal = BASE.startsWith('http://');
    await ctx.addCookies([{
      name: 'aguidetocloud_theme',
      value: theme,
      domain: isLocal ? '127.0.0.1' : '.aguidetocloud.com',
      path: '/',
    }]);

    for (const p of PAGES) {
      const page = await ctx.newPage();
      await page.goto(BASE + p.url, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch((e) => console.warn('goto warn', p.url, e.message));
      await page.waitForTimeout(2500);
      const file = path.join(OUT, `${p.slug}__${vp.name}__${theme}.png`);
      await page.screenshot({ path: file, fullPage: true, timeout: 30000 }).catch((e) => console.warn('shot warn', file, e.message));
      console.log('✓', file);
      await page.close();
    }
    await ctx.close();
  }
}

await browser.close();
console.log('done');
