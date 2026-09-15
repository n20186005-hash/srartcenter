import { readFileSync } from 'node:fs';

const html = readFileSync('dist/zh/index.html', 'utf8');
const text = html
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<style[\s\S]*?<\/style>/g, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const grab = (needle, span = 200) => {
  const i = text.indexOf(needle);
  return i < 0 ? `!! NOT FOUND: ${needle}` : text.slice(i, i + span);
};

console.log('--- 评分小字 (Hero) ---');
console.log(grab('评分与评价数同步自谷歌地图', 150));
console.log('\n--- 评价区块来源说明 ---');
console.log(grab('同步自 Google 地图用户评价', 120));
console.log('\n--- 资料来源区块 ---');
console.log(grab('评价 · 同步时间', 160));
console.log('\n--- 图片产权 ---');
console.log(
  [...text.matchAll(/本网站所展示的所有图片产权及版权均归原摄影者所有。/g)].length + ' occurrence(s)'
);
console.log('\n--- 实体等位声明 ---');
console.log(grab('欢迎来到暹粒艺术中心夜市', 180));
console.log('\n--- 面包屑/层级 ---');
console.log(grab('地理位置层级', 120));
console.log('\n--- 域名字符串出现次数 ---');
console.log('srartcenter.com:', [...text.matchAll(/srartcenter\.com/g)].length);
console.log('Google 地图出站链接次数:', [...html.matchAll(/maps\.app\.goo\.gl\/cawVtxVppm8w1Hm1A/g)].length);
