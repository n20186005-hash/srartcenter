import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import { siteConfig } from './src/config/site.ts';

// https://astro.build/config
export default defineConfig({
  site: siteConfig.baseUrl,
  // The guide pages are rendered on demand (they embed a live weather block)
  // and are cached at the edge; the legal pages are prerendered as static HTML.
  output: 'server',
  adapter: cloudflare({
    // No local bindings (KV, D1, R2) are used by this site, so the local
    // platform proxy is left off: `astro dev` then runs on plain Node and
    // starts instantly. Bindings can be enabled again if they are added.
    platformProxy: { enabled: false },
  }),
  i18n: {
    defaultLocale: 'km',
    locales: ['km', 'en', 'zh'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
