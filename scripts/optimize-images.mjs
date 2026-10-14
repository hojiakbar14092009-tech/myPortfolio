// Reads originals from ./assets (never modified), writes graded responsive sets to ./public/img.
// Each image -> <name>-<w>.{avif,webp,jpg} plus a manifest consumed by src/data/images.ts.
import sharp from 'sharp';
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'assets';
const OUT = 'public/img';
const WIDTHS = [480, 960, 1600];
const BG_WIDTHS = [640, 1280, 1920];

const IMG = /\.(png|jpe?g|webp|avif)$/i;
const dir = async (sub, grade, prefix = '', skip = []) => {
  const files = (await readdir(path.join(SRC, sub)).catch(() => [])).filter((f) => IMG.test(f) && !skip.includes(path.parse(f).name));
  const sized = await Promise.all(files.map(async (f) => [f, (await stat(path.join(SRC, sub, f))).size]));
  // Empty placeholder files are skipped instead of crashing sharp.
  return sized.filter(([, size]) => size > 0).map(([f]) => ({ file: path.join(sub, f), name: prefix + path.parse(f).name, grade }));
};

const jobs = [
  { file: 'profile.webp', name: 'profile', grade: 'portrait' },
  ...(await dir('bio', 'cinema')),
  // Learning collage: name files russian / english / math / history / law (any image extension).
  ...(await dir('learning', 'cinema', 'learning-')),
  ...(await dir('shots', 'none')),
  // Chapter field backgrounds: intro, chess, football, swimming, combat, boxing, learning, it, contact, about-page.
  // no-risk.png is flat black with baked-in text; that section rebuilds it as live type, so it is not exported.
  ...(await dir('backgrounds', 'bg', 'bg-', ['no-risk'])),
];

// One shared grade so the bio photos read as a single series:
// lower saturation, lifted contrast, slightly cooled highlights.
function grade(img, kind) {
  if (kind === 'none') return img;
  if (kind === 'portrait') return img.modulate({ saturation: 0.92 }).linear(1.04, -4);
  return img
    .modulate({ saturation: 0.72, brightness: 0.97 })
    .linear(1.1, -10)
    .recomb([
      [1.0, 0.02, 0.0],
      [0.0, 1.0, 0.02],
      [0.02, 0.0, 1.02],
    ]);
}

// Field backgrounds are shown full-viewport under a scrim, grain and Ken Burns, so a soft image is fine:
// monochrome, contrast stretched, upscaled up to 3x with a slight blur that hides resampling artefacts.
// The WebGL field reads the .webp; the static fallback uses the full set.
async function background(job, input, meta) {
  const maxW = Math.min(meta.width * 3, 1920);
  const widths = [...new Set(BG_WIDTHS.map((w) => Math.min(w, maxW)))];
  for (const w of widths) {
    const img = sharp(input).rotate().grayscale().normalise({ lower: 1, upper: 99 }).median(3)
      .resize({ width: w, kernel: 'lanczos3' }).blur(w > meta.width * 1.5 ? 0.8 : 0.4);
    const base = path.join(OUT, `${job.name}-${w}`);
    await img.clone().avif({ quality: 48, effort: 5 }).toFile(`${base}.avif`);
    await img.clone().webp({ quality: 72 }).toFile(`${base}.webp`);
    await img.clone().jpeg({ quality: 76, mozjpeg: true }).toFile(`${base}.jpg`);
  }
  const blur = await sharp(input).rotate().grayscale().resize({ width: 20 }).webp({ quality: 40 }).toBuffer();
  manifest[job.name] = { widths, ratio: +(meta.width / meta.height).toFixed(4), blur: `data:image/webp;base64,${blur.toString('base64')}` };
  console.log(`${job.name}: ${meta.width}x${meta.height} -> ${widths.join('/')} (field)`);
}

await mkdir(OUT, { recursive: true });
const manifest = {};

for (const job of jobs) {
  const input = path.join(SRC, job.file);
  const meta = await sharp(input).rotate().metadata();
  if (job.grade === 'bg') {
    await background(job, input, meta);
    continue;
  }
  const maxW = Math.min(meta.width * 2, 1600); // never upscale beyond 2x
  const widths = [...new Set(WIDTHS.map((w) => Math.min(w, maxW)))];
  const small = meta.width < 1000 && job.grade !== 'none'; // UI screenshots stay pixel-crisp

  for (const w of widths) {
    let img = sharp(input).rotate(); // .rotate() applies EXIF orientation; output strips metadata
    if (small) img = img.median(3); // light denoise before upscaling low-res sources
    img = img.resize({ width: w, kernel: 'lanczos3', withoutEnlargement: false });
    img = grade(img, job.grade).sharpen({ sigma: small ? 1.0 : 0.6, m1: 0.5, m2: 1.5 });
    const base = path.join(OUT, `${job.name}-${w}`);
    await img.clone().avif({ quality: 52, effort: 5 }).toFile(`${base}.avif`);
    await img.clone().webp({ quality: 78 }).toFile(`${base}.webp`);
    await img.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(`${base}.jpg`);
  }
  // Tiny blurred preview shown while the real image loads.
  const blur = await grade(sharp(input).rotate().resize({ width: 20 }), job.grade).webp({ quality: 40 }).toBuffer();
  manifest[job.name] = {
    widths,
    ratio: +(meta.width / meta.height).toFixed(4),
    blur: `data:image/webp;base64,${blur.toString('base64')}`,
  };
  console.log(`${job.name}: ${meta.width}x${meta.height} -> ${widths.join('/')}`);
}

await writeFile('src/data/images.json', JSON.stringify(manifest, null, 2) + '\n');
