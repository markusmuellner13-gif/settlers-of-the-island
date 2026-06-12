// Generates PNG app icons from icons/icon.svg (run: node tools/gen-icons.mjs)
import sharp from 'sharp';
import { readFileSync } from 'fs';

const svg = readFileSync(new URL('../icons/icon.svg', import.meta.url));

await sharp(svg, { density: 300 }).resize(192, 192).png().toFile('icons/icon-192.png');
await sharp(svg, { density: 300 }).resize(512, 512).png().toFile('icons/icon-512.png');

// Maskable: artwork shrunk to ~78% on a solid background so circular masks don't clip it.
const inner = await sharp(svg, { density: 300 }).resize(400, 400).png().toBuffer();
await sharp({
  create: { width: 512, height: 512, channels: 4, background: '#0e3a5c' },
})
  .composite([{ input: inner, left: 56, top: 56 }])
  .png()
  .toFile('icons/icon-512-maskable.png');

console.log('Icons generated.');
