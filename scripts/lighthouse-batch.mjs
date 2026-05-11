// Lighthouse batch — runs Lighthouse against the 17 representative pages and
// collects category scores (Performance, Accessibility, Best Practices, SEO)
// into a single JSON report. Surfaces only pages with scores <90.
//
// Output: audit-output/lighthouse/<slug>.json + audit-output/lighthouse-summary.json

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(REPO_ROOT, 'audit-output', 'lighthouse');
const SUMMARY = path.join(REPO_ROOT, 'audit-output', 'lighthouse-summary.json');

const PAGES = [
  ['/', 'home'],
  ['/free-tools/', 'tools-hub'],
  ['/blog/', 'blog-index'],
  ['/copilot-matrix/', 'copilot-matrix'],
  ['/roi-calculator/', 'roi-calc'],
  ['/licence-picker/', 'licence-picker'],
  ['/m365-roadmap/', 'roadmap'],
  ['/ai-news/', 'ainews'],
  ['/service-health/', 'service-health'],
  ['/cert-tracker/', 'cert-tracker'],
  ['/cert-tracker/az-900/', 'cert-page-az900'],
  ['/world-clock/', 'world-clock'],
  ['/color-palette/', 'color-palette'],
  ['/site-analytics/', 'site-analytics'],
  ['/copilot-readiness/', 'readiness'],
  ['/blog/how-microsoft-365-copilot-works-layer-by-layer/', 'blog-post'],
  ['/study-guides/', 'sg-index'],
];

const BASE = 'https://www.aguidetocloud.com';
const FORM_FACTOR = process.argv.includes('--desktop') ? 'desktop' : 'mobile';

async function runLighthouse(url, slug) {
  const out = path.join(OUT_DIR, `${slug}.json`);
  return new Promise((resolve) => {
    const args = [
      url,
      '--output=json',
      `--output-path="${out}"`,
      '--only-categories=performance,accessibility,best-practices,seo',
      `--form-factor=${FORM_FACTOR}`,
      '--chrome-flags=--headless=new',
      '--throttling-method=simulate',
      '--quiet',
    ];
    if (FORM_FACTOR === 'desktop') {
      args.push('--screenEmulation.disabled');
    }
    const isWin = process.platform === 'win32';
    const cmd = isWin
      ? 'node_modules\\.bin\\lighthouse.cmd'
      : 'node_modules/.bin/lighthouse';
    const proc = spawn(cmd, args, {
      shell: true,
      env: { ...process.env, CHROME_PATH: process.env.CHROME_PATH || (isWin ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' : '') },
    });
    let stderr = '';
    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.on('close', async (code) => {
      // EPERM on Windows temp cleanup is harmless if the report was written.
      try {
        const j = JSON.parse(await fs.readFile(out, 'utf8'));
        resolve({
          slug, url,
          scores: {
            performance: Math.round((j.categories.performance?.score ?? 0) * 100),
            accessibility: Math.round((j.categories.accessibility?.score ?? 0) * 100),
            bestPractices: Math.round((j.categories['best-practices']?.score ?? 0) * 100),
            seo: Math.round((j.categories.seo?.score ?? 0) * 100),
          },
          audits: {
            failingA11y: Object.entries(j.audits || {})
              .filter(([id, a]) => a.score !== null && a.score < 1 && j.categories.accessibility?.auditRefs?.some(r => r.id === id))
              .map(([id, a]) => ({ id, score: a.score, title: a.title }))
              .slice(0, 10),
            failingSeo: Object.entries(j.audits || {})
              .filter(([id, a]) => a.score !== null && a.score < 1 && j.categories.seo?.auditRefs?.some(r => r.id === id))
              .map(([id, a]) => ({ id, score: a.score, title: a.title })),
            failingBestPractices: Object.entries(j.audits || {})
              .filter(([id, a]) => a.score !== null && a.score < 1 && j.categories['best-practices']?.auditRefs?.some(r => r.id === id))
              .map(([id, a]) => ({ id, score: a.score, title: a.title })),
          },
        });
      } catch (e) {
        resolve({ slug, error: `exit ${code}: ${stderr.slice(-200)}` });
      }
    });
  });
}

(async () => {
  await fs.mkdir(OUT_DIR, { recursive: true });
  console.log(`Running Lighthouse (${FORM_FACTOR}) against ${PAGES.length} pages...`);
  console.log('slug              perf  a11y  bp    seo   audits<100');
  console.log('-'.repeat(70));
  const results = [];
  for (const [route, slug] of PAGES) {
    const r = await runLighthouse(BASE + route, slug);
    if (r.error) {
      console.log(`${slug.padEnd(16)} ERROR: ${r.error.slice(0, 80)}`);
    } else {
      const s = r.scores;
      const flags = [];
      if (r.audits.failingA11y.length) flags.push(`a11y:${r.audits.failingA11y.length}`);
      if (r.audits.failingSeo.length) flags.push(`seo:${r.audits.failingSeo.length}`);
      if (r.audits.failingBestPractices.length) flags.push(`bp:${r.audits.failingBestPractices.length}`);
      console.log(`${slug.padEnd(16)}  ${String(s.performance).padStart(3)}   ${String(s.accessibility).padStart(3)}   ${String(s.bestPractices).padStart(3)}   ${String(s.seo).padStart(3)}   ${flags.join(' ')}`);
    }
    results.push(r);
  }

  await fs.writeFile(SUMMARY, JSON.stringify({
    generated: new Date().toISOString(),
    formFactor: FORM_FACTOR,
    results,
  }, null, 2));

  // ── Summary ──
  console.log('\n=== AVERAGE SCORES ===');
  const okResults = results.filter(r => !r.error);
  const avg = key => Math.round(okResults.reduce((s, r) => s + r.scores[key], 0) / okResults.length);
  console.log(`  Performance:     ${avg('performance')}`);
  console.log(`  Accessibility:   ${avg('accessibility')}`);
  console.log(`  Best Practices:  ${avg('bestPractices')}`);
  console.log(`  SEO:             ${avg('seo')}`);

  console.log('\n=== PAGES WITH ANY CATEGORY <90 ===');
  for (const r of okResults) {
    const low = Object.entries(r.scores).filter(([k, v]) => v < 90).map(([k, v]) => `${k}=${v}`).join(' · ');
    if (low) console.log(`  ${r.slug.padEnd(20)} ${low}`);
  }

  // Aggregated a11y/seo/bp issues
  console.log('\n=== TOP FAILING AUDITS ACROSS ALL PAGES ===');
  const audits = {};
  for (const r of okResults) {
    for (const [k, arr] of Object.entries(r.audits)) {
      for (const a of arr) {
        const key = `${k}:${a.id}`;
        if (!audits[key]) audits[key] = { id: a.id, title: a.title, cat: k.replace('failing', ''), count: 0 };
        audits[key].count++;
      }
    }
  }
  const sorted = Object.values(audits).sort((a, b) => b.count - a.count);
  for (const a of sorted.slice(0, 15)) {
    console.log(`  [${a.cat.padEnd(13)}] ${a.id.padEnd(35)} fails on ${a.count} page(s) — ${a.title.slice(0, 60)}`);
  }

  console.log(`\nWrote ${SUMMARY}`);
})();
