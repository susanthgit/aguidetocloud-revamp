// Direct Cloudflare Worker deploy via REST API.
// Bypasses wrangler/workerd entirely (the local workerd binary is broken on
// this Windows ARM64 machine). Uploads the same bundle wrangler would.

import { readFileSync } from 'node:fs';

const TOKEN = process.argv[2];
const ACCOUNT_ID = process.argv[3];
const SCRIPT_NAME = 'brainbar-mcp';
const BUNDLE_PATH = 'dist/index.js';

if (!TOKEN || !ACCOUNT_ID) {
  console.error('usage: node deploy-via-api.mjs <api-token> <account-id>');
  process.exit(2);
}

const bundle = readFileSync(BUNDLE_PATH, 'utf-8');

// Metadata describing the Worker. Mirrors what wrangler.toml would generate.
const metadata = {
  main_module: 'index.js',
  compatibility_date: '2026-05-01',
  compatibility_flags: ['nodejs_compat'],
  bindings: [
    { type: 'ai', name: 'AI' },
  ],
};

// Build multipart/form-data body manually for full control over per-part
// Content-Type (Cloudflare requires application/javascript+module for ESM
// module files, application/json for metadata).
const boundary = '----CmdMcpDeploy' + Math.random().toString(36).slice(2);
const CRLF = '\r\n';

const parts = [
  `--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="metadata"; filename="metadata.json"${CRLF}` +
    `Content-Type: application/json${CRLF}${CRLF}` +
    JSON.stringify(metadata) + CRLF,
  `--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="index.js"; filename="index.js"${CRLF}` +
    `Content-Type: application/javascript+module${CRLF}${CRLF}` +
    bundle + CRLF,
  `--${boundary}--${CRLF}`,
];
const body = parts.join('');

const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/scripts/${SCRIPT_NAME}`;
console.log(`PUT ${url}`);
console.log(`bundle: ${bundle.length} bytes  ·  body: ${body.length} bytes`);

const resp = await fetch(url, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
  },
  body,
});

const text = await resp.text();
let parsed;
try { parsed = JSON.parse(text); } catch { parsed = null; }

console.log(`status: ${resp.status} ${resp.statusText}`);
if (parsed) {
  console.log('success:', parsed.success);
  if (parsed.errors && parsed.errors.length) {
    console.error('errors:', JSON.stringify(parsed.errors, null, 2));
  }
  if (parsed.messages && parsed.messages.length) {
    console.log('messages:', JSON.stringify(parsed.messages, null, 2));
  }
  if (parsed.result) {
    console.log('result.id:', parsed.result.id);
    console.log('result.created_on:', parsed.result.created_on);
    console.log('result.modified_on:', parsed.result.modified_on);
    if (parsed.result.bindings) {
      console.log('result.bindings:', JSON.stringify(parsed.result.bindings, null, 2));
    }
  }
} else {
  console.log('raw response:', text.slice(0, 1000));
}

process.exit(resp.ok && parsed && parsed.success ? 0 : 1);
