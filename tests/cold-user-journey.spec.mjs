import { test, expect } from '@playwright/test';

const URL = 'http://localhost:1314/instruct-builder/';

test('Cold user journey — first-time visitor walk-through', async ({ page }) => {
  // ── 1. Landing state — what does the user see first? ──
  await page.goto(URL);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tests/screenshots/cold-01-landing.png', fullPage: true });

  // Extract key visible elements for analysis
  const h1 = await page.locator('h1').first().textContent().catch(() => '(no h1)');
  const taglines = await page.locator('.tool-tagline, .tool-subtitle, .zt-page header p').allTextContents().catch(() => []);
  const tabLabels = await page.locator('.instruct-tab').allTextContents();
  const platformLabels = await page.locator('.instruct-platform-pill span').allTextContents();
  const formLabels = await page.locator('.instruct-form label').allTextContents();
  const buttons = await page.locator('button:visible, a.zt-btn:visible').allTextContents();
  console.log('--- LANDING STATE ---');
  console.log('H1:', h1);
  console.log('Tagline area:', taglines);
  console.log('Tabs:', tabLabels);
  console.log('Platform pills:', platformLabels);
  console.log('Form field labels (top of fold):', formLabels.slice(0, 10));
  console.log('Visible buttons:', buttons);

  // ── 2. Right pane (empty state) ──
  const emptyState = await page.locator('.instruct-preview-empty').textContent();
  console.log('Empty state copy:', emptyState);
  await page.locator('.instruct-preview-empty').screenshot({ path: 'tests/screenshots/cold-02-empty-state.png' }).catch(() => {});

  // ── 3. Hover effects? ──
  await page.locator('.instruct-tone-pill').first().hover();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'tests/screenshots/cold-03-hover-tone.png', clip: { x: 0, y: 200, width: 700, height: 600 }}).catch(() => {});

  // ── 4. Try filling without any guidance (truly cold) ──
  // What if I just type something into "What should it do"?
  await page.fill('#instruct-purpose', 'Help me draft replies to angry customer emails');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tests/screenshots/cold-04-first-input.png', fullPage: true });

  // Does anything change? Is there feedback?
  const previewVisible = await page.locator('#preview-content').isVisible();
  console.log('Live preview triggered:', previewVisible);

  // ── 5. Templates tab ──
  await page.click('.instruct-tab[data-tab="templates"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'tests/screenshots/cold-05-templates-tab.png', fullPage: true });

  const templateNames = await page.locator('.instruct-tpl-name').allTextContents();
  const templateCategories = await page.locator('.instruct-tpl-badge').allTextContents();
  console.log('Template count:', templateNames.length);
  console.log('Templates:', templateNames);
  console.log('Categories:', [...new Set(templateCategories)]);

  // ── 6. FAQ tab ──
  await page.click('.instruct-tab[data-tab="faq"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'tests/screenshots/cold-06-faq-tab.png', fullPage: true });

  const faqQuestions = await page.locator('#panel-faq details summary').allTextContents();
  console.log('FAQ question count:', faqQuestions.length);
  console.log('FAQ questions:', faqQuestions);

  // ── 7. Click a template, see full flow ──
  await page.click('.instruct-tab[data-tab="templates"]');
  await page.click('.instruct-tpl-card[data-tpl="it-helpdesk"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tests/screenshots/cold-07-template-loaded.png', fullPage: true });

  // ── 8. Output appearance ──
  const outputBox = page.locator('.instruct-split-preview');
  await outputBox.screenshot({ path: 'tests/screenshots/cold-08-output-area.png' }).catch(() => {});
  const strengthText = await page.locator('#strength-badge').textContent();
  console.log('Strength badge:', strengthText);
  const charText = await page.locator('#output-chars').textContent();
  console.log('Char count:', charText);

  // ── 9. Mobile viewport ──
  await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 Pro
  await page.goto(URL);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tests/screenshots/cold-09-mobile-landing.png', fullPage: true });

  await page.click('.instruct-tab[data-tab="templates"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'tests/screenshots/cold-10-mobile-templates.png', fullPage: true });
});
