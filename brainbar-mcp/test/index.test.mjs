/**
 * Offline tests for the Brain Bar MCP server.
 *
 * Mocks Cloudflare's runtime (the index fetch is patched to read a local
 * copy of brainbar/public/cmd-index.json) and exercises the JSON-RPC
 * dispatch end to end via the Worker default export's fetch() handler.
 *
 * Usage:
 *   cd brainbar-mcp
 *   npm test
 *
 * Requires Node 22.6+ for TypeScript stripping (--experimental-strip-types).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Patch global fetch BEFORE importing the worker, so module-scoped cache
// inside the worker hits our local index.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexPath = path.resolve(__dirname, '..', '..', 'brainbar', 'public', 'cmd-index.json');
const indexJson = await readFile(indexPath, 'utf8');

const realFetch = globalThis.fetch;
globalThis.fetch = async (url) => {
  if (String(url).includes('cmd-index.json')) {
    return new Response(indexJson, {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }
  return realFetch ? realFetch(url) : new Response('not mocked', { status: 404 });
};

const workerModule = await import('../src/index.ts');
const worker = workerModule.default;

async function rpc(method, params, id = 1) {
  const req = new Request('https://mcp.local/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  });
  const res = await worker.fetch(req);
  if (res.status === 202) return null;
  return await res.json();
}

test('GET / serves homepage', async () => {
  const req = new Request('https://mcp.local/');
  const res = await worker.fetch(req);
  assert.equal(res.status, 200);
  const body = await res.text();
  assert.match(body, /brainbar-mcp/);
});

test('GET /health is OK', async () => {
  const req = new Request('https://mcp.local/health');
  const res = await worker.fetch(req);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.server, 'brainbar');
});

test('initialize returns server capabilities', async () => {
  const r = await rpc('initialize', { protocolVersion: '2025-03-26' });
  assert.equal(r.result.serverInfo.name, 'brainbar');
  assert.ok(r.result.capabilities.tools);
});

test('tools/list returns 3 tools', async () => {
  const r = await rpc('tools/list');
  assert.equal(r.result.tools.length, 3);
  const names = r.result.tools.map(t => t.name);
  assert.deepEqual(names.sort(), ['brainbar_get', 'brainbar_list_kinds', 'brainbar_search']);
});

test('brainbar_search returns exact slug match (tier 1)', async () => {
  const r = await rpc('tools/call', { name: 'brainbar_search', arguments: { query: 'mde' } });
  const hits = JSON.parse(r.result.content[0].text);
  assert.ok(Array.isArray(hits));
  assert.ok(hits.length >= 1);
  assert.equal(hits[0].slug, 'mde');
  assert.equal(hits[0].tier, 1);
  assert.equal(hits[0].match_reason, 'exact slug');
});

test('brainbar_search resolves alias (tier 3) — mdatp → mde', async () => {
  const r = await rpc('tools/call', { name: 'brainbar_search', arguments: { query: 'mdatp' } });
  const hits = JSON.parse(r.result.content[0].text);
  assert.equal(hits[0].slug, 'mde');
  assert.equal(hits[0].tier, 3);
});

test('brainbar_search resolves old name (tier 4) — azure-ai-studio → foundry', async () => {
  const r = await rpc('tools/call', { name: 'brainbar_search', arguments: { query: 'azure-ai-studio' } });
  const hits = JSON.parse(r.result.content[0].text);
  assert.equal(hits[0].slug, 'azure-ai-foundry');
  assert.equal(hits[0].tier, 4);
});

test('brainbar_search returns substring matches', async () => {
  const r = await rpc('tools/call', { name: 'brainbar_search', arguments: { query: 'defender' } });
  const hits = JSON.parse(r.result.content[0].text);
  assert.ok(hits.length >= 3);
  assert.equal(hits[0].slug, 'defender');
});

test('brainbar_get returns full record', async () => {
  const r = await rpc('tools/call', { name: 'brainbar_get', arguments: { slug: 'mde' } });
  const entry = JSON.parse(r.result.content[0].text);
  assert.equal(entry.slug, 'mde');
  assert.equal(entry.kind, 'product');
  assert.equal(entry.domain, 'security');
});

test('brainbar_get follows abbreviation', async () => {
  const r = await rpc('tools/call', { name: 'brainbar_get', arguments: { slug: 'MDE' } });
  const entry = JSON.parse(r.result.content[0].text);
  assert.equal(entry.slug, 'mde');
});

test('brainbar_get returns error for unknown slug', async () => {
  const r = await rpc('tools/call', { name: 'brainbar_get', arguments: { slug: 'nonexistent' } });
  const out = JSON.parse(r.result.content[0].text);
  assert.match(out.error, /no entry/);
});

test('brainbar_list_kinds returns groupings', async () => {
  const r = await rpc('tools/call', { name: 'brainbar_list_kinds', arguments: {} });
  const groups = JSON.parse(r.result.content[0].text);
  assert.ok(Array.isArray(groups));
  const kinds = groups.map(g => g.kind);
  assert.ok(kinds.includes('product'));
  assert.ok(kinds.includes('license'));
  assert.ok(kinds.includes('disambiguation'));
});

test('brainbar_list_kinds filters by kind', async () => {
  const r = await rpc('tools/call', { name: 'brainbar_list_kinds', arguments: { kind: 'license' } });
  const groups = JSON.parse(r.result.content[0].text);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].kind, 'license');
  assert.ok(groups[0].count >= 5);
});

test('unknown tool returns JSON-RPC error', async () => {
  const r = await rpc('tools/call', { name: 'nonexistent_tool', arguments: {} });
  assert.ok(r.error);
  assert.equal(r.error.code, -32601);
});

test('unknown method returns JSON-RPC error', async () => {
  const r = await rpc('not/a/method', {});
  assert.ok(r.error);
  assert.equal(r.error.code, -32601);
});
