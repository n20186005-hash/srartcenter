import { siteConfig } from '../config/site';

/**
 * URL canonicalisation rules for the guide.
 *
 * Search Console reported the same pages indexed under several spellings of the
 * same URL — "srartcenter.com" and "www.srartcenter.com", http and https, and
 * legal pages requested both with and without a trailing slash. Every variant
 * is redirected (301) to the single form declared in <link rel="canonical">.
 *
 * Kept as a pure function (no Astro imports) so it can be reasoned about and
 * tested on its own.
 */

// Hosts served by this Worker in production. Preview deployments
// (*.workers.dev) and localhost are deliberately left alone so they stay
// reviewable and do not bounce to the live site.
const PRODUCTION_HOSTS = new Set(['srartcenter.com', 'www.srartcenter.com']);

const CANONICAL_HOST = siteConfig.domain; // "www.srartcenter.com"
const CANONICAL_SCHEME = 'https';

// Requests that look like a file (favicon.svg, sitemap.xml, robots.txt,
// /gallery/x.jpg) must never gain a trailing slash.
const FILE_LIKE = /\.[a-z0-9]{1,8}$/i;

/**
 * Returns the absolute URL to redirect to, or null when the request already
 * uses the canonical form.
 */
export function canonicalRedirect(request: Request, url: URL): string | null {
  const host = (request.headers.get('host') ?? url.host).toLowerCase().split(':')[0];
  if (!PRODUCTION_HOSTS.has(host)) return null;

  const scheme = (
    request.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '')
  ).toLowerCase();

  let path = url.pathname;
  if (path.endsWith('/index.html')) path = path.slice(0, -'index.html'.length);
  if (!path.endsWith('/') && !FILE_LIKE.test(path)) path = `${path}/`;

  const fixed = host !== CANONICAL_HOST || scheme !== CANONICAL_SCHEME || path !== url.pathname;
  if (!fixed) return null;

  return `${CANONICAL_SCHEME}://${CANONICAL_HOST}${path}${url.search}`;
}
