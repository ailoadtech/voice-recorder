# Desktop App Packaging Guide

## Overview

This guide covers the complete process of packaging the Voice Intelligence desktop application for distribution across Windows, macOS, and Linux platforms using Tauri.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Build Configuration](#build-configuration)
3. [Platform-Specific Packaging](#platform-specific-packaging)
4. [Distribution Formats](#distribution-formats)
5. [Build Process](#build-process)
6. [Testing Installers](#testing-installers)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### All Platforms

- Node.js 18+ and npm
- Rust toolchain (installed via rustup)
- Tauri CLI (`@tauri-apps/cli`)

### Windows

- **Visual Studio Build Tools** or Visual Studio 2019+
- **WebView2 Runtime** (automatically installed by installer)
- **WiX Toolset v3** (for MSI installers)
  ```powershell
  # Install WiX via Chocolatey
  choco install wixtoolset
  
  # Or download from: https://wixtoolset.org/releases/
  ```

### macOS

- **Xcode Command Line Tools**
  ```bash
  xcode-select --install
  ```
- **Apple Developer Account** (for distribution)

### Linux

- **Build essentials**
  ```bash
  # Debian/Ubuntu
  sudo apt-get install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
  
  # Fedora
  sudo dnf install webkit2gtk4.0-devel \
    openssl-devel \
    curl \
    wget \
    file \
    libappindicator-gtk3-devel \
    librsvg2-devel
  
  # Arch
  sudo pacman -S webkit2gtk \
    base-devel \
    curl \
    wget \
    file \
    openssl \
    appmenu-gtk-module \
    gtk3 \
    libappindicator-gtk3 \
    librsvg
  ```

## Build Configuration

### Package Metadata

The application metadata is configured in `src-tauri/tauri.conf.json`:

```json
{
  "productName": "Voice Intelligence",
  "version": "0.1.0",
  "identifier": "com.voiceintelligence.app",
  "bundle": {
    "publisher": "Voice Intelligence",
    "copyright": "Copyright © 2026 Voice Intelligence. All rights reserved.",
    "category": "Productivity",
    "shortDescription": "Voice recording with AI-powered transcription and enrichment",
    "longDescription": "Voice Intelligence is a desktop application..."
  }
}
```

### Version Management

Update version in multiple locations:

1. **package.json**
   ```json
   {
     "version": "0.1.0"
   }
   ```

2. **src-tauri/Cargo.toml**
   ```toml
   [package]
   version = "0.1.0"
   ```

3. **src-tauri/tauri.conf.json**
   ```json
   {
     "version": "0.1.0"
   }
   ```

**Tip:** Use a script to sync versions:
```bash
npm version patch  # Updates package.json
# Then manually update Cargo.toml and tauri.conf.json
```

## Platform-Specific Packaging

### Windows

#### MSI Installer (WiX)

**Features:**
- Professional Windows installer
- Add/Remove Programs integration
- Upgrade/downgrade handling
- Custom installation directory

**Configuration:**
```json
{
  "bundle": {
    "windows": {
      "wix": {
        "language": "en-US",
        "skipWebviewInstall": false,
        "enableElevatedUpdateTask": false
      }
    }
  }
}
```

**Build:**
```bash
npm run tauri:build -- --target x86_64-pc-windows-msvc
```

**Output:**
- `src-tauri/target/release/bundle/msi/Voice Intelligence_0.1.0_x64_en-US.msi`

#### NSIS Installer

**Features:**
- Lightweight installer
- Modern UI
- Per-user or per-machine installation
- Custom branding

**Configuration:**
```json
{
  "bundle": {
    "windows": {
      "nsis": {
        "installMode": "currentUser",
        "languages": ["en-US"],
        "compression": "lzma"
      }
    }
  }
}
```

**Build:**
```bash
npm run tauri:build -- --bundles nsis
```

**Output:**
- `src-tauri/target/release/bundle/nsis/Voice Intelligence_0.1.0_x64-setup.exe`

### macOS

#### DMG Installer

**Features:**
- Drag-and-drop installation
- Custom background image
- Automatic code signing
- Notarization support

**Configuration:**
```json
{
  "bundle": {
    "macOS": {
      "minimumSystemVersion": "10.13",
      "dmg": {
        "windowSize": {
          "width": 660,
          "height": 400
        },
        "appPosition": {
          "x": 180,
          "y": 170
        },
        "applicationFolderPosition": {
          "x": 480,
          "y": 170
        }
      }
    }
  }
}
```

**Build:**
```bash
# Intel Macs
npm run tauri:build -- --target x86_64-apple-darwin

# Apple Silicon
npm run tauri:build -- --target aarch64-apple-darwin

# Universal binary (both architectures)
npm run tauri:build -- --target universal-apple-darwin
```

**Output:**
- `src-tauri/target/release/bundle/dmg/Voice Intelligence_0.1.0_aarch64.dmg`
- `src-tauri/target/release/bundle/dmg/Voice Intelligence_0.1.0_x64.dmg`

#### App Bundle

**Output:**
- `src-tauri/target/release/bundle/macos/Voice Intelligence.app`

### Linux

#### AppImage

**Features:**
- Single-file executable
- No installation required
- Works on most distributions
- Portable

**Build:**
```bash
npm run tauri:build -- --bundles appimage
```

**Output:**
- `src-tauri/target/release/bundle/appimage/voice-intelligence_0.1.0_amd64.AppImage`

#### Debian Package (.deb)

**Features:**
- Native package for Debian/Ubuntu
- APT integration
- Dependency management

**Configuration:**
```json
{
  "bundle": {
    "linux": {
      "deb": {
        "depends": []
      }
    }
  }
}
```

**Build:**
```bash
npm run tauri:build -- --bundles deb
```

**Output:**
- `src-tauri/target/release/bundle/deb/voice-intelligence_0.1.0_amd64.deb`

## Distribution Formats

### Comparison

| Format | Platform | Size | Installation | Updates | Best For |
|--------|----------|------|--------------|---------|----------|
| MSI | Windows | Medium | System-wide | Windows Update | Enterprise |
| NSIS | Windows | Small | User/System | Custom | General users |
| DMG | macOS | Medium | Drag-drop | Manual/Auto | macOS standard |
| AppImage | Linux | Large | None | Manual | Portable |
| .deb | Linux | Small | APT | APT | Debian/Ubuntu |

### Recommended Formats

**Windows:**
- Primary: NSIS (easier for users)
- Alternative: MSI (enterprise environments)

**macOS:**
- Primary: DMG (standard distribution)
- Alternative: App bundle (for testing)

**Linux:**
- Primary: AppImage (universal)
- Alternative: .deb (Debian/Ubuntu users)

## Build Process

### Development Build

```bash
# Build for current platform
npm run tauri:build

# Build with debug symbols
npm run tauri:build -- --debug
```

### Production Build

```bash
# Clean previous builds
rm -rf src-tauri/target/release/bundle

# Build optimized release
npm run tauri:build

# Build specific format
npm run tauri:build -- --bundles msi,nsis  # Windows
npm run tauri:build -- --bundles dmg       # macOS
npm run tauri:build -- --bundles appimage,deb  # Linux
```

### Multi-Platform Build

**Using GitHub Actions:**

See `.github/workflows/build-and-sign.yml.template` for automated multi-platform builds.

**Manual (requires multiple machines/VMs):**

```bash
# On Windows
npm run tauri:build -- --bundles msi,nsis

# On macOS
npm run tauri:build -- --target universal-apple-darwin

# On Linux
npm run tauri:build -- --bundles appimage,deb
```

### Build Optimization

**Reduce Bundle Size:**

1. **Enable LTO (Link Time Optimization):**
   ```toml
   # src-tauri/Cargo.toml
   [profile.release]
   lto = true
   codegen-units = 1
   opt-level = "z"  # Optimize for size
   strip = true     # Strip symbols
   ```

2. **Minimize dependencies:**
   ```bash
   # Analyze bundle size
   cargo bloat --release -n 10
   ```

3. **Configure Next.js:**
   ```javascript
   // next.config.ts
   module.exports = {
     output: 'export',
     images: {
       unoptimized: true
     },
     // Enable compression
     compress: true
   }
   ```

## Testing Installers

### Pre-Release Checklist

- [ ] Version numbers match across all files
- [ ] Icons are properly configured
- [ ] Code signing configured (if applicable)
- [ ] License file included (if applicable)
- [ ] README and documentation updated
- [ ] Environment variables documented
- [ ] API keys removed from build

### Windows Testing

```powershell
# Install MSI
msiexec /i "Voice Intelligence_0.1.0_x64_en-US.msi" /l*v install.log

# Install NSIS
.\Voice_Intelligence_0.1.0_x64-setup.exe

# Verify installation
Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* | 
  Where-Object { $_.DisplayName -like "*Voice Intelligence*" }

# Test application
& "C:\Program Files\Voice Intelligence\Voice Intelligence.exe"

# Uninstall
msiexec /x "Voice Intelligence_0.1.0_x64_en-US.msi"
```

### macOS Testing

```bash
# Mount DMG
hdiutil attach "Voice Intelligence_0.1.0_aarch64.dmg"

# Copy to Applications
cp -R "/Volumes/Voice Intelligence/Voice Intelligence.app" /Applications/

# Verify signature
codesign -vvv --deep --strict "/Applications/Voice Intelligence.app"

# Test application
open "/Applications/Voice Intelligence.app"

# Unmount DMG
hdiutil detach "/Volumes/Voice Intelligence"

# Uninstall
rm -rf "/Applications/Voice Intelligence.app"
```

### Linux Testing

```bash
# Test AppImage
chmod +x voice-intelligence_0.1.0_amd64.AppImage
./voice-intelligence_0.1.0_amd64.AppImage

# Install .deb
sudo dpkg -i voice-intelligence_0.1.0_amd64.deb
sudo apt-get install -f  # Fix dependencies

# Test application
voice-intelligence

# Uninstall
sudo apt-get remove voice-intelligence
```

### Automated Testing

```bash
# Create test script
cat > test-installer.sh << 'EOF'
#!/bin/bash
set -e

echo "Testing installer..."

# Install
if [[ "$OSTYPE" == "darwin"* ]]; then
  hdiutil attach "Voice Intelligence_0.1.0_aarch64.dmg"
  cp -R "/Volumes/Voice Intelligence/Voice Intelligence.app" /Applications/
  hdiutil detach "/Volumes/Voice Intelligence"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  chmod +x voice-intelligence_0.1.0_amd64.AppImage
  ./voice-intelligence_0.1.0_amd64.AppImage --appimage-extract
fi

echo "Installation successful!"
EOF

chmod +x test-installer.sh
./test-installer.sh
```

## Troubleshooting

### Common Issues

#### "WebView2 not found" (Windows)

**Solution:**
- Ensure `skipWebviewInstall: false` in tauri.conf.json
- Or install WebView2 manually: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

#### "Code signature invalid" (macOS)

**Solution:**
```bash
# Re-sign the app
codesign --force --deep --sign "Developer ID Application: Your Name" "Voice Intelligence.app"

# Verify
codesign -vvv --deep --strict "Voice Intelligence.app"
```

#### "Application damaged" (macOS)

**Solution:**
```bash
# Remove quarantine attribute
xattr -cr "Voice Intelligence.app"
```

#### "Permission denied" (Linux)

**Solution:**
```bash
# Make AppImage executable
chmod +x voice-intelligence_0.1.0_amd64.AppImage

# Or use FUSE
sudo apt-get install fuse libfuse2
```

#### Build fails with "linker error"

**Solution:**
```bash
# Clean and rebuild
cargo clean
npm run tauri:build
```

### Build Logs

**Location:**
- Windows: `src-tauri/target/release/build/`
- macOS: `src-tauri/target/release/build/`
- Linux: `src-tauri/target/release/build/`

**View logs:**
```bash
# Verbose build
npm run tauri:build -- --verbose

# Save logs
npm run tauri:build 2>&1 | tee build.log
```

## Distribution Checklist

### Pre-Distribution

- [ ] Test installer on clean system
- [ ] Verify all features work
- [ ] Check for hardcoded paths
- [ ] Validate code signing
- [ ] Test auto-update (if implemented)
- [ ] Review privacy policy
- [ ] Prepare release notes

### Distribution Channels

**Direct Download:**
- Host installers on website
- Provide checksums (SHA256)
- Include installation instructions

**Package Managers:**
- Windows: Chocolatey, Winget
- macOS: Homebrew Cask
- Linux: Snap, Flatpak, AUR

**App Stores:**
- Microsoft Store (Windows)
- Mac App Store (macOS)
- Snap Store (Linux)

### Post-Distribution

- [ ] Monitor crash reports
- [ ] Track download statistics
- [ ] Collect user feedback
- [ ] Plan update schedule
- [ ] Maintain documentation

## Next Steps

1. **Configure icons:** See [Icon Generation](#icon-generation)
2. **Set up code signing:** See [CODE_SIGNING.md](CODE_SIGNING.md)
3. **Create CI/CD pipeline:** See [build-and-sign.yml.template](../.github/workflows/build-and-sign.yml.template)
4. **Test installers:** Follow [Testing Installers](#testing-installers)
5. **Distribute:** Choose distribution channels

## Resources

- [Tauri Bundle Documentation](https://tauri.app/v1/guides/building/)
- [WiX Toolset](https://wixtoolset.org/)
- [NSIS Documentation](https://nsis.sourceforge.io/Docs/)
- [Apple Distribution Guide](https://developer.apple.com/distribution/)
- [AppImage Documentation](https://docs.appimage.org/)

---

**Note:** This guide assumes Tauri v2. Configuration may differ for other versions.
