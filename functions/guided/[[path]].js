// Pages Function: proxy /guided/* to the Astro Guided platform
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/^\/guided/, '') || '/';
  const target = `https://guided-49q.pages.dev${path}${url.search}`;

  const response = await fetch(target, {
    method: context.request.method,
    headers: context.request.headers,
  });

  // Pass through the response with correct headers
  const newHeaders = new Headers(response.headers);
  newHeaders.delete('x-frame-options');
  
  return new Response(response.body, {
    status: response.status,
    headers: newHeaders,
  });
}
