const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:1314/qr-generator/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Dark mode (default)
  await page.screenshot({ path: 'z4-screenshots/qr-dark-first.png', fullPage: false });
  await page.screenshot({ path: 'z4-screenshots/qr-dark-full.png', fullPage: true });

  // Light mode
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'z4-screenshots/qr-light-first.png', fullPage: false });

  // Check above-fold
  const audit = await page.evaluate(() => {
    const vis = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return 'MISSING';
      if (el.hidden) return 'HIDDEN';
      const r = el.getBoundingClientRect();
      return r.height === 0 ? 'COLLAPSED' : r.top < window.innerHeight ? 'VISIBLE' : 'BELOW_FOLD';
    };
    return {
      tabs: vis('.qrgen-tabs'),
      typePills: vis('.qrgen-type-pills'),
      urlInput: vis('#qrgen-url'),
      tryCards: vis('.qrgen-try-cards'),
      styleSection: vis('.qrgen-style-toggle'),
      previewCard: vis('.qrgen-preview-card'),
      previewBox: vis('.qrgen-preview-box'),
      downloadBtns: vis('.qrgen-actions'),
      faq: vis('#panel-faq'),
      qrVisible: document.querySelector('.qrgen-preview-box canvas, .qrgen-preview-box svg') ? 'HAS_QR' : 'NO_QR',
    };
  });
  console.log('=== ABOVE FOLD ===');
  console.log(JSON.stringify(audit, null, 2));

  // Check colors
  const colors = await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const get = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color };
    };
    return {
      typePill: get('.qrgen-type-pill.active'),
      section: get('.qrgen-section'),
      previewCard: get('.qrgen-preview-card'),
      btn: get('.qrgen-btn'),
      btnPrimary: get('.qrgen-btn-primary'),
      tryCard: get('.qrgen-try-card'),
    };
  });
  console.log('=== COLORS ===');
  console.log(JSON.stringify(colors, null, 2));

  await browser.close();
})();
