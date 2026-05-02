const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:1314/wifi-qr/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Light mode — the problem mode
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'z4-screenshots/wifi-light-fixed.png', fullPage: false });

  // Check card text color in light mode
  const cardColors = await page.evaluate(() => {
    const get = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      return getComputedStyle(el).color;
    };
    return {
      cardText: get('.wifiqr-card'),
      heading: get('.wifiqr-card-heading'),
      instruction: get('.wifiqr-card-instruction'),
      network: get('.wifiqr-card-network'),
      password: get('.wifiqr-card-password'),
    };
  });
  console.log('LIGHT MODE CARD TEXT COLORS:');
  console.log(JSON.stringify(cardColors, null, 2));

  // Dark mode for comparison
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'z4-screenshots/wifi-dark-fixed.png', fullPage: false });

  await browser.close();
})();
