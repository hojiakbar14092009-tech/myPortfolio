// Renders brand bitmaps from the HSH "Canvas" mark. Run: node scripts/og.mjs
//   public/og.png (1200×630) · public/apple-touch-icon.png (180×180)
import sharp from 'sharp';

const STEMS = 'M14 12V60M38 12V60M94 12V60M118 12V60';
const SPINE = 'M14 48H54A12 12 0 1 0 66 36A12 12 0 1 1 78 24H118';
const plate = (fill, id) =>
  `<defs><mask id="${id}"><rect width="132" height="72" rx="10" fill="#fff"/><path d="${STEMS}${SPINE}" fill="none" stroke="#000" stroke-width="8" stroke-linecap="square"/></mask></defs><rect width="132" height="72" rx="10" fill="${fill}" mask="url(#${id})"/>`;

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0B0B0C"/>
  <g transform="translate(96 96) scale(2.6)">${plate('#F4F2EE', 'a')}</g>
  <path d="M96 470H1104" stroke="#F4F2EE" stroke-opacity=".15"/>
  <text x="96" y="420" fill="#F4F2EE" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700" letter-spacing="-2">Hojiakbar Sharofiddinov</text>
  <text x="96" y="530" fill="#96938C" font-family="Arial, Helvetica, sans-serif" font-size="28">UI/UX Designer &amp; Full-Stack Developer · From the ring to the code</text>
  <circle cx="1096" cy="520" r="6" fill="#C9B48A"/>
</svg>`;

const touch = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="#0B0B0C"/>
  <g transform="translate(24 63.8) scale(1)">${plate('#F4F2EE', 'b')}</g>
</svg>`;

await sharp(Buffer.from(og)).png().toFile('public/og.png');
await sharp(Buffer.from(touch)).png().toFile('public/apple-touch-icon.png');
console.log('og.png + apple-touch-icon.png written');
