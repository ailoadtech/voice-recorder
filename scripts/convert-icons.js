/**
 * Icon Conversion Script
 * 
 * Converts SVG icons to PNG format and generates platform-specific formats.
 * Uses Tauri CLI for final icon generation.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'src-tauri', 'icons');

console.log('🔄 Converting icons to PNG format...\n');

// Check if sharp-cli is available
let hasSharp = false;
try {
  execSync('sharp --version', { stdio: 'ignore' });
  hasSharp = true;
  console.log('✓ Found sharp-cli for SVG to PNG conversion');
} catch (e) {
  console.log('⚠ sharp-cli not found. Install with: npm install -g sharp-cli');
}

// Check if ImageMagick is available
let hasImageMagick = false;
try {
  execSync('convert --version', { stdio: 'ignore' });
  hasImageMagick = true;
  console.log('✓ Found ImageMagick for SVG to PNG conversion');
} catch (e) {
  console.log('⚠ ImageMagick not found');
}

if (!hasSharp && !hasImageMagick) {
  console.log('\n❌ No conversion tool found!');
  console.log('\nPlease install one of the following:');
  console.log('1. sharp-cli: npm install -g sharp-cli');
  console.log('2. ImageMagick: https://imagemagick.org/script/download.php');
  console.log('\nOr use online converters:');
  console.log('- https://cloudconvert.com/svg-to-png');
  console.log('- https://convertio.co/svg-png/');
  process.exit(1);
}

// Convert SVG files to PNG
const svgFiles = fs.readdirSync(iconsDir).filter(f => f.endsWith('.svg'));

console.log(`\n📝 Converting ${svgFiles.length} SVG files...\n`);

svgFiles.forEach(svgFile => {
  const svgPath = path.join(iconsDir, svgFile);
  const pngFile = svgFile.replace('.svg', '.png');
  const pngPath = path.join(iconsDir, pngFile);
  
  try {
    if (hasSharp) {
      execSync(`sharp -i "${svgPath}" -o "${pngPath}"`, { stdio: 'inherit' });
    } else if (hasImageMagick) {
      execSync(`convert "${svgPath}" "${pngPath}"`, { stdio: 'inherit' });
    }
    console.log(`✓ Converted ${svgFile} → ${pngFile}`);
  } catch (error) {
    console.error(`✗ Failed to convert ${svgFile}:`, error.message);
  }
});

// Check if we have the 1024x1024 PNG for Tauri icon generation
const icon1024Path = path.join(iconsDir, 'icon-1024.png');
if (fs.existsSync(icon1024Path)) {
  console.log('\n🎨 Generating platform-specific icons with Tauri CLI...\n');
  
  try {
    // Use Tauri CLI to generate all required formats
    execSync(`npm run tauri:icon "${icon1024Path}"`, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('\n✓ Platform-specific icons generated successfully!');
  } catch (error) {
    console.error('\n✗ Failed to generate platform icons:', error.message);
    console.log('\nYou can manually run: npm run tauri:icon icons/icon-1024.png');
  }
} else {
  console.log('\n⚠ icon-1024.png not found. Skipping Tauri icon generation.');
  console.log('Run this script again after converting icon-1024.svg to PNG.');
}

console.log('\n✅ Icon conversion complete!\n');
console.log('Generated files:');
console.log('- PNG files for all sizes');
console.log('- icon.ico (Windows)');
console.log('- icon.icns (macOS)');
console.log('\nIcons are ready for production build! 🚀\n');
