#!/usr/bin/env node
'use strict';

/**
 * Regression tests for cert descriptions.
 *
 *   node scripts/lib/cert-description.test.js
 *
 * Exit 0 = pass. Wired into pre-push so the false "free practice exam" claim
 * cannot silently come back. Every case below is a REAL string that was live
 * on aguidetocloud.com, not a synthetic fixture.
 */

const fs = require('fs');
const path = require('path');
const TOML = require('@iarna/toml');
const {
  buildCertDescription,
  claimsFreePracticeExam,
  claimsUnpricedQuantity,
  pickExamCode,
  MAX_DESCRIPTION,
} = require('./cert-description');

let failed = 0;
const ok = (cond, label) => {
  if (!cond) { failed++; console.log(`  FAIL  ${label}`); }
  else console.log(`  pass  ${label}`);
};

console.log('\n1. Detector must FIRE on real false claims (long names included)');
[
  // Short names — caught by the original naive detector too.
  'Free 62-193 study guide and 250-question practice exam. Microsoft Certified Educator — exam objectives.',
  'AB-100: the expert exam. Free 250-question practice exam + complete study guide and exam tips.',
  // Long names — these defeated the original 40-character proximity window.
  'Free Databricks Certified Data Engineer Associate study guide and 250-question practice exam. Exam objectives, domains and weights.',
  'Free Databricks Certified Machine Learning Associate study guide and 250-question practice exam. Exam objectives, domains and weights.',
  'Free MongoDB Associate Database Administrator study guide and 250-question practice exam. MongoDB Associate DBA certification (C100DBA).',
  'Free MongoDB Associate Developer study guide and 250-question practice exam. MongoDB Associate Developer certification (C100DEV).',
  'Free Oracle APEX Cloud Developer Professional study guide and 250-question practice exam. Exam objectives and study resources.',
  'Free SnowPro Core Certification study guide and 250-question practice exam. Exam objectives, domains and weights.',
  'Free Splunk Enterprise Certified Admin study guide and 250-question practice exam. Exam objectives and study resources.',
  'Free Splunk O11y Cloud Certified Metrics User study guide and 250-question practice exam. Exam objectives.',
].forEach((d, i) => ok(claimsFreePracticeExam(d, { pricePractice: 9 }) === true, `false claim #${i + 1} detected`));

console.log('\n2. Detector must STAY SILENT on truthful wording');
[
  'Free AIF-C01 study guide. Try 20 questions free. Full practice exam access: US$9 for 1 year. AWS Certified AI Practitioner.',
  'Free AZ-104 study guide covering Azure architecture, networking, identity, and core services.',
].forEach((d, i) => ok(claimsFreePracticeExam(d, { pricePractice: 9 }) === false, `truthful #${i + 1} not flagged`));

console.log('\n3. A genuinely free bank (price 0) can legitimately say "free"');
ok(claimsFreePracticeExam('Free AZ-900 study guide and full practice exam — no payment needed.', { pricePractice: 0 }) === false,
  'az-900 free wording accepted');
ok(claimsFreePracticeExam('Free AZ-900 study guide and 250-question practice exam.', { pricePractice: 0 }) === false,
  'price 0 exempts any free claim');

console.log('\n4. buildCertDescription uses the canonical exam code, never the slug');
const certs = TOML.parse(fs.readFileSync(path.resolve(__dirname, '../../data/all_certs.toml'), 'utf8')).cert_map;
[['aws-aif-c01', 'AIF-C01'], ['cisco-ccna', 'CCNA'], ['comptia-sy0-701', 'SY0-701']].forEach(([slug, code]) => {
  const d = buildCertDescription(certs[slug], slug.toUpperCase());
  ok(d.includes(`Free ${code} study guide`) && !d.includes(slug.toUpperCase()),
    `${slug} renders as ${code}, not the slug`);
});

console.log('\n5. Every generated description fits the snippet budget and is truthful');
let over = 0, lying = 0;
for (const [slug, c] of Object.entries(certs)) {
  const d = buildCertDescription(c, slug.toUpperCase());
  if (d.length > MAX_DESCRIPTION) over++;
  if (claimsFreePracticeExam(d, { pricePractice: c.price_practice })) lying++;
}
ok(over === 0, `0 of ${Object.keys(certs).length} generated descriptions exceed ${MAX_DESCRIPTION} chars (got ${over})`);
ok(lying === 0, `0 generated descriptions make a false free claim (got ${lying})`);

console.log('\n6. Live content scan — no cert page may advertise a paid bank as free');
const dir = path.resolve(__dirname, '../../content/cert-tracker');
const offenders = [];
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md') && x !== '_index.md')) {
  const m = fs.readFileSync(path.join(dir, f), 'utf8')
    .match(/^description:[ \t]*"((?:[^"\\]|\\.)*)"[ \t]*$/m);
  if (!m) continue;
  const cert = certs[f.replace(/\.md$/, '')];
  if (claimsFreePracticeExam(m[1], { pricePractice: cert && cert.price_practice })) offenders.push(f);
}
ok(offenders.length === 0, `0 cert pages claim a free paid exam (got ${offenders.length}${offenders.length ? ': ' + offenders.slice(0, 6).join(', ') : ''})`);

console.log('\n7. No writer may re-introduce the claim');
const scripts = path.resolve(__dirname, '..');
const rewriter = fs.readFileSync(path.join(scripts, 'rewrite-cert-metas.ps1'), 'utf8');
ok(/REFUSING TO RUN/.test(rewriter) && /IUnderstandThisCanReintroduceFalsePricingClaims/.test(rewriter),
  'rewrite-cert-metas.ps1 still refuses to run unattended');
ok(/\$descVariants \+=/.test(rewriter) && rewriter.indexOf('REFUSING TO RUN') < rewriter.indexOf('$descVariants +='),
  'its refusal guard sits BEFORE the description templates');

const sync = fs.readFileSync(path.join(scripts, 'sync-cert-data.js'), 'utf8');
ok(/require\(['"]\.\/lib\/cert-description['"]\)/.test(sync),
  'sync-cert-data.js imports the shared description library');
ok(!/Free \$\{[^}]*\}-question practice exam|Free \$\{c\.questions\}/.test(sync),
  'sync-cert-data.js has no inline free-practice-exam template');
ok(/Never overwrite existing files/.test(sync),
  'sync-cert-data.js still refuses to overwrite existing pages');

console.log('\n8. Placeholder exam codes must never reach a SERP');
{
  // cert_map carries no `slug` field (0 of 289) and 90 records store the slug
  // upper-cased as `code`. An earlier pass shipped 8 pages reading
  // "Free ORACLE-DB-AZURE-ARCHITECT-PROFESSIONAL study guide", destroying the
  // real code (1Z0-1147) that buyers actually search for.
  const oracle = {
    name: 'Oracle AI Database@Azure Architect Professional',
    code: 'ORACLE-DB-AZURE-ARCHITECT-PROFESSIONAL',
    vendor: 'oracle', price_practice: 9,
  };
  const slug = 'oracle-db-azure-architect-professional';
  const prior = 'Oracle AI Database@Azure Architect Professional (1Z0-1147) study guide and 250-question practice exam.';
  ok(pickExamCode(oracle, slug.toUpperCase(), { slug, existingDescription: prior }) === '1Z0-1147',
    'recovers the real exam code from the pre-existing description');

  const genuine = { name: 'GitHub Foundations', code: 'GH-900', vendor: 'github', price_practice: 9 };
  ok(pickExamCode(genuine, 'GH-900', { slug: 'gh-900', existingDescription: '' }) === 'GH-900',
    'keeps a short genuine code that happens to equal the slug');

  const noCode = {
    name: 'Certified Data Analyst Associate',
    code: 'DATABRICKS-DATA-ANALYST-ASSOCIATE',
    vendor: 'databricks', price_practice: 9,
  };
  const built = buildCertDescription(noCode, 'DATABRICKS-DATA-ANALYST-ASSOCIATE', {
    slug: 'databricks-data-analyst-associate',
    existingDescription: 'Certified Data Analyst Associate study guide and 250-question practice exam.',
  });
  ok(!/DATABRICKS-DATA-ANALYST-ASSOCIATE/.test(built), 'never shouts the slug when no real code exists');
  ok(/Databricks Certified Data Analyst Associate/.test(built), 'prefixes the vendor when the name omits it');

  const longName = {
    name: 'Salesforce Certified Agentforce Field Service and Operations Consultant',
    code: 'SALESFORCE-FIELD-SERVICE-CONSULTANT', vendor: 'salesforce', price_practice: 9,
  };
  const shortened = buildCertDescription(longName, 'SALESFORCE-FIELD-SERVICE-CONSULTANT', {
    slug: 'salesforce-field-service-consultant', existingDescription: 'x 250-question practice exam.',
  });
  ok(shortened.length <= MAX_DESCRIPTION, 'shortens rather than overflow on very long names');
  ok(/US\$9/.test(shortened), 'the price survives shortening — stating it is the whole point');
}

console.log('\n9. Unpriced question-count pitches are also a claim');
{
  ok(claimsUnpricedQuantity('X study guide and 250-question practice exam.', { pricePractice: 9 }),
    'fires on "250-question practice exam" with no price');
  ok(!claimsUnpricedQuantity('Free AIF-C01 study guide. Try 20 questions free. Full practice exam access: US$9 for 1 year.', { pricePractice: 9 }),
    'does not fire on our own priced wording');
  ok(!claimsUnpricedQuantity('Free 250-question practice exam.', { pricePractice: 0 }),
    'does not fire when the exam really is free (az-900)');
}

console.log(failed === 0 ? '\nALL PASS\n' : `\n${failed} FAILURE(S)\n`);
process.exit(failed === 0 ? 0 : 1);
