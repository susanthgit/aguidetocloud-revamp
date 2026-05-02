const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  await page.goto('http://localhost:1314/ps-builder/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const panels = await page.$$eval('.psb-panel', els => els.map(e => ({ id: e.id, hidden: e.hidden, hasActive: e.classList.contains('active'), childCount: e.children.length, text: e.textContent.substring(0,100) })));
  console.log('Panels:', JSON.stringify(panels, null, 2));
  console.log('JS Errors:', errors);
  await browser.close();
})();
