// Quick screenshot capture for v2b features — run after dev server is up.
import { chromium } from 'playwright';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

const BASE = 'http://127.0.0.1:1316';
const SHOTS = path.resolve('screenshots');
await mkdir(SHOTS, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

async function shot(name) {
  await page.screenshot({ path: path.join(SHOTS, `v2b-${name}.png`), fullPage: false });
}

// Scenario 1: synonym hit
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !!document.querySelector('#bb-input'));
await page.waitForFunction(() => document.querySelector('#bb-input-status')?.textContent?.includes('entries'));
await page.fill('#bb-input', 'antivirus');
await page.waitForTimeout(150);
await shot('01-synonym-antivirus');

// Scenario 2: did-you-mean
await page.fill('#bb-input', 'intuune');
await page.waitForTimeout(150);
await shot('02-did-you-mean-intuune');

// Scenario 3: multi-token
await page.fill('#bb-input', 'defender for endpoint');
await page.waitForTimeout(150);
await shot('03-multi-token');

// Scenario 4: match highlight
await page.fill('#bb-input', 'intu');
await page.waitForTimeout(150);
await shot('04-match-highlight');

// Scenario 5: recent searches — navigate to mde first, then home
await page.goto(`${BASE}/mde/`, { waitUntil: 'domcontentloaded' });
// Manually seed recent (since this is a fresh context)
await page.evaluate(() => {
  localStorage.setItem('bb:recent', JSON.stringify([
    { q: 'antivirus', slug: 'mde', ts: Date.now() },
    { q: 'sso', slug: 'entra-p1', ts: Date.now() - 60000 },
    { q: 'pim', slug: 'pim', ts: Date.now() - 120000 },
  ]));
});
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !!document.querySelector('#bb-input'));
await page.waitForTimeout(150);
await shot('05-recent-searches');

// Scenario 6: help overlay
await page.click('body');
await page.waitForTimeout(50);
await page.keyboard.press('?');
await page.waitForTimeout(100);
await shot('06-help-overlay');
await page.keyboard.press('Escape');
await page.waitForTimeout(50);

// Scenario 7: entry with freshness dot
await page.goto(`${BASE}/mde/`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(100);
await shot('07-entry-freshness-dot');

await browser.close();
console.log('Screenshots saved to ' + SHOTS);
