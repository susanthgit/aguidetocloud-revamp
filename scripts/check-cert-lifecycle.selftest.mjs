import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import TOML from '@iarna/toml';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const gate = join(root, 'scripts', 'check-cert-lifecycle.mjs');
const index = join(root, 'public', 'cert-compass', 'index.html');
const source = readFileSync(gate, 'utf8')
  .replace(/^import [^\n]*\n/gm, '')
  .replaceAll('import.meta.url', JSON.stringify(pathToFileURL(gate).href));

function run(overrides = new Map()) {
  let exit = 0;
  const messages = [];
  const stop = {};
  try {
    runInNewContext(source, {
      readFileSync: (file, encoding) => overrides.has(file) ? overrides.get(file) : readFileSync(file, encoding),
      readdirSync, existsSync, join, dirname, basename, fileURLToPath, runInNewContext, TOML,
      console: { log: message => messages.push(message), error: message => messages.push(message) },
      process: { exit: code => { exit = code; throw stop; } },
    }, { timeout: 30000 });
  } catch (error) {
    if (error !== stop) throw error;
  }
  return { exit, messages: messages.join('\n') };
}

function mutatePayload(change) {
  const html = readFileSync(index, 'utf8');
  return html.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script\s*>)/gi, (full, open, body, close) => {
    if (!/^\s*window\.__compass\w+\s*=/.test(body)) return full;
    const data = Object.create(null);
    data.window = data;
    runInNewContext(body, data, { timeout: 1000 });
    change(data);
    return open + Object.entries(data)
      .filter(([key]) => key.startsWith('__compass'))
      .map(([key, value]) => `window.${key}=${JSON.stringify(value)};`).join('\n') + close;
  });
}

assert.equal(run().exit, 0, 'baseline lifecycle gate must pass before negative controls');
const cases = [
  ['stale built pricing', data => {
    data.__compassCerts.find(cert => cert.id === 'gcp-associate-cloud-engineer').fee_usd = 200;
  }, 'built Cert Compass Certs differs from its lifecycle-filtered source'],
  ['empty Microsoft AI matches', data => {
    data.__compassGroups.find(group => group.id === 'ai-engineering').cert_ids =
      data.__compassGroups.find(group => group.id === 'ai-engineering').cert_ids.filter(id => !id.startsWith('ms-'));
  }, 'ai-engineering: missing current curated choice'],
  ['missing current catalog entry', data => {
    data.__compassCerts = data.__compassCerts.filter(cert => cert.id !== 'ms-ai-901');
  }, 'ai-fundamentals: missing current curated choice ms-ai-901'],
  ['empty Microsoft career path', data => {
    data.__compassPaths.find(path => path.id === 'ai-ml-engineer').recommended_order =
      data.__compassPaths.find(path => path.id === 'ai-ml-engineer').recommended_order.filter(order => order.provider !== 'microsoft');
  }, 'ai-ml-engineer: missing current curated career choice'],
  ['retired recommendation', data => {
    data.__compassGroups[0].cert_ids.push('aws-database-specialty');
  }, 'remains in the built Cert Compass Groups data'],
];
for (const [label, mutation, expected] of cases) {
  // Isolated in-memory synthetic regressions; never written to site data.
  const result = run(new Map([[index, mutatePayload(mutation)]]));
  assert.equal(result.exit, 1, label);
  assert(result.messages.includes(expected), `${label}: ${result.messages}`);
  console.log(`PASS: gate rejects ${label}`);
}
const catalogFile = join(root, 'data', 'cert_compass', 'certifications.toml');
const catalog = readFileSync(catalogFile, 'utf8');
const dangling = run(new Map([[catalogFile, catalog.replace('match_group = "ai-fundamentals"', 'match_group = "unknown-group"')]]));
assert.equal(dangling.exit, 1);
assert(dangling.messages.includes('declared match group does not include this current certification'));
const trackerPage = join(root, 'public', 'cert-tracker', 'ai-103', 'index.html');
const duration = run(new Map([[trackerPage, readFileSync(trackerPage, 'utf8').replaceAll('estimated lesson reading', 'study time')]]));
assert.equal(duration.exit, 1);
assert(duration.messages.includes('lesson-reading duration is missing or mislabelled'));
console.log('PASS: gate rejects dangling groups and ambiguous lesson time; baseline remains unchanged.');
