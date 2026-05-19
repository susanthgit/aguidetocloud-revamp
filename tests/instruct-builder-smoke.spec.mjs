import { test, expect } from '@playwright/test';

const URL = 'http://localhost:1314/instruct-builder/';

async function selectPlatform(page, platformId) {
  await page.locator(`label.instruct-platform-pill:has(input[value="${platformId}"])`).click();
}

test('Instruction Builder v4 — full user flow', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/Agent Instruction Builder/i);

  const tabs = page.locator('.instruct-tab');
  await expect(tabs).toHaveCount(3);
  await expect(tabs.nth(0)).toHaveText('Build');
  await expect(tabs.nth(1)).toHaveText('Templates');
  await expect(tabs.nth(2)).toHaveText('FAQ');

  await expect(page.locator('.instruct-platform-pill')).toHaveCount(5);
  await expect(page.locator('input[name="instruct-platform"][value="m365"]')).toBeChecked();

  await page.click('.instruct-tab[data-tab="templates"]');
  await expect(page.locator('#panel-templates')).toHaveClass(/active/);
  await expect(page.locator('.instruct-tpl-card')).toHaveCount(13);

  await page.click('.instruct-tpl-card[data-tpl="daily-email-digest"]');
  await expect(page.locator('#panel-build')).toHaveClass(/active/);
  await expect(page.locator('#instruct-name')).toHaveValue(/Daily Email Digest/i);
  await expect(page.locator('#instruct-purpose')).toHaveValue(/daily scan-friendly briefing/i);
  await expect(page.locator('#instruct-output-format')).toHaveValue(/5 buckets/i);
  await expect(page.locator('#section-output-format')).toHaveAttribute('open', '');
  await expect(page.locator('#instruct-schedule')).toHaveValue(/Good morning/i);
  await expect(page.locator('#section-schedule')).toHaveAttribute('open', '');
  await expect(page.locator('#ex-user-1')).toHaveValue(/What did I miss/i);

  await expect(page.locator('#preview-content')).toBeVisible();
  const m365 = await page.locator('#output-text').inputValue();
  expect(m365).toContain('## Role & Purpose');
  expect(m365).toContain('## Output Format');
  expect(m365).toContain('## When Triggered Automatically');
  expect(m365).toContain('## Examples');

  await selectPlatform(page, 'claude');
  await page.waitForTimeout(500);
  const claude = await page.locator('#output-text').inputValue();
  expect(claude).toContain('<role>');
  expect(claude).toContain('<output_format>');
  expect(claude).toContain('<scheduled_behaviour>');
  expect(claude).toContain('<examples>');

  const caps = page.locator('.instruct-caps-badge');
  await expect(caps).toBeVisible();
  await expect(caps).toHaveAttribute('href', '/blog/m365-agent-builder-explained/#caps');
  await expect(caps).toContainText('CAPS technique');

  await expect(page.locator('#strength-badge')).toContainText(/Strong|Moderate|Weak/);
  await expect(page.locator('#output-chars')).toContainText('characters');

  await expect(page.locator('#tone-custom-field')).toBeHidden();
  await page.click('#tone-custom-toggle');
  await expect(page.locator('#tone-custom-field')).toBeVisible();
  await page.fill('#instruct-tone-custom', 'Crisp, scan-friendly');
  await page.waitForTimeout(500);
  expect(await page.locator('#output-text').inputValue()).toContain('Crisp, scan-friendly');

  await page.click('#section-additional summary');
  await expect(page.locator('.instruct-quickadd-chip')).toHaveCount(4);
  await page.click('.instruct-quickadd-chip[data-scaffold="greeting"]');
  await expect(page.locator('#instruct-additional')).toHaveValue(/Greeting:/i);

  await page.click('#btn-start-over');
  await expect(page.locator('#instruct-purpose')).toHaveValue('');
  await page.click('#btn-try-example');
  await expect(page.locator('#instruct-name')).toHaveValue(/Daily Email Digest/i);

  await expect(page.locator('.instruct-score-ring')).toHaveCount(0);
  await expect(page.locator('#history-drawer')).toHaveCount(0);
  await expect(page.locator('#share-modal')).toHaveCount(0);
  await expect(page.locator('#btn-history')).toHaveCount(0);
  await expect(page.locator('#btn-share')).toHaveCount(0);
  await expect(page.locator('#btn-optimize')).toHaveCount(0);
  await expect(page.locator('#btn-download-all')).toHaveCount(0);
  await expect(page.locator('[data-tab="quiz"]')).toHaveCount(0);

  await page.screenshot({ path: 'tests/screenshots/instruct-builder-v4-final.png', fullPage: true });
});

test('Instruction Builder — all 5 platforms produce non-empty output', async ({ page }) => {
  await page.goto(URL);
  await page.click('.instruct-tab[data-tab="templates"]');
  await page.click('.instruct-tpl-card[data-tpl="it-helpdesk"]');
  await expect(page.locator('#preview-content')).toBeVisible();

  const platforms = ['m365', 'studio', 'chatgpt', 'claude', 'assistants'];
  for (const p of platforms) {
    await selectPlatform(page, p);
    await page.waitForTimeout(400);
    const output = await page.locator('#output-text').inputValue();
    expect(output.length).toBeGreaterThan(300);
    expect(output.toLowerCase()).toContain('it');
  }
});
