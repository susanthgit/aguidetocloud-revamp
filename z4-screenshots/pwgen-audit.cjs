const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:1314/password-generator/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'z4-screenshots/pwgen-dark.png', fullPage: false });
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'z4-screenshots/pwgen-light.png', fullPage: false });

  const audit = await page.evaluate(() => {
    const get = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color };
    };
    return {
      activeTab: get('.pwgen-tab.active'),
      section: get('.pwgen-section'),
      sectionTitle: get('.pwgen-section-title'),
      qsCard: get('.pwgen-qs-card'),
    };
  });
  console.log(JSON.stringify(audit, null, 2));
  await browser.close();
})();
