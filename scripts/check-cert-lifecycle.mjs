#!/usr/bin/env node
// Cert lifecycle guardrail.
// Fails when a cert page claims to be active while still carrying present-tense
// beta or beta-discount language, or when a page's status disagrees with latest.json.
// Historical phrasing ("went into beta", "after the beta") is deliberately allowed.
//
// KNOWN LIMITS — stated so nobody mistakes a pass for full coverage:
//  1. Check 3 only requires NON-active pages to exist in latest.json. A page marked
//     `active` that is missing from latest.json is invisible here, which is exactly
//     how AB-650 shipped mislabelled. ~13 active pages are currently in that blind
//     spot (AB-100/250/410/730/731/900, GH-*). Detecting those needs the upstream
//     truth, not local data, so it belongs in cert-lifecycle-probe.mjs, not here.
//  2. This file checks INTERNAL CONSISTENCY only — page copy vs latest.json. It can
//     never tell you the status is *correct*, only that our two stores agree.
//  3. claimIsAboutOtherExam resolves attribution by nearest preceding exam code plus
//     an explicit self-reference test. Pronoun self-reference still escapes:
//     "Unlike AI-102, it is currently in beta" reads as a claim about AI-102.
//     Deliberately biased toward false negatives — a noisy gate teaches --no-verify.
//  4. Check 4 reads data/all_certs.toml, but only claims that name an exam code
//     outright ("Microsoft's beta cert AB-250") or a beta-priced exam_cost. A
//     tagline that implies beta without naming a code is not detected.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import TOML from '@iarna/toml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES_DIR = join(ROOT, 'content', 'cert-tracker');
const DATA_FILE = join(ROOT, 'static', 'data', 'cert-tracker', 'latest.json');
const REGISTRY_FILE = join(ROOT, 'data', 'all_certs.toml');
const COMPASS_FILE = join(ROOT, 'data', 'cert_compass', 'certifications.toml');
const COMPASS_INDEX = join(ROOT, 'public', 'cert-compass', 'index.html');
const TRACKER_TEMPLATE = join(ROOT, 'layouts', 'cert-tracker', 'single.html');
const SITEMAP_FILE = join(ROOT, 'public', 'sitemap.xml');

// Present-tense claims only — these are false once an exam is GA.
const STALE_CLAIMS = [
  { re: /\bis (?:currently )?(?:in|a) beta\b/i, msg: 'says the exam is in beta' },
  { re: /\bstill in beta\b/i, msg: 'says the exam is still in beta' },
  { re: /\bthis beta exam\b/i, msg: 'calls it "this beta exam"' },
  { re: /\bbeta exam\b(?!\s*(?:was|had))/i, msg: 'calls it a beta exam' },
  { re: /\bbeta cert(?:ification)?\b(?!\s*(?:was|had))/i, msg: 'calls it a beta cert' },
  { re: /\bbeta sittings are\b/i, msg: 'describes current beta sittings' },
  { re: /\bbeta seats are\b/i, msg: 'describes current beta seats' },
  { re: /\bcert-status-beta\b/, msg: 'has a hand-written beta status banner' },
];

// False on EVERY page regardless of status. Microsoft publishes no standing
// beta-discount percentage, so a specific figure is an invented claim.
const ALWAYS_FALSE_CLAIMS = [
  { re: /\b\d{1,2}\s*%\s*(?:off|discount)/i, msg: 'quotes a specific beta discount percentage' },
  { re: /beta exams are typically offered at/i, msg: 'claims a standing beta discount' },
];

function frontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : '';
}
function field(fm, name) {
  const m = fm.match(new RegExp(`^${name}:\\s*"?([^"\\n]*)"?\\s*$`, 'm'));
  return m ? m[1].trim() : null;
}

function compassData(html) {
  const sandbox = Object.create(null);
  sandbox.window = sandbox;
  for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)) {
    if (!/^\s*window\.__compass\w+\s*=/.test(match[1])) continue;
    // Hugo minification turns JSON into JavaScript literals and chains assignments.
    runInNewContext(match[1], sandbox, {
      timeout: 1000,
      contextCodeGeneration: { strings: false, wasm: false },
      microtaskMode: 'afterEvaluate',
    });
  }
  return sandbox;
}

function hasNoindex(html) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)].some(([tag]) => {
    const attributes = new Map([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)]
      .map(([, name, double, single, bare]) => [name.toLowerCase(), (double ?? single ?? bare).toLowerCase()]));
    const directives = (attributes.get('content') || '').split(/[,\s]+/);
    return attributes.get('name') === 'robots' && directives.includes('noindex') && directives.includes('nofollow');
  });
}

// A line is exempt when it is an FAQ question (reader phrasing, not a site claim)
// or when the beta mention is explicitly negated or set in the past.
const EXEMPT = [
  /^\s*-\s*question:/i,
  /\(it isn'?t\)|\bit isn'?t\b|\bis not (?:in|a) beta\b|\bno longer in beta\b/i,
  /\bhas since gone\b|\bnow generally available\b|\bwent into beta\b|\bentered beta\b|\bduring the beta\b|\bafter (?:the|its) beta\b|\bwas cancelled\b/i,
];
const isExempt = line => EXEMPT.some(re => re.test(line));

// A beta claim that is clearly about a *different* exam is not this page's problem.
// Attribute each claim to the nearest exam code appearing before it on the line, so
// "AB-410 is GA, but its sibling AB-620 is still in beta" is correctly exempt.
// The exception is an explicit self-reference between that code and the claim
// ("Migrating from AI-102? This exam is currently in beta") — there the subject has
// switched back to this page's own exam, so the claim does count against us.
const CODE_SRC = '\\b(?:AZ|AI|DP|SC|MS|MB|PL|AB|GH|MD|MO)-\\d{3}\\b';
const SELF_REF = /\bthis (?:exam|cert|certification|one)\b/i;
function claimIsAboutOtherExam(line, ownCode, re) {
  const hit = line.match(re);
  if (!hit || hit.index === undefined) return false;
  let nearest = null;
  for (const m of line.matchAll(new RegExp(CODE_SRC, 'gi'))) {
    if (m.index < hit.index) nearest = m;
  }
  if (!nearest || nearest[0].toUpperCase() === ownCode) return false;
  if (SELF_REF.test(line.slice(nearest.index + nearest[0].length, hit.index))) return false;
  return true;
}

const failures = [];
let latestData = null;

// --- Check 1: active pages must not carry present-tense beta/discount claims ---
const files = readdirSync(PAGES_DIR).filter(f => f.endsWith('.md') && f !== '_index.md');
const pageStatus = new Map();

for (const file of files) {
  const raw = readFileSync(join(PAGES_DIR, file), 'utf8');
  const fm = frontmatter(raw);
  const status = field(fm, 'exam_status') || 'active';
  const code = (field(fm, 'exam_code') || basename(file, '.md')).toUpperCase();
  pageStatus.set(code, status);

  const lines = raw.split(/\r?\n/);
  const duplicateHeading = lines.findIndex(line => /^## What to Study Next\s*$/.test(line));
  if (duplicateHeading !== -1) {
    failures.push(`${file}:${duplicateHeading + 1}  static "What to Study Next" section duplicates the template-rendered section`);
  }

  // Price-figure claims are false on every page, beta or not.
  for (const { re, msg } of ALWAYS_FALSE_CLAIMS) {
    const idx = lines.findIndex(l => re.test(l) && !isExempt(l) && !claimIsAboutOtherExam(l, code, re));
    if (idx !== -1) {
      failures.push(`${file}:${idx + 1}  ${msg}\n      → ${lines[idx].trim().slice(0, 150)}`);
    }
  }

  if (status !== 'active') continue;

  for (const { re, msg } of STALE_CLAIMS) {
    const idx = lines.findIndex(l => re.test(l) && !isExempt(l) && !claimIsAboutOtherExam(l, code, re));
    if (idx !== -1) {
      failures.push(`${file}:${idx + 1}  status=active but ${msg}\n      → ${lines[idx].trim().slice(0, 150)}`);
    }
  }
}

// --- Check 2: page status must agree with the data the index renders from ---
const MS_CODE = /^(?:AZ|AI|DP|SC|MS|MB|PL|AB|GH|MD|MO)-\d{3}$/;
if (existsSync(DATA_FILE)) {
  const data = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
  latestData = data;
  const inData = new Set();
  for (const exam of data.exams || []) {
    const code = String(exam.code).toUpperCase();
    inData.add(code);
    const ps = pageStatus.get(code);
    if (!ps) continue;
    if (ps !== exam.status) {
      failures.push(`${code}  status mismatch: page says "${ps}" but latest.json says "${exam.status}"`);
    }
  }

  // --- Check 3: the reverse direction, which is how the original bug shipped ---
  // The index merges latest.json over all_certs.toml, and all_certs cannot express
  // "beta" (its schema allows live|coming-soon|planned|retired). So a page with a
  // non-active status that is MISSING from latest.json silently renders as active
  // on the index while the detail page shows a beta/retired banner.
  for (const [code, status] of pageStatus) {
    if (status === 'active' || !MS_CODE.test(code)) continue;
    if (!inData.has(code)) {
      failures.push(`${code}  page says "${status}" but the exam is missing from latest.json — the index will render it as active`);
    }
  }
} else {
  failures.push(`missing data file: ${DATA_FILE}`);
}

// --- Check 4: the registry the index renders from must not describe a non-beta
// exam as beta. Pages and latest.json were both corrected for AB-250 while
// data/all_certs.toml still called it "Microsoft's beta cert AB-250" and priced
// it at the beta rate, so the index kept publishing the stale claim. Only claims
// that name a code outright are checked, which makes attribution unambiguous.
if (existsSync(REGISTRY_FILE)) {
  const betaCodes = new Set();
  for (const [code, status] of pageStatus) if (status === 'beta') betaCodes.add(code);
  if (existsSync(DATA_FILE)) {
    for (const exam of JSON.parse(readFileSync(DATA_FILE, 'utf8')).exams || []) {
      if (exam.status === 'beta') betaCodes.add(String(exam.code).toUpperCase());
    }
  }

  const NAMED_BETA = /\bbeta (?:cert(?:ification)?|exam) ((?:AZ|AI|DP|SC|MS|MB|PL|AB|GH|MD|MO)-\d{3})\b/gi;
  const lines = readFileSync(REGISTRY_FILE, 'utf8').split(/\r?\n/);
  const seen = new Set();
  let blockCode = null;

  lines.forEach((line, i) => {
    const codeDecl = line.match(/^\s*code\s*=\s*"([^"]+)"/);
    if (codeDecl) blockCode = codeDecl[1].toUpperCase();

    for (const m of line.matchAll(NAMED_BETA)) {
      const code = m[1].toUpperCase();
      if (betaCodes.has(code)) continue;
      const key = `named:${code}`;
      if (seen.has(key)) continue;
      seen.add(key);
      failures.push(`${code}  data/all_certs.toml:${i + 1} calls it a beta exam, but it is not beta`);
    }

    if (/^\s*exam_cost\s*=\s*"\s*Beta\b/i.test(line) && blockCode && !betaCodes.has(blockCode)) {
      const key = `cost:${blockCode}`;
      if (seen.has(key)) return;
      seen.add(key);
      failures.push(`${blockCode}  data/all_certs.toml:${i + 1} still quotes beta pricing, but it is not beta`);
    }
  });
} else {
  failures.push(`missing registry file: ${REGISTRY_FILE}`);
}

// --- Check 5: tracker recommendations have one renderer, and Cert Compass hides
// every retired Microsoft cert in both its catalog and direct-detail routes.
if (existsSync(TRACKER_TEMPLATE)) {
  const template = readFileSync(TRACKER_TEMPLATE, 'utf8');
  const headings = template.match(/<h2>What to Study Next<\/h2>/g) || [];
  if (headings.length !== 1) {
    failures.push(`layouts/cert-tracker/single.html must render exactly one "What to Study Next" heading (found ${headings.length})`);
  }
} else {
  failures.push(`missing tracker template: ${TRACKER_TEMPLATE}`);
}

if (existsSync(COMPASS_FILE) && latestData) {
  const compassDir = dirname(COMPASS_FILE);
  const compassCerts = TOML.parse(readFileSync(COMPASS_FILE, 'utf8')).certs;
  const groups = TOML.parse(readFileSync(join(compassDir, 'equivalents.toml'), 'utf8')).groups;
  const paths = TOML.parse(readFileSync(join(compassDir, 'career_paths.toml'), 'utf8')).paths;
  const topics = TOML.parse(readFileSync(join(compassDir, 'topics.toml'), 'utf8'));
  const certIDs = new Set(compassCerts.map(cert => cert.id));
  const groupMap = new Map(groups.map(group => [group.id, group]));
  if (certIDs.size !== compassCerts.length) failures.push('duplicate Compass certification IDs');
  const requireCert = (id, context) => {
    if (!certIDs.has(id)) failures.push(`${context}: unknown certification ${id}`);
  };
  for (const group of groups) {
    for (const id of group.cert_ids) requireCert(id, `group ${group.id}`);
  }
  for (const path of paths) {
    for (const order of path.recommended_order) {
      for (const id of order.certs) requireCert(id, `path ${path.id}`);
    }
    if (path.if_only_one) requireCert(path.if_only_one, `path ${path.id} single recommendation`);
    for (const id of path.related_groups) {
      if (!groupMap.has(id)) failures.push(`path ${path.id}: unknown group ${id}`);
    }
  }
  const topicIDs = new Set(topics.topics.map(topic => topic.id));
  for (const mapping of topics.cert_topics) {
    requireCert(mapping.cert_id, 'topic mapping');
    for (const id of mapping.topics) {
      if (!topicIDs.has(id)) failures.push(`${mapping.cert_id}: unknown topic ${id}`);
    }
  }
  const signals = TOML.parse(readFileSync(join(compassDir, 'market_signals.toml'), 'utf8')).signals;
  for (const signal of signals) requireCert(signal.cert_id, 'market signal');
  const today = new Date().toISOString().slice(0, 10);
  const lifecycle = new Map((latestData.exams || []).map(exam => {
    const expired = exam.status === 'retiring' && exam.retirement_date && exam.retirement_date < today;
    return [String(exam.code).toUpperCase(), expired ? 'retired' : exam.status];
  }));
  const retired = compassCerts.filter(cert => {
    const status = cert.provider === 'microsoft'
      ? (lifecycle.get(cert.exam_code.toUpperCase()) || cert.status)
      : cert.retirement_date && cert.retirement_date < today ? 'retired' : cert.status;
    return status === 'retired';
  });
  const retiredIDs = new Set(retired.map(cert => cert.id));
  const currentIDs = ids => ids.filter(id => !retiredIDs.has(id));
  const expectedPayloads = {
    Providers: TOML.parse(readFileSync(join(compassDir, 'providers.toml'), 'utf8')).providers,
    Certs: compassCerts.filter(cert => !retiredIDs.has(cert.id)),
    Groups: groups.map(group => ({ ...group, cert_ids: currentIDs(group.cert_ids) })),
    Paths: paths.map(path => ({
      ...path,
      recommended_order: path.recommended_order
        .map(order => ({ ...order, certs: currentIDs(order.certs) }))
        .filter(order => order.certs.length),
      if_only_one: retiredIDs.has(path.if_only_one) ? '' : path.if_only_one,
      if_only_one_reason: retiredIDs.has(path.if_only_one) ? '' : path.if_only_one_reason,
    })),
    Signals: signals.filter(signal => !retiredIDs.has(signal.cert_id)),
    Quiz: TOML.parse(readFileSync(join(compassDir, 'quiz.toml'), 'utf8')).questions,
    TopicDefs: topics.topics,
    CertTopics: topics.cert_topics.filter(mapping => !retiredIDs.has(mapping.cert_id)),
  };
  const canonical = value => {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
    }
    return value;
  };
  for (const cert of compassCerts.filter(cert => !retiredIDs.has(cert.id))) {
    if (cert.match_group && !groupMap.get(cert.match_group)?.cert_ids.includes(cert.id)) {
      failures.push(`${cert.id}: declared match group does not include this current certification`);
    }
    if (!topics.cert_topics.some(mapping => mapping.cert_id === cert.id)) {
      failures.push(`${cert.id}: missing topic mapping`);
    }
    const detail = join(ROOT, 'content', 'cert-compass', cert.id, 'index.md');
    if (!existsSync(detail)) failures.push(`${cert.id}: missing Compass detail route`);
  }

  if (!existsSync(COMPASS_INDEX)) {
    failures.push(`missing built Cert Compass index: ${COMPASS_INDEX}`);
  } else {
    const html = readFileSync(COMPASS_INDEX, 'utf8');
    const payloads = new Map();
    let data;
    try {
      data = compassData(html);
    } catch (error) {
      failures.push(`could not read built Cert Compass data script: ${error.message}`);
      data = Object.create(null);
    }
    for (const name of Object.keys(expectedPayloads)) {
      const payload = data[`__compass${name}`];
      if (!payload || typeof payload !== 'object') {
        failures.push(`built Cert Compass page is missing its ${name} data payload`);
        continue;
      }
      try {
        payloads.set(name, payload);
        if (JSON.stringify(canonical(payload)) !== JSON.stringify(canonical(expectedPayloads[name]))) {
          failures.push(`built Cert Compass ${name} differs from its lifecycle-filtered source; rebuild before pushing`);
        }
        const references = new Set();
        const collect = value => {
          if (typeof value === 'string') references.add(value);
          else if (value && typeof value === 'object') {
            for (const [key, child] of Object.entries(value)) {
              references.add(key);
              collect(child);
            }
          }
        };
        collect(payload);
        for (const cert of retired) {
          if (references.has(cert.id) || references.has(cert.exam_code)) {
            failures.push(`${cert.exam_code} (${cert.id}) remains in the built Cert Compass ${name} data`);
          }
        }
      } catch (error) {
        failures.push(`could not parse built Cert Compass ${name} data: ${error.message}`);
      }
    }
    const certPayload = payloads.get('Certs');
    if (certPayload && (!Array.isArray(certPayload) || !certPayload.some(cert => cert.id === 'ms-az-900'))) {
      failures.push('active AZ-900 is missing from the built Cert Compass catalog');
    }
    if (Array.isArray(certPayload)) {
      const builtIDs = new Set(certPayload.map(cert => cert.id));
      // Curated role coverage, not an automatic successor/equivalence rule.
      const coverage = {
        'ai-fundamentals': ['ms-ai-901'],
        'ai-engineering': ['ms-ai-103', 'ms-ai-300'],
        'cloud-security': ['ms-sc-500'],
        developer: ['ms-ai-200'],
        'data-engineering': ['ms-dp-700'],
        'cloud-admin': ['aws-cloudops-assoc'],
      };
      const builtGroups = payloads.get('Groups') || [];
      for (const [groupID, ids] of Object.entries(coverage)) {
        const group = builtGroups.find(group => group.id === groupID);
        for (const id of ids) {
          if (!builtIDs.has(id) || !group?.cert_ids.includes(id)) {
            failures.push(`${groupID}: missing current curated choice ${id} from catalog or matches`);
          }
        }
      }
      const builtPaths = payloads.get('Paths') || [];
      for (const [pathID, ids] of Object.entries({
        'ai-ml-engineer': ['ms-ai-901', 'ms-ai-103', 'ms-ai-300'],
        'security-engineer': ['ms-sc-500'],
        developer: ['ms-ai-200'],
        'data-engineer': ['ms-dp-700'],
        'cloud-admin': ['aws-cloudops-assoc'],
      })) {
        const path = builtPaths.find(path => path.id === pathID);
        const pathIDs = new Set((path?.recommended_order || []).flatMap(order => order.certs));
        for (const id of ids) {
          if (!pathIDs.has(id)) failures.push(`${pathID}: missing current curated career choice ${id}`);
        }
      }
      for (const cert of certPayload) {
        const page = join(ROOT, 'public', 'cert-compass', cert.id, 'index.html');
        if (!existsSync(page)) {
          failures.push(`${cert.id}: current detail route was not built`);
        }
      }
    }
  }

  const studyModules = TOML.parse(readFileSync(join(ROOT, 'data', 'study_modules.toml'), 'utf8'));
  for (const [slug, modules] of Object.entries(studyModules)) {
    if (!Array.isArray(modules) || !modules.length) continue;
    const page = join(ROOT, 'public', 'cert-tracker', slug, 'index.html');
    if (!existsSync(page)) continue;
    const html = readFileSync(page, 'utf8');
    if (!html.includes('estimated lesson reading') || /<\/span>\s*study time/.test(html)) {
      failures.push(`${slug}: lesson-reading duration is missing or mislabelled as total study time`);
    }
  }

  const sitemap = existsSync(SITEMAP_FILE) ? readFileSync(SITEMAP_FILE, 'utf8') : '';
  if (!sitemap) failures.push(`missing built sitemap: ${SITEMAP_FILE}`);
  for (const cert of retired) {
    const page = join(ROOT, 'public', 'cert-compass', cert.id, 'index.html');
    if (!existsSync(page)) {
      failures.push(`${cert.exam_code} (${cert.id}) retired detail route is missing its non-indexable fallback`);
      continue;
    }
    const html = readFileSync(page, 'utf8');
    if (!hasNoindex(html)) {
      failures.push(`${cert.exam_code} (${cert.id}) retired detail route is missing noindex`);
    }
    if (!html.includes('This certification has been retired and is no longer listed in Cert Compass.')) {
      failures.push(`${cert.exam_code} (${cert.id}) retired detail route still exposes certification details`);
    }
    if (/"@type"\s*:\s*"Course"/.test(html)) {
      failures.push(`${cert.exam_code} (${cert.id}) retired detail route still emits Course structured data`);
    }
    if (sitemap.includes(`/cert-compass/${cert.id}/`)) {
      failures.push(`${cert.exam_code} (${cert.id}) retired detail route is still in the sitemap`);
    }
  }
} else {
  failures.push(`missing Compass certification data or cert-tracker lifecycle data`);
}

if (failures.length) {
  console.error(`\n[cert-lifecycle] ${failures.length} problem(s) found:\n`);
  for (const f of failures) console.error('  ✗ ' + f);
  console.error('\nFix the page copy or the status data before pushing.\n');
  process.exit(1);
}
console.log(`[cert-lifecycle] OK — ${files.length} cert pages consistent with latest.json and all_certs.toml`);
