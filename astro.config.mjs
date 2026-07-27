import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { siteConfig } from './src/config/site.ts';

// https://astro.build/config
export default defineConfig({
  site: siteConfig.baseUrl,
  output: 'static',
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
