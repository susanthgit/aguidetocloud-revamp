// ═══════════════════════════════════════════════════════════════════════════
// cmd-pure.mjs · unit tests (Node built-in test runner · zero deps)
// ═══════════════════════════════════════════════════════════════════════════
//
// Run: node --test test/cmd-pure.test.mjs   (Node 22+ built-in test runner)
//
// Covers:
//   1. normaliseIncludes (polymorphic shape handling)
//   2. deriveIncludedIn (build-time inversion)
//   3. treeWalk (cycle-safe, depth-limited)
//   4. classifyFreshness (date buckets)
//   5. dispatchPattern (ordered matcher priority)
//   6. pipeJson / pipeCsv / pipeSort / pipeHead / pipeTail / pipeWc
// ═══════════════════════════════════════════════════════════════════════════

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  normaliseIncludes,
  deriveIncludedIn,
  treeWalk,
  classifyFreshness,
  daysAgo,
  buildMatcherRegistry,
  dispatchPattern,
  pipeJson,
  pipeCsv,
  pipeSort,
  pipeHead,
  pipeTail,
  pipeWc,
  csvEscape,
} from '../static/js/cmd-pure.mjs';

// ─── 1. normaliseIncludes ─────────────────────────────────────────────────

describe('normaliseIncludes', () => {
  test('empty/null input returns []', () => {
    assert.deepEqual(normaliseIncludes(null), []);
    assert.deepEqual(normaliseIncludes(undefined), []);
    assert.deepEqual(normaliseIncludes([]), []);
    assert.deepEqual(normaliseIncludes('not-array'), []);
  });

  test('string entries become {slug, note: ""}', () => {
    assert.deepEqual(
      normaliseIncludes(['mde', 'intune']),
      [{ slug: 'mde', note: '' }, { slug: 'intune', note: '' }],
    );
  });

  test('object entries pass through with normalised note', () => {
    assert.deepEqual(
      normaliseIncludes([{ slug: 'mde', note: 'Plan 2' }]),
      [{ slug: 'mde', note: 'Plan 2' }],
    );
  });

  test('mixed string and object entries normalise consistently', () => {
    assert.deepEqual(
      normaliseIncludes([{ slug: 'mde', note: 'Plan 2 only' }, 'intune']),
      [{ slug: 'mde', note: 'Plan 2 only' }, { slug: 'intune', note: '' }],
    );
  });

  test('invalid entries are filtered out', () => {
    assert.deepEqual(
      normaliseIncludes(['mde', null, 42, { note: 'no slug' }, { slug: '' }]),
      [{ slug: 'mde', note: '' }],
    );
  });

  test('object note=null/undefined coerces to empty string', () => {
    assert.deepEqual(
      normaliseIncludes([{ slug: 'mde', note: null }]),
      [{ slug: 'mde', note: '' }],
    );
  });
});

// ─── 2. deriveIncludedIn ──────────────────────────────────────────────────

describe('deriveIncludedIn', () => {
  test('builds inverse map from includes arrays', () => {
    const entries = [
      { slug: 'm365-e3', includes: [{ slug: 'mde', note: 'Plan 1' }, 'teams'] },
      { slug: 'm365-e5', includes: [{ slug: 'mde', note: 'Plan 2' }, 'teams', 'mdi'] },
      { slug: 'mde', includes: [] },
      { slug: 'teams', includes: [] },
      { slug: 'mdi', includes: [] },
    ];
    const inv = deriveIncludedIn(entries);
    assert.deepEqual(
      inv.get('mde'),
      [{ slug: 'm365-e3', note: 'Plan 1' }, { slug: 'm365-e5', note: 'Plan 2' }],
    );
    assert.deepEqual(
      inv.get('teams'),
      [{ slug: 'm365-e3', note: '' }, { slug: 'm365-e5', note: '' }],
    );
    assert.deepEqual(
      inv.get('mdi'),
      [{ slug: 'm365-e5', note: '' }],
    );
  });

  test('entries with no includes do not appear in any inverse list', () => {
    const entries = [
      { slug: 'standalone', includes: [] },
      { slug: 'orphan' },
    ];
    const inv = deriveIncludedIn(entries);
    assert.equal(inv.get('standalone'), undefined);
    assert.equal(inv.get('orphan'), undefined);
  });
});

// ─── 3. treeWalk ──────────────────────────────────────────────────────────

describe('treeWalk', () => {
  function makeFixture() {
    const entries = [
      { slug: 'm365-e5', includes: ['m365-e3', { slug: 'mde', note: 'Plan 2' }] },
      { slug: 'm365-e3', includes: ['mde', 'teams'] },
      { slug: 'mde', includes: [] },
      { slug: 'teams', includes: [] },
    ];
    const bySlug = new Map(entries.map(e => [e.slug, e]));
    const inv = deriveIncludedIn(entries);
    return { bySlug, inv };
  }

  test('default depth limits walk to root + 2 levels', () => {
    const { bySlug, inv } = makeFixture();
    const result = treeWalk('m365-e5', bySlug, inv);
    const depths = result.map(r => r.depth);
    assert.ok(depths.every(d => d <= 2), `depths within bound: ${depths.join(',')}`);
  });

  test('cycle suppression — visiting same slug twice flags cycled', () => {
    const entries = [
      { slug: 'a', includes: ['b'] },
      { slug: 'b', includes: ['a'] },
    ];
    const bySlug = new Map(entries.map(e => [e.slug, e]));
    const inv = deriveIncludedIn(entries);
    const result = treeWalk('a', bySlug, inv);
    const cycledNodes = result.filter(r => r.cycled);
    assert.ok(cycledNodes.length > 0, 'should detect cycle');
  });

  test('parents direction walks included_in', () => {
    const { bySlug, inv } = makeFixture();
    const result = treeWalk('mde', bySlug, inv, { direction: 'parents' });
    const slugs = result.map(r => r.slug);
    assert.ok(slugs.includes('m365-e5'), 'mde has parent m365-e5');
    assert.ok(slugs.includes('m365-e3'), 'mde has parent m365-e3');
  });

  test('non-existent slug returns just the root', () => {
    const { bySlug, inv } = makeFixture();
    const result = treeWalk('does-not-exist', bySlug, inv);
    assert.equal(result.length, 1);
    assert.equal(result[0].slug, 'does-not-exist');
  });
});

// ─── 4. classifyFreshness ─────────────────────────────────────────────────

describe('classifyFreshness', () => {
  test('today returns fresh', () => {
    assert.equal(classifyFreshness('2026-05-07', '2026-05-07'), 'fresh');
  });

  test('29 days ago returns fresh', () => {
    assert.equal(classifyFreshness('2026-04-08', '2026-05-07'), 'fresh');
  });

  test('30 days ago returns stale (boundary)', () => {
    assert.equal(classifyFreshness('2026-04-07', '2026-05-07'), 'stale');
  });

  test('60 days ago returns stale', () => {
    assert.equal(classifyFreshness('2026-03-08', '2026-05-07'), 'stale');
  });

  test('90 days ago returns stale (boundary)', () => {
    assert.equal(classifyFreshness('2026-02-06', '2026-05-07'), 'stale');
  });

  test('91 days ago returns ancient', () => {
    assert.equal(classifyFreshness('2026-02-05', '2026-05-07'), 'ancient');
  });

  test('future date returns unknown (never negative bucket)', () => {
    assert.equal(classifyFreshness('2026-06-01', '2026-05-07'), 'unknown');
  });

  test('malformed date returns unknown', () => {
    assert.equal(classifyFreshness('not-a-date', '2026-05-07'), 'unknown');
    assert.equal(classifyFreshness('', '2026-05-07'), 'unknown');
    assert.equal(classifyFreshness(null, '2026-05-07'), 'unknown');
  });

  test('daysAgo basic math', () => {
    assert.equal(daysAgo('2026-05-04', '2026-05-07'), 3);
    assert.equal(daysAgo('2026-05-07', '2026-05-07'), 0);
    assert.equal(daysAgo('2026-05-08', '2026-05-07'), -1);
  });
});

// ─── 5. Ordered matcher priority ──────────────────────────────────────────

describe('dispatchPattern', () => {
  const skus = {
    '06ebc4ee-1bb5-47dd-8120-11324bc54e06': 'm365-e5',
    '05e9a617-0261-4cee-bb44-138d3ef5d965': 'm365-e3',
  };
  const registry = buildMatcherRegistry({ skus });

  test('known SKU GUID resolves to sku, NOT generic guid', () => {
    const m = dispatchPattern('06ebc4ee-1bb5-47dd-8120-11324bc54e06', registry);
    assert.equal(m.kind, 'sku');
    assert.equal(m.slug, 'm365-e5');
  });

  test('unknown UUID falls through to generic guid', () => {
    const m = dispatchPattern('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', registry);
    assert.equal(m.kind, 'guid');
  });

  test('Azure resource ID parses as resource-id, NOT generic guid (despite containing UUID)', () => {
    const m = dispatchPattern(
      '/subscriptions/06ebc4ee-1bb5-47dd-8120-11324bc54e06/resourceGroups/rg-prod/providers/Microsoft.Web/sites/myapp',
      registry,
    );
    assert.equal(m.kind, 'resource-id');
  });

  test('Graph URL parses as graph', () => {
    const m = dispatchPattern('https://graph.microsoft.com/v1.0/users', registry);
    assert.equal(m.kind, 'graph');
  });

  test('MC ID parses as mc', () => {
    const m = dispatchPattern('MC823456', registry);
    assert.equal(m.kind, 'mc');
  });

  test('AADSTS still matches', () => {
    const m = dispatchPattern('AADSTS50058', registry);
    assert.equal(m.kind, 'aadsts');
  });

  test('HRESULT still matches', () => {
    const m = dispatchPattern('0xC0000005', registry);
    assert.equal(m.kind, 'hresult');
  });

  test('KB still matches', () => {
    const m = dispatchPattern('KB5028166', registry);
    assert.equal(m.kind, 'kb');
  });

  test('non-matching input returns null', () => {
    assert.equal(dispatchPattern('hello world', registry), null);
    assert.equal(dispatchPattern('', registry), null);
    assert.equal(dispatchPattern(null, registry), null);
  });
});

// ─── 6. Pipe transforms ───────────────────────────────────────────────────

describe('pipeJson', () => {
  test('serialises blocks to single dump block, strips html', () => {
    const blocks = [
      { type: 'man', text: 'mde', html: '<b>mde</b>', entry: { slug: 'mde', name: 'MDE' } },
      { type: 'plain', text: 'hello' },
    ];
    const out = pipeJson(blocks);
    assert.equal(out.length, 1);
    assert.equal(out[0].type, 'dump');
    const parsed = JSON.parse(out[0].text);
    assert.equal(parsed.length, 2);
    assert.equal(parsed[0].entry.slug, 'mde');
    assert.equal(parsed[0].html, undefined, 'html field should be stripped');
  });

  test('empty input returns dump block with empty array', () => {
    const out = pipeJson([]);
    assert.equal(out.length, 1);
    assert.deepEqual(JSON.parse(out[0].text), []);
  });
});

describe('pipeCsv + csvEscape', () => {
  test('cell with comma is quoted', () => {
    assert.equal(csvEscape('hello, world'), '"hello, world"');
  });

  test('cell with quote escapes via doubling', () => {
    assert.equal(csvEscape('say "hi"'), '"say ""hi"""');
  });

  test('formula prefix gets apostrophe', () => {
    assert.equal(csvEscape('=cmd|/c calc!A1'), "'=cmd|/c calc!A1");
    assert.equal(csvEscape('+1234'), "'+1234");
    assert.equal(csvEscape('-1234'), "'-1234");
    assert.equal(csvEscape('@mention'), "'@mention");
  });

  test('null/undefined become empty string', () => {
    assert.equal(csvEscape(null), '');
    assert.equal(csvEscape(undefined), '');
  });

  test('array joined with semicolons', () => {
    assert.equal(csvEscape(['a', 'b', 'c']), 'a;b;c');
  });

  test('man block uses entry-row schema', () => {
    const blocks = [
      {
        type: 'man',
        entry: {
          slug: 'mde',
          name: 'Microsoft Defender for Endpoint',
          kind: 'product',
          domain: 'security',
          status: 'ga',
          last_verified: '2026-05-04',
          url: '/mde/',
          plain_english: 'EDR for endpoints',
        },
      },
    ];
    const out = pipeCsv(blocks);
    const lines = out[0].text.split('\n');
    assert.equal(lines[0], 'type,slug,name,kind,domain,status,last_verified,url,plain_english');
    assert.ok(lines[1].startsWith('man,mde,'));
  });

  test('plain block falls back to type,text schema', () => {
    const out = pipeCsv([{ type: 'plain', text: 'hello' }]);
    const lines = out[0].text.split('\n');
    assert.equal(lines[0], 'type,text');
    assert.equal(lines[1], 'plain,hello');
  });
});

describe('pipeSort', () => {
  test('sorts data blocks by entry.slug, preserves chrome at top', () => {
    const blocks = [
      { type: 'heading', text: '// results' },
      { type: 'man', entry: { slug: 'mfa' } },
      { type: 'man', entry: { slug: 'autopilot' } },
      { type: 'man', entry: { slug: 'mde' } },
    ];
    const out = pipeSort(blocks);
    assert.equal(out[0].type, 'heading');
    assert.equal(out[1].entry.slug, 'autopilot');
    assert.equal(out[2].entry.slug, 'mde');
    assert.equal(out[3].entry.slug, 'mfa');
  });
});

describe('pipeHead / pipeTail', () => {
  test('pipeHead with N=2 returns first 2 data blocks + chrome at top', () => {
    const blocks = [
      { type: 'heading', text: 'h' },
      { type: 'plain', text: 'a' },
      { type: 'plain', text: 'b' },
      { type: 'plain', text: 'c' },
    ];
    const out = pipeHead(blocks, 2);
    assert.equal(out.length, 3);
    assert.equal(out[0].type, 'heading');
    assert.equal(out[1].text, 'a');
    assert.equal(out[2].text, 'b');
  });

  test('pipeTail with N=2 returns last 2 data blocks (no chrome)', () => {
    const blocks = [
      { type: 'heading', text: 'h' },
      { type: 'plain', text: 'a' },
      { type: 'plain', text: 'b' },
      { type: 'plain', text: 'c' },
    ];
    const out = pipeTail(blocks, 2);
    assert.equal(out.length, 2);
    assert.equal(out[0].text, 'b');
    assert.equal(out[1].text, 'c');
  });
});

describe('pipeWc', () => {
  test('counts blocks broken down by type', () => {
    const blocks = [
      { type: 'heading' },
      { type: 'man' },
      { type: 'man' },
      { type: 'plain' },
    ];
    const out = pipeWc(blocks);
    assert.equal(out.length, 1);
    assert.equal(out[0].type, 'dim');
    assert.match(out[0].text, /total: 4/);
    assert.match(out[0].text, /man: 2/);
  });
});
