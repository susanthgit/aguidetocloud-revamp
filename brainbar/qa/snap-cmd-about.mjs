// snap-cmd-about.mjs — local + live snap for cmd /about/ tour CTA
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
const BASE = (process.argv[2] || 'http://localhost:1320').replace(/\/$/, '');
const OUT = resolve(process.argv[3] || 'C:/ssClawy/aguidetocloud-revamp/brainbar/qa/about-tour');
mkdirSync(OUT, { recursive: true });
const URL = BASE + '/about/';
const cases = [
  { name: 'desktop-1440-light', w: 1440, h: 900, theme: 'light' },
  { name: 'desktop-1440-dark',  w: 1440, h: 900, theme: 'dark' },
  { name: 'mobile-390-light',   w: 390,  h: 844, theme: 'light' },
  { name: 'mobile-390-dark',    w: 390,  h: 844, theme: 'dark' },
];
const browser = await chromium.launch();
for (const c of cases) {
  const ctx = await browser.newContext({ viewport: { width: c.w, height: c.h }, colorScheme: c.theme, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  if (BASE.startsWith('http://localhost')) await page.route('**/cosmos-bar.js', r => r.abort());
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.evaluate((t) => { document.documentElement.dataset.theme = t; try { localStorage.setItem('theme', t); } catch {} }, c.theme);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/cmd-about__${c.name}.png`, fullPage: true });
  console.log('shot:', c.name);
  await ctx.close();
}
await browser.close();
console.log('done.');
