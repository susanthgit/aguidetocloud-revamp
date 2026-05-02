const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const dir = 'C:/ssClawy/aguidetocloud-revamp/z4-screenshots/purview-zen';
  require('fs').mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:1314/purview-starter/');
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  await page.waitForTimeout(1500);
  for (const tab of ['kits', 'custom', 'deploy', 'faq']) {
    await page.click(`[data-tab="${tab}"]`);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${dir}/${tab}.png`, fullPage: true });
  }
  await ctx.close();
  await browser.close();
  console.log('Done');
})();
