// Renders public/favicon.svg into the raster icons browsers ask for on their own:
//
//   node scripts/favicon.mjs
//
//   public/favicon.ico           16, 32 and 48 px, 32-bit with alpha — the tab icon in Safari and
//                                older browsers, and the fallback Chromium requests regardless
//   public/apple-touch-icon.png  180 px on a solid background (iOS rounds the corners itself)
//
// Drives the same headless Edge/Chrome as the smoke suite, so nothing new gets installed.
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { findBrowser } from "./browser.mjs";

const SOURCE = path.resolve("public/favicon.svg");
const ICO_SIZES = [16, 32, 48];
const TOUCH_SIZE = 180;
const TOUCH_BACKGROUND = "#0a0a0a";

// Give the SVG an intrinsic size (its viewBox), or Chromium would rasterise it into a 300×150 box.
function withIntrinsicSize(svg) {
  const [, , w, h] = /viewBox="([\d.\s-]+)"/.exec(svg)[1].trim().split(/[\s,]+/);
  return svg.replace(/<svg\b/, `<svg width="${w}" height="${h}"`);
}

// A classic .ico: one 32-bit bottom-up DIB per size, each followed by its 1-bit transparency mask.
function ico(images) {
  const dibs = images.map(({ size, rgba }) => {
    const xorRow = size * 4;
    const andRow = Math.ceil(size / 32) * 4;
    const dib = Buffer.alloc(40 + (xorRow + andRow) * size);
    dib.writeUInt32LE(40, 0);
    dib.writeInt32LE(size, 4);
    dib.writeInt32LE(size * 2, 8);
    dib.writeUInt16LE(1, 12);
    dib.writeUInt16LE(32, 14);
    dib.writeUInt32LE((xorRow + andRow) * size, 20);
    for (let y = 0; y < size; y++) {
      const row = size - 1 - y;
      for (let x = 0; x < size; x++) {
        const src = (y * size + x) * 4;
        const dst = 40 + row * xorRow + x * 4;
        dib[dst] = rgba[src + 2];
        dib[dst + 1] = rgba[src + 1];
        dib[dst + 2] = rgba[src];
        dib[dst + 3] = rgba[src + 3];
        if (rgba[src + 3] === 0) dib[40 + xorRow * size + row * andRow + (x >> 3)] |= 0x80 >> (x & 7);
      }
    }
    return dib;
  });
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size }, i) => {
    const entry = 6 + 16 * i;
    header[entry] = size & 0xff;
    header[entry + 1] = size & 0xff;
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(dibs[i].length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += dibs[i].length;
  });
  return Buffer.concat([header, ...dibs]);
}

const browser = await puppeteer.launch({ executablePath: findBrowser(), headless: true, args: ["--no-first-run"] });
try {
  const page = await browser.newPage();
  const rendered = await page.evaluate(
    async (svg, sizes, touchSize, touchBackground) => {
      const img = new Image();
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      await img.decode();
      const draw = (size, background) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        if (background) {
          ctx.fillStyle = background;
          ctx.fillRect(0, 0, size, size);
        }
        ctx.drawImage(img, 0, 0, size, size);
        return canvas;
      };
      return {
        ico: sizes.map((size) => Array.from(draw(size).getContext("2d").getImageData(0, 0, size, size).data)),
        touch: draw(touchSize, touchBackground).toDataURL("image/png").split(",")[1]
      };
    },
    withIntrinsicSize(fs.readFileSync(SOURCE, "utf8")),
    ICO_SIZES,
    TOUCH_SIZE,
    TOUCH_BACKGROUND
  );
  const icoFile = ico(ICO_SIZES.map((size, i) => ({ size, rgba: rendered.ico[i] })));
  fs.writeFileSync(path.resolve("public/favicon.ico"), icoFile);
  const touchFile = Buffer.from(rendered.touch, "base64");
  fs.writeFileSync(path.resolve("public/apple-touch-icon.png"), touchFile);
  console.log(`public/favicon.ico: ${ICO_SIZES.join("/")} px, ${(icoFile.length / 1024).toFixed(1)} KB`);
  console.log(`public/apple-touch-icon.png: ${TOUCH_SIZE} px, ${(touchFile.length / 1024).toFixed(1)} KB`);
} finally {
  await browser.close();
}
