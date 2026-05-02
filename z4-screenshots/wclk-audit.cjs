const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:1314/world-clock/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'z4-screenshots/wclk-planner-light.png', fullPage: true });

  await page.evaluate(() => { document.documentElement.setAttribute('data-theme', 'dark'); });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'z4-screenshots/wclk-planner-dark.png', fullPage: true });

  // Grab computed colors
  await page.evaluate(() => { document.documentElement.setAttribute('data-theme', 'light'); });
  await page.waitForTimeout(300);
  const lightColors = await page.evaluate(() => {
    const get = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, border: s.borderColor, borderBottom: s.borderBottomColor };
    };
    return {
      page: get('.wclk-page'),
      tab: get('.wclk-tab'),
      activeTab: get('.wclk-tab.active'),
      localBar: get('.wclk-local'),
      localLabel: get('.wclk-local-label'),
      localTime: get('.wclk-local-time'),
      search: get('.wclk-search'),
      quickBtn: get('.wclk-quick-btn'),
      toggleBtn: get('.wclk-toggle'),
      card: get('.wclk-card'),
      cardTime: get('.wclk-card-time'),
      cardCity: get('.wclk-card-city'),
      stepNum: get('.wclk-step-num'),
      hint: get('.wclk-hint'),
      label: get('.wclk-label'),
      preset: get('.wclk-preset'),
      copyBtn: get('.wclk-copy-btn'),
    };
  });
  console.log('=== LIGHT ===');
  console.log(JSON.stringify(lightColors, null, 2));

  await page.evaluate(() => { document.documentElement.setAttribute('data-theme', 'dark'); });
  await page.waitForTimeout(300);
  const darkColors = await page.evaluate(() => {
    const get = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, border: s.borderColor, borderBottom: s.borderBottomColor };
    };
    return {
      page: get('.wclk-page'),
      tab: get('.wclk-tab'),
      activeTab: get('.wclk-tab.active'),
      localBar: get('.wclk-local'),
      localLabel: get('.wclk-local-label'),
      localTime: get('.wclk-local-time'),
      search: get('.wclk-search'),
      quickBtn: get('.wclk-quick-btn'),
      toggleBtn: get('.wclk-toggle'),
      card: get('.wclk-card'),
      cardTime: get('.wclk-card-time'),
      cardCity: get('.wclk-card-city'),
    };
  });
  console.log('=== DARK ===');
  console.log(JSON.stringify(darkColors, null, 2));

  await browser.close();
})();
