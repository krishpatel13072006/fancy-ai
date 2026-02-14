const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Create a simple gradient icon with the app's colors
async function generateIcons() {
  const sizes = [192, 512];
  
  // Create SVG with gradient background
  const createSvg = (size) => `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#7b5cff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ff8fd1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" 
            font-family="Arial, sans-serif" font-weight="bold" 
            font-size="${size * 0.4}" fill="white">AI</text>
    </svg>
  `;
  
  const iconsDir = path.join(__dirname, 'public', 'icons');
  
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  for (const size of sizes) {
    const svg = Buffer.from(createSvg(size));
    await sharp(svg)
      .png()
      .toFile(path.join(iconsDir, `icon-${size}.png`));
    console.log(`Created icon-${size}.png`);
  }
  
  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);
