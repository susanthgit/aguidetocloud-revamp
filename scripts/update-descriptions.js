const fs = require('fs');
const { google } = require('googleapis');

const creds = JSON.parse(fs.readFileSync('credentials.json'));
const tokens = JSON.parse(fs.readFileSync('tokens.json'));
const oauth2 = new google.auth.OAuth2(creds.installed.client_id, creds.installed.client_secret, creds.installed.redirect_uris[0]);
oauth2.setCredentials(tokens);
const yt = google.youtube({ version: 'v3', auth: oauth2 });

const videos = JSON.parse(fs.readFileSync('C:/ssClawy/aguidetocloud-revamp/data/videos-full.json'));

const NEW_FOOTER = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 A Guide to Cloud & AI — Your AI & Cloud Skills Hub

📺 Watch on website: https://www.aguidetocloud.com
☕ Support my work: https://ko-fi.com/aguidetocloud/shop
💬 Community: https://susanth.bio.link/

🔔 Subscribe for weekly tutorials!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

const footerPatterns = [
  /\n*🚀\s*Level Up.*/s,
  /\n*👉\s+Ask Questions.*/s,
  /\n*Level Up Your Learning.*/s,
  /\n*Useful Links Below.*/s
];

function cleanDescription(desc) {
  let content = desc;
  for (const pattern of footerPatterns) {
    const match = content.match(pattern);
    if (match) {
      content = content.substring(0, match.index);
      break;
    }
  }
  content = content.trimEnd();
  return content + '\n' + NEW_FOOTER;
}

async function updateAll() {
  let success = 0;
  let errors = [];

  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];
    const newDesc = cleanDescription(v.description);

    // Skip if description hasn't changed
    if (newDesc.trim() === v.description.trim()) {
      console.log(`[${i+1}/${videos.length}] SKIP (no change): ${v.title.substring(0, 50)}`);
      success++;
      continue;
    }

    try {
      // Get current video snippet (required for update)
      const current = await yt.videos.list({ part: 'snippet', id: v.id });
      const snippet = current.data.items[0].snippet;

      // Update only the description
      snippet.description = newDesc;

      await yt.videos.update({
        part: 'snippet',
        requestBody: {
          id: v.id,
          snippet: {
            title: snippet.title,
            description: newDesc,
            tags: snippet.tags,
            categoryId: snippet.categoryId
          }
        }
      });

      success++;
      console.log(`[${i+1}/${videos.length}] ✅ ${v.title.substring(0, 55)}`);

      // Small delay to respect rate limits
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      errors.push({ title: v.title, error: e.message });
      console.log(`[${i+1}/${videos.length}] ❌ ${v.title.substring(0, 45)} — ${e.message.substring(0, 60)}`);
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`✅ Updated: ${success}/${videos.length}`);
  if (errors.length > 0) {
    console.log(`❌ Errors: ${errors.length}`);
    errors.forEach(e => console.log(`  - ${e.title.substring(0, 40)}: ${e.error.substring(0, 80)}`));
  }
}

updateAll();
