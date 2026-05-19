import { test, expect } from '@playwright/test';

const URL = 'http://localhost:1314/instruct-builder/';

async function selectPlatform(page, platformId) {
  await page.locator(`label.instruct-platform-pill:has(input[value="${platformId}"])`).click();
}

test('Instruction Builder v5 — full user flow', async ({ page }) => {
  await page.goto(URL);
  await expect(page).toHaveTitle(/Agent Instruction Builder/i);

  // Fix #3 verify: H1 exists and contains the tool name
  await expect(page.locator('h1.zt-title')).toBeVisible();
  await expect(page.locator('h1.zt-title')).toContainText(/Agent Instruction Builder/i);

  const tabs = page.locator('.instruct-tab');
  await expect(tabs).toHaveCount(3);
  await expect(tabs.nth(0)).toHaveText('Build');
  await expect(tabs.nth(1)).toHaveText('Templates');
  await expect(tabs.nth(2)).toHaveText('FAQ');

  await expect(page.locator('.instruct-platform-pill')).toHaveCount(5);
  await expect(page.locator('input[name="instruct-platform"][value="m365"]')).toBeChecked();
  // Fix #1: short labels are visible (e.g., "M365" not full "M365 Agent Builder")
  await expect(page.locator('.instruct-platform-pill').first()).toContainText('M365');

  // Fix #2: ghost preview banner is visible BEFORE typing
  await expect(page.locator('.instruct-preview-empty-banner')).toBeVisible();
  await expect(page.locator('.instruct-preview-empty-banner')).toContainText(/finished agent looks like/i);

  // Fix #5: collapsible sections have subtitles in summary text
  await expect(page.locator('#section-output-format summary')).toContainText(/digests, reports, structured outputs/i);
  await expect(page.locator('#section-examples summary')).toContainText(/happy path \+ refusal pair/i);

  await page.click('.instruct-tab[data-tab="templates"]');
  await expect(page.locator('#panel-templates')).toHaveClass(/active/);
  await expect(page.locator('.instruct-tpl-card')).toHaveCount(13);

  // Fix #7 + #14: category filters present
  await expect(page.locator('.instruct-tpl-filter')).toHaveCount(4);
  await expect(page.locator('.instruct-tpl-filter[data-cat="Daily Routine"]')).toBeVisible();

  // Fix #8: NEW badge on the 3 new templates
  await expect(page.locator('.instruct-tpl-card[data-tpl="daily-email-digest"] .instruct-tpl-new')).toBeVisible();
  await expect(page.locator('.instruct-tpl-card[data-tpl="scheduled-briefing"] .instruct-tpl-new')).toBeVisible();
  await expect(page.locator('.instruct-tpl-card[data-tpl="daily-standup"] .instruct-tpl-new')).toBeVisible();

  // Filter: clicking "Daily Routine" should hide non-matching cards
  await page.click('.instruct-tpl-filter[data-cat="Daily Routine"]');
  await expect(page.locator('.instruct-tpl-card[data-tpl="it-helpdesk"]')).toBeHidden();
  await expect(page.locator('.instruct-tpl-card[data-tpl="daily-email-digest"]')).toBeVisible();
  await page.click('.instruct-tpl-filter[data-cat="all"]');

  await page.click('.instruct-tpl-card[data-tpl="daily-email-digest"]');
  await expect(page.locator('#panel-build')).toHaveClass(/active/);
  // Fix #11: agent-name is BLANK after template load (was pre-filled before v5)
  await expect(page.locator('#instruct-name')).toHaveValue('');
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

  // Fix #9: CAPS badge renders BEFORE the textarea
  const capsIdx = (await page.locator('#preview-content').innerHTML()).indexOf('instruct-caps-badge');
  const textareaIdx = (await page.locator('#preview-content').innerHTML()).indexOf('instruct-output-text');
  expect(capsIdx).toBeGreaterThan(0);
  expect(capsIdx).toBeLessThan(textareaIdx);

  // Fix #10: next-step CTA renders with correct platform paste-URL
  const cta = page.locator('#next-step-cta');
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute('href', 'https://microsoft365.com/chat');
  await expect(cta).toHaveAttribute('target', '_blank');
  await expect(cta).toContainText(/Paste into M365|M365 Agent Builder/i);

  // Fix #12: download .md button exists
  await expect(page.locator('#btn-download-md')).toBeVisible();

  await selectPlatform(page, 'claude');
  await page.waitForTimeout(500);
  const claude = await page.locator('#output-text').inputValue();
  expect(claude).toContain('<role>');
  expect(claude).toContain('<output_format>');
  expect(claude).toContain('<scheduled_behaviour>');
  expect(claude).toContain('<examples>');
  // Fix #10: CTA updates with platform switch
  await expect(cta).toHaveAttribute('href', 'https://claude.ai/projects');

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
  // Fix #11 (also covers try-example): agent-name remains blank
  await expect(page.locator('#instruct-name')).toHaveValue('');
  // Purpose IS filled
  await expect(page.locator('#instruct-purpose')).not.toHaveValue('');

  await expect(page.locator('.instruct-score-ring')).toHaveCount(0);
  await expect(page.locator('#history-drawer')).toHaveCount(0);
  await expect(page.locator('#share-modal')).toHaveCount(0);

  await page.screenshot({ path: 'tests/screenshots/instruct-builder-v5-final.png', fullPage: true });
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
    // Fix #10: each platform's CTA has a valid paste_url
    const href = await page.locator('#next-step-cta').getAttribute('href');
    expect(href).toMatch(/^https?:\/\//);
  }
});

test('Fix #4: strength hint is clickable and scrolls/pulses target', async ({ page }) => {
  await page.goto(URL);
  // Minimal weak input — no boundaries, no examples, no knowledge
  await page.fill('#instruct-purpose', 'help with stuff');
  await page.waitForTimeout(500);
  const badge = page.locator('#strength-badge');
  await expect(badge).toContainText(/Weak|Moderate/);
  // There should be at least one clickable hint
  const hints = page.locator('.instruct-strength-hint');
  await expect(hints.first()).toBeVisible();
  // Hint links should be anchors (no href #)
  const firstTarget = await hints.first().getAttribute('data-target');
  expect(firstTarget).toMatch(/instruct-boundaries|ex-user-2|instruct-knowledge|instruct-name/);
});

test('Fix #12: download .md button creates a download', async ({ page }) => {
  await page.goto(URL);
  await page.click('.instruct-tab[data-tab="templates"]');
  await page.click('.instruct-tpl-card[data-tpl="it-helpdesk"]');
  await expect(page.locator('#preview-content')).toBeVisible();
  // Give an agent name so the filename uses it
  await page.fill('#instruct-name', 'TechBot');
  await page.waitForTimeout(400);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('#btn-download-md'),
  ]);
  expect(download.suggestedFilename()).toMatch(/techbot-instructions\.md$/i);
});

test('Fix #18: smart suggestion shows when purpose mentions email', async ({ page }) => {
  await page.goto(URL);
  await page.fill('#instruct-purpose', 'Help me triage my inbox every morning');
  await page.waitForTimeout(500);
  const sug = page.locator('#smart-suggestion');
  await expect(sug).toBeVisible();
  await expect(sug).toContainText(/My emails/i);
  await page.click('.instruct-smart-add');
  await expect(page.locator('#instruct-knowledge')).toHaveValue(/My emails/i);
  await expect(sug).toBeHidden();
});

