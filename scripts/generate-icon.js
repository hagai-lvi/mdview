import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsetDir = join(__dirname, '../bin/mdview-window.app/Contents/Resources/AppIcon.iconset');

// Icon sizes needed for macOS iconset
const sizes = [16, 32, 64, 128, 256, 512, 1024];

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background - Claude's terracotta/coral color
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#E07850');  // Claude orange
  gradient.addColorStop(1, '#D4634B');  // Darker shade

  // Rounded rectangle background
  const radius = size * 0.2;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, radius);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Inner shadow/glow effect
  ctx.beginPath();
  ctx.roundRect(size * 0.05, size * 0.05, size * 0.9, size * 0.9, radius * 0.85);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fill();

  // Claude logo sparkle at top
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw Claude's signature sparkle/asterisk at top
  const sparkleSize = size * 0.22;
  ctx.font = `${sparkleSize}px -apple-system`;
  ctx.fillText('✦', size * 0.5, size * 0.25);

  // Large "MD" text below
  const fontSize = size * 0.42;
  ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`;
  ctx.fillText('MD', size * 0.5, size * 0.62);

  return canvas;
}

// Generate all sizes
for (const size of sizes) {
  const canvas = generateIcon(size);
  const buffer = canvas.toBuffer('image/png');

  // Standard size
  writeFileSync(join(iconsetDir, `icon_${size}x${size}.png`), buffer);

  // @2x size (half the dimension name but full resolution)
  if (size <= 512) {
    const halfSize = size / 2;
    writeFileSync(join(iconsetDir, `icon_${halfSize}x${halfSize}@2x.png`), buffer);
  }
}

console.log('Icon PNGs generated in', iconsetDir);
console.log('Run: iconutil -c icns ' + iconsetDir);
