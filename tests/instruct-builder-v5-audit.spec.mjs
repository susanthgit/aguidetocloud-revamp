// v5 cold-user audit — desktop + mobile screenshots across user flows
import { test, expect } from '@playwright/test';

const URL = 'http://localhost:1314/instruct-builder/';
const DESKTOP = { width: 1440, height: 900 };
const MOBILE  = { width: 390,  height: 844 }; // iPhone 14

async function selectPlatform(page, platformId) {
  await page.locator(`label.instruct-platform-pill:has(input[value="${platformId}"])`).click();
}

for (const device of [
  { name: 'desktop', viewport: DESKTOP },
  { name: 'mobile',  viewport: MOBILE  },
]) {
  test.describe(`v5 audit — ${device.name}`, () => {
    test.use({ viewport: device.viewport });

    test(`${device.name}: 1. empty state — ghost preview banner visible`, async ({ page }) => {
      await page.goto(URL);
      await page.waitForTimeout(500);
      // Banner is always visible; ghost is desktop-only
      await expect(page.locator('.instruct-preview-empty-banner')).toBeVisible();
      if (device.name === 'desktop') {
        await expect(page.locator('.instruct-preview-ghost')).toBeVisible();
      } else {
        await expect(page.locator('.instruct-preview-ghost')).toBeHidden();
      }
      // Keyboard hint hidden on mobile
      const kbd = page.locator('.instruct-kbd-bar');
      if (device.name === 'desktop') {
        await expect(kbd).toBeVisible();
      } else {
        await expect(kbd).toBeHidden();
      }
      await page.screenshot({ path: `tests/screenshots/v5-${device.name}-1-empty.png`, fullPage: true });
    });

    test(`${device.name}: 2. platform pills — fit in ≤2 rows with short labels`, async ({ page }) => {
      await page.goto(URL);
      const pills = page.locator('.instruct-platform-pill');
      await expect(pills).toHaveCount(5);
      if (device.name === 'desktop') {
        // The page has L+R sidebars that squeeze the form column. With v4's
        // 5-platform pills it's reasonable to wrap to a second row, as long
        // as it doesn't go to a third row (which would mean labels are too
        // long again). Short names should keep this at ≤2 rows.
        const ys = [];
        for (let i = 0; i < 5; i++) {
          const b = await pills.nth(i).boundingBox();
          ys.push(Math.round(b.y));
        }
        const uniqueYs = [...new Set(ys)].sort((a, b) => a - b);
        expect(uniqueYs.length, `Pill rows should be ≤2 — got ${uniqueYs.length}: ${ys}`).toBeLessThanOrEqual(2);
      }
      await page.screenshot({ path: `tests/screenshots/v5-${device.name}-2-pills.png`, clip: device.name === 'desktop' ? { x: 0, y: 0, width: device.viewport.width, height: 600 } : undefined });
    });

    test(`${device.name}: 3. templates tab — filters + NEW badges + categories`, async ({ page }) => {
      await page.goto(URL);
      await page.click('.instruct-tab[data-tab="templates"]');
      await page.waitForTimeout(300);
      await expect(page.locator('.instruct-tpl-card')).toHaveCount(13);
      await expect(page.locator('.instruct-tpl-filter')).toHaveCount(4);
      await expect(page.locator('.instruct-tpl-card[data-tpl="daily-email-digest"] .instruct-tpl-new')).toBeVisible();
      // Verify category split
      const dailyRoutineCards = page.locator('.instruct-tpl-card[data-cat="Daily Routine"]');
      await expect(dailyRoutineCards).toHaveCount(4); // project-reporter + 3 new
      await page.screenshot({ path: `tests/screenshots/v5-${device.name}-3-templates.png`, fullPage: true });
    });

    test(`${device.name}: 4. loaded template — full preview rendered`, async ({ page }) => {
      await page.goto(URL);
      await page.click('.instruct-tab[data-tab="templates"]');
      await page.click('.instruct-tpl-card[data-tpl="daily-email-digest"]');
      await page.waitForTimeout(500);
      await expect(page.locator('#preview-content')).toBeVisible();
      // Fix #11: name blank
      await expect(page.locator('#instruct-name')).toHaveValue('');
      // Fix #9: CAPS badge appears above textarea
      const ph = await page.locator('#preview-content').innerHTML();
      expect(ph.indexOf('instruct-caps-badge')).toBeLessThan(ph.indexOf('instruct-output-text'));
      // Fix #10: next-step CTA visible with M365 paste URL
      await expect(page.locator('#next-step-cta')).toBeVisible();
      await expect(page.locator('#next-step-cta')).toHaveAttribute('href', 'https://microsoft365.com/chat');
      // Fix #18: smart suggestion shows for email purpose? It mentions "inbox" → match expected
      // Note: it ONLY shows if the value isn't already in knowledge. Daily Digest template has "My emails" in knowledge.
      // So the suggestion should be HIDDEN.
      await expect(page.locator('#smart-suggestion')).toBeHidden();
      await page.screenshot({ path: `tests/screenshots/v5-${device.name}-4-loaded.png`, fullPage: true });
    });

    test(`${device.name}: 5. weak input — clickable strength hints`, async ({ page }) => {
      await page.goto(URL);
      await page.fill('#instruct-purpose', 'help with stuff');
      await page.waitForTimeout(500);
      await expect(page.locator('#strength-badge')).toContainText(/Weak|Moderate/);
      await expect(page.locator('.instruct-strength-hint').first()).toBeVisible();
      await page.screenshot({ path: `tests/screenshots/v5-${device.name}-5-weak.png`, fullPage: true });
      // Click first hint and verify scroll
      await page.locator('.instruct-strength-hint').first().click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: `tests/screenshots/v5-${device.name}-5b-pulsed.png`, fullPage: true });
    });
  });
}
