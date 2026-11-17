import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const file = resolve('public/sitemap.xml');
const slugs = ['old-market','pub-street','siem-reap-riverside','made-in-cambodia-market','night-market-transport-faq','wat-damnak','wat-preah-prom-rath','wat-bo','royal-independence-gardens','angkor-national-museum','artisans-angkor','satcha-handicraft-center','khmer-ceramics-center','preah-ang-chek-chorm-shrine','phare-cambodian-circus'];
const base = 'https://www.srartcenter.com';
const prefixes = ['', '/en', '/zh'];
const start = '<!-- GENERATED NEARBY START -->';
const end = '<!-- GENERATED NEARBY END -->';
const entries = slugs.flatMap((slug) => prefixes.map((prefix) => {
  const path = `/nearby/${slug}/`;
  const alternates = prefixes.map((p, i) => `    <xhtml:link rel="alternate" hreflang="${['km','en','zh'][i]}" href="${base}${p}${path}" />`).join('\n');
  return `  <url>\n    <loc>${base}${prefix}${path}</loc>\n    <lastmod>2026-11-16</lastmod>\n    <priority>0.7</priority>\n${alternates}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${base}/en${path}" />\n  </url>`;
})).join('\n');
let xml = readFileSync(file, 'utf8');
xml = xml.replace(new RegExp(`${start}[\\s\\S]*?${end}\\s*`), '');
xml = xml.replace('</urlset>', `${start}\n${entries}\n${end}\n</urlset>`);
writeFileSync(file, xml);
