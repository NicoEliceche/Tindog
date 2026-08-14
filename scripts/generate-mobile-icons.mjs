import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const assetsDirectory = path.join(projectRoot, 'apps', 'mobile', 'assets');
const webAppDirectory = path.join(projectRoot, 'src', 'app');
const originalLogoPath = path.join(assetsDirectory, 'tindog_patita_logo.png');
const masterPath = path.join(assetsDirectory, 'tindog-icon-master.png');
const monochromeSourcePath = path.join(assetsDirectory, 'android-icon-monochrome-source.png');
const brandBlack = { r: 11, g: 11, b: 11, alpha: 1 };

function circularMask(size) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`
      + `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/>`
      + '</svg>',
  );
}

async function circularArtwork(input, size, fit = 'cover') {
  const source = sharp(input);
  if (fit === 'contain') {
    source.trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } });
  }

  const resized = await source
    .resize(size, size, { fit, position: 'centre' })
    .png()
    .toBuffer();

  return sharp(resized)
    .composite([{ input: circularMask(size), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

async function placeOnCanvas({
  input,
  output,
  canvasSize,
  artworkSize,
  background,
  fit,
}) {
  const artwork = await circularArtwork(input, artworkSize, fit);
  const inset = Math.round((canvasSize - artworkSize) / 2);

  const canvas = sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background,
    },
  }).composite([{ input: artwork, left: inset, top: inset }]);

  if (background.alpha === 1) {
    canvas.removeAlpha();
  }

  await canvas.png().toFile(output);
}

async function generateWebFavicon({ input, output, size }) {
  const fullBleedArtwork = await sharp(input)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(size, size, { fit: 'cover', position: 'north' })
    .png()
    .toBuffer();

  await sharp(fullBleedArtwork)
    .composite([{ input: circularMask(size), blend: 'dest-in' }])
    .png()
    .toFile(output);
}

await Promise.all([
  // iOS applies its own outer mask. The circular brand mark remains at 66.4%
  // of the square so every launcher shape keeps equal clear space.
  placeOnCanvas({
    input: masterPath,
    output: path.join(assetsDirectory, 'icon.png'),
    canvasSize: 1024,
    artworkSize: 680,
    background: brandBlack,
  }),
  // Android adaptive foreground: 18% transparent inset on all four sides.
  placeOnCanvas({
    input: masterPath,
    output: path.join(assetsDirectory, 'android-icon-foreground.png'),
    canvasSize: 432,
    artworkSize: 276,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  }),
  // Keep the themed icon recognizable while preventing its old lower-right
  // rectangular edge from reaching the adaptive-icon boundary.
  placeOnCanvas({
    input: monochromeSourcePath,
    output: path.join(assetsDirectory, 'android-icon-monochrome.png'),
    canvasSize: 432,
    artworkSize: 276,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    fit: 'contain',
  }),
  placeOnCanvas({
    input: masterPath,
    output: path.join(assetsDirectory, 'splash-icon.png'),
    canvasSize: 1024,
    artworkSize: 760,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  }),
  placeOnCanvas({
    input: masterPath,
    output: path.join(assetsDirectory, 'favicon.png'),
    canvasSize: 256,
    artworkSize: 184,
    background: brandBlack,
  }),
  // The browser favicon is intentionally full-bleed and transparent outside
  // its 50% radius. Native and Apple icons keep their padded black canvas.
  generateWebFavicon({
    input: originalLogoPath,
    output: path.join(webAppDirectory, 'icon.png'),
    size: 512,
  }),
  placeOnCanvas({
    input: masterPath,
    output: path.join(webAppDirectory, 'apple-icon.png'),
    canvasSize: 180,
    artworkSize: 130,
    background: brandBlack,
  }),
  sharp({ create: { width: 432, height: 432, channels: 3, background: brandBlack } })
    .png()
    .toFile(path.join(assetsDirectory, 'android-icon-background.png')),
]);

console.log('Generated Tindog mobile and web icon assets.');
