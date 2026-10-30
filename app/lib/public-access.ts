// Only the public catalogue and anonymous submission routes use this policy.
// Admin routes retain their same-origin checks and authenticated allowlist.
const PUBLIC_FRONTEND_ORIGINS = new Set(['https://hinm9dy.github.io']);

export function publicOriginAllowed(request: Request) {
  const origin = request.headers.get('origin');
  return origin === new URL(request.url).origin || (origin !== null && PUBLIC_FRONTEND_ORIGINS.has(origin));
}

export function publicResponse(request: Request, response: Response) {
  const origin = request.headers.get('origin');
  if (origin && PUBLIC_FRONTEND_ORIGINS.has(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.append('Vary', 'Origin');
  }
  return response;
}

export function publicPreflight(request: Request, method: 'GET' | 'POST') {
  const requestedMethod = request.headers.get('access-control-request-method');
  const requestedHeaders = request.headers.get('access-control-request-headers')?.split(',').map(h => h.trim().toLowerCase()) ?? [];
  if (!publicOriginAllowed(request) || (requestedMethod && requestedMethod !== method) || requestedHeaders.some(h => h !== 'content-type')) {
    return new Response(null, { status: 403 });
  }
  return publicResponse(request, new Response(null, { status: 204, headers: {
    'Access-Control-Allow-Methods': `${method}, OPTIONS`,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '600',
  } }));
}
