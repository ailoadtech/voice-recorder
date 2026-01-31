/**
 * Icon Generator Script
 * 
 * Generates app icons for Tauri desktop application.
 * Creates a professional microphone-based icon design.
 */

const fs = require('fs');
const path = require('path');

/**
 * Create an SVG icon with microphone design
 * Represents voice recording functionality
 */
const createSVGIcon = (size) => {
  const padding = size * 0.15;
  const micWidth = size * 0.25;
  const micHeight = size * 0.35;
  const micX = size * 0.5;
  const micY = size * 0.35;
  const standHeight = size * 0.15;
  
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <!-- Background with gradient -->
  <defs>
    <linearGradient id="bg-gradient-${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563EB;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="mic-gradient-${size}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#E5E7EB;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Rounded background -->
  <rect width="${size}" height="${size}" fill="url(#bg-gradient-${size})" rx="${size * 0.18}"/>
  
  <!-- Microphone body -->
  <rect x="${micX - micWidth/2}" y="${micY - micHeight/2}" 
        width="${micWidth}" height="${micHeight}" 
        fill="url(#mic-gradient-${size})" rx="${micWidth * 0.4}"/>
  
  <!-- Microphone grille lines -->
  <line x1="${micX - micWidth/3}" y1="${micY - micHeight/4}" 
        x2="${micX + micWidth/3}" y2="${micY - micHeight/4}" 
        stroke="#3B82F6" stroke-width="${size * 0.015}" stroke-linecap="round"/>
  <line x1="${micX - micWidth/3}" y1="${micY}" 
        x2="${micX + micWidth/3}" y2="${micY}" 
        stroke="#3B82F6" stroke-width="${size * 0.015}" stroke-linecap="round"/>
  <line x1="${micX - micWidth/3}" y1="${micY + micHeight/4}" 
        x2="${micX + micWidth/3}" y2="${micY + micHeight/4}" 
        stroke="#3B82F6" stroke-width="${size * 0.015}" stroke-linecap="round"/>
  
  <!-- Microphone stand -->
  <path d="M ${micX - micWidth * 0.6} ${micY + micHeight/2 + size * 0.05} 
           Q ${micX} ${micY + micHeight/2 + size * 0.15} 
           ${micX + micWidth * 0.6} ${micY + micHeight/2 + size * 0.05}" 
        stroke="white" stroke-width="${size * 0.04}" fill="none" stroke-linecap="round"/>
  <line x1="${micX}" y1="${micY + micHeight/2}" 
        x2="${micX}" y2="${micY + micHeight/2 + standHeight}" 
        stroke="white" stroke-width="${size * 0.04}" stroke-linecap="round"/>
  
  <!-- Sound waves (decorative) -->
  <path d="M ${micX + micWidth * 0.8} ${micY - size * 0.08} 
           Q ${micX + micWidth * 1.1} ${micY} 
           ${micX + micWidth * 0.8} ${micY + size * 0.08}" 
        stroke="white" stroke-width="${size * 0.025}" fill="none" 
        stroke-linecap="round" opacity="0.6"/>
  <path d="M ${micX + micWidth * 1.1} ${micY - size * 0.12} 
           Q ${micX + micWidth * 1.5} ${micY} 
           ${micX + micWidth * 1.1} ${micY + size * 0.12}" 
        stroke="white" stroke-width="${size * 0.025}" fill="none" 
        stroke-linecap="round" opacity="0.4"/>
</svg>`;
};

/**
 * Generate PNG data URL from SVG (for Node.js without external dependencies)
 */
const svgToPngDataUrl = (svg) => {
  // For actual PNG conversion, we'd need sharp or similar
  // For now, we'll save SVG and provide instructions
  return svg;
};

// Icon sizes needed for different platforms
const iconSizes = [
  { size: 16, filename: '16x16.png' },
  { size: 32, filename: '32x32.png' },
  { size: 64, filename: '64x64.png' },
  { size: 128, filename: '128x128.png' },
  { size: 256, filename: '128x128@2x.png' },
  { size: 512, filename: '512x512.png' },
  { size: 1024, filename: 'icon-1024.png' }
];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'src-tauri', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Generating Voice Intelligence app icons...\n');

// Generate SVG icons for each size
iconSizes.forEach(({ size, filename }) => {
  const svg = createSVGIcon(size);
  const svgFilename = filename.replace('.png', '.svg');
  const svgPath = path.join(iconsDir, svgFilename);
  
  fs.writeFileSync(svgPath, svg);
  console.log(`✓ Generated ${svgFilename} (${size}x${size})`);
});

// Generate the main icon.svg for system tray
const mainIcon = createSVGIcon(128);
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), mainIcon);
console.log('✓ Generated icon.svg for system tray');

// Create a README for icon conversion
const conversionGuide = `# Icon Conversion Guide

## SVG Icons Generated

All SVG icons have been generated. To convert them to PNG/ICO/ICNS formats:

### Option 1: Using Sharp (Recommended)

\`\`\`bash
npm install -g sharp-cli

# Convert all SVG to PNG
for file in *.svg; do
  sharp -i "$file" -o "\${file%.svg}.png"
done
\`\`\`

### Option 2: Using Tauri CLI (Easiest)

\`\`\`bash
# Use the 1024x1024 icon as source
npm run tauri icon icons/icon-1024.png
\`\`\`

This will automatically generate all required formats:
- PNG files for all sizes
- icon.ico for Windows
- icon.icns for macOS

### Option 3: Using ImageMagick

\`\`\`bash
# Install ImageMagick
sudo apt-get install imagemagick  # Linux
brew install imagemagick          # macOS

# Convert SVG to PNG
for file in *.svg; do
  convert "$file" "\${file%.svg}.png"
done

# Generate Windows .ico (multiple sizes)
convert icon-1024.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico

# Generate macOS .icns (requires macOS)
# 1. Create icon.iconset directory
mkdir icon.iconset
# 2. Copy required sizes
cp 16x16.png icon.iconset/icon_16x16.png
cp 32x32.png icon.iconset/icon_16x16@2x.png
cp 32x32.png icon.iconset/icon_32x32.png
cp 64x64.png icon.iconset/icon_32x32@2x.png
cp 128x128.png icon.iconset/icon_128x128.png
cp 256x256.png icon.iconset/icon_128x128@2x.png
cp 256x256.png icon.iconset/icon_256x256.png
cp 512x512.png icon.iconset/icon_256x256@2x.png
cp 512x512.png icon.iconset/icon_512x512.png
cp 1024x1024.png icon.iconset/icon_512x512@2x.png
# 3. Generate .icns
iconutil -c icns icon.iconset
\`\`\`

### Option 4: Online Converters

1. Go to https://cloudconvert.com/svg-to-png
2. Upload the SVG files
3. Convert to PNG
4. Use https://icoconvert.com/ for .ico
5. Use https://iconverticons.com/online/ for .icns

## Current Status

✓ SVG icons generated
⚠ PNG conversion needed
⚠ ICO file needed (Windows)
⚠ ICNS file needed (macOS)

Run one of the conversion methods above to complete icon setup.
`;

fs.writeFileSync(path.join(iconsDir, 'CONVERSION_GUIDE.md'), conversionGuide);
console.log('✓ Generated CONVERSION_GUIDE.md');

console.log('\n📋 Next Steps:');
console.log('1. Convert SVG to PNG using one of the methods in CONVERSION_GUIDE.md');
console.log('2. Recommended: Run "npm run tauri icon icons/icon-1024.png" after PNG conversion');
console.log('3. This will generate icon.ico (Windows) and icon.icns (macOS)');
console.log('\n💡 For production: Consider hiring a designer for professional icons');
console.log('   Current icons are functional placeholders with microphone design.\n');
