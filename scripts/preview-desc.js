const fs = require('fs');
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

// Preview 3 videos
const samples = [0, 10, 50].filter(i => i < videos.length);
for (const i of samples) {
  const v = videos[i];
  const newDesc = cleanDescription(v.description);
  console.log('=== ' + v.title.substring(0, 65) + ' ===');
  console.log('Old: ' + v.description.length + ' chars -> New: ' + newDesc.length + ' chars');
  console.log('--- LAST 12 LINES ---');
  console.log(newDesc.split('\n').slice(-12).join('\n'));
  console.log('');
}

// Check pattern match coverage
let matched = 0;
let unmatched = [];
for (const v of videos) {
  let found = false;
  for (const p of footerPatterns) {
    if (p.test(v.description)) { found = true; break; }
  }
  if (found) matched++;
  else unmatched.push(v.title.substring(0, 55));
}
console.log('Footer matched: ' + matched + '/' + videos.length);
if (unmatched.length > 0) {
  console.log('No match (' + unmatched.length + '):');
  unmatched.forEach(t => console.log('  - ' + t));
}
