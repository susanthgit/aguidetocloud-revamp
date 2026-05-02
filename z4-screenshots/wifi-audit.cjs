const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:1314/wifi-qr/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Dark mode (default)
  await page.screenshot({ path: 'z4-screenshots/wifi-dark.png', fullPage: true });

  // Light mode
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'z4-screenshots/wifi-light.png', fullPage: true });

  // Check colors
  const colors = await page.evaluate(() => {
    const get = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, border: s.borderColor };
    };
    return {
      activeTab: get('.wifiqr-tab.active'),
      form: get('.wifiqr-form'),
      sectionTitle: get('.wifiqr-section-title'),
      templateBtn: get('.wifiqr-template-btn.active'),
      btn: get('.wifiqr-btn'),
      btnPrimary: get('.wifiqr-btn-primary'),
      upsell: get('.wifiqr-upsell'),
      card: get('.wifiqr-card'),
    };
  });
  console.log('=== LIGHT MODE COLORS ===');
  console.log(JSON.stringify(colors, null, 2));

  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.waitForTimeout(300);
  const darkColors = await page.evaluate(() => {
    const get = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, border: s.borderColor };
    };
    return {
      activeTab: get('.wifiqr-tab.active'),
      form: get('.wifiqr-form'),
      sectionTitle: get('.wifiqr-section-title'),
      templateBtn: get('.wifiqr-template-btn.active'),
      btn: get('.wifiqr-btn'),
      btnPrimary: get('.wifiqr-btn-primary'),
    };
  });
  console.log('=== DARK MODE COLORS ===');
  console.log(JSON.stringify(darkColors, null, 2));

  // Above-fold audit
  const audit = await page.evaluate(() => {
    const vis = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return 'MISSING';
      const r = el.getBoundingClientRect();
      return r.height === 0 ? 'COLLAPSED' : r.top < window.innerHeight ? 'VISIBLE' : 'BELOW_FOLD';
    };
    return {
      tabs: vis('.wifiqr-tabs'),
      form: vis('.wifiqr-form'),
      templates: vis('.wifiqr-template-grid'),
      previewCard: vis('.wifiqr-card'),
      actions: vis('.wifiqr-actions'),
      upsell: vis('.wifiqr-upsell'),
    };
  });
  console.log('=== ABOVE FOLD ===');
  console.log(JSON.stringify(audit, null, 2));

  await browser.close();
})();
