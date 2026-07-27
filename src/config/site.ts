// Single source of truth for the site domain.
// Override via env CURRENT_SITE_DOMAIN when deploying to a real domain.
function resolveBaseUrl(): string {
  const env =
    (typeof process !== 'undefined' && process.env?.CURRENT_SITE_DOMAIN) ||
    (import.meta.env?.CURRENT_SITE_DOMAIN as string | undefined);
  const raw = (env || 'https://siemreapartcenternightmarket.com').replace(/\/$/, '');
  return raw;
}

export const siteConfig = {
  name: 'Siem Reap Art Center Night Market',
  baseUrl: resolveBaseUrl(),
  slug: 'siem-reap-art-center-night-market',
  locales: ['km', 'en', 'zh'] as const,
};

export const ogLocale: Record<string, string> = {
  km: 'km_KH',
  en: 'en_US',
  zh: 'zh_CN',
};

// Public, factual attraction data used by JSON-LD and shared components.
// Coordinates and address are taken from the project brief.
export const attraction = {
  lat: 13.352276586944907,
  lng: 103.85230731225379,
  plusCode: '9V24+W2F',
  address: '9V24+W2F, 17000 Hospital St, Krong Siem Reap, Cambodia',
  // No commercial ranking / ratings are asserted; this is an informational guide.
  mapsUrl: 'https://maps.app.goo.gl/9SU1KZSJxURa8Rci7',
  embedUrl: 'https://www.google.com/maps?q=13.352276586944907,103.85230731225379&output=embed',
  country: 'KH',
  hoursOpen: '16:00',
  hoursClose: '23:00',
};
