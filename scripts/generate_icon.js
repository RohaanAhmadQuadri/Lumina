const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(len + 12);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.slice(4, len + 8);
  const crc = crc32(typeAndData);
  buf.writeUInt32BE(crc, len + 8);
  return buf;
}

function generateLuminaIconPNG(size = 256) {
  const width = size;
  const height = size;

  // Unfiltered RGBA scanlines
  const rowBytes = width * 4 + 1;
  const rawData = Buffer.alloc(rowBytes * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = size * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // Rounded dark badge background with luminous electric cyan/purple gradient
        const t = (x + y) / (width + height);
        // Gradient from cyan (#00d2b4) to violet (#818cf8)
        let r = Math.round(0 * (1 - t) + 129 * t);
        let g = Math.round(210 * (1 - t) + 140 * t);
        let b = Math.round(180 * (1 - t) + 248 * t);

        // Center aperture ring
        const innerDist = Math.abs(dist - radius * 0.55);
        if (innerDist < 8) {
          r = 255; g = 255; b = 255;
        } else if (dist < radius * 0.3) {
          r = 255; g = 255; b = 255;
        }

        // Anti-aliasing edge
        let alpha = 255;
        if (dist > radius - 1.5) {
          alpha = Math.round(255 * (radius - dist) / 1.5);
          alpha = Math.max(0, Math.min(255, alpha));
        }

        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
        rawData[pxOffset + 3] = alpha;
      } else {
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createIcoFromPng(pngBuf) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = ICO
  header.writeUInt16LE(1, 4); // count 1

  const entry = Buffer.alloc(16);
  entry.writeUInt8(0, 0); // 256 width -> 0
  entry.writeUInt8(0, 1); // 256 height -> 0
  entry.writeUInt8(0, 2); // color count 0
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // planes
  entry.writeUInt16LE(32, 6); // bit count
  entry.writeUInt32LE(pngBuf.length, 8); // bytes in resource
  entry.writeUInt32LE(22, 12); // image offset: 6 + 16 = 22

  return Buffer.concat([header, entry, pngBuf]);
}

// Generate files
const assetsDir = path.join(__dirname, '../assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const png256 = generateLuminaIconPNG(256);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), png256);
console.log('Created assets/icon.png (256x256)');

const ico = createIcoFromPng(png256);
fs.writeFileSync(path.join(assetsDir, 'icon.ico'), ico);
console.log('Created assets/icon.ico (256x256)');
