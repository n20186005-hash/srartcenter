import { defineMiddleware } from 'astro:middleware';
import { canonicalRedirect } from './lib/canonical';

/**
 * Two jobs run here, in this order:
 *
 * 1. URL canonicalisation — every production URL is redirected (301) to the one
 *    form declared in <link rel="canonical">, so the host, scheme and
 *    trailing-slash variants that Search Console listed separately collapse
 *    into a single URL. The rules live in `src/lib/canonical.ts`.
 * 2. Edge cache — the guide pages are rendered on demand because they carry a
 *    live weather block, so they are stored in the platform edge cache for a
 *    few minutes. The runtime keeps serving the cached copy while it
 *    revalidates in the background, which keeps both the time-to-first-byte and
 *    the number of upstream weather calls low.
 */
const EDGE_TTL_SECONDS = 900;
const CACHEABLE_PATHS = new Set(['/', '/en/', '/zh/']);

export const onRequest = defineMiddleware(async (context, next) => {
  const request = context.request;
  const url = new URL(request.url);

  if (request.method === 'GET' || request.method === 'HEAD') {
    const target = canonicalRedirect(request, url);
    if (target) return Response.redirect(target, 301);
  }

  if (request.method !== 'GET' || !CACHEABLE_PATHS.has(url.pathname)) {
    return next();
  }

  const edgeCache = (globalThis as any).caches?.default;
  if (!edgeCache) return next();

  try {
    const hit = await edgeCache.match(request);
    if (hit) return hit;
  } catch {
    // A cache lookup must never break the page.
  }

  const response = await next();

  try {
    if (response.status === 200) {
      const headers = new Headers(response.headers);
      headers.set('Cache-Control', `public, max-age=60, s-maxage=${EDGE_TTL_SECONDS}, stale-while-revalidate=86400`);
      const cacheable = new Response(response.body, { status: 200, statusText: response.statusText, headers });

      const waitUntil = (context.locals as any)?.runtime?.ctx?.waitUntil;
      if (typeof waitUntil === 'function') {
        waitUntil.call((context.locals as any).runtime.ctx, edgeCache.put(request, cacheable.clone()));
      } else {
        await edgeCache.put(request, cacheable.clone());
      }

      return cacheable;
    }
  } catch {
    // Caching is best effort: fall through and return the fresh response.
  }

  return response;
});
