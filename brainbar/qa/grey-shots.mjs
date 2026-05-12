// Capture only the home page in 4 modes — desktop+mobile × dark+light
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.CMD_BASE || 'http://127.0.0.1:8788';
const OUT = path.resolve(process.env.CMD_OUT || 'qa/grey-shots');
await mkdir(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'desktop', w: 1440, h: 900 },
  { name: 'mobile',  w: 390,  h: 844 },
];

const browser = await chromium.launch({ headless: true });
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: 1,
    isMobile: vp.name === 'mobile',
    hasTouch: vp.name === 'mobile',
  });
  if (BASE.startsWith('http://')) {
    await ctx.route('**/cosmos-bar.js', (r) => r.abort());
    await ctx.route('**/atlas-bar.json', (r) => r.abort());
  }
  const page = await ctx.newPage();
  try { await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 15000 }); }
  catch (e) { console.warn('goto', e.message); }
  await page.waitForTimeout(1500);
  const file = path.join(OUT, `home__${vp.name}.png`);
  await page.screenshot({ path: file, fullPage: true, timeout: 20000 });
  console.log('✓', file);
  await page.close();
  await ctx.close();
}
await browser.close();
