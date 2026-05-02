const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:1314/world-clock/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'z4-screenshots/wclk-v3-dark.png', fullPage: true });
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'z4-screenshots/wclk-v3-light.png', fullPage: true });
  const above = await page.evaluate(() => {
    const vis = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return 'MISSING';
      if (el.hidden) return 'HIDDEN';
      const r = el.getBoundingClientRect();
      return r.height === 0 ? 'COLLAPSED' : r.top < window.innerHeight ? 'VISIBLE' : 'BELOW_FOLD';
    };
    return {
      localTime: vis('.wclk-local'),
      search: vis('.wclk-search'),
      toolbar: vis('.wclk-toolbar'),
      clockCards: vis('#wclk-grid'),
      goldenWindow: vis('.wclk-meeting-golden'),
      copyShare: vis('.wclk-meeting-summary'),
      timeline: vis('#wclk-meeting-timeline'),
      slider: vis('.wclk-slider-wrap'),
      sliderResults: vis('#wclk-slider-results'),
      calLink: document.querySelectorAll('a[href*="calendar"]').length,
    };
  });
  console.log(JSON.stringify(above, null, 2));
  await browser.close();
})();
