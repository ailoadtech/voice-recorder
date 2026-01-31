# Icon Conversion Guide

## SVG Icons Generated

All SVG icons have been generated. To convert them to PNG/ICO/ICNS formats:

### Option 1: Using Sharp (Recommended)

```bash
npm install -g sharp-cli

# Convert all SVG to PNG
for file in *.svg; do
  sharp -i "$file" -o "${file%.svg}.png"
done
```

### Option 2: Using Tauri CLI (Easiest)

```bash
# Use the 1024x1024 icon as source
npm run tauri icon icons/icon-1024.png
```

This will automatically generate all required formats:
- PNG files for all sizes
- icon.ico for Windows
- icon.icns for macOS

### Option 3: Using ImageMagick

```bash
# Install ImageMagick
sudo apt-get install imagemagick  # Linux
brew install imagemagick          # macOS

# Convert SVG to PNG
for file in *.svg; do
  convert "$file" "${file%.svg}.png"
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
```

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
