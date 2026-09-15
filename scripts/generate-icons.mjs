// Generates the PWA / favicon PNG assets from code (no image dependencies).
// Run with: npm run icons
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'public', 'icons');

// ---------------------------------------------------------------------------
// Minimal PNG encoder (8-bit RGBA, filter 0)
// ---------------------------------------------------------------------------
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// Drawing helpers (all shapes described in normalised 0..1 coordinates)
// ---------------------------------------------------------------------------
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (x, e0, e1) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => a + (b - a) * t;
const mixRgb = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

// Rounded-rect coverage for the background tile.
function roundedRectAlpha(u, v, inset, radius, feather) {
  const dx = Math.max(inset - u, u - (1 - inset), 0);
  const dy = Math.max(inset - v, v - (1 - inset), 0);
  const dist = Math.hypot(dx, dy);
  return 1 - smooth(dist, radius - feather, radius + feather);
}

// Ellipse coverage (normalised radius: 1 == on the edge).
function ellipseAlpha(u, v, cx, cy, rx, ry, feather) {
  const r = Math.hypot((u - cx) / rx, (v - cy) / ry);
  return 1 - smooth(r, 1 - feather, 1 + feather);
}

function rectAlpha(u, v, x0, x1, y0, y1, feather) {
  const dx = Math.max(x0 - u, u - x1, 0);
  const dy = Math.max(y0 - v, v - y1, 0);
  const dist = Math.hypot(dx, dy);
  return 1 - smooth(dist, feather * 0.5, feather);
}

const BRAND = [0xe2, 0x72, 0x2b];
const BRAND_DARK = [0x3b, 0x2a, 0x20];
const GOLD = [0xf7, 0xc9, 0x48];
const GOLD_DEEP = [0xe2, 0x8b, 0x2b];

// Draws the lantern mark used by every generated icon.
function renderIcon(size, { maskable = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const feather = 1.2 / size;
  const scale = maskable ? 0.62 : 0.78;
  const inset = maskable ? 0 : 0.055;
  const radius = maskable ? 0 : 0.24;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = (x + 0.5) / size;
      const v = (y + 0.5) / size;

      // Background: rounded tile (any purpose) or full bleed (maskable).
      const bgAlpha = maskable ? 1 : roundedRectAlpha(u, v, inset, radius, feather);
      let rgb = mixRgb(BRAND, BRAND_DARK, clamp01((u + v) / 2 * 1.05));
      let alpha = bgAlpha;

      // Lantern geometry in mark-space, scaled around the icon centre.
      const mu = (u - 0.5) / scale + 0.5;
      const mv = (v - 0.5) / scale + 0.5;

      const capTop = rectAlpha(mu, mv, 0.385, 0.615, 0.155, 0.215, feather);
      const capBottom = rectAlpha(mu, mv, 0.385, 0.615, 0.815, 0.875, feather);
      const tassel = rectAlpha(mu, mv, 0.487, 0.513, 0.875, 0.955, feather);
      const body = ellipseAlpha(mu, mv, 0.5, 0.515, 0.245, 0.295, feather);
      const bodyRecess = ellipseAlpha(mu, mv, 0.5, 0.515, 0.205, 0.255, feather * 0.8);

      const paint = (cover, color) => {
        if (cover <= 0) return;
        const a = cover;
        rgb = [mix(rgb[0], color[0], a), mix(rgb[1], color[1], a), mix(rgb[2], color[2], a)];
        alpha = Math.max(alpha, bgAlpha === 0 ? a : Math.max(alpha, a));
      };

      paint(capTop, BRAND_DARK);
      paint(capBottom, BRAND_DARK);
      paint(tassel, BRAND_DARK);

      // Lantern body with a soft vertical gradient and an inner glow ring.
      if (body > 0) {
        let bodyColor = mixRgb(GOLD, GOLD_DEEP, clamp01((mv - 0.24) / 0.55));
        if (bodyRecess > 0) bodyColor = mixRgb(bodyColor, GOLD, 0.35 * bodyRecess);
        paint(body, bodyColor);
      }

      // Glow behind the tile edge.
      const glow = Math.max(0, 1 - Math.hypot(u - 0.5, v - 0.46) / 0.62);
      if (glow > 0 && body <= 0) {
        rgb = [mix(rgb[0], GOLD[0], glow * 0.08), mix(rgb[1], GOLD[1], glow * 0.06), mix(rgb[2], GOLD[2], glow * 0.04)];
      }

      const o = (y * size + x) * 4;
      rgba[o] = Math.round(clamp01(rgb[0] / 255) * 255);
      rgba[o + 1] = Math.round(clamp01(rgb[1] / 255) * 255);
      rgba[o + 2] = Math.round(clamp01(rgb[2] / 255) * 255);
      rgba[o + 3] = Math.round(clamp01(alpha) * 255);
    }
  }
  return encodePng(size, size, rgba);
}

mkdirSync(outDir, { recursive: true });

const outputs = [
  ['icon-192.png', renderIcon(192)],
  ['icon-512.png', renderIcon(512)],
  ['icon-maskable-512.png', renderIcon(512, { maskable: true })],
  ['apple-touch-icon.png', renderIcon(180, { maskable: true })],
  ['favicon-32.png', renderIcon(32)],
];

for (const [name, buffer] of outputs) {
  writeFileSync(resolve(outDir, name), buffer);
  console.log(`icons: wrote ${name} (${buffer.length} bytes)`);
}
