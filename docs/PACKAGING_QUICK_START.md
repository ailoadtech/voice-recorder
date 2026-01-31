# Packaging Quick Start

Quick reference for packaging the Voice Intelligence desktop app.

## TL;DR

```bash
# Build for current platform (all formats)
npm run package

# Build specific format
npm run package:windows  # MSI + NSIS
npm run package:macos    # DMG
npm run package:linux    # AppImage + DEB

# Clean build
npm run package:clean
```

## Prerequisites

### All Platforms
- Node.js 18+
- Rust toolchain
- Tauri CLI (installed via npm)

### Windows
- Visual Studio Build Tools
- WiX Toolset (for MSI)

### macOS
- Xcode Command Line Tools
- Apple Developer Account (for distribution)

### Linux
- Build essentials
- WebKit2GTK

## Quick Commands

### Build Commands

```bash
# Standard build
npm run tauri:build

# Debug build
npm run tauri:build:debug

# Platform-specific
npm run package:windows
npm run package:macos
npm run package:linux

# Custom format
npm run tauri:build -- --bundles msi
npm run tauri:build -- --bundles dmg
npm run tauri:build -- --bundles appimage,deb
```

### Icon Generation

```bash
# Generate all icon formats from a 1024x1024 PNG
npm run tauri:icon path/to/icon-1024.png
```

### Code Signing

```bash
# Setup code signing
npm run sign:setup

# List certificates
npm run sign:list
```

## Output Locations

All build artifacts are in `src-tauri/target/release/bundle/`:

**Windows:**
- `msi/Voice Intelligence_0.1.0_x64_en-US.msi`
- `nsis/Voice Intelligence_0.1.0_x64-setup.exe`

**macOS:**
- `dmg/Voice Intelligence_0.1.0_aarch64.dmg`
- `macos/Voice Intelligence.app`

**Linux:**
- `appimage/voice-intelligence_0.1.0_amd64.AppImage`
- `deb/voice-intelligence_0.1.0_amd64.deb`

## Testing Installers

### Windows

```powershell
# Install MSI
msiexec /i "Voice Intelligence_0.1.0_x64_en-US.msi"

# Install NSIS
.\Voice_Intelligence_0.1.0_x64-setup.exe

# Verify
Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* | 
  Where-Object { $_.DisplayName -like "*Voice Intelligence*" }
```

### macOS

```bash
# Mount and install
hdiutil attach "Voice Intelligence_0.1.0_aarch64.dmg"
cp -R "/Volumes/Voice Intelligence/Voice Intelligence.app" /Applications/
hdiutil detach "/Volumes/Voice Intelligence"

# Verify signature
codesign -vvv --deep --strict "/Applications/Voice Intelligence.app"
```

### Linux

```bash
# AppImage
chmod +x voice-intelligence_0.1.0_amd64.AppImage
./voice-intelligence_0.1.0_amd64.AppImage

# DEB
sudo dpkg -i voice-intelligence_0.1.0_amd64.deb
```

## Common Issues

### "WebView2 not found" (Windows)
- Installer should include WebView2
- Or download from: https://developer.microsoft.com/microsoft-edge/webview2/

### "Application damaged" (macOS)
```bash
xattr -cr "Voice Intelligence.app"
```

### "Permission denied" (Linux)
```bash
chmod +x voice-intelligence_0.1.0_amd64.AppImage
```

## Distribution Formats

| Format | Platform | Size | Best For |
|--------|----------|------|----------|
| MSI | Windows | Medium | Enterprise |
| NSIS | Windows | Small | General users |
| DMG | macOS | Medium | Standard |
| AppImage | Linux | Large | Portable |
| .deb | Linux | Small | Debian/Ubuntu |

## Pre-Release Checklist

- [ ] Version numbers updated
- [ ] Icons configured
- [ ] Code signing setup (if applicable)
- [ ] Test on clean system
- [ ] Verify all features work
- [ ] Check for hardcoded paths
- [ ] Review release notes

## Advanced Options

### Custom Build

```bash
# Specific target
npm run tauri:build -- --target x86_64-pc-windows-msvc

# Multiple formats
npm run tauri:build -- --bundles msi,nsis

# With verbose output
npm run tauri:build -- --verbose
```

### Optimize Bundle Size

Edit `src-tauri/Cargo.toml`:

```toml
[profile.release]
lto = true
codegen-units = 1
opt-level = "z"
strip = true
```

### Package Script Options

```bash
# Show help
node scripts/package.js --help

# Custom format
node scripts/package.js --format msi

# Debug build
node scripts/package.js --debug

# Skip checksums
node scripts/package.js --no-checksums
```

## Next Steps

1. **Configure icons:** `npm run tauri:icon icon.png`
2. **Setup signing:** `npm run sign:setup`
3. **Build package:** `npm run package`
4. **Test installer:** Follow platform-specific instructions
5. **Distribute:** Upload to website or app store

## Resources

- **Full Guide:** [PACKAGING.md](PACKAGING.md)
- **Code Signing:** [CODE_SIGNING.md](CODE_SIGNING.md)
- **Tauri Docs:** https://tauri.app/v1/guides/building/

---

**Quick Help:** Run `node scripts/package.js --help` for all options.
