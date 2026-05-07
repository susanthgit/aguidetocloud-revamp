/**
 * Offline tests for the cmd MCP server.
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

async function rpc(method, params, id = 1, env = {}) {
  const req = new Request('https://mcp.local/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  });
  const res = await worker.fetch(req, env);
  if (res.status === 202) return null;
  return await res.json();
}

test('GET / serves homepage', async () => {
  const req = new Request('https://mcp.local/');
  const res = await worker.fetch(req, {});
  assert.equal(res.status, 200);
  const body = await res.text();
  assert.match(body, /brainbar-mcp/);
});

test('GET /health is OK', async () => {
  const req = new Request('https://mcp.local/health');
  const res = await worker.fetch(req, {});
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

test('tools/list returns 4 tools', async () => {
  const r = await rpc('tools/list');
  assert.equal(r.result.tools.length, 4);
  const names = r.result.tools.map(t => t.name);
  assert.deepEqual(names.sort(), ['cmd_ask', 'cmd_get', 'cmd_list_kinds', 'cmd_search']);
});

test('cmd_search returns exact slug match (tier 1)', async () => {
  const r = await rpc('tools/call', { name: 'cmd_search', arguments: { query: 'mde' } });
  const hits = JSON.parse(r.result.content[0].text);
  assert.ok(Array.isArray(hits));
  assert.ok(hits.length >= 1);
  assert.equal(hits[0].slug, 'mde');
  assert.equal(hits[0].tier, 1);
  assert.equal(hits[0].match_reason, 'exact slug');
});

test('cmd_search resolves alias (tier 3) — mdatp → mde', async () => {
  const r = await rpc('tools/call', { name: 'cmd_search', arguments: { query: 'mdatp' } });
  const hits = JSON.parse(r.result.content[0].text);
  assert.equal(hits[0].slug, 'mde');
  assert.equal(hits[0].tier, 3);
});

test('cmd_search resolves old name (tier 4) — azure-ai-studio → foundry', async () => {
  const r = await rpc('tools/call', { name: 'cmd_search', arguments: { query: 'azure-ai-studio' } });
  const hits = JSON.parse(r.result.content[0].text);
  assert.equal(hits[0].slug, 'azure-ai-foundry');
  assert.equal(hits[0].tier, 4);
});

test('cmd_search returns substring matches', async () => {
  const r = await rpc('tools/call', { name: 'cmd_search', arguments: { query: 'defender' } });
  const hits = JSON.parse(r.result.content[0].text);
  assert.ok(hits.length >= 3);
  assert.equal(hits[0].slug, 'defender');
});

test('cmd_get returns full record', async () => {
  const r = await rpc('tools/call', { name: 'cmd_get', arguments: { slug: 'mde' } });
  const entry = JSON.parse(r.result.content[0].text);
  assert.equal(entry.slug, 'mde');
  assert.equal(entry.kind, 'product');
  assert.equal(entry.domain, 'security');
});

test('cmd_get follows abbreviation', async () => {
  const r = await rpc('tools/call', { name: 'cmd_get', arguments: { slug: 'MDE' } });
  const entry = JSON.parse(r.result.content[0].text);
  assert.equal(entry.slug, 'mde');
});

test('cmd_get returns error for unknown slug', async () => {
  const r = await rpc('tools/call', { name: 'cmd_get', arguments: { slug: 'nonexistent' } });
  const out = JSON.parse(r.result.content[0].text);
  assert.match(out.error, /no entry/);
});

test('cmd_list_kinds returns groupings', async () => {
  const r = await rpc('tools/call', { name: 'cmd_list_kinds', arguments: {} });
  const groups = JSON.parse(r.result.content[0].text);
  assert.ok(Array.isArray(groups));
  const kinds = groups.map(g => g.kind);
  assert.ok(kinds.includes('product'));
  assert.ok(kinds.includes('license'));
  assert.ok(kinds.includes('disambiguation'));
});

test('cmd_list_kinds filters by kind', async () => {
  const r = await rpc('tools/call', { name: 'cmd_list_kinds', arguments: { kind: 'license' } });
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

// ─── cmd_ask tests (Cloudflare Workers AI integration) ─────────────────────

test('cmd_ask without AI binding returns binding-required message', async () => {
  // env without AI — simulates undeployed / misconfigured state
  const r = await rpc('tools/call', { name: 'cmd_ask', arguments: { question: 'what is mde?' } }, 1, {});
  assert.ok(r.result.content[0].text);
  const payload = JSON.parse(r.result.content[0].text);
  assert.match(payload.answer, /Cloudflare AI binding/);
});

test('cmd_ask with mock AI returns grounded answer with citations', async () => {
  const mockAi = {
    async run(model, input) {
      // Mock: return a canned answer that cites mde and m365-e5
      return { response: 'MDE [mde] is included in M365 E5 [m365-e5]. Plan 1 is preventative; Plan 2 adds full EDR.' };
    },
  };
  const r = await rpc('tools/call', { name: 'cmd_ask', arguments: { question: 'what is mde and is it in e5?' } }, 1, { AI: mockAi });
  assert.ok(r.result.content[0].text);
  const payload = JSON.parse(r.result.content[0].text);
  assert.match(payload.answer, /MDE/);
  assert.deepEqual(payload.cited_slugs.sort(), ['m365-e5', 'mde']);
  assert.equal(payload.model, '@cf/meta/llama-3.1-8b-instruct');
  assert.ok(Array.isArray(payload.entries_used));
});

test('cmd_ask: empty question returns usage error', async () => {
  const r = await rpc('tools/call', { name: 'cmd_ask', arguments: { question: '' } }, 1, { AI: { async run() { return { response: '' }; } } });
  const payload = JSON.parse(r.result.content[0].text);
  assert.match(payload.answer, /usage:/);
});

test('POST /ask HTTP endpoint works directly', async () => {
  const mockAi = {
    async run() { return { response: 'Conditional Access [conditional-access] requires Entra ID P1 [entra-p1].' }; },
  };
  const req = new Request('https://mcp.local/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'what license do I need for conditional access?' }),
  });
  const res = await worker.fetch(req, { AI: mockAi });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.match(body.answer, /Conditional Access/);
  assert.ok(body.cited_slugs.length >= 1);
});

test('POST /ask without question returns 400', async () => {
  const req = new Request('https://mcp.local/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const res = await worker.fetch(req, {});
  assert.equal(res.status, 400);
});
