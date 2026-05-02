const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const dir = 'C:/ssClawy/aguidetocloud-revamp/z4-screenshots/ps-zen';
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:1314/ps-builder/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${dir}/build-v2.png`, fullPage: true });
  await page.click('[data-tab="recipes"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${dir}/recipes-v2.png`, fullPage: true });
  await ctx.close();
  await browser.close();
  console.log('Done');
})();
