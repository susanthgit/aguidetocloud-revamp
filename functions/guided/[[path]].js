// Pages Function: proxy /guided/* to the Astro Guided platform
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/^\/guided/, '') || '/';
  const target = `https://guided-49q.pages.dev/guided${path}${url.search}`;

  const response = await fetch(target, {
    method: context.request.method,
    headers: context.request.headers,
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
