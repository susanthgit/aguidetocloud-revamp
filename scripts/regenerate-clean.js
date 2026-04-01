const fs = require('fs');
const path = require('path');

const CONTENT_DIR = 'content';
const videos = JSON.parse(fs.readFileSync('data/videos-fresh.json', 'utf8'));

// Also load the jazz video we added manually
const jazzId = 'sz73OdPnb5w';

function cleanDescriptionForWebsite(desc) {
  let lines = desc.split('\n');
  let cleanLines = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Stop at footer
    if (trimmed.startsWith('━━━')) break;
    
    // Skip timestamps (00:00:00, 01:22:39, etc.)
    if (/^\d{1,2}:\d{2}/.test(trimmed)) continue;
    
    // Skip hashtag lines
    if (/^#\w+/.test(trimmed)) continue;
    
    // Skip lines that are just URLs
    if (/^https?:\/\//.test(trimmed)) continue;
    
    // Skip lines starting with 👉 (link lines)
    if (trimmed.startsWith('👉')) continue;
    
    // Skip "Level Up" footer lines
    if (/Level Up Your Learning|Useful Links Below/i.test(trimmed)) continue;
    
    // Skip section headers that are just emoji labels
    if (/^[🔎🚀⏰📌🔗] /.test(trimmed) && trimmed.length < 40) continue;
    
    // Clean emojis from remaining lines but keep the text
    let clean = trimmed
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}✅✔🔥🎯🤖💼📌📺🔔☕💬🌐📚📰🔗🧲🔎]/gu, '')
      .replace(/^[-–—•]\s*/, '')
      .trim();
    
    if (clean.length > 0) {
      cleanLines.push(clean);
    }
  }
  
  // Take the first meaningful paragraph (up to ~300 chars)
  let result = '';
  for (const line of cleanLines) {
    if (result.length + line.length > 400) break;
    if (result.length > 0) result += ' ';
    result += line;
  }
  
  // If too short, just use what we have
  if (result.length < 20 && cleanLines.length > 0) {
    result = cleanLines.slice(0, 3).join(' ');
  }
  
  return result || 'Watch this tutorial on the A Guide to Cloud & AI YouTube channel.';
}

function categorize(v) {
  const t = v.title.toLowerCase();
  if (t.includes('interview question') || (t.includes('interview prep') && !t.includes('mock'))) return 'interview-prep';
  if (t.includes('18 key questions') && t.includes('interview')) return 'interview-prep';
  if (t.includes('mock exam') || t.includes('exam practice') || t.includes('practice question') ||
      t.includes('exam voucher') || t.includes('exam discount') || t.includes('exam simulation') ||
      t.includes('practice test') || t.includes('sc-100')) return 'exam-qa';
  if (t.includes('copilot') || t.includes('agent') || t.includes('prompt engineering') ||
      t.includes('researcher agent') || t.includes('analyst agent')) return 'ai-hub';
  if (t.includes('full course') || t.includes('certification training')) return 'certifications';
  if (t.includes('purview') || t.includes('sentinel') || t.includes('devops') || t.includes('boards')) return 'cloud-labs';
  if (t.includes('windows 365') || t.includes('virtual desktop')) return 'cloud-labs';
  if (t.includes('azure')) return 'cloud-labs';
  if (t.includes('music') || t.includes('beats') || t.includes('fire sounds') || t.includes('crackling') || t.includes('jazz')) return 'music';
  return 'cloud-labs';
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
    if (t.includes('what\'s new') || t.includes('update')) return "What's New";
    if (t.includes('agent') || t.includes('copilot studio')) return 'Agentic AI';
    if (t.includes('prompt')) return 'Prompt Engineering';
    return 'M365 Copilot';
  }
  if (cat === 'cloud-labs') {
    if (t.includes('purview')) return 'Security';
    if (t.includes('sentinel')) return 'Security';
    if (t.includes('devops') || t.includes('boards')) return 'DevOps';
    if (t.includes('windows 365') || t.includes('virtual desktop')) return 'Virtual Desktop';
    if (t.includes('network') || t.includes('expressroute')) return 'Networking';
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
  return { 'ai-hub': 'ai', 'cloud-labs': 'cloud', 'certifications': 'cert', 'exam-qa': 'cert', 'interview-prep': 'cloud', 'music': '' }[cat] || '';
}

function isFeatured(v, cat) {
  if (v.views > 100000) return true;
  if (cat === 'ai-hub' && v.date >= '2025-01-01') return true;
  return false;
}

// Clean out old content (except _index.md and jazz music we added manually)
const sections = ['ai-hub', 'cloud-labs', 'certifications', 'exam-qa', 'interview-prep', 'music'];
for (const sec of sections) {
  const dir = path.join(CONTENT_DIR, sec);
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f !== '_index.md' && f.endsWith('.md'));
    files.forEach(f => fs.unlinkSync(path.join(dir, f)));
  }
}

const usedSlugs = {};
let counts = {};

for (const v of videos) {
  const cat = categorize(v);
  counts[cat] = (counts[cat] || 0) + 1;
  
  let slug = slugify(v.title);
  if (usedSlugs[cat + '/' + slug]) slug += '-' + v.id.substring(0, 4);
  usedSlugs[cat + '/' + slug] = true;
  
  const cleanDesc = cleanDescriptionForWebsite(v.description);
  const cardTag = getCardTag(cat, v.title);
  const tagClass = getTagClass(cat);
  const featured = isFeatured(v, cat);
  const hugoTags = (v.tags || []).filter(t => t.length > 2 && t.length < 30).slice(0, 8).map(t => t.toLowerCase());
  
  const content = [
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
  
  fs.writeFileSync(path.join(CONTENT_DIR, cat, slug + '.md'), content);
}

// Re-add jazz music manually
const jazzContent = `---
title: "Smooth Jazz for Studying & Reading | Ad-Free Relaxing Background Music"
date: 2022-04-22T00:00:00Z
youtube_id: "sz73OdPnb5w"
card_tag: "Study Music"
tag_class: ""
tags: ["study music", "focus music", "jazz", "background music", "relaxation"]
views: 1016
likes: 0
---

Smooth jazz for studying, reading, and relaxation. Ad-free background music to help you focus and unwind.`;
fs.writeFileSync(path.join(CONTENT_DIR, 'music', 'smooth-jazz-for-studying-reading.md'), jazzContent);
counts['music'] = (counts['music'] || 0) + 1;

console.log('\nRegenerated with clean descriptions:');
Object.entries(counts).sort().forEach(([cat, count]) => console.log(`  ${cat}: ${count}`));
console.log(`  TOTAL: ${Object.values(counts).reduce((a, b) => a + b, 0)}`);
