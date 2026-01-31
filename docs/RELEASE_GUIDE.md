# Release Guide

Complete guide for creating and publishing releases of Voice Intelligence Desktop App.

## Table of Contents

1. [Pre-Release Preparation](#pre-release-preparation)
2. [Version Management](#version-management)
3. [Building and Packaging](#building-and-packaging)
4. [Testing](#testing)
5. [Creating the Release](#creating-the-release)
6. [Publishing](#publishing)
7. [Post-Release](#post-release)

## Pre-Release Preparation

### 1. Code Quality Check

Ensure all code quality checks pass:

```bash
# Run tests
npm test

# Check linting
npm run lint

# Check formatting
npm run format:check

# Validate environment configuration
npm run validate-env

# Build and check for errors
npm run build:prod
```

### 2. Update Documentation

- [ ] Update README.md with latest features
- [ ] Update CHANGELOG.md with all changes since last release
- [ ] Review and update user documentation
- [ ] Update API documentation if needed
- [ ] Check all links in documentation

### 3. Security Audit

```bash
# Run security audit
npm audit

# Fix any high/critical vulnerabilities
npm audit fix
```

## Version Management

### Determine Version Number

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (x.0.0): Breaking changes
- **MINOR** (0.x.0): New features, backwards compatible
- **PATCH** (0.0.x): Bug fixes, backwards compatible

### Update Version

Use the version script to update all version numbers:

```bash
# Check current version
npm run version:current

# Increment patch version (0.1.0 → 0.1.1)
npm run version:patch

# Increment minor version (0.1.0 → 0.2.0)
npm run version:minor

# Increment major version (0.1.0 → 1.0.0)
npm run version:major

# Set specific version
npm run version 1.2.3

# Verify all versions match
npm run version:verify
```

This updates:
- `package.json`
- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`

### Commit Version Changes

```bash
# Review changes
git diff

# Commit version bump
git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml
git commit -m "Bump version to X.Y.Z"
```

## Building and Packaging

### 1. Clean Build Environment

```bash
# Clean all build artifacts
npm run clean

# Optional: Full clean and reinstall
npm run reinstall
```

### 2. Production Build

```bash
# Build Next.js application
npm run build:prod

# Analyze bundle size (optional)
npm run build:analyze
```

### 3. Build Desktop Application

```bash
# Build for all platforms
npm run tauri:build

# Or build for specific platforms
npm run package:windows
npm run package:macos
npm run package:linux
```

Build artifacts will be in `src-tauri/target/release/bundle/`:
- **Windows**: `msi/` and `nsis/` directories
- **macOS**: `dmg/` directory
- **Linux**: `appimage/` and `deb/` directories

### 4. Code Signing (if applicable)

For Windows:

```bash
# Setup code signing (first time only)
npm run sign:setup

# Verify certificate
npm run sign:list
```

The build process will automatically sign if certificate is configured.

## Testing

### 1. Test on Clean System

**Critical**: Always test on a clean system before release!

#### Windows Testing

1. Use a clean Windows VM or test machine
2. Install the MSI or NSIS installer
3. Verify installation completes successfully
4. Test all core features
5. Check for errors in Event Viewer

#### macOS Testing

1. Use a clean macOS system
2. Mount the DMG and install
3. Verify Gatekeeper allows the app
4. Test all core features
5. Check Console.app for errors

#### Linux Testing

1. Use a clean Linux system (Ubuntu/Debian)
2. Install AppImage or DEB package
3. Test all core features
4. Check system logs for errors

### 2. Functional Testing

Test all core functionality:

- [ ] Application launches successfully
- [ ] Audio recording works
- [ ] Transcription completes
- [ ] LLM enrichment works
- [ ] History saves and loads
- [ ] Export functionality works
- [ ] Hotkey registration works
- [ ] System tray integration works
- [ ] Settings persist correctly
- [ ] Error handling works properly

### 3. Performance Testing

- [ ] Startup time is acceptable
- [ ] Memory usage is reasonable
- [ ] No memory leaks during extended use
- [ ] CPU usage is appropriate
- [ ] Recording is smooth without lag

## Creating the Release

### 1. Generate Release Notes

```bash
# Generate release notes from git commits
npm run release:notes

# Or specify version
npm run release:notes -- 1.0.0

# Or from specific tag
npm run release:notes -- --from-tag v0.9.0
```

Release notes will be created in `releases/vX.Y.Z.md`.

Edit the generated file to:
- Add highlights and important changes
- Include screenshots or demos
- Add upgrade instructions
- Document known issues
- Add breaking changes section if needed

### 2. Create Distribution Package

```bash
# Create distribution package with all installers
npm run release:dist

# Or specify version
npm run release:dist -- --version 1.0.0
```

This creates a `dist/vX.Y.Z/` directory containing:
- All installer files
- SHA256SUMS.txt (checksums)
- manifest.json (metadata)
- INSTALL.txt (installation instructions)
- docs/ (documentation)

### 3. Create Git Tag

```bash
# Create and push tag
npm run version:tag
git push origin vX.Y.Z

# Or manually
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

## Publishing

### 1. Create GitHub Release

1. Go to GitHub repository
2. Click "Releases" → "Draft a new release"
3. Select the tag you just created
4. Copy release notes from `releases/vX.Y.Z.md`
5. Upload installer files from `dist/vX.Y.Z/`
6. Upload SHA256SUMS.txt
7. Mark as pre-release if applicable
8. Publish release

### 2. Verify Downloads

After publishing:
- [ ] Download each installer
- [ ] Verify checksums match
- [ ] Test installation from downloaded files

### 3. Update Website (if applicable)

- [ ] Update download links
- [ ] Update version number
- [ ] Update screenshots if needed
- [ ] Publish blog post or announcement

### 4. Announce Release

- [ ] Post on social media
- [ ] Send email to mailing list
- [ ] Update documentation site
- [ ] Notify beta testers

## Post-Release

### 1. Monitor

After release, monitor:

- [ ] Download statistics
- [ ] Crash reports
- [ ] User feedback
- [ ] GitHub issues
- [ ] API usage and costs

### 2. Support

- [ ] Respond to issues promptly
- [ ] Update FAQ based on questions
- [ ] Provide user support
- [ ] Document common problems

### 3. Plan Next Release

- [ ] Triage reported bugs
- [ ] Prioritize feature requests
- [ ] Update roadmap
- [ ] Plan next version

## Rollback Procedure

If critical issues are found after release:

1. **Immediate Actions**
   - Document the issue
   - Remove download links
   - Post notice about the issue

2. **Prepare Hotfix**
   - Create hotfix branch
   - Fix the critical issue
   - Test thoroughly
   - Increment patch version

3. **Release Hotfix**
   - Follow normal release process
   - Mark as hotfix in release notes
   - Notify all users

## Release Checklist

Use `docs/RELEASE_CHECKLIST.md` for a detailed checklist of all steps.

## Automation (Future)

Consider automating:
- Version bumping
- Changelog generation
- Release notes creation
- GitHub release creation
- Distribution package creation

Tools to consider:
- GitHub Actions for CI/CD
- semantic-release for automation
- Conventional Commits for changelog

## Troubleshooting

### Build Fails

```bash
# Clean and rebuild
npm run clean
npm run reinstall
npm run tauri:build
```

### Installer Not Created

- Check Tauri configuration
- Verify all dependencies installed
- Check build logs for errors
- Ensure platform-specific tools installed

### Code Signing Fails

- Verify certificate is valid
- Check certificate thumbprint
- Ensure certificate is in correct store
- Check timestamp server is accessible

### Version Mismatch

```bash
# Verify versions
npm run version:verify

# Fix manually if needed
npm run version X.Y.Z
```

## Resources

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Tauri Documentation](https://tauri.app/v1/guides/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

**Last Updated:** 2026-01-30
