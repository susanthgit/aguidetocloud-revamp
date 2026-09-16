import { chromium } from 'playwright';
import fs from 'fs';

const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });

const b = await chromium.connectOverCDP('http://127.0.0.1:9333');
const ctx = b.contexts()[0];
let p = ctx.pages()[0] || await ctx.newPage();

// Crisp wide capture: 1600x1000 @ 2x
const client = await ctx.newCDPSession(p);
await client.send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 2, mobile: false });

async function shot(name) {
  await p.waitForTimeout(2500);
  const f = `${OUT}/${name}.png`;
  await p.screenshot({ path: f });
  console.log('shot', name, '->', p.url().slice(0, 80));
}

// 1) Copilot landing
await p.goto('https://admin.microsoft.com/Adminportal/Home#/copilot', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => console.log('nav1', e.message.slice(0,60)));
await p.waitForTimeout(5000);
await shot('01-copilot-landing');

// Dump the visible nav/section labels so we can find Settings + Cost management without guessing
try {
  const labels = await p.evaluate(() => Array.from(document.querySelectorAll('a,button,[role=tab],[role=link],h1,h2,span'))
    .map(e => (e.innerText || '').trim())
    .filter(t => t && t.length < 40 && /setting|cost|cowork|billing|usage|discover|manage|agent/i.test(t))
    .slice(0, 40));
  console.log('LABELS:', JSON.stringify([...new Set(labels)]));
} catch (e) { console.log('labels err', e.message.slice(0,60)); }

await b.close();
