/* Service worker for the Siem Reap Art Center Night Market visitor guide (PWA). */
const VERSION = 'v1';
const STATIC_CACHE = `srart-static-${VERSION}`;
const PAGE_CACHE = `srart-pages-${VERSION}`;
const IMAGE_CACHE = `srart-images-${VERSION}`;
const KEEP = [STATIC_CACHE, PAGE_CACHE, IMAGE_CACHE];
const MAX_IMAGE_ENTRIES = 60;

const PRECACHE_URLS = [
  '/',
  '/en/',
  '/zh/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !KEEP.includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function isBypassed(url) {
  if (url.origin !== self.location.origin) return true;
  if (url.pathname.startsWith('/api/')) return true;
  return false;
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)));
}

// HTML: network first, fall back to the cached page, then to the home page.
async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(PAGE_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = (await caches.match(request)) || (await caches.match('/'));
    if (cached) return cached;
    throw error;
  }
}

// Same-origin assets: cache first with a background revalidate.
async function handleAsset(request) {
  const cached = await caches.match(request);
  const network = fetch(request)
    .then(async (response) => {
      if (response && response.ok) {
        const cacheName = request.destination === 'image' ? IMAGE_CACHE : STATIC_CACHE;
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
        if (cacheName === IMAGE_CACHE) trimCache(IMAGE_CACHE, MAX_IMAGE_ENTRIES);
      }
      return response;
    })
    .catch(() => undefined);

  return cached || (await network) || Response.error();
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (isBypassed(url)) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  event.respondWith(handleAsset(request));
});
