import fs from 'fs';
import { google } from 'googleapis';

const creds = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
const tokens = JSON.parse(fs.readFileSync('tokens.json', 'utf8'));
const oauth2 = new google.auth.OAuth2(creds.installed.client_id, creds.installed.client_secret, creds.installed.redirect_uris[0]);
oauth2.setCredentials(tokens);
const yt = google.youtube({ version: 'v3', auth: oauth2 });

const videos = JSON.parse(fs.readFileSync('C:/ssClawy/aguidetocloud-revamp/data/videos-full.json', 'utf8'));

// Brand tags for ALL videos
const BRAND_TAGS = [
  'A Guide to Cloud and AI',
  'LearnAIAndCloud',
  'Susanth Sutheesh',
  'beginner tutorial'
];

// Category detection + tags
function getCategoryTags(title, existingTags) {
  const t = title.toLowerCase();
  const tags = existingTags.map(t => t.toLowerCase());
  const extra = [];

  // AI / Copilot content
  if (t.includes('copilot') || t.includes('agent') || t.includes('prompt engineering') || t.includes('ai-900') || t.includes('openai')) {
    extra.push('Microsoft 365 Copilot', 'AI tutorial', 'Microsoft AI', 'AI for beginners');
  }

  // Azure labs / tutorials
  if (t.includes('azure') && (t.includes('lab') || t.includes('tutorial') || t.includes('hands-on') || t.includes('hands on'))) {
    extra.push('Azure tutorial', 'Azure hands on lab', 'cloud computing', 'Azure for beginners');
  }

  // Certification / Full Course / Mock Exam
  if (t.includes('full course') || t.includes('mock exam') || t.includes('certification') || t.includes('exam practice')) {
    extra.push('Microsoft certification', 'exam prep', 'certification training');
  }

  // Specific exam tags (standardize naming)
  const examMatch = t.match(/(az|ms|sc|pl|dp|ai)-?\d{3}/i);
  if (examMatch) {
    const exam = examMatch[0].toUpperCase().replace(/(\D+)(\d+)/, '$1-$2');
    extra.push(exam, exam + ' exam', exam + ' certification');
  }

  // Purview
  if (t.includes('purview')) extra.push('Microsoft Purview', 'data protection', 'compliance');

  // Sentinel
  if (t.includes('sentinel')) extra.push('Microsoft Sentinel', 'SIEM', 'security');

  // DevOps
  if (t.includes('devops') || t.includes('ci/cd') || t.includes('boards')) extra.push('Azure DevOps', 'CI/CD', 'DevOps tutorial');

  // Windows 365 / AVD
  if (t.includes('windows 365') || t.includes('virtual desktop')) extra.push('Windows 365', 'Azure Virtual Desktop', 'VDI');

  // Music videos
  if (t.includes('music') || t.includes('beats') || t.includes('fire sounds') || t.includes('crackling')) {
    extra.push('study music', 'focus music', 'background music');
  }

  return extra;
}

async function updateTags() {
  let success = 0, errors = [];

  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];

    try {
      const res = await yt.videos.list({ part: 'snippet', id: v.id });
      const snippet = res.data.items[0].snippet;
      const existingTags = snippet.tags || [];

      // Build new tag set: existing + brand + category (deduplicated)
      const categoryTags = getCategoryTags(v.title, existingTags);
      const allTags = [...existingTags];

      for (const tag of [...BRAND_TAGS, ...categoryTags]) {
        if (!allTags.some(t => t.toLowerCase() === tag.toLowerCase())) {
          allTags.push(tag);
        }
      }

      // YouTube max 500 chars total for tags
      let finalTags = [];
      let charCount = 0;
      for (const tag of allTags) {
        if (charCount + tag.length + 1 <= 500) {
          finalTags.push(tag);
          charCount += tag.length + 1;
        }
      }

      const added = finalTags.length - existingTags.length;

      await yt.videos.update({
        part: 'snippet',
        requestBody: {
          id: v.id,
          snippet: {
            title: snippet.title,
            description: snippet.description,
            tags: finalTags,
            categoryId: snippet.categoryId
          }
        }
      });

      success++;
      console.log(`[${i+1}/74] ✅ +${added} tags | ${v.title.substring(0, 55)}`);
      await new Promise(r => setTimeout(r, 600));
    } catch (e) {
      errors.push(v.title.substring(0, 40));
      console.log(`[${i+1}/74] ❌ ${v.title.substring(0, 40)} — ${e.message.substring(0, 50)}`);
    }
  }

  console.log(`\n=== DONE: ${success}/74 updated, ${errors.length} errors ===`);
  if (errors.length) errors.forEach(e => console.log('  ❌ ' + e));
}

updateTags();
