/**
 * YouTube Channel Scanner
 * 
 * Fetches all videos from the channel, compares with existing data,
 * and generates new content pages for any videos not yet on the site.
 * 
 * Only ADDS new videos — never modifies existing content pages.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID || 'UCYN12Rlv9hgZlWJa1XPfdyg';
const DATA_FILE = path.join(__dirname, '..', 'data', 'videos-fresh.json');
const CONTENT_DIR = path.join(__dirname, '..', 'content');

// ── Category classification (matches existing generate-content.js logic) ──

function categorize(title) {
  const t = title.toLowerCase();
  if (t.includes('interview prep') || t.includes('interview questions') || (t.includes('interview') && t.includes('key questions'))) return 'interview-prep';
  if (t.includes('mock exam') || t.includes('practice questions') || t.includes('exam q&a') || t.includes('exam voucher')) return 'exam-qa';
  if (t.includes('copilot') || t.includes('ai agent') || t.includes('prompt engineer') || t.includes('ai foundry') || t.includes('github copilot') || t.includes('artificial intelligence') || t.includes('chatgpt') || t.includes('openai') || t.includes('ai hub') || t.includes('copilot studio')) return 'ai-hub';
  if (/\b(az|sc|ms|pl|dp|ai|md)-?\d{3}\b/i.test(t) && (t.includes('full course') || t.includes('certification') || t.includes('full exam'))) return 'certifications';
  if (t.includes('study music') || t.includes('lofi') || t.includes('lo-fi') || t.includes('jazz') || t.includes('background music')) return 'music';
  return 'cloud-labs';
}

function getCardTag(title, category) {
  const t = title.toLowerCase();
  const tagMap = {
    'ai-hub': () => {
      if (t.includes('copilot studio')) return ['Copilot Studio', 'ai'];
      if (t.includes('prompt engineer') || t.includes('prompt')) return ['Prompt Engineering', 'ai'];
      if (t.includes('ai foundry')) return ['AI Foundry', 'ai'];
      if (t.includes('github copilot')) return ['GitHub Copilot', 'ai'];
      if (t.includes('agent')) return ['AI Agents', 'ai'];
      if (t.includes('update') || t.includes("what's new")) return ["What's New", 'ai'];
      return ['M365 Copilot', 'ai'];
    },
    'cloud-labs': () => {
      if (t.includes('intune')) return ['Intune', 'cloud'];
      if (t.includes('virtual desktop') || t.includes('windows 365') || t.includes('avd')) return ['Virtual Desktop', 'cloud'];
      if (t.includes('network') || t.includes('firewall')) return ['Networking', 'cloud'];
      if (t.includes('security')) return ['Security', 'cloud'];
      if (t.includes('devops')) return ['DevOps', 'cloud'];
      if (t.includes('entra') || t.includes('active directory')) return ['Entra ID', 'cloud'];
      if (t.includes('365') || t.includes('microsoft 365') || t.includes('m365')) return ['Microsoft 365', 'cloud'];
      return ['Azure', 'cloud'];
    },
    'certifications': () => {
      const match = t.match(/\b(az|sc|ms|pl|dp|ai|md)-?\d{3}\b/i);
      return match ? [match[0].toUpperCase().replace(/(\D)(\d)/, '$1-$2'), 'cert'] : ['Certification', 'cert'];
    },
    'exam-qa': () => {
      const match = t.match(/\b(az|sc|ms|pl|dp|ai|md)-?\d{3}\b/i);
      return match ? [match[0].toUpperCase().replace(/(\D)(\d)/, '$1-$2'), 'cert'] : ['Exam Q&A', 'cert'];
    },
    'interview-prep': () => ['Interview Prep', 'cloud'],
    'music': () => ['Study Music', 'music'],
  };
  const fn = tagMap[category];
  return fn ? fn() : ['General', 'cloud'];
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
    .replace(/-$/, '');
}

function cleanDescription(desc) {
  if (!desc) return '';
  const lines = desc.split('\n');
  const clean = [];
  for (const line of lines) {
    if (line.includes('━━━')) break;
    if (/^#\w/.test(line.trim())) continue; // hashtag lines
    if (/^https?:\/\//.test(line.trim())) continue; // URL-only lines
    if (/^👉/.test(line.trim())) continue;
    if (/^00:\d{2}/.test(line.trim())) continue; // timestamps
    const trimmed = line.trim();
    if (trimmed.length > 0) clean.push(trimmed);
  }
  return clean.slice(0, 6).join('\n');
}

// ── YouTube API helpers ──

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

async function getUploadsPlaylistId() {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`;
  const data = await fetchJSON(url);
  if (!data.items || data.items.length === 0) throw new Error('Channel not found');
  return data.items[0].contentDetails.relatedPlaylists.uploads;
}

async function getAllVideoIds(playlistId) {
  const ids = [];
  let pageToken = '';
  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=50&pageToken=${pageToken}&key=${API_KEY}`;
    const data = await fetchJSON(url);
    for (const item of data.items) {
      ids.push(item.contentDetails.videoId);
    }
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  return ids;
}

async function getVideoDetails(videoIds) {
  const videos = [];
  // YouTube API allows max 50 IDs per request
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50).join(',');
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${batch}&key=${API_KEY}`;
    const data = await fetchJSON(url);
    for (const item of data.items) {
      videos.push({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        tags: item.snippet.tags || [],
        date: item.snippet.publishedAt,
        views: parseInt(item.statistics.viewCount || '0'),
        likes: parseInt(item.statistics.likeCount || '0'),
        duration: item.contentDetails.duration,
      });
    }
  }
  return videos;
}

// ── Content generation ──

function generateMarkdown(video) {
  const category = categorize(video.title);
  const [cardTag, tagClass] = getCardTag(video.title, category);
  const slug = slugify(video.title);
  const tags = (video.tags || [])
    .filter(t => t.length > 2 && t.length < 30)
    .slice(0, 8)
    .map(t => t.toLowerCase());
  const desc = cleanDescription(video.description);

  const frontmatter = [
    '---',
    `title: ${JSON.stringify(video.title)}`,
    `date: ${video.date}`,
    `youtube_id: "${video.id}"`,
    `card_tag: "${cardTag}"`,
    `tag_class: "${tagClass}"`,
    `tags: [${tags.map(t => JSON.stringify(t)).join(', ')}]`,
    `featured: false`,
    `views: ${video.views}`,
    `likes: ${video.likes}`,
    '---',
    '',
    desc,
    '',
  ].join('\n');

  return { category, slug, content: frontmatter };
}

// ── Main ──

async function main() {
  console.log('🔍 Scanning YouTube channel for new videos...\n');

  // Load existing data
  let existingData = [];
  if (fs.existsSync(DATA_FILE)) {
    existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
  const existingIds = new Set(existingData.map(v => v.id));

  // Also check existing content files for youtube_id
  const contentIds = new Set();
  const sections = ['ai-hub', 'cloud-labs', 'certifications', 'exam-qa', 'interview-prep', 'music'];
  for (const section of sections) {
    const dir = path.join(CONTENT_DIR, section);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (file === '_index.md' || !file.endsWith('.md')) continue;
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const match = content.match(/youtube_id:\s*"([^"]+)"/);
      if (match) contentIds.add(match[1]);
    }
  }

  console.log(`📦 Existing data file: ${existingData.length} videos`);
  console.log(`📄 Existing content pages: ${contentIds.size} videos\n`);

  // Fetch from YouTube
  console.log('📡 Fetching from YouTube API...');
  const playlistId = await getUploadsPlaylistId();
  const videoIds = await getAllVideoIds(playlistId);
  console.log(`   Found ${videoIds.length} videos on channel\n`);

  // Find new video IDs (not in data file AND not in content)
  const newIds = videoIds.filter(id => !existingIds.has(id) && !contentIds.has(id));

  if (newIds.length === 0) {
    console.log('✅ No new videos found. Everything is up to date!');
    return;
  }

  console.log(`🆕 Found ${newIds.length} new video(s)!\n`);

  // Fetch details for new videos
  const newVideos = await getVideoDetails(newIds);

  // Update data file
  const allData = [...existingData, ...newVideos];
  allData.sort((a, b) => b.date.localeCompare(a.date));
  fs.writeFileSync(DATA_FILE, JSON.stringify(allData, null, 2), 'utf8');
  console.log(`📁 Updated data file: ${allData.length} total videos\n`);

  // Generate content pages for new videos only
  let created = 0;
  const usedSlugs = new Set();

  for (const video of newVideos) {
    const { category, slug, content } = generateMarkdown(video);
    let finalSlug = slug;

    // Avoid duplicate slugs
    if (usedSlugs.has(finalSlug) || fs.existsSync(path.join(CONTENT_DIR, category, `${finalSlug}.md`))) {
      finalSlug = `${slug}-${video.id.substring(0, 4).toLowerCase()}`;
    }
    usedSlugs.add(finalSlug);

    const filePath = path.join(CONTENT_DIR, category, `${finalSlug}.md`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   ✅ ${category}/${finalSlug}.md — "${video.title.substring(0, 60)}..."`);
    created++;
  }

  console.log(`\n🎉 Created ${created} new content page(s)!`);
  console.log('   Push will trigger auto-deploy via deploy.yml');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
