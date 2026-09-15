/**
 * Image pipeline for the visitor guide.
 *
 * For every photo in public/gallery it produces:
 *   - <name>.jpg        max 1600px wide, progressive, quality 78   (full view / hero)
 *   - <name>.webp       max 1600px wide, quality 72                (modern browsers)
 *   - <name>-640.jpg    max 640px wide                             (grid thumbnail)
 *   - <name>-640.webp   max 640px wide                             (grid thumbnail)
 *
 * File names are validated against the house convention: lowercase words joined
 * by dashes and ending with the photo index, e.g. "siem-reap-art-center-night-market-1.jpg".
 *
 * Usage: npm run images
 */
import { readdir, stat, readFile, writeFile } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

const GALLERY_DIR = 'public/gallery';
const FULL_WIDTH = 1600;
const THUMB_WIDTH = 640;
const JPEG_QUALITY = 78;
const THUMB_JPEG_QUALITY = 76;
const WEBP_QUALITY = 72;
const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*-\d+\.(?:jpe?g|png)$/;

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function main() {
  const entries = (await readdir(GALLERY_DIR)).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();

  if (entries.length === 0) {
    console.log('No images found in', GALLERY_DIR);
    return;
  }

  const invalid = entries.filter((f) => !NAME_PATTERN.test(f));
  if (invalid.length > 0) {
    console.warn('! File names outside the convention (xxx-xxx-xxx-1.jpg):');
    for (const f of invalid) console.warn('   -', f);
    console.warn('');
  }

  let before = 0;
  let after = 0;
  const rows = [];

  for (const file of entries) {
    const abs = join(GALLERY_DIR, file);
    const name = basename(file, extname(file));
    const originalBytes = (await stat(abs)).size;
    before += originalBytes;

    // Read the photo into memory first: the source file is overwritten in place,
    // so no file handle may stay open on it.
    const input = await readFile(abs);
    const source = sharp(input, { failOn: 'none' }).rotate();
    const meta = await source.metadata();

    // Full size versions (JPEG keeps the original file name, so no markup needs to change).
    const full = await source
      .clone()
      .resize({ width: FULL_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
      .toBuffer();

    const fullWebp = await source
      .clone()
      .resize({ width: FULL_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 5 })
      .toBuffer();

    // Grid thumbnails.
    const thumb = await source
      .clone()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: THUMB_JPEG_QUALITY, progressive: true, mozjpeg: true })
      .toBuffer();

    const thumbWebp = await source
      .clone()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 5 })
      .toBuffer();

    await writeFile(abs, full);
    await writeFile(join(GALLERY_DIR, `${name}.webp`), fullWebp);
    await writeFile(join(GALLERY_DIR, `${name}-${THUMB_WIDTH}.jpg`), thumb);
    await writeFile(join(GALLERY_DIR, `${name}-${THUMB_WIDTH}.webp`), thumbWebp);

    const saved = originalBytes - full.length;
    after += full.length + thumb.length;
    rows.push({
      file,
      dimensions: `${meta.width}x${meta.height} -> ${Math.min(meta.width, FULL_WIDTH)}w`,
      original: kb(originalBytes),
      full: kb(full.length),
      thumb: kb(thumb.length),
      webp: kb(fullWebp.length),
      saved: `${((saved / originalBytes) * 100).toFixed(0)}%`,
    });
  }

  console.table(rows);
  console.log(`\nFull-size JPEG total: ${(before / 1024 / 1024).toFixed(2)} MB -> ${(after / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Saved ${(((before - after) / before) * 100).toFixed(0)}% across ${entries.length} photos.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
