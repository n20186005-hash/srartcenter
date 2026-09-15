import km from './km.json';
import en from './en.json';
import zh from './zh.json';
import { siteConfig } from '../config/site';

export const defaultLang = 'km';
export const languagesList = ['km', 'en', 'zh'] as const;

export const languages: Record<string, string> = {
  km: 'ខ្មែរ',
  en: 'English',
  zh: '中文',
};

// Order shown in the language switcher (default first).
export const langOrder: string[] = ['km', 'en', 'zh'];

const ui: Record<string, any> = { km, en, zh };

export function getLangFromUrl(url: URL): string {
  const seg = url.pathname.split('/').filter(Boolean);
  const lang = seg[0];
  return (languagesList as readonly string[]).includes(lang) ? lang : defaultLang;
}

export function getI18n(url: URL) {
  const lang = getLangFromUrl(url);
  const messages = ui[lang];
  const t = (key: string): string => {
    const found = key
      .split('.')
      .reduce<any>((o, i) => (o == null ? undefined : o[i]), messages);
    return found ?? '';
  };
  return { lang, messages, t };
}

// Section path of the current page, without the locale prefix
// e.g. "/privacy-policy" -> "privacy-policy", "/en/" -> "", "/zh/terms-of-service" -> "terms-of-service"
function sectionPathFromUrl(url?: URL): string {
  if (!url) return '';
  return url.pathname
    .split('/')
    .filter(Boolean)
    .filter((seg) => seg !== 'index.html' && !(languagesList as readonly string[]).includes(seg))
    .join('/');
}

// Per-locale absolute URLs (hreflang + canonical) for the current page.
// Khmer keeps the unprefixed root because it is the site's default locale, so
// x-default deliberately points at the English page instead: it is the version
// served to visitors whose language is not km, en or zh.
export function buildAlternates(url?: URL): Record<string, string> {
  const base = siteConfig.baseUrl;
  const section = sectionPathFromUrl(url);
  const suffix = section ? `/${section}` : '';
  const en = `${base}/en${suffix}/`;
  return {
    km: `${base}${suffix}/`,
    en,
    zh: `${base}/zh${suffix}/`,
    xDefault: en,
  };
}

// Canonical URL of the page currently being rendered.
export function canonicalUrl(url?: URL): string {
  if (!url) return `${siteConfig.baseUrl}/`;
  const section = sectionPathFromUrl(url);
  const suffix = section ? `/${section}` : '';
  const prefix = url.pathname.startsWith('/zh') ? '/zh' : url.pathname.startsWith('/en') ? '/en' : '';
  return `${siteConfig.baseUrl}${prefix}${suffix}/`;
}

export function htmlLangAttr(lang: string): string {
  if (lang === 'zh') return 'zh-CN';
  if (lang === 'km') return 'km';
  return lang;
}

// Unique <title> / meta description for the legal (privacy / terms / cookies) pages,
// so every URL keeps a distinct title instead of reusing the attraction title.
export function legalMeta(
  url: URL,
  section: 'privacy' | 'terms' | 'cookies'
): { title: string; description: string } {
  const { messages } = getI18n(url);
  const block = messages.legal?.[section];
  const first: string = block?.sections?.[0]?.p ?? messages.footer?.tagline ?? '';
  return {
    title: `${block?.title ?? section} — ${messages.header.siteName}`,
    description: first.length > 158 ? `${first.slice(0, 155)}…` : first,
  };
}
