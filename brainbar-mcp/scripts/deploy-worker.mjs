// scripts/deploy-worker.mjs
//
// Direct API deploy for a single-file Cloudflare Worker (no wrangler).
// Compiles TypeScript with esbuild before upload (CF Workers API only
// accepts JavaScript modules — wrangler's local transpile, replicated).

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import esbuild from 'esbuild';

const projectDir = resolve(process.argv[2] ?? process.cwd());

const TOKEN      = process.env.CLOUDFLARE_API_TOKEN;
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!TOKEN || !ACCOUNT_ID) {
  console.error('CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID required');
  process.exit(1);
}

function parseToml(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line || line.startsWith('[')) continue;
    const m = line.match(/^([a-zA-Z_][a-zA-Z0-9_-]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) out[key] = val.slice(1, -1);
    else if (val.startsWith('[') && val.endsWith(']'))
      out[key] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
    else if (val === 'true' || val === 'false') out[key] = val === 'true';
    else if (/^-?\d+$/.test(val)) out[key] = parseInt(val, 10);
    else out[key] = val.replace(/^"|"$/g, '');
  }
  return out;
}

const wranglerPath = join(projectDir, 'wrangler.toml');
if (!existsSync(wranglerPath)) { console.error(`✗ no wrangler.toml at ${wranglerPath}`); process.exit(1); }
const cfg = parseToml(readFileSync(wranglerPath, 'utf8'));

const SCRIPT_NAME = cfg.name;
const MAIN_PATH   = join(projectDir, cfg.main);
const COMPAT_DATE = cfg.compatibility_date ?? '2025-04-01';
const COMPAT_FLAGS = Array.isArray(cfg.compatibility_flags) ? cfg.compatibility_flags : [];

if (!SCRIPT_NAME) { console.error('✗ wrangler.toml: name required'); process.exit(1); }
if (!cfg.main || !existsSync(MAIN_PATH)) { console.error(`✗ main entry not found: ${MAIN_PATH}`); process.exit(1); }

console.log(`→ Deploying Worker '${SCRIPT_NAME}' from ${MAIN_PATH}`);
console.log(`  compatibility_date: ${COMPAT_DATE}`);
console.log(`  compatibility_flags: ${COMPAT_FLAGS.join(', ') || '(none)'}`);

// Compile TS → JS (or pass JS through) via esbuild
const buildResult = await esbuild.build({
  entryPoints: [MAIN_PATH],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  platform: 'browser',
  write: false,
  conditions: ['workerd', 'worker', 'browser'],
  external: ['cloudflare:workers', 'cloudflare:email', 'cloudflare:test'],
});
const scriptSource = buildResult.outputFiles[0].text;
const moduleName = 'index.js';
const contentType = 'application/javascript+module';

const metadata = {
  main_module: moduleName,
  compatibility_date: COMPAT_DATE,
  compatibility_flags: COMPAT_FLAGS,
};

const formData = new FormData();
formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }), 'metadata.json');
formData.append(moduleName, new Blob([scriptSource], { type: contentType }), moduleName);

const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/scripts/${SCRIPT_NAME}`;
const r = await fetch(url, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${TOKEN}` },
  body: formData,
});
const text = await r.text();
let body;
try { body = JSON.parse(text); } catch { body = { raw: text }; }

if (!r.ok || body.success === false) {
  console.error('✗ Worker upload failed:');
  console.error(JSON.stringify(body, null, 2));
  process.exit(1);
}

console.log('');
console.log(`🎉 Worker deployed: ${SCRIPT_NAME}`);

// Enable workers.dev subdomain
const subResp = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/scripts/${SCRIPT_NAME}/subdomain`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled: true }),
  }
);
const subBody = await subResp.json().catch(() => ({}));
if (subBody.success !== false) {
  const sdResp = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/subdomain`,
    { headers: { 'Authorization': `Bearer ${TOKEN}` } }
  );
  const sdBody = await sdResp.json();
  const subdomain = sdBody.result?.subdomain;
  if (subdomain) {
    console.log(`   workers.dev URL: https://${SCRIPT_NAME}.${subdomain}.workers.dev/`);
  }
} else {
  console.log(`   ⚠ couldn't enable subdomain:`, JSON.stringify(subBody.errors));
}

