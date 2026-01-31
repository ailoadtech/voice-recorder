# Scripts Directory

This directory contains utility scripts for the Voice Intelligence application.

## Code Signing Scripts

### Windows: `setup-code-signing.ps1`

PowerShell script for setting up code signing on Windows.

**Usage:**

```powershell
# Create a self-signed certificate for development
.\scripts\setup-code-signing.ps1 -CreateSelfSigned

# Import an existing certificate
.\scripts\setup-code-signing.ps1 -CertificatePath .\mycert.pfx -CertificatePassword "mypassword"

# List installed certificates
.\scripts\setup-code-signing.ps1 -ShowThumbprint
```

**Features:**
- Create self-signed certificates for development
- Import existing certificates
- List installed code signing certificates
- Automatically update tauri.conf.json
- Certificate validation and expiration checking

### macOS/Linux: `setup-code-signing.sh`

Bash script for setting up code signing on macOS and Linux.

**Usage:**

```bash
# Setup code signing (interactive)
./scripts/setup-code-signing.sh --setup

# List installed signing identities
./scripts/setup-code-signing.sh --list

# Verify application signature
./scripts/setup-code-signing.sh --verify "./Voice Intelligence.app"
```

**Features:**
- macOS: List and configure Developer ID certificates
- Linux: Create and manage GPG keys
- Verify code signatures
- Automatically update tauri.conf.json

## Dependency Management Scripts

### `update-dependencies.js`

Manages dependency updates with safety checks and automation.

**Usage:**

```bash
# Check for outdated dependencies
npm run deps:check

# Run security audit
npm run deps:audit

# Update patch versions (safe)
npm run deps:update

# Update minor versions
npm run deps:update:minor

# Check for major updates
npm run deps:update:major

# Fix security vulnerabilities
npm run deps:fix

# Advanced usage
node scripts/update-dependencies.js --help
node scripts/update-dependencies.js --update-patch --dry-run
```

**Features:**
- Check for outdated npm and Cargo packages
- Security vulnerability scanning
- Automatic patch/minor updates
- Interactive major update review
- Dry-run mode for safe previews
- Color-coded output for update types

**Update Types:**
- **Patch (x.x.X)**: Bug fixes, security patches - Low risk
- **Minor (x.X.x)**: New features, backward compatible - Medium risk
- **Major (X.x.x)**: Breaking changes - High risk, manual review required

### `security-monitor.js`

Comprehensive security vulnerability monitoring and management.

**Usage:**

```bash
# Run full security scan with report
npm run security:scan

# Run security audit only
npm run security:audit

# Fix vulnerabilities automatically
npm run security:fix

# Generate detailed security report
npm run security:report

# CI mode (fails on critical/high vulnerabilities)
npm run security:ci

# Advanced usage
node scripts/security-monitor.js --help
node scripts/security-monitor.js --scan --ci --severity=high
```

**Features:**
- npm and Cargo security audits
- Vulnerability scanning and reporting
- Automatic fix attempts
- Severity-based filtering
- CI/CD integration
- JSON report generation
- Color-coded vulnerability display

**Severity Levels:**
- **Critical**: Immediate action required
- **High**: Address within 24 hours
- **Moderate**: Address within 1 week
- **Low**: Address in next maintenance cycle

**Documentation:** See [Security Monitoring Guide](../docs/SECURITY_MONITORING.md) for complete details

### `setup-dependency-tools.sh` / `setup-dependency-tools.ps1`

Sets up additional dependency management tools (cargo-audit, cargo-outdated).

**Usage:**

```bash
# Linux/macOS
npm run deps:setup

# Windows
npm run deps:setup:windows
```

**Features:**
- Installs cargo-audit for Rust security scanning
- Installs cargo-outdated for checking outdated crates
- Verifies installations
- Cross-platform support

**Requirements:**
- Rust and Cargo must be installed
- Internet connection for downloading tools

## Automated Dependency Updates

### Dependabot

Automatically checks for dependency updates weekly.

**Configuration:** `.github/dependabot.yml`

**Schedule:** Every Monday at 9:00 AM UTC

**What it monitors:**
- npm packages
- Cargo crates
- GitHub Actions

**Features:**
- Groups minor/patch updates
- Separates major updates for review
- Automatic pull request creation
- Security vulnerability alerts

### GitHub Actions Workflow

**Workflow:** `.github/workflows/dependency-check.yml`

**Triggers:**
- Weekly schedule (Monday 10:00 AM UTC)
- Manual dispatch
- Pull requests modifying dependency files

**What it does:**
- Runs npm audit for security vulnerabilities
- Runs cargo audit for Rust vulnerabilities
- Checks for outdated packages
- Runs Trivy security scanner
- Reviews dependencies in pull requests
- Uploads audit results as artifacts

## Dependency Management Documentation

For detailed dependency management information, see:
- [Dependency Management Guide](../docs/DEPENDENCY_MANAGEMENT.md) - Complete guide
- [Dependency Quick Reference](../docs/DEPENDENCY_QUICK_REFERENCE.md) - Quick commands

## Other Scripts

### `generate-icons.js`

Generates SVG application icons with professional microphone design.

**Usage:**

```bash
# Generate SVG icons
npm run icons:generate

# Generate and convert to all formats
npm run icons:build
```

**Features:**
- Professional microphone-based icon design
- Blue gradient background (#3B82F6 to #2563EB)
- Multiple sizes (16x16 to 1024x1024)
- Sound wave decorations
- Optimized for all platforms

**Output:**
- SVG icons in `src-tauri/icons/`
- CONVERSION_GUIDE.md with next steps

### `convert-icons.js`

Converts SVG icons to PNG and generates platform-specific formats.

**Usage:**

```bash
# Convert icons (requires sharp-cli or ImageMagick)
npm run icons:convert

# Install conversion tool first
npm install -g sharp-cli
# OR
brew install imagemagick  # macOS
sudo apt-get install imagemagick  # Linux
```

**Features:**
- Automatic tool detection (sharp-cli or ImageMagick)
- SVG to PNG conversion for all sizes
- Generates icon.ico for Windows
- Generates icon.icns for macOS
- Uses Tauri CLI for platform formats

**Output:**
- PNG files for all sizes
- icon.ico (Windows multi-size)
- icon.icns (macOS multi-size)

**Documentation:** See [docs/ICONS.md](../docs/ICONS.md) for complete icon guide

### `package.js`

Automates the desktop app packaging process across different platforms and formats.

**Usage:**

```bash
# Build for current platform (all formats)
npm run package

# Build specific format
npm run package:windows  # MSI + NSIS
npm run package:macos    # DMG
npm run package:linux    # AppImage + DEB

# Clean build
npm run package:clean

# Debug build
npm run package:debug

# Advanced usage
node scripts/package.js --help
node scripts/package.js --format msi --clean
node scripts/package.js --target x86_64-pc-windows-msvc
```

**Features:**
- Automated prerequisite checking
- Multi-format builds
- Checksum generation
- Build artifact listing
- Platform-specific optimizations
- Clean build support

### `generate-icons.js`

Generates application icons from a source image.

**Usage:**

```bash
npm run tauri:icon path/to/icon.png
```

### `validate-api-keys.ts`

Validates API key configuration.

**Usage:**

```bash
npm run validate:api-keys
```

### `validate-env.ts`

Validates environment variable configuration.

**Usage:**

```bash
npm run validate-env
```

### `wsl-setup.sh`

Sets up the development environment in WSL.

**Usage:**

```bash
./scripts/wsl-setup.sh
```

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit certificates or private keys to version control**
2. **Use strong passwords for certificate protection**
3. **Store certificates in secure locations**
4. **Use environment variables for sensitive data in CI/CD**
5. **Rotate certificates before expiration**

## Documentation

For detailed code signing information, see:
- [Code Signing Guide](../docs/CODE_SIGNING.md)
- [Tauri Setup Guide](../docs/TAURI_SETUP.md)

## CI/CD Integration

See `.github/workflows/build-and-sign.yml.template` for GitHub Actions integration example.


## Release Management Scripts

### `version.js`

Manages version numbers across all project files.

**Usage:**

```bash
# Show current version
npm run version:current

# Verify all versions match
npm run version:verify

# Increment version
npm run version:patch    # 0.1.0 → 0.1.1
npm run version:minor    # 0.1.0 → 0.2.0
npm run version:major    # 0.1.0 → 1.0.0

# Set specific version
npm run version 1.2.3

# Create git tag
npm run version:tag
```

**Features:**
- Updates package.json, tauri.conf.json, and Cargo.toml
- Semantic versioning support
- Version verification
- Automatic git tag creation
- Prevents version mismatches

**Files Updated:**
- `package.json`
- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`

### `generate-release-notes.js`

Generates release notes from git commits and changelog.

**Usage:**

```bash
# Generate for current version
npm run release:notes

# Generate for specific version
npm run release:notes -- 1.0.0

# Generate from specific tag
npm run release:notes -- --from-tag v0.9.0
```

**Features:**
- Extracts commits from git history
- Categorizes changes (features, fixes, improvements, docs)
- Generates formatted markdown
- Includes installation instructions
- Lists contributors
- Adds system requirements
- Includes checksums section

**Output:** `releases/vX.Y.Z.md`

### `create-distribution.js`

Creates distribution packages with installers and documentation.

**Usage:**

```bash
# Create distribution for current version
npm run release:dist

# Create for specific version
npm run release:dist -- --version 1.0.0

# Clean distribution directory
npm run release:dist:clean
```

**Features:**
- Collects all platform installers
- Generates SHA256 checksums
- Creates manifest.json with metadata
- Copies essential documentation
- Generates installation instructions
- Creates distribution summary

**Output Structure:**
```
dist/vX.Y.Z/
├── Voice-Intelligence-X.Y.Z-setup.msi
├── Voice-Intelligence-X.Y.Z-setup.exe
├── Voice-Intelligence-X.Y.Z.dmg
├── voice-intelligence-X.Y.Z.AppImage
├── voice-intelligence_X.Y.Z_amd64.deb
├── SHA256SUMS.txt
├── manifest.json
├── INSTALL.txt
└── docs/
```

### `analyze-bundle.js`

Analyzes Next.js bundle size and composition.

**Usage:**

```bash
npm run build:analyze
```

**Features:**
- Reports bundle sizes
- Identifies large dependencies
- Suggests optimizations
- Tracks size over time

## Complete Release Workflow

Here's the complete workflow for creating a release:

```bash
# 1. Prepare
npm test
npm run lint
npm run format:check
npm run validate-env

# 2. Update version
npm run version:patch  # or minor/major

# 3. Commit version changes
git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml
git commit -m "Bump version to X.Y.Z"
git push

# 4. Build application
npm run clean
npm run tauri:build

# 5. Generate release assets
npm run release:notes
npm run release:dist

# 6. Create and push git tag
npm run version:tag
git push --tags

# 7. Test on clean systems (manual)

# 8. Create GitHub release (manual)
# - Upload files from dist/vX.Y.Z/
# - Use release notes from releases/vX.Y.Z.md
```

## Release Documentation

For detailed release information, see:
- [Release Guide](../docs/RELEASE_GUIDE.md) - Complete release process
- [Release Checklist](../docs/RELEASE_CHECKLIST.md) - Detailed checklist
- [Release Quick Start](../docs/RELEASE_QUICK_START.md) - Quick reference

---

**Last Updated:** 2026-01-30
