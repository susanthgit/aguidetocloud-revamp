#!/usr/bin/env node
/**
 * sync-cert-data.js — Data unification sync script
 *
 * Reads cert metadata from Guided platform TOML files and generates
 * Hugo data files for the shared data layer.
 *
 * Usage:
 *   node scripts/sync-cert-data.js --data     # Regenerate data/all_certs.toml
 *   node scripts/sync-cert-data.js --pages    # Generate missing cert-tracker .md files
 *   node scripts/sync-cert-data.js --all      # Both
 *
 * Source of truth: C:\ssClawy\guided\src\content\certs\*.toml
 * Output: data/all_certs.toml, content/cert-tracker/*.md (non-manual only)
 */

const fs = require('fs');
const path = require('path');
const TOML = require('@iarna/toml');

// ── Paths ──
const GUIDED_CERTS_DIR = path.resolve(__dirname, '../../guided/src/content/certs');
const GUIDED_QUESTIONS_DIR = path.resolve(__dirname, '../../guided/src/data/questions');
const HUGO_DATA_DIR = path.resolve(__dirname, '../data');
const HUGO_CERT_CONTENT_DIR = path.resolve(__dirname, '../content/cert-tracker');

// ── Level normalization: Guided → Hugo ──
const LEVEL_MAP = {
  'fundamentals': 'beginner',
  'foundational': 'beginner',
  'entry': 'beginner',
  'associate': 'intermediate',
  'core': 'intermediate',
  'specialist': 'intermediate',
  'professional': 'advanced',
  'expert': 'advanced',
  'specialty': 'advanced',
};

// ── Status normalization: Guided → Hugo ──
const STATUS_MAP = {
  'live': 'active',
  'coming-soon': 'upcoming',
  'coming_soon': 'upcoming',
  'deprecated': 'retired',
};

// ── Microsoft sub-category mapping from Guided's category field ──
const MS_GUIDED_CATEGORY_MAP = {
  'cloud': 'Azure',
  'security': 'Security',
  'ai': 'AI',
  'data': 'Data',
  'admin': 'Microsoft 365',
  'business': 'Power Platform',   // PL-* and some MB-*
  'devops': 'Azure',              // AZ-400
};

// Fallback: map from exam code prefix when Guided category missing
const MS_CODE_PREFIX_MAP = {
  'az': 'Azure',
  'ai': 'AI',
  'dp': 'Data',
  'sc': 'Security',
  'ms': 'Microsoft 365',
  'md': 'Microsoft 365',
  'pl': 'Power Platform',
  'mb': 'Dynamics 365',
  'ab': 'AI',
};

function normLevel(level) {
  if (!level) return 'intermediate';
  return LEVEL_MAP[level.toLowerCase()] || level.toLowerCase();
}

function normStatus(status) {
  if (!status) return 'active';
  return STATUS_MAP[status.toLowerCase()] || status.toLowerCase();
}

// Extract clean display code from slug-style code
// "cisco-ccna" → "CCNA", "comptia-sy0-701" → "SY0-701", "AZ-900" → "AZ-900"
function getDisplayCode(code, vendor) {
  if (!code) return '';
  // Microsoft certs already use real exam codes (AZ-900, SC-200)
  if (vendor === 'microsoft') return code.toUpperCase();
  // Non-Microsoft: strip vendor prefix from the slug
  const vendorPrefixes = [
    'aws-', 'cisco-', 'comptia-', 'gcp-', 'isc2-', 'isaca-',
    'cncf-', 'hashicorp-', 'juniper-', 'paloalto-', 'eccouncil-', 'fortinet-',
  ];
  let clean = code;
  for (const prefix of vendorPrefixes) {
    if (clean.toLowerCase().startsWith(prefix)) {
      clean = clean.substring(prefix.length);
      break;
    }
  }
  return clean.toUpperCase();
}

function getMsCategory(cert) {
  // Prefer the Guided TOML category field (more accurate)
  if (cert.category && MS_GUIDED_CATEGORY_MAP[cert.category]) {
    // Special case: MB-* certs should be Dynamics 365, not Power Platform
    if (cert.code && cert.code.toLowerCase().startsWith('mb')) {
      return 'Dynamics 365';
    }
    return MS_GUIDED_CATEGORY_MAP[cert.category];
  }
  // Fallback: code prefix
  const clean = (cert.code || '').split('-')[0].toLowerCase();
  return MS_CODE_PREFIX_MAP[clean] || 'Azure';
}

function getExamCategory(cert) {
  // Microsoft certs: use sub-category (Azure, Security, etc.)
  if (cert.vendor === 'microsoft') {
    return getMsCategory(cert);
  }
  // Non-Microsoft: use vendor short_name as category
  const vendorCategoryMap = {
    'aws': 'AWS',
    'cisco': 'Cisco',
    'comptia': 'CompTIA',
    'gcp': 'GCP',
    'isc2': 'ISC²',
    'isaca': 'ISACA',
    'cncf': 'CNCF',
    'hashicorp': 'HashiCorp',
    'juniper': 'Juniper',
    'paloalto': 'Palo Alto',
    'eccouncil': 'EC-Council',
    'fortinet': 'Fortinet',
  };
  return vendorCategoryMap[cert.vendor] || cert.vendor;
}

function readAllCerts() {
  const files = fs.readdirSync(GUIDED_CERTS_DIR).filter(f => f.endsWith('.toml'));
  const certs = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(GUIDED_CERTS_DIR, file), 'utf8');
      const data = TOML.parse(content);
      const slug = path.basename(file, '.toml');

      const vendor = data.vendor || 'microsoft';
      certs.push({
        slug,
        vendor,
        code: data.code || slug.toUpperCase(),
        display_code: getDisplayCode(data.code || slug, vendor),
        name: data.name || '',
        tagline: data.tagline || '',
        description: data.description || '',
        category: data.category || '',
        level: data.level || 'associate',
        status: data.status || 'live',
        modules: data.modules || 0,
        questions: data.questions || 0,
        domains: data.domains || 0,
        accent: data.accent || '',
        featured: data.featured || false,
        order: data.order || 999,
        price_practice: data.price_practice || 19,
        last_updated: data.last_updated || '',
        exam_updated: data.exam_updated || '',
        // Official exam details
        exam_url: data.exam_url || '',
        exam_duration: data.exam_duration || 0,
        exam_questions_real: data.exam_questions_real || '',
        exam_passing_score: data.exam_passing_score || '',
        exam_cost: data.exam_cost || '',
        exam_provider: data.exam_provider || '',
        exam_validity: data.exam_validity || '',
        exam_prerequisites: data.exam_prerequisites || '',
        exam_question_types: data.exam_question_types || [],
      });
    } catch (err) {
      console.error(`⚠️  Error parsing ${file}: ${err.message}`);
    }
  }

  // Sort: by vendor order, then by cert order within vendor
  const vendorOrder = ['microsoft', 'aws', 'comptia', 'cisco', 'gcp', 'isc2', 'isaca', 'cncf', 'hashicorp', 'juniper', 'paloalto', 'eccouncil', 'fortinet'];
  certs.sort((a, b) => {
    const va = vendorOrder.indexOf(a.vendor);
    const vb = vendorOrder.indexOf(b.vendor);
    if (va !== vb) return va - vb;
    return a.order - b.order;
  });

  return certs;
}

// ── Generate data/all_certs.toml ──
function generateAllCertsToml(certs) {
  const lines = [
    '# All certification exam data — shared data layer for Hugo templates',
    '# Source of truth: guided/src/content/certs/*.toml',
    '# Generated by: scripts/sync-cert-data.js (DO NOT hand-edit)',
    `# Last synced: ${new Date().toISOString().split('T')[0]}`,
    `# Total certs: ${certs.length}`,
    '',
  ];

  // ── Flat array: [[cert]] ──
  lines.push('# ═══════════════════════════════════════════════════');
  lines.push('# Flat array — use site.Data.all_certs.cert for lists');
  lines.push('# ═══════════════════════════════════════════════════');
  lines.push('');

  for (const c of certs) {
    const hugoLevel = normLevel(c.level);
    const hugoStatus = normStatus(c.status);
    const examCategory = getExamCategory(c);

    lines.push('[[cert]]');
    lines.push(`slug = "${c.slug}"`);
    lines.push(`vendor = "${c.vendor}"`);
    lines.push(`code = "${c.display_code}"`);
    lines.push(`name = "${escapeTOML(c.name)}"`);
    lines.push(`tagline = "${escapeTOML(c.tagline)}"`);
    lines.push(`exam_category = "${examCategory}"`);
    lines.push(`level = "${hugoLevel}"`);
    lines.push(`status = "${hugoStatus}"`);
    lines.push(`modules = ${c.modules}`);
    lines.push(`questions = ${c.questions}`);
    lines.push(`domains = ${c.domains}`);
    lines.push(`order = ${c.order}`);
    lines.push(`featured = ${c.featured}`);
    lines.push(`price_practice = ${c.price_practice}`);
    lines.push(`exam_url = "${escapeTOML(c.exam_url)}"`);
    lines.push(`exam_cost = "${escapeTOML(c.exam_cost)}"`);
    lines.push(`exam_duration = ${c.exam_duration}`);
    lines.push(`exam_passing_score = "${escapeTOML(c.exam_passing_score)}"`);
    lines.push(`guided_url = "/guided/${c.slug}/"`);
    lines.push('');
  }

  // ── Keyed map: [cert_map.slug] ──
  lines.push('');
  lines.push('# ═══════════════════════════════════════════════════');
  lines.push('# Keyed map — use (index site.Data.all_certs.cert_map "slug")');
  lines.push('# for single-page lookups (replaces guided_certs.toml)');
  lines.push('# ═══════════════════════════════════════════════════');
  lines.push('');

  for (const c of certs) {
    const hugoLevel = normLevel(c.level);
    const hugoStatus = normStatus(c.status);
    const examCategory = getExamCategory(c);

    lines.push(`[cert_map.${sanitizeKey(c.slug)}]`);
    lines.push(`vendor = "${c.vendor}"`);
    lines.push(`code = "${c.display_code}"`);
    lines.push(`name = "${escapeTOML(c.name)}"`);
    lines.push(`tagline = "${escapeTOML(c.tagline)}"`);
    lines.push(`exam_category = "${examCategory}"`);
    lines.push(`level = "${hugoLevel}"`);
    lines.push(`status = "${hugoStatus}"`);
    lines.push(`modules = ${c.modules}`);
    lines.push(`questions = ${c.questions}`);
    lines.push(`domains = ${c.domains}`);
    lines.push(`order = ${c.order}`);
    lines.push(`featured = ${c.featured}`);
    lines.push(`price_practice = ${c.price_practice}`);
    lines.push(`exam_url = "${escapeTOML(c.exam_url)}"`);
    lines.push(`exam_cost = "${escapeTOML(c.exam_cost)}"`);
    lines.push(`exam_duration = ${c.exam_duration}`);
    lines.push(`exam_passing_score = "${escapeTOML(c.exam_passing_score)}"`);
    lines.push(`exam_questions_real = "${escapeTOML(c.exam_questions_real)}"`);
    lines.push(`exam_provider = "${escapeTOML(c.exam_provider)}"`);
    lines.push(`exam_validity = "${escapeTOML(c.exam_validity)}"`);
    lines.push(`exam_prerequisites = "${escapeTOML(c.exam_prerequisites || 'None')}"`);
    if (c.exam_question_types && c.exam_question_types.length > 0) {
      lines.push(`exam_question_types = [${c.exam_question_types.map(t => `"${escapeTOML(t)}"`).join(', ')}]`);
    }
    lines.push(`guided_url = "/guided/${c.slug}/"`);
    lines.push(`practice_url = "/guided/${c.slug}/practice/"`);
    lines.push('');
  }

  const output = lines.join('\n');
  const outputPath = path.join(HUGO_DATA_DIR, 'all_certs.toml');
  fs.writeFileSync(outputPath, output, 'utf8');
  console.log(`✅ Generated ${outputPath} (${certs.length} certs)`);
}

// ── Generate data/study_modules.toml — interactive study guide curriculum ──
function generateStudyModulesToml() {
  const GUIDED_CONTENT_DIR = path.resolve(__dirname, '../../guided/src/content');
  const lines = [
    '# Interactive study guide curriculum — Microsoft certs only',
    '# Source: guided/src/content/{cert}/domain-N/*.mdx',
    '# Generated by: scripts/sync-cert-data.js (DO NOT hand-edit)',
    `# Last synced: ${new Date().toISOString().split('T')[0]}`,
    '',
  ];

  let certCount = 0;
  let totalModules = 0;

  // Read all cert directories (exclude 'certs' which has TOML metadata)
  const certDirs = fs.readdirSync(GUIDED_CONTENT_DIR)
    .filter(d => d !== 'certs' && fs.statSync(path.join(GUIDED_CONTENT_DIR, d)).isDirectory())
    .sort();

  for (const certSlug of certDirs) {
    const certPath = path.join(GUIDED_CONTENT_DIR, certSlug);
    const domainDirs = fs.readdirSync(certPath)
      .filter(d => d.startsWith('domain-') && fs.statSync(path.join(certPath, d)).isDirectory())
      .sort();

    if (domainDirs.length === 0) continue;

    certCount++;

    for (const domDir of domainDirs) {
      const domPath = path.join(certPath, domDir);
      const mdxFiles = fs.readdirSync(domPath).filter(f => f.endsWith('.mdx')).sort();

      for (const mdxFile of mdxFiles) {
        const filePath = path.join(domPath, mdxFile);
        const content = fs.readFileSync(filePath, 'utf8');

        // Parse frontmatter
        const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (!fmMatch) continue;

        const fm = fmMatch[1];
        const title = (fm.match(/title:\s*"([^"]+)"/) || [])[1] || mdxFile.replace('.mdx', '');
        const domain = (fm.match(/domain:\s*"([^"]+)"/) || [])[1] || domDir;
        const domainNumber = parseInt((fm.match(/domainNumber:\s*(\d+)/) || [])[1] || '1');
        const order = parseInt((fm.match(/order:\s*(\d+)/) || [])[1] || '1');
        const isFree = /isFree:\s*true/.test(fm);
        const estimatedMinutes = parseInt((fm.match(/estimatedMinutes:\s*(\d+)/) || [])[1] || '0');
        const moduleSlug = mdxFile.replace('.mdx', '');
        const guidedUrl = `/guided/${certSlug}/${domDir}/${moduleSlug}/`;

        lines.push(`[[${sanitizeModuleKey(certSlug)}]]`);
        lines.push(`title = "${escapeTOML(title)}"`);
        lines.push(`domain = "${escapeTOML(domain)}"`);
        lines.push(`domain_number = ${domainNumber}`);
        lines.push(`order = ${order}`);
        lines.push(`is_free = ${isFree}`);
        lines.push(`estimated_minutes = ${estimatedMinutes}`);
        lines.push(`url = "${guidedUrl}"`);
        lines.push('');

        totalModules++;
      }
    }
  }

  const output = lines.join('\n');
  const outputPath = path.join(HUGO_DATA_DIR, 'study_modules.toml');
  fs.writeFileSync(outputPath, output, 'utf8');
  console.log(`✅ Generated ${outputPath} (${certCount} certs, ${totalModules} modules)`);
}

function sanitizeModuleKey(slug) {
  // TOML array-of-tables key: use quoted key for slugs with hyphens
  return `"${slug}"`;
}

// ── Generate cert-tracker markdown files for non-Microsoft certs ──
function generateCertPages(certs) {
  let created = 0;
  let skipped = 0;

  for (const c of certs) {
    const slug = c.slug;
    // For Microsoft certs: use exam code as filename (existing convention)
    // e.g. az-900.md, sc-200.md — these already exist with manual: true
    const mdFilename = `${slug}.md`;
    const mdPath = path.join(HUGO_CERT_CONTENT_DIR, mdFilename);

    // Never overwrite existing files (may have manual: true or hand-edited content)
    if (fs.existsSync(mdPath)) {
      skipped++;
      continue;
    }

    const hugoLevel = normLevel(c.level);
    const hugoStatus = normStatus(c.status);
    const examCategory = getExamCategory(c);
    const displayCode = c.display_code;

    // Build front matter
    const fm = [
      '---',
      `title: "${displayCode}: ${escapeTOML(c.name)} — Study Guide & Practice Exam"`,
      `description: "Free ${displayCode} study guide and ${c.questions}-question practice exam. ${escapeTOML(c.name)} — exam objectives, study resources, and exam simulation."`,
      `type: "cert-tracker"`,
      `layout: "single"`,
      `exam_code: "${displayCode}"`,
      `exam_title: "${escapeTOML(c.name)}"`,
      `exam_level: "${hugoLevel}"`,
      `exam_status: "${hugoStatus}"`,
      `exam_category: "${examCategory}"`,
      `vendor: "${c.vendor}"`,
      `manual: false`,
      `guided_slug: "${slug}"`,
      `---`,
    ];

    // Build body content — genuinely useful, not thin
    const body = buildCertPageContent(c, examCategory, certs);

    fs.writeFileSync(mdPath, fm.join('\n') + '\n' + body, 'utf8');
    created++;
  }

  console.log(`✅ Cert pages: ${created} created, ${skipped} skipped (already exist)`);
}

// Read domain metadata from Guided question JSON files
function readDomains(slug) {
  const domains = [];
  try {
    const files = fs.readdirSync(GUIDED_QUESTIONS_DIR)
      .filter(f => f.startsWith(`${slug}-domain-`) && f.endsWith('.json'))
      .sort();
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(GUIDED_QUESTIONS_DIR, file), 'utf8'));
      if (data.meta) {
        domains.push({
          name: data.meta.domainName || `Domain ${data.meta.domain}`,
          weight: data.meta.weight || 0,
          questionCount: (data.questions || []).length,
        });
      }
    }
  } catch (e) { /* no domain files — that's fine */ }
  return domains;
}

// Find related certs from same vendor (excluding self)
function getRelatedCerts(cert, allCerts) {
  return allCerts
    .filter(c => c.vendor === cert.vendor && c.slug !== cert.slug)
    .sort((a, b) => a.order - b.order)
    .slice(0, 5);
}

// Get vendor data by slug
function getVendorData(vendorSlug) {
  try {
    const vendorsToml = fs.readFileSync(path.join(HUGO_DATA_DIR, 'vendors.toml'), 'utf8');
    const data = TOML.parse(vendorsToml);
    return (data.vendor || []).find(v => v.slug === vendorSlug);
  } catch (e) { return null; }
}

// Level descriptions for "Who is this for" section
const LEVEL_DESCRIPTIONS = {
  'fundamentals': { audience: 'beginners and career changers', experience: 'No prior experience required', studyTime: '2-4 weeks of part-time study' },
  'foundational': { audience: 'beginners and career changers', experience: 'No prior experience required', studyTime: '2-4 weeks of part-time study' },
  'entry': { audience: 'beginners and career changers', experience: 'No prior experience required', studyTime: '2-4 weeks of part-time study' },
  'associate': { audience: 'IT professionals with some hands-on experience', experience: '6-12 months of hands-on experience recommended', studyTime: '4-8 weeks of focused study' },
  'core': { audience: 'IT professionals with some hands-on experience', experience: '6-12 months of hands-on experience recommended', studyTime: '4-8 weeks of focused study' },
  'professional': { audience: 'experienced professionals seeking advanced validation', experience: '2+ years of hands-on experience recommended', studyTime: '8-12 weeks of intensive study' },
  'expert': { audience: 'experienced professionals seeking advanced validation', experience: '2+ years of hands-on experience recommended', studyTime: '8-12 weeks of intensive study' },
  'specialty': { audience: 'professionals specialising in a focused domain', experience: 'Prior certification or equivalent experience recommended', studyTime: '6-10 weeks of focused study' },
};

function buildCertPageContent(cert, examCategory, allCerts) {
  const code = cert.display_code;
  const domains = readDomains(cert.slug);
  const relatedCerts = getRelatedCerts(cert, allCerts);
  const vendorData = getVendorData(cert.vendor);
  const levelInfo = LEVEL_DESCRIPTIONS[cert.level] || LEVEL_DESCRIPTIONS['associate'];
  const lines = [];

  // ── About section ──
  lines.push(`## About the ${code} Exam`);
  lines.push('');
  if (cert.tagline) {
    lines.push(`> ${cert.tagline}`);
    lines.push('');
  }
  if (cert.description) {
    const sentences = cert.description.split('. ').slice(0, 3).join('. ');
    lines.push(sentences + (sentences.endsWith('.') ? '' : '.'));
    lines.push('');
  }

  // ── Who is this exam for? ──
  lines.push(`## Who Should Take This Exam?`);
  lines.push('');
  lines.push(`The ${code} is designed for **${levelInfo.audience}**. ${levelInfo.experience}.`);
  lines.push('');
  if (cert.exam_prerequisites && cert.exam_prerequisites !== 'None') {
    lines.push(`**Prerequisites:** ${cert.exam_prerequisites}`);
    lines.push('');
  }
  lines.push(`**Typical study time:** ${levelInfo.studyTime}`);
  lines.push('');

  // ── Exam Quick Facts table ──
  lines.push('## Exam Quick Facts');
  lines.push('');
  lines.push('| Detail | Value |');
  lines.push('|--------|-------|');
  lines.push(`| **Exam Code** | ${code} |`);
  lines.push(`| **Title** | ${cert.name} |`);
  if (cert.exam_duration) lines.push(`| **Duration** | ${cert.exam_duration} minutes |`);
  if (cert.exam_questions_real) lines.push(`| **Questions** | ${cert.exam_questions_real} |`);
  if (cert.exam_passing_score) lines.push(`| **Pass Score** | ${cert.exam_passing_score} |`);
  if (cert.exam_cost) lines.push(`| **Cost** | ${cert.exam_cost} |`);
  if (cert.exam_provider) lines.push(`| **Provider** | ${cert.exam_provider} |`);
  if (cert.exam_validity) lines.push(`| **Validity** | ${cert.exam_validity} |`);
  if (cert.exam_prerequisites) lines.push(`| **Prerequisites** | ${cert.exam_prerequisites} |`);
  if (cert.exam_question_types && cert.exam_question_types.length > 0) {
    lines.push(`| **Question Types** | ${cert.exam_question_types.join(', ')} |`);
  }
  if (cert.exam_url) lines.push(`| **Official Page** | [View on ${examCategory} →](${cert.exam_url}) |`);
  lines.push('');

  // ── Exam Domains ──
  if (domains.length > 0) {
    lines.push(`## Exam Domains & Weights`);
    lines.push('');
    lines.push(`The ${code} exam covers **${domains.length} domains**. Focus your study time based on the weights below — higher-weighted domains have more exam questions.`);
    lines.push('');
    lines.push('| Domain | Weight | Practice Qs |');
    lines.push('|--------|--------|-------------|');
    for (const d of domains) {
      lines.push(`| ${d.name} | ${d.weight}% | ${d.questionCount} |`);
    }
    const totalQs = domains.reduce((sum, d) => sum + d.questionCount, 0);
    lines.push(`| **Total** | **100%** | **${totalQs}** |`);
    lines.push('');

    // Study tip based on weights
    const heaviest = domains.reduce((a, b) => b.weight > a.weight ? b : a);
    const lightest = domains.reduce((a, b) => b.weight < a.weight ? b : a);
    lines.push(`> 💡 **Study tip:** **${heaviest.name}** carries the most weight (${heaviest.weight}%) — start there. **${lightest.name}** has the least (${lightest.weight}%), but don't skip it — exam questions can come from any domain.`);
    lines.push('');
  }

  // ── Practice Exam section ──
  if (cert.questions > 0) {
    lines.push(`## Practice Exam — ${cert.questions} Questions`);
    lines.push('');
    lines.push(`Prepare for the ${code} with our **${cert.questions}-question practice exam** covering all ${cert.domains} exam domains. Every question includes detailed explanations and maps to official exam objectives.`);
    lines.push('');
    lines.push('**What you get:**');
    lines.push('- ✅ Exam simulation mode with timer');
    lines.push('- ✅ Spaced repetition for weak areas');
    lines.push('- ✅ Detailed explanations for every question');
    lines.push('- ✅ Progress tracking across domains');
    lines.push('- ✅ 20 free questions — no account needed');
    lines.push('');
  }

  // ── Certification Path ──
  if (vendorData && vendorData.cert_path_note) {
    lines.push(`## ${vendorData.short_name || vendorData.name} Certification Path`);
    lines.push('');
    lines.push(vendorData.cert_path_note);
    lines.push('');
  }

  // ── Related Certs ──
  if (relatedCerts.length > 0) {
    lines.push(`## Related ${examCategory} Certifications`);
    lines.push('');
    lines.push(`If you're studying for the ${code}, you might also be interested in these ${examCategory} certifications:`);
    lines.push('');
    for (const rc of relatedCerts) {
      lines.push(`- **[${rc.display_code}: ${rc.name}](/cert-tracker/${rc.slug}/)** — ${rc.questions} practice questions`);
    }
    lines.push('');
  }

  // ── Study Tips ──
  lines.push(`## Study Tips`);
  lines.push('');
  lines.push(`1. **Start with the heaviest domain** — focus your time where the exam focuses its questions`);
  lines.push(`2. **Use our practice exam** — try the 20 free questions first to gauge your readiness`);
  lines.push(`3. **Review explanations** — don't just check if you got it right; read why each answer is correct`);
  lines.push(`4. **Simulate exam conditions** — use the timed exam mode to practice under pressure`);
  if (cert.exam_url) {
    lines.push(`5. **Check the official page** — [official exam details](${cert.exam_url}) always have the latest objectives`);
  }
  lines.push('');

  return lines.join('\n');
}

// ── Helpers ──
function escapeTOML(str) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function sanitizeKey(slug) {
  // TOML keys: replace hyphens with underscores for dotted key access
  // But Hugo can handle dotted keys with hyphens via index function
  // Keep hyphens — Hugo accesses via: index site.Data.all_certs.cert_map "az-900"
  return `"${slug}"`;
}

// ── Main ──
function main() {
  const args = process.argv.slice(2);
  const doData = args.includes('--data') || args.includes('--all') || args.length === 0;
  const doPages = args.includes('--pages') || args.includes('--all');

  console.log('🔄 Sync cert data: Guided → Hugo');
  console.log(`   Source: ${GUIDED_CERTS_DIR}`);
  console.log('');

  const certs = readAllCerts();
  console.log(`📦 Found ${certs.length} certs across ${new Set(certs.map(c => c.vendor)).size} vendors`);

  // Vendor summary
  const vendorCounts = {};
  for (const c of certs) {
    vendorCounts[c.vendor] = (vendorCounts[c.vendor] || 0) + 1;
  }
  for (const [v, count] of Object.entries(vendorCounts)) {
    console.log(`   ${v}: ${count}`);
  }
  console.log('');

  if (doData) {
    generateAllCertsToml(certs);
    generateStudyModulesToml();
  }

  if (doPages) {
    generateCertPages(certs);
  }

  console.log('\n✅ Sync complete!');
}

main();
