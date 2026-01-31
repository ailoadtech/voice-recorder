# Desktop App Packaging Checklist

Use this checklist to ensure a smooth packaging and release process.

## Pre-Build Checklist

### Version Management
- [ ] Update version in `package.json`
- [ ] Update version in `src-tauri/Cargo.toml`
- [ ] Update version in `src-tauri/tauri.conf.json`
- [ ] Versions match across all files
- [ ] Version follows semantic versioning (MAJOR.MINOR.PATCH)

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Dependencies up to date (check for security vulnerabilities)

### Configuration
- [ ] Environment variables documented in `.env.example`
- [ ] API keys removed from code
- [ ] Debug logging disabled
- [ ] Production URLs configured
- [ ] Error tracking configured (if applicable)

### Assets
- [ ] Application icons generated (all sizes)
  - [ ] 32x32.png
  - [ ] 128x128.png
  - [ ] 128x128@2x.png
  - [ ] icon.icns (macOS)
  - [ ] icon.ico (Windows)
  - [ ] icon.png (Linux/Tray)
- [ ] Installer images (optional)
  - [ ] Windows: banner, dialog images
  - [ ] macOS: DMG background
- [ ] License file (if applicable)

### Documentation
- [ ] README.md updated
- [ ] CHANGELOG.md updated with release notes
- [ ] User guide updated
- [ ] API documentation current
- [ ] Known issues documented

## Platform-Specific Preparation

### Windows
- [ ] WiX Toolset installed (for MSI)
- [ ] Visual Studio Build Tools installed
- [ ] Code signing certificate obtained (production)
- [ ] Certificate thumbprint configured in `tauri.conf.json`
- [ ] Timestamp server configured
- [ ] WebView2 installation configured

### macOS
- [ ] Xcode Command Line Tools installed
- [ ] Apple Developer Program membership active
- [ ] Developer ID certificate installed
- [ ] Signing identity configured in `tauri.conf.json`
- [ ] Notarization credentials ready
- [ ] Hardened runtime enabled

### Linux
- [ ] Build dependencies installed
- [ ] Desktop file configured (for .deb)
- [ ] GPG key created (optional, for signing)
- [ ] AppImage dependencies configured

## Build Process

### Clean Build
- [ ] Clean previous build artifacts (`npm run package:clean`)
- [ ] Clean node_modules if needed (`npm run clean:all && npm install`)
- [ ] Clean Rust target directory (if issues persist)

### Build Execution
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Tauri builds successfully (`npm run tauri:build`)
- [ ] No build warnings or errors
- [ ] Build artifacts created in expected locations

### Platform Builds
- [ ] Windows MSI created
- [ ] Windows NSIS installer created
- [ ] macOS DMG created
- [ ] macOS app bundle created
- [ ] Linux AppImage created
- [ ] Linux .deb package created

## Post-Build Verification

### File Verification
- [ ] All expected installers present
- [ ] File sizes reasonable (not suspiciously large/small)
- [ ] Checksums generated (`checksums.txt`)
- [ ] Build artifacts match expected naming convention

### Code Signing Verification

**Windows:**
```powershell
Get-AuthenticodeSignature "Voice Intelligence.exe"
# Status should be: Valid
```
- [ ] Executable signed
- [ ] Signature valid
- [ ] Certificate not expired
- [ ] Timestamp present

**macOS:**
```bash
codesign -vvv --deep --strict "Voice Intelligence.app"
spctl -a -vvv "Voice Intelligence.app"
```
- [ ] App bundle signed
- [ ] Signature valid
- [ ] Notarization complete
- [ ] Gatekeeper accepts app

**Linux:**
```bash
gpg --verify voice-intelligence.AppImage.asc
```
- [ ] GPG signature present (if applicable)
- [ ] Signature valid

## Installation Testing

### Test Environment
- [ ] Clean test system available (VM or physical)
- [ ] Operating system up to date
- [ ] No previous version installed
- [ ] Standard user account (not admin)

### Windows Testing
- [ ] MSI installer runs
- [ ] NSIS installer runs
- [ ] Installation completes without errors
- [ ] Application appears in Start Menu
- [ ] Application appears in Add/Remove Programs
- [ ] Desktop shortcut created (if configured)
- [ ] Application launches successfully
- [ ] No SmartScreen warnings (with valid certificate)
- [ ] Uninstaller works correctly

### macOS Testing
- [ ] DMG mounts successfully
- [ ] Drag-and-drop installation works
- [ ] Application launches from Applications folder
- [ ] No Gatekeeper warnings (with valid certificate)
- [ ] Application appears in Launchpad
- [ ] Uninstallation works (drag to trash)

### Linux Testing
- [ ] AppImage is executable
- [ ] AppImage runs without installation
- [ ] .deb installs via dpkg/apt
- [ ] Application appears in application menu
- [ ] Desktop file works correctly
- [ ] Uninstallation works

## Functional Testing

### Core Features
- [ ] Application launches
- [ ] Main window displays correctly
- [ ] All UI elements visible
- [ ] Navigation works
- [ ] Settings persist
- [ ] Data storage works

### Voice Intelligence Features
- [ ] Microphone access granted
- [ ] Audio recording works
- [ ] Transcription service connects
- [ ] LLM service connects
- [ ] Hotkey registration works
- [ ] System tray integration works
- [ ] Background operation works

### Error Handling
- [ ] Network errors handled gracefully
- [ ] API errors displayed properly
- [ ] Permission errors handled
- [ ] Invalid input handled
- [ ] Application doesn't crash

### Performance
- [ ] Application starts quickly (< 5 seconds)
- [ ] UI responsive
- [ ] Memory usage reasonable
- [ ] CPU usage acceptable
- [ ] No memory leaks during extended use

## Security Testing

### Code Security
- [ ] No hardcoded credentials
- [ ] No sensitive data in logs
- [ ] API keys properly secured
- [ ] HTTPS used for all network requests
- [ ] Input validation in place

### Installation Security
- [ ] Installer signed (production)
- [ ] No security warnings during installation
- [ ] Application runs with minimal permissions
- [ ] No unnecessary system access requested
- [ ] Secure update mechanism (if applicable)

## Documentation Review

### User Documentation
- [ ] Installation instructions accurate
- [ ] Setup guide complete
- [ ] Feature documentation current
- [ ] Troubleshooting section helpful
- [ ] FAQ addresses common issues

### Developer Documentation
- [ ] Build instructions accurate
- [ ] Development setup documented
- [ ] Architecture documented
- [ ] API documentation current
- [ ] Contributing guidelines present

## Release Preparation

### Release Assets
- [ ] All installers ready
- [ ] Checksums file included
- [ ] Release notes written
- [ ] Screenshots updated
- [ ] Demo video prepared (optional)

### Distribution Channels
- [ ] GitHub Release created
- [ ] Website download page updated
- [ ] Package manager submissions prepared
  - [ ] Chocolatey (Windows)
  - [ ] Homebrew (macOS)
  - [ ] Snap/Flatpak (Linux)
- [ ] App store submissions prepared (if applicable)

### Communication
- [ ] Release announcement drafted
- [ ] Social media posts prepared
- [ ] Email notification ready (if applicable)
- [ ] Documentation site updated
- [ ] Support channels notified

## Post-Release Monitoring

### First 24 Hours
- [ ] Monitor download statistics
- [ ] Check for crash reports
- [ ] Monitor support channels
- [ ] Review user feedback
- [ ] Check for critical issues

### First Week
- [ ] Analyze usage metrics
- [ ] Review error logs
- [ ] Collect user feedback
- [ ] Plan hotfix if needed
- [ ] Update FAQ based on questions

### Ongoing
- [ ] Monitor for security vulnerabilities
- [ ] Track feature requests
- [ ] Plan next release
- [ ] Update dependencies
- [ ] Maintain documentation

## Rollback Plan

### If Critical Issues Found
- [ ] Identify issue severity
- [ ] Communicate with users
- [ ] Remove download links (if necessary)
- [ ] Prepare hotfix
- [ ] Test hotfix thoroughly
- [ ] Release hotfix
- [ ] Post-mortem analysis

## Sign-Off

### Team Approval
- [ ] Developer sign-off
- [ ] QA sign-off
- [ ] Product owner sign-off
- [ ] Security review complete (if required)

### Final Checks
- [ ] All checklist items completed
- [ ] No known critical issues
- [ ] Rollback plan in place
- [ ] Support team briefed
- [ ] Monitoring in place

---

**Release Date:** _________________

**Version:** _________________

**Released By:** _________________

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

