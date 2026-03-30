const fs = require('fs');
const path = require('path');
const videos = JSON.parse(fs.readFileSync('data/videos-fresh.json', 'utf8'));

const CONTENT_DIR = 'content';

function categorize(v) {
  const t = v.title.toLowerCase();
  if (t.includes('interview question')) return 'interview-prep';
  if (t.includes('mock exam') || t.includes('exam practice') || t.includes('practice question') ||
      t.includes('exam voucher') || t.includes('exam discount') || t.includes('exam simulation') ||
      t.includes('practice test') || t.includes('sc-100')) return 'exam-qa';
  if (t.includes('copilot') || t.includes('agent') || t.includes('prompt engineering') ||
      t.includes('researcher agent') || t.includes('analyst agent')) return 'ai-hub';
  if (t.includes('full course') || t.includes('certification training')) return 'certifications';
  if (t.includes('purview') || t.includes('sentinel') || t.includes('devops') || t.includes('boards')) return 'cloud-labs';
  if (t.includes('windows 365') || t.includes('virtual desktop')) return 'cloud-labs';
  if (t.includes('azure')) return 'cloud-labs';
  if (t.includes('music') || t.includes('beats') || t.includes('fire sounds') || t.includes('crackling')) return 'music';
  return 'cloud-labs'; // default
}

function slugify(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

function getCardTag(cat, title) {
  const t = title.toLowerCase();
  if (cat === 'ai-hub') {
    if (t.includes('what\'s new') || t.includes('update')) return 'What\'s New';
    if (t.includes('agent') || t.includes('copilot studio')) return 'Agentic AI';
    if (t.includes('prompt')) return 'Prompt Engineering';
    return 'M365 Copilot';
  }
  if (cat === 'cloud-labs') {
    if (t.includes('purview')) return 'Security';
    if (t.includes('sentinel')) return 'Security';
    if (t.includes('devops') || t.includes('boards')) return 'DevOps';
    if (t.includes('windows 365') || t.includes('virtual desktop')) return 'Virtual Desktop';
    if (t.includes('network') || t.includes('peering') || t.includes('expressroute')) return 'Networking';
    if (t.includes('firewall')) return 'Security';
    if (t.includes('migrate') || t.includes('app service')) return 'Migration';
    return 'Azure';
  }
  if (cat === 'certifications') {
    const match = t.match(/(az|ms|sc|pl|dp|ai)-?\d{3}/i);
    return match ? match[0].toUpperCase().replace(/(\D+)(\d+)/, '$1-$2') : 'Certification';
  }
  if (cat === 'exam-qa') {
    const match = t.match(/(az|ms|sc|pl|dp|ai)-?\d{3}/i);
    return match ? match[0].toUpperCase().replace(/(\D+)(\d+)/, '$1-$2') : 'Exam Tips';
  }
  if (cat === 'interview-prep') return 'Interview Prep';
  if (cat === 'music') return 'Study Music';
  return '';
}

function getTagClass(cat) {
  const map = { 'ai-hub': 'ai', 'cloud-labs': 'cloud', 'certifications': 'cert', 'exam-qa': 'cert', 'interview-prep': 'cloud', 'music': '' };
  return map[cat] || '';
}

// Get description up to the footer line
function getCleanDescription(desc) {
  const footerIdx = desc.indexOf('━━━');
  let clean = footerIdx > -1 ? desc.substring(0, footerIdx).trim() : desc.trim();
  // Remove hashtags at the end
  clean = clean.replace(/\n*#\w+[\s\S]*$/, '').trim();
  return clean;
}

function isFeatured(v, cat) {
  // Feature the newest videos and top performers
  if (v.views > 100000) return true;
  if (cat === 'ai-hub' && v.date >= '2025-01-01') return true;
  return false;
}

// Track slugs to avoid duplicates
const usedSlugs = {};

let counts = {};
for (const v of videos) {
  const cat = categorize(v);
  counts[cat] = (counts[cat] || 0) + 1;
  
  let slug = slugify(v.title);
  if (usedSlugs[cat + '/' + slug]) {
    slug += '-' + v.id.substring(0, 4);
  }
  usedSlugs[cat + '/' + slug] = true;
  
  const cardTag = getCardTag(cat, v.title);
  const tagClass = getTagClass(cat);
  const cleanDesc = getCleanDescription(v.description);
  const featured = isFeatured(v, cat);
  
  // Build Hugo tags from video tags (pick top 5 relevant ones)
  const hugoTags = (v.tags || [])
    .filter(t => t.length > 2 && t.length < 30)
    .slice(0, 8)
    .map(t => t.toLowerCase());
  
  const frontmatter = [
    '---',
    `title: "${v.title.replace(/"/g, '\\"')}"`,
    `date: ${v.date}`,
    `youtube_id: "${v.id}"`,
    `card_tag: "${cardTag}"`,
    `tag_class: "${tagClass}"`,
    `tags: [${hugoTags.map(t => '"' + t + '"').join(', ')}]`,
    featured ? 'featured: true' : null,
    `views: ${v.views}`,
    `likes: ${v.likes}`,
    '---',
    '',
    cleanDesc
  ].filter(Boolean).join('\n');
  
  const filePath = path.join(CONTENT_DIR, cat, slug + '.md');
  fs.writeFileSync(filePath, frontmatter);
}

console.log('\nGenerated content:');
Object.entries(counts).sort().forEach(([cat, count]) => console.log(`  ${cat}: ${count} files`));
console.log(`  TOTAL: ${videos.length} files`);
