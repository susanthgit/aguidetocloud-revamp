/**
 * GET /api/discussions
 * Fetches recent GitHub Discussions with comments (server-side, uses PAT).
 * Returns JSON array for the frontend accordion.
 */
const https = require('https');

module.exports = async function (context) {
  const pat = process.env.GITHUB_FEEDBACK_PAT;
  if (!pat) {
    context.res = { status: 500, body: { error: 'Not configured' } };
    return;
  }

  const query = `{
    repository(owner: "susanthgit", name: "aguidetocloud-feedback") {
      discussions(first: 15, orderBy: {field: CREATED_AT, direction: DESC}) {
        totalCount
        nodes {
          title url number createdAt
          category { name }
          body
          labels(first: 5) {
            nodes { name color }
          }
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
            labels(first: 5) {
              nodes { name color }
            }
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

    context.res = {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
      body: { discussions, totalCount, pinned },
    };
  } catch (err) {
    context.log.error('Error fetching discussions:', err.message);
    context.res = { status: 500, body: { error: 'Failed to fetch discussions' } };
  }
};

function graphql(pat, query) {
  const postData = JSON.stringify({ query });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Authorization': `bearer ${pat}`,
        'Content-Type': 'application/json',
        'User-Agent': 'aguidetocloud-feedback',
        'Content-Length': Buffer.byteLength(postData),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Failed to parse response')); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}
