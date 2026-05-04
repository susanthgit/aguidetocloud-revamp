/**
 * Offline test harness for the wildcard subdomain middleware.
 *
 * Mocks Cloudflare's request/response env and exercises the routing logic
 * against the real cmd-index.json (loaded from the local Hugo build output).
 *
 * Usage:
 *   cd brainbar
 *   hugo --gc --minify              # produce public/cmd-index.json
 *   node scripts/test-middleware.mjs
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { onRequest } from '../functions/_middleware.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = path.resolve(__dirname, '..', 'public', 'cmd-index.json');

let indexJson;
try {
  indexJson = await readFile(INDEX_PATH, 'utf8');
} catch {
  console.error('!! cannot find', INDEX_PATH, '— run `hugo` first.');
  process.exit(1);
}

// Patch global fetch so the middleware can load the index.
globalThis.fetch = async (url) => {
  if (String(url).endsWith('/cmd-index.json')) {
    return new Response(indexJson, { status: 200, headers: { 'content-type': 'application/json' } });
  }
  return new Response('not found', { status: 404 });
};

function mockRequest(host, pathName = '/', search = '') {
  return new Request(`https://${host}${pathName}${search}`, {
    headers: { host },
  });
}

function mockContext(req) {
  return {
    request: req,
    next: async () => new Response('STATIC_PASSTHROUGH', { status: 200 }),
  };
}

async function run(label, host, expected) {
  const req = mockRequest(host);
  const ctx = mockContext(req);
  const res = await onRequest(ctx);

  const got = res.status === 302
    ? `302 → ${res.headers.get('Location')}`
    : `${res.status} → ${await res.text()}`;

  const pass = got === expected;
  const tag = pass ? '✅ pass' : '❌ FAIL';
  console.log(`${tag}  ${label}`);
  if (!pass) {
    console.log(`        host:     ${host}`);
    console.log(`        expected: ${expected}`);
    console.log(`        got:      ${got}`);
  }
  return pass;
}

console.log('// brainbar wildcard middleware · offline tests');
console.log('// ' + '─'.repeat(62));

const cases = [
  ['apex passes through',                     'cmd.aguidetocloud.com',                        '200 → STATIC_PASSTHROUGH'],
  ['random other host passes through',        'aguidetocloud.com',                            '200 → STATIC_PASSTHROUGH'],
  ['www subdomain → strip to apex',           'www.cmd.aguidetocloud.com',                    '302 → https://cmd.aguidetocloud.com/'],
  ['exact slug → canonical entry',            'mde.cmd.aguidetocloud.com',                    '302 → https://cmd.aguidetocloud.com/mde/'],
  ['abbreviation matches case-insensitive',   'MDE.cmd.aguidetocloud.com',                    '302 → https://cmd.aguidetocloud.com/mde/'],
  ['alias → canonical entry',                 'mdatp.cmd.aguidetocloud.com',                  '302 → https://cmd.aguidetocloud.com/mde/'],
  ['alias #2 → canonical (foundry)',          'foundry.cmd.aguidetocloud.com',                '302 → https://cmd.aguidetocloud.com/azure-ai-foundry/'],
  ['old-name slug → canonical (rebrand)',     'azure-ai-studio.cmd.aguidetocloud.com',        '302 → https://cmd.aguidetocloud.com/azure-ai-foundry/'],
  ['unknown prefix → fallback search',        'something.cmd.aguidetocloud.com',              '302 → https://cmd.aguidetocloud.com/?q=something'],
  ['portal slug → canonical entry',           'intune.cmd.aguidetocloud.com',                 '302 → https://cmd.aguidetocloud.com/intune/'],
  ['license slug',                            'm365-e3.cmd.aguidetocloud.com',                '302 → https://cmd.aguidetocloud.com/m365-e3/'],
  ['feature slug',                            'pim.cmd.aguidetocloud.com',                    '302 → https://cmd.aguidetocloud.com/pim/'],
  ['nested label rejected (passes through)',  'a.b.cmd.aguidetocloud.com',                    '200 → STATIC_PASSTHROUGH'],
];

let passed = 0;
let failed = 0;
for (const [label, host, expected] of cases) {
  const ok = await run(label, host, expected);
  if (ok) passed++; else failed++;
}

console.log('// ' + '─'.repeat(62));
if (failed === 0) {
  console.log(`PASS: ${passed}/${cases.length} cases.`);
  process.exit(0);
} else {
  console.log(`FAIL: ${failed} case(s) failed (${passed}/${cases.length} passed).`);
  process.exit(1);
}
