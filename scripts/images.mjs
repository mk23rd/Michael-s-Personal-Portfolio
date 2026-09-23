// Regenerates the AVIF and WebP renditions in src/assets/images from the originals (name.jpg, no width
// suffix). This is one-off tooling, so sharp is not a project dependency:
//
//   npm install --no-save sharp && node scripts/images.mjs
//
// Add a new original, run this, then add its intrinsic size to src/lib/images.ts.
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const dir = process.argv[2] ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/assets/images");
const widths = [480, 800, 1200, 1600];

const originals = (await readdir(dir)).filter((file) => /^[a-z0-9]+\.jpg$/.test(file));

for (const file of originals) {
  const name = path.basename(file, ".jpg");
  const source = sharp(path.join(dir, file));
  const { width: intrinsic } = await source.metadata();

  for (const width of widths.filter((w) => w <= intrinsic)) {
    const resized = source.clone().resize({ width });
    const avif = await resized.clone().avif({ quality: 60, effort: 6 }).toFile(path.join(dir, `${name}-${width}.avif`));
    const webp = await resized.clone().webp({ quality: 80 }).toFile(path.join(dir, `${name}-${width}.webp`));
    console.log(`${name}-${width}: avif ${(avif.size / 1024).toFixed(0)} kB, webp ${(webp.size / 1024).toFixed(0)} kB`);
  }
}
