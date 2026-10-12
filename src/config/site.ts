// Single source of truth for the site domain.
// Override via env CURRENT_SITE_DOMAIN when deploying to a real domain.
function resolveBaseUrl(): string {
  // `globalThis.process` rather than `process`: the same module is read by the
  // Worker at runtime, where no Node globals exist.
  const env =
    ((globalThis as any).process?.env?.CURRENT_SITE_DOMAIN as string | undefined) ||
    (import.meta.env?.CURRENT_SITE_DOMAIN as string | undefined);
  const raw = (env || 'https://www.srartcenter.com').replace(/\/$/, '');
  return raw;
}

const baseUrl = resolveBaseUrl();

export const siteConfig = {
  name: 'Siem Reap Art Center Night Market',
  baseUrl,
  // Host used by canonical / og:url / JSON-LD url  (e.g. "www.srartcenter.com")
  domain: new URL(baseUrl).host,
  // Registrable domain of the guide, matching the attraction short name.
  brandDomain: 'srartcenter.com',
  slug: 'siem-reap-art-center-night-market',
  galleryCount: 24,
  locales: ['km', 'en', 'zh'] as const,
  // Google Analytics 4 measurement ID.
  ga4Id: 'G-HXM22WWPKP',
  themeColor: '#E2722B',
  backgroundColor: '#FBF4EA',
  manifestPath: '/manifest.webmanifest',
  serviceWorkerPath: '/sw.js',
  // Month the Google Maps rating / review count on this page was last read.
  ratingSyncedAt: '2026-10',
};

export const ogLocale: Record<string, string> = {
  km: 'km_KH',
  en: 'en_US',
  zh: 'zh_CN',
};

// Public, factual attraction data used by JSON-LD and shared components.
// Address, coordinates, phone, rating and links come from the attraction's
// public Google Maps listing (read 2026-10).
export const attraction = {
  fullName: 'Siem Reap Art Center Night Market',
  // "srartcenter" = Siem Reap Art Center, the short / colloquial form.
  shortName: 'Siem Reap Art Center',
  altNames: [
    'Siem Reap Art Center',
    '暹粒藝術中心夜市',
    '暹粒艺术中心夜市',
    'មជ្ឈមណ្ឌលសិល្បៈខេត្តសៀមរាប',
  ],
  category: 'Night market',
  streetAddress: '17000 Hospital St',
  locality: 'Krong Siem Reap',
  city: 'Siem Reap',
  state: 'Siem Reap Province',
  country: 'Cambodia',
  countryCode: 'KH',
  // ISO 3166-2 subdivision code for Siem Reap Province.
  regionCode: 'KH-17',
  postalCode: '17000',
  plusCode: '9V24+W2F',
  address: '9V24+W2F, 17000 Hospital St, Krong Siem Reap, Cambodia',
  lat: 13.352276586944907,
  lng: 103.85230731225379,
  phone: '+85563963331',
  phoneDisplay: '+855 63 963 331',
  website: 'https://www.srartcenter.com/',
  // Google Maps share short link (kept for every outbound Google Maps reference).
  mapsUrl: 'https://maps.app.goo.gl/cawVtxVppm8w1Hm1A',
  embedUrl: 'https://www.google.com/maps?q=13.352276586944907,103.85230731225379&output=embed',
  // Aggregate rating shown on the page only. Never emitted into JSON-LD.
  rating: 4.2,
  ratingOutOf: 5,
  reviewCount: 6092,
  reviewCountLabel: '6,092',
  // Authoritative tourism portals (.gov.kh / .org) used as outbound references.
  govtTourismUrl: 'https://tourism.gov.kh/en/',
  govtTourismLabel: 'Cambodia Ministry of Tourism',
  govtTourismOrgUrl: 'https://www.tourismcambodia.org/',
  hoursOpen: '16:00',
  hoursClose: '23:00',
  openingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  closedDays: ['Sunday'],
};

// Absolute URL helper for canonical / og / JSON-LD values.
export function absoluteUrl(path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${siteConfig.baseUrl}${clean}`;
}

export const galleryImageUrls: string[] = Array.from(
  { length: siteConfig.galleryCount },
  (_, i) => absoluteUrl(`/gallery/${siteConfig.slug}-${i + 1}.jpg`)
);
