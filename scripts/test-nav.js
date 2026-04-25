const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // Capture ALL console messages
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message));
  
  await page.goto('https://www.aguidetocloud.com/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('JS errors:', errors.length ? errors : 'NONE');

  // Check if switcher.js loaded and ran — look for evidence
  var switcherCheck = await page.evaluate(() => {
    // The vendor tab code should have bound listeners
    // Check if hamburger has click listener (earlier in switcher.js)
    var hamburger = document.getElementById('hamburger-btn');
    var hasHamburger = !!hamburger;
    
    // Try to find if the vendor section ran — add test
    var vendorTabs = document.querySelectorAll('.mega-vendor-tab');
    return {
      hamburgerExists: hasHamburger,
      vendorTabCount: vendorTabs.length,
      // Check the JS file loaded
      scriptTags: Array.from(document.querySelectorAll('script[src*="switcher"]')).map(s => s.src)
    };
  });
  console.log('Switcher check:', JSON.stringify(switcherCheck, null, 2));

  await browser.close();
})();
