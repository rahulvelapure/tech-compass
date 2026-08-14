/**
 * Generates public/favicon.ico — an original Tech Compass mark.
 *
 * The design is a compass needle on a rounded ink tile: the publication's name
 * rendered as a symbol rather than a monogram, because two letters ("TC") turn
 * to mud at 16x16 while a single high-contrast needle stays legible.
 *
 * Colours are derived from the site's own OKLCH design tokens in styles.css,
 * converted here rather than hard-coded, so the icon cannot drift out of step
 * with the brand.
 *
 * No external image library: shapes are rasterised with 4x4 supersampling and
 * the PNGs are assembled by hand, so this runs anywhere Node runs.
 *
 *   node scripts/generate-favicon.mjs
 */

import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "favicon.ico");
const SIZES = [16, 32, 48];

/* ---------------------------------------------------------------- colour */

/** OKLCH -> sRGB (0-255). Mirrors the tokens in src/styles.css. */
function oklch(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];

  return lin.map((v) => {
    const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, Math.round(c * 255)));
  });
}

// --primary / --foreground (light theme): the editorial ink.
const INK = oklch(0.23, 0.036, 261.7);
// --accent: the link/brand blue.
const ACCENT = oklch(0.546, 0.215, 262.9);
// --primary-foreground: near-white.
const PAPER = oklch(0.99, 0.002, 247.9);

/* --------------------------------------------------------------- geometry */

/** Rounded square covering the full tile, in 0..1 space. */
function inTile(x, y, r) {
  // Standard rounded-box SDF: clamp the offset from the inner rect to the
  // positive quadrant, then test against the corner radius. Clamping is what
  // keeps the straight edge bands inside — without it they get carved away.
  const dx = Math.max(Math.abs(x - 0.5) - (0.5 - r), 0);
  const dy = Math.max(Math.abs(y - 0.5) - (0.5 - r), 0);
  return dx * dx + dy * dy <= r * r;
}

function inTriangle(px, py, [ax, ay], [bx, by], [cx, cy]) {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

// Needle axis: tilted off vertical so the mark reads as a bearing, not an arrow.
const TILT = (35 * Math.PI) / 180;
const DIR = [Math.sin(TILT), -Math.cos(TILT)];
const PERP = [-DIR[1], DIR[0]];
const LEN = 0.335;
const WAIST = 0.108;

const C = [0.5, 0.5];
const NORTH = [C[0] + DIR[0] * LEN, C[1] + DIR[1] * LEN];
const SOUTH = [C[0] - DIR[0] * LEN, C[1] - DIR[1] * LEN];
const W1 = [C[0] + PERP[0] * WAIST, C[1] + PERP[1] * WAIST];
const W2 = [C[0] - PERP[0] * WAIST, C[1] - PERP[1] * WAIST];

/** Returns [r,g,b,a] for a point in 0..1 space. */
function sample(x, y) {
  if (!inTile(x, y, 0.22)) return [0, 0, 0, 0];
  if (inTriangle(x, y, NORTH, W1, W2)) return [...PAPER, 255];
  if (inTriangle(x, y, SOUTH, W1, W2)) return [...ACCENT, 255];
  return [...INK, 255];
}

/** Rasterise one size with 4x4 supersampling. Returns raw RGBA. */
function raster(size) {
  const SS = 4;
  const out = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const [sr, sg, sb, sa] = sample(
            (px + (sx + 0.5) / SS) / size,
            (py + (sy + 0.5) / SS) / size,
          );
          // Premultiply so edge pixels blend against transparency correctly.
          const w = sa / 255;
          r += sr * w;
          g += sg * w;
          b += sb * w;
          a += sa;
        }
      }
      const n = SS * SS;
      const alpha = a / n;
      const i = (py * size + px) * 4;
      const wsum = a / 255 || 1;
      out[i] = Math.round(r / wsum);
      out[i + 1] = Math.round(g / wsum);
      out[i + 2] = Math.round(b / wsum);
      out[i + 3] = Math.round(alpha);
    }
  }
  return out;
}

/* ------------------------------------------------------------------- PNG */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(size, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Filter byte 0 (None) in front of every scanline.
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ------------------------------------------------------------------- ICO */

const images = SIZES.map((s) => png(s, raster(s)));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(images.length, 4);

let offset = 6 + images.length * 16;
const entries = images.map((img, i) => {
  const e = Buffer.alloc(16);
  e[0] = SIZES[i] >= 256 ? 0 : SIZES[i];
  e[1] = SIZES[i] >= 256 ? 0 : SIZES[i];
  e[2] = 0; // palette size
  e[3] = 0; // reserved
  e.writeUInt16LE(1, 4); // colour planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(img.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += img.length;
  return e;
});

const ico = Buffer.concat([header, ...entries, ...images]);
writeFileSync(OUT, ico);

console.log(
  `favicon.ico written — ${SIZES.join(", ")}px, ${ico.length} bytes\n` +
    `  ink    rgb(${INK.join(",")})\n` +
    `  accent rgb(${ACCENT.join(",")})\n` +
    `  paper  rgb(${PAPER.join(",")})`,
);
