const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, storageState: undefined });
  const page = await ctx.newPage();

  // Fresh visit — no localStorage
  await page.goto('http://localhost:1314/world-clock/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // What does the user see on first load?
  const firstScreen = await page.evaluate(() => {
    const visible = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return 'MISSING';
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight ? 'VISIBLE' : 'BELOW_FOLD';
    };
    return {
      localTime: visible('.wclk-local'),
      search: visible('.wclk-search'),
      quickAdds: visible('.wclk-quick-adds'),
      controls: visible('.wclk-meeting-controls'),
      goldenWindow: visible('.wclk-meeting-golden'),
      clockCards: visible('#wclk-grid'),
      timeline: visible('#wclk-meeting-timeline'),
      slider: visible('.wclk-slider-wrap'),
      emptyHint: visible('#wclk-empty-hint'),
      meetingHint: visible('#wclk-meeting-hint'),
      // Check if golden window has content
      goldenContent: document.getElementById('wclk-meeting-golden')?.innerHTML?.length || 0,
      // Check number of clock cards
      cardCount: document.querySelectorAll('.wclk-card').length,
      // Check timeline content
      timelineContent: document.getElementById('wclk-meeting-timeline')?.innerHTML?.length || 0,
      // What's the page scroll height?
      scrollHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
    };
  });
  console.log('=== FIRST SCREEN (above fold) ===');
  console.log(JSON.stringify(firstScreen, null, 2));

  // Screenshot what user sees on first load (viewport only, not full page)
  await page.screenshot({ path: 'z4-screenshots/wclk-first-screen.png' });

  // Now scroll down to see what's below
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'z4-screenshots/wclk-scroll-500.png' });

  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'z4-screenshots/wclk-scroll-1000.png' });

  // Mobile view
  await page.setViewportSize({ width: 375, height: 812 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'z4-screenshots/wclk-mobile.png', fullPage: true });

  // Check: can user understand what to do without reading hints?
  // Check: what elements are interactive?
  const interactiveCount = await page.evaluate(() => {
    return {
      buttons: document.querySelectorAll('button:not([hidden])').length,
      inputs: document.querySelectorAll('input:not([hidden])').length,
      selects: document.querySelectorAll('select').length,
      links: document.querySelectorAll('a').length,
    };
  });
  console.log('=== INTERACTIVE ELEMENTS ===');
  console.log(JSON.stringify(interactiveCount, null, 2));

  await browser.close();
})();
