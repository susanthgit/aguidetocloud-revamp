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
  return res.json();
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

  const query = `{
    repository(owner: "susanthgit", name: "aguidetocloud-feedback") {
      discussions(first: 15, orderBy: {field: CREATED_AT, direction: DESC}) {
        totalCount
        nodes {
          title url number createdAt
          category { name }
          body
          labels(first: 5) { nodes { name color } }
          comments(first: 5) {
            totalCount
            nodes { body createdAt author { login } }
          }
        }
      }
      pinnedDiscussions(first: 5) {
        nodes {
          discussion {
            title url number createdAt
            category { name }
            body
            labels(first: 5) { nodes { name color } }
            comments(first: 5) {
              totalCount
              nodes { body createdAt author { login } }
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
    const pinned = (result.data?.repository?.pinnedDiscussions?.nodes || [])
      .map(n => n.discussion)
      .filter(Boolean);

    return new Response(JSON.stringify({ discussions, totalCount, pinned }), {
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
