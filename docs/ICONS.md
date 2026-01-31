# Application Icons Guide

Complete guide for generating, customizing, and managing application icons for the Voice Intelligence Desktop App.

## Overview

The app uses a professional microphone-based icon design that represents its core voice recording functionality. Icons are generated in multiple formats and sizes to support all platforms (Windows, macOS, Linux).

## Quick Start

### Generate All Icons

```bash
npm run icons:build
```

This single command:
1. Generates SVG icons with microphone design
2. Converts SVG to PNG format
3. Creates platform-specific formats (.ico for Windows, .icns for macOS)

### Prerequisites

Install one of these conversion tools:

**Option 1: sharp-cli (Recommended)**
```bash
npm install -g sharp-cli
```

**Option 2: ImageMagick**
```bash
# Linux
sudo apt-get install imagemagick

# macOS  
brew install imagemagick

# Windows
# Download from https://imagemagick.org/script/download.php
```

## Icon Formats

### Source Files (SVG)
Vector graphics that can scale to any size without quality loss:
- `16x16.svg` through `icon-1024.svg`
- `icon.svg` (system tray)

### Raster Files (PNG)
Bitmap images at specific sizes:
- `16x16.png` - Tiny icon
- `32x32.png` - Small icon (Windows taskbar)
- `64x64.png` - Medium icon
- `128x128.png` - Standard icon
- `128x128@2x.png` - Retina/HiDPI (256x256)
- `512x512.png` - Large icon
- `icon-1024.png` - Master icon (1024x1024)
- `icon.png` - System tray (128x128)

### Platform-Specific
- `icon.ico` - Windows executable icon (contains multiple sizes)
- `icon.icns` - macOS bundle icon (contains multiple sizes)

## Icon Design

### Current Design
The default icon features:
- **Background**: Blue gradient (#3B82F6 to #2563EB)
- **Symbol**: White microphone with stand
- **Accent**: Sound wave decorations
- **Style**: Modern, flat design with subtle depth

### Design Principles
- **Simplicity**: Recognizable at 16x16 pixels
- **Contrast**: Visible on light and dark backgrounds
- **Relevance**: Microphone represents voice recording
- **Scalability**: Vector-based for all sizes

## Scripts

### npm run icons:generate
Generates SVG icons with the microphone design.

**Output:**
- All SVG files in `src-tauri/icons/`
- `CONVERSION_GUIDE.md` with next steps

**When to use:**
- Initial icon setup
- After modifying icon design in `scripts/generate-icons.js`

### npm run icons:convert
Converts SVG to PNG and generates platform-specific formats.

**Requirements:**
- sharp-cli or ImageMagick installed
- SVG files must exist

**Output:**
- PNG files for all sizes
- `icon.ico` (Windows)
- `icon.icns` (macOS)

**When to use:**
- After generating SVG icons
- When updating icon design

### npm run icons:build
Runs both `icons:generate` and `icons:convert` in sequence.

**When to use:**
- Complete icon generation workflow
- First-time setup
- After design changes

### npm run tauri:icon
Tauri CLI command for generating platform-specific icons from a single PNG.

**Usage:**
```bash
npm run tauri:icon icons/icon-1024.png
```

**When to use:**
- You have a custom 1024x1024 PNG
- Quick regeneration of platform formats

## Customization

### Method 1: Modify SVG Design

Edit the icon design in `scripts/generate-icons.js`:

```javascript
const createSVGIcon = (size) => {
  // Modify the SVG markup here
  return `<svg width="${size}" height="${size}">
    <!-- Your custom design -->
  </svg>`;
};
```

Then regenerate:
```bash
npm run icons:build
```

### Method 2: Use Custom PNG

If you have a professionally designed icon:

1. Save as `src-tauri/icons/icon-1024.png` (1024x1024, transparent background)
2. Generate all formats:
   ```bash
   npm run tauri:icon icons/icon-1024.png
   ```

### Method 3: Replace Individual Files

Manually create and place icon files in `src-tauri/icons/`:
- Ensure all required sizes exist
- Follow naming conventions
- Use PNG format with transparency
- Test at all sizes

## Platform Guidelines

### Windows
- **Format**: .ico (multi-size)
- **Sizes**: 16, 32, 48, 64, 128, 256
- **Style**: Flat, colorful, simple shapes
- **Background**: Transparent or solid color
- **Testing**: Check taskbar, window title, installer

### macOS
- **Format**: .icns (multi-size)
- **Sizes**: 16, 32, 64, 128, 256, 512, 1024 (with @2x variants)
- **Style**: Rounded corners, subtle shadows, depth
- **Background**: Transparent
- **Testing**: Check dock, Finder, Launchpad

### Linux
- **Format**: PNG
- **Sizes**: 16, 32, 48, 64, 128, 256, 512
- **Style**: Varies by desktop environment
- **Background**: Transparent
- **Testing**: Check application menu, taskbar

## Configuration

Icons are referenced in `src-tauri/tauri.conf.json`:

```json
{
  "bundle": {
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  },
  "app": {
    "trayIcon": {
      "iconPath": "icons/icon.png"
    }
  }
}
```

## Troubleshooting

### Icons not showing in development
```bash
# Clear cache and restart
npm run clean
npm run tauri:dev
```

### Icons not showing in production build
- Verify all icon files exist in `src-tauri/icons/`
- Check `tauri.conf.json` paths are correct
- Rebuild: `npm run tauri:build`

### Conversion script fails
```bash
# Install sharp-cli
npm install -g sharp-cli

# Or install ImageMagick
# Linux: sudo apt-get install imagemagick
# macOS: brew install imagemagick
# Windows: Download from imagemagick.org
```

### Icons look blurry
- Ensure PNG files are used (not SVG) in final build
- Verify high-DPI versions (@2x) are generated
- Check icon sizes match platform requirements
- Use `npm run tauri:icon` to regenerate

### macOS .icns generation fails
- Requires macOS with `iconutil` command
- Alternative: Use online converter (https://iconverticons.com)
- Or build on macOS machine

### Windows .ico generation fails
- Install ImageMagick
- Or use online converter (https://icoconvert.com)
- Or use `npm run tauri:icon` which handles it automatically

## Testing Icons

### Visual Testing
1. **Small sizes (16x16, 32x32)**
   - Icon should be recognizable
   - Main elements visible
   - Not too cluttered

2. **Medium sizes (64x64, 128x128)**
   - Details clear
   - Colors accurate
   - Good contrast

3. **Large sizes (256x256, 512x512, 1024x1024)**
   - Sharp edges
   - No pixelation
   - Professional appearance

### Platform Testing

**Windows:**
```bash
npm run tauri:build
# Check: Taskbar, window title, installer, Start menu
```

**macOS:**
```bash
npm run tauri:build
# Check: Dock, Finder, Launchpad, About dialog
```

**Linux:**
```bash
npm run tauri:build
# Check: Application menu, taskbar, window title
```

### Background Testing
Test icons on:
- Light backgrounds (white, light gray)
- Dark backgrounds (black, dark gray)
- Colored backgrounds (various colors)
- Transparent backgrounds

## Production Checklist

Before releasing:

- [ ] All icon sizes generated (16x16 to 1024x1024)
- [ ] PNG files created from SVG
- [ ] icon.ico generated for Windows
- [ ] icon.icns generated for macOS
- [ ] Icons tested at all sizes
- [ ] Icons visible on light backgrounds
- [ ] Icons visible on dark backgrounds
- [ ] System tray icon displays correctly
- [ ] App icon shows in taskbar/dock
- [ ] Installer icon displays correctly
- [ ] Icons look professional and polished
- [ ] No pixelation or blurriness
- [ ] Consistent with app branding

## Resources

### Tools
- [sharp-cli](https://www.npmjs.com/package/sharp-cli) - SVG to PNG conversion
- [ImageMagick](https://imagemagick.org/) - Image manipulation
- [Tauri CLI](https://tauri.app/v1/guides/features/icons) - Icon generation

### Online Converters
- [CloudConvert](https://cloudconvert.com/svg-to-png) - SVG to PNG
- [ICO Convert](https://icoconvert.com/) - PNG to ICO
- [IconVerticons](https://iconverticons.com/) - PNG to ICNS

### Design Resources
- [Figma](https://www.figma.com/) - Icon design
- [Inkscape](https://inkscape.org/) - Vector graphics editor
- [GIMP](https://www.gimp.org/) - Raster graphics editor

### Guidelines
- [Windows Icon Guidelines](https://docs.microsoft.com/en-us/windows/apps/design/style/iconography)
- [macOS Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Tauri Icon Documentation](https://tauri.app/v1/guides/features/icons)

## File Structure

```
src-tauri/icons/
├── 16x16.svg              # Tiny icon (SVG)
├── 16x16.png              # Tiny icon (PNG)
├── 32x32.svg              # Small icon (SVG)
├── 32x32.png              # Small icon (PNG)
├── 64x64.svg              # Medium icon (SVG)
├── 64x64.png              # Medium icon (PNG)
├── 128x128.svg            # Standard icon (SVG)
├── 128x128.png            # Standard icon (PNG)
├── 128x128@2x.svg         # Retina icon (SVG, 256x256)
├── 128x128@2x.png         # Retina icon (PNG, 256x256)
├── 512x512.svg            # Large icon (SVG)
├── 512x512.png            # Large icon (PNG)
├── icon-1024.svg          # Master icon (SVG)
├── icon-1024.png          # Master icon (PNG)
├── icon.svg               # System tray (SVG)
├── icon.png               # System tray (PNG)
├── icon.ico               # Windows multi-size icon
├── icon.icns              # macOS multi-size icon
├── README.md              # Icon documentation
└── CONVERSION_GUIDE.md    # Conversion instructions
```

## Next Steps

1. **Generate icons**: `npm run icons:build`
2. **Test in development**: `npm run tauri:dev`
3. **Test in production**: `npm run tauri:build`
4. **Customize if needed**: Edit `scripts/generate-icons.js`
5. **Document changes**: Update this guide if you modify the workflow

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review Tauri icon documentation
3. Check platform-specific guidelines
4. Test with different conversion tools
5. Consider hiring a professional designer for custom icons
