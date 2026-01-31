# Release Quick Start

Quick reference for creating a release of Voice Intelligence Desktop App.

## Prerequisites

- [ ] All tests passing
- [ ] No linting errors
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Security audit clean

## Quick Release Steps

### 1. Update Version

```bash
# Increment version (patch/minor/major)
npm run version:patch

# Or set specific version
npm run version 1.0.0

# Verify
npm run version:verify
```

### 2. Commit Version

```bash
git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml
git commit -m "Bump version to X.Y.Z"
git push
```

### 3. Build Application

```bash
# Clean build
npm run clean

# Build for production
npm run tauri:build
```

### 4. Generate Release Assets

```bash
# Generate release notes
npm run release:notes

# Create distribution package
npm run release:dist
```

### 5. Create Git Tag

```bash
npm run version:tag
git push --tags
```

### 6. Test on Clean System

- Install on clean Windows/macOS/Linux
- Test all core features
- Verify no errors

### 7. Create GitHub Release

1. Go to GitHub → Releases → New Release
2. Select tag vX.Y.Z
3. Copy content from `releases/vX.Y.Z.md`
4. Upload files from `dist/vX.Y.Z/`
5. Publish

## File Locations

- **Release Notes**: `releases/vX.Y.Z.md`
- **Distribution**: `dist/vX.Y.Z/`
- **Installers**: `src-tauri/target/release/bundle/`
- **Checksums**: `dist/vX.Y.Z/SHA256SUMS.txt`

## Available Scripts

### Version Management
```bash
npm run version:current    # Show current version
npm run version:verify     # Verify versions match
npm run version:patch      # Increment patch (0.1.0 → 0.1.1)
npm run version:minor      # Increment minor (0.1.0 → 0.2.0)
npm run version:major      # Increment major (0.1.0 → 1.0.0)
npm run version:tag        # Create git tag
```

### Building
```bash
npm run build:prod         # Build Next.js for production
npm run tauri:build        # Build desktop app (all platforms)
npm run package:windows    # Build Windows installers
npm run package:macos      # Build macOS installer
npm run package:linux      # Build Linux installers
```

### Release
```bash
npm run release:notes      # Generate release notes
npm run release:dist       # Create distribution package
npm run release:dist:clean # Clean distribution directory
```

## Checklist

Use the detailed checklist: `docs/RELEASE_CHECKLIST.md`

## Full Guide

See complete guide: `docs/RELEASE_GUIDE.md`

## Emergency Rollback

If critical issues found:

1. Remove download links
2. Post notice
3. Create hotfix branch
4. Fix issue
5. Release hotfix version

---

**Quick Tip**: Always test on a clean system before publishing!
