/**
 * GET /api/discussions — Cloudflare Pages Function
 * Fetches recent GitHub Discussions with comments (server-side, uses PAT).
 * Ported from Azure Function as part of Cloudflare migration.
 *
 * Environment variables (set in CF Pages dashboard):
 *   GITHUB_FEEDBACK_PAT — GitHub PAT with discussions:write scope
 */

async function graphql(pat, query) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${pat}`,
      'Content-Type': 'application/json',
      'User-Agent': 'aguidetocloud-feedback',
    },
    body: JSON.stringify({ query }),
  });

  // Without these two guards a 401 / 403 / rate-limit answer from GitHub falls
  // through as "no discussions", so the board renders empty and looks like
  // nobody has ever asked a question. Fail loudly instead.
  if (!res.ok) {
    throw new Error(`GitHub API returned HTTP ${res.status}`);
  }
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`GitHub GraphQL error: ${json.errors[0].message}`);
  }
  return json;
}

// bodyHTML is requested alongside body, so every post is carried twice. Real
// posts are small — the largest on the board today is ~10 KB of HTML — but a
// GitHub comment can be 65,536 characters, and 50 threads x 5 comments of those
// would be a payload no browser wants. Anything wildly larger than a real post
// is dropped here; the client already falls back to rendering the Markdown when
// bodyHTML is missing, so nothing disappears from the page.
//
// A per-field cap alone is not enough: 300 posts just under it still add up. So
// there is also an aggregate budget, spent in the order the page renders. Once
// it is gone, the remaining bodies ship as Markdown only.
// NOTE: this bounds what we SEND. It cannot bound what we RECEIVE — the whole
// GitHub response is buffered by res.json() before we see it. Fixing that means
// not requesting bodyHTML for every post up front, which is an endpoint design
// change (see the morning report, 26 Aug 2026).
const MAX_BODY_HTML = 40000;
const MAX_TOTAL_HTML = 400000;
// The Markdown `body` needs its own budget. It is what the client falls back to
// when bodyHTML is missing or DOMPurify fails to load, so it cannot simply be
// dropped when the HTML is — but capping only the HTML left the raw Markdown
// completely unbounded: 50 threads x 5 comments at GitHub's 65,536-character
// limit still serialized a ~20 MB response with every bodyHTML already blanked
// (measured 26 Aug 2026). Markdown is the cheaper of the two to render, so it
// gets the larger allowance.
const MAX_BODY_MD = 65536;
const MAX_TOTAL_MD = 600000;
// Exported ONLY so the QA suite can exercise the real function instead of a
// copy. Cloudflare Pages calls onRequestGet; extra named exports are inert.
// A test that re-implements the thing it tests passes while the shipped code
// is broken — that exact drift was caught by mutation testing, 26 Aug 2026.
// Exported for the same reason as capAll: a guard that greps for a variable
// name passes when the behaviour is deleted. Gate B round 4 proved exactly that
// — replacing the filter with `const uniqueDiscussions = discussions` left both
// dedupe assertions green. These are testable behaviour, not searchable syntax.
export function dedupeByNumber(list) {
  const seen = new Set();
  return (list || []).filter(d => {
    if (!d || seen.has(d.number)) return false;
    seen.add(d.number);
    return true;
  });
}

// A pinned discussion recent enough to also appear in the main list was being
// carried twice: capAll() charged the budget for both copies, and the client
// then discarded the second one. That spends the HTML budget on markup nobody
// ever sees, pushing a later real thread onto the Markdown fallback.
export function dropPinned(pinned, discussions) {
  const pinnedNumbers = new Set((pinned || []).map(d => d && d.number));
  return (discussions || []).filter(d => d && !pinnedNumbers.has(d.number));
}

export function capAll(lists) {
  let budget = MAX_TOTAL_HTML;
  let mdBudget = MAX_TOTAL_MD;
  const cap = (o) => {
    if (!o) return;
    if (typeof o.bodyHTML === 'string') {
      if (o.bodyHTML.length > MAX_BODY_HTML || o.bodyHTML.length > budget) o.bodyHTML = '';
      else budget -= o.bodyHTML.length;
    }
    if (typeof o.body === 'string') {
      // Truncate rather than blank: a trimmed post still says something, and an
      // empty one with an empty bodyHTML would render as a blank card.
      if (o.body.length > MAX_BODY_MD) o.body = o.body.slice(0, MAX_BODY_MD);
      if (o.body.length > mdBudget) o.body = o.body.slice(0, Math.max(0, mdBudget));
      mdBudget -= o.body.length;
    }
  };
  for (const list of lists) {
    for (const d of list || []) {
      cap(d);
      for (const c of d?.comments?.nodes || []) cap(c);
    }
  }
}

export async function onRequestGet(context) {
  const { env, request } = context;

  // Origin check
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = ['https://www.aguidetocloud.com', 'https://aguidetocloud.com'];
  const isLocalhost = origin.startsWith('http://localhost');

  const pat = env.GITHUB_FEEDBACK_PAT;

  if (!pat) {
    return new Response(JSON.stringify({ error: 'Not configured' }), { status: 500 });
  }

  // Curated on-site pins — surfaced with the 📌 badge at the top of the Ask
  // section, independent of GitHub's own pinned discussions. Edit this list to
  // pin/unpin (by discussion number); order here is the display order.
  // Pinning is off for now (revisit later). Add numbers here to re-pin, e.g.
  // [41]; order in this list is the display order.
  const FEATURED = [];
  const featuredQuery = FEATURED.map((n, i) => `
      f${i}: discussion(number: ${n}) {
        title url number createdAt
        category { name }
        body
        bodyHTML
        labels(first: 5) { nodes { name color } }
        comments(first: 5) { totalCount nodes { body bodyHTML createdAt author { login } } }
      }`).join('');

  const query = `{
    repository(owner: "susanthgit", name: "aguidetocloud-feedback") {${featuredQuery}
      discussions(first: 50, orderBy: {field: CREATED_AT, direction: DESC}) {
        totalCount
        pageInfo { hasNextPage }
        nodes {
          title url number createdAt
          category { name }
          body
          bodyHTML
          labels(first: 5) { nodes { name color } }
          comments(first: 5) {
            totalCount
            nodes { body bodyHTML createdAt author { login } }
          }
        }
      }
      pinnedDiscussions(first: 5) {
        nodes {
          discussion {
            title url number createdAt
            category { name }
            body
            bodyHTML
            labels(first: 5) { nodes { name color } }
            comments(first: 5) {
              totalCount
              nodes { body bodyHTML createdAt author { login } }
            }
          }
        }
      }
    }
  }`;

  try {
    const result = await graphql(pat, query);
    const discussions = result.data?.repository?.discussions?.nodes || [];
    const totalCount = result.data?.repository?.discussions?.totalCount || 0;
    // True only if the board ever outgrows the 50-thread fetch. Surfaces a
    // "browse the rest on GitHub" link rather than silently hiding threads
    // again — which is the bug this whole change exists to kill.
    const hasMore = result.data?.repository?.discussions?.pageInfo?.hasNextPage || false;
    const repo = result.data?.repository || {};
    const ghPinned = (repo.pinnedDiscussions?.nodes || [])
      .map(n => n.discussion)
      .filter(Boolean);
    // Curated featured first, then GitHub-pinned — deduped by number.
    const featured = FEATURED.map((_, i) => repo['f' + i]).filter(Boolean);
    const pinned = dedupeByNumber([...featured, ...ghPinned]);
    const uniqueDiscussions = dropPinned(pinned, discussions);

    // Pinned renders first on the page, so it spends the HTML budget first.
    capAll([pinned, uniqueDiscussions]);
    return new Response(JSON.stringify({
      discussions: uniqueDiscussions, totalCount, hasMore, pinned
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'Vary': 'Origin',
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : (isLocalhost ? origin : 'https://www.aguidetocloud.com'),
      },
    });
  } catch (err) {
    console.error('Error fetching discussions:', err.message);
    return new Response(JSON.stringify({ error: 'Failed to fetch discussions' }), { status: 500 });
  }
}
