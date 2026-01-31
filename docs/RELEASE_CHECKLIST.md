# Release Checklist

This checklist ensures a smooth and complete release process for Voice Intelligence Desktop App.

## Pre-Release Preparation

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code formatted (`npm run format:check`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Bundle size analyzed and optimized (`npm run build:analyze`)

### Documentation
- [ ] README.md is up to date
- [ ] CHANGELOG.md updated with new features, fixes, and breaking changes
- [ ] API documentation current
- [ ] User guide reflects latest features
- [ ] Developer guide updated

### Environment & Configuration
- [ ] Environment variables validated (`npm run validate-env`)
- [ ] API keys configuration documented
- [ ] All required dependencies listed in package.json
- [ ] Tauri configuration reviewed (tauri.conf.json)

### Security
- [ ] Security audit completed (`npm audit`)
- [ ] No high/critical vulnerabilities
- [ ] API keys not hardcoded
- [ ] Sensitive data properly handled
- [ ] Code signing certificate configured (if applicable)

## Version Management

### Update Version Numbers
- [ ] Update version in `package.json`
- [ ] Update version in `src-tauri/tauri.conf.json`
- [ ] Update version in `src-tauri/Cargo.toml`
- [ ] Ensure all three versions match

### Git Tagging
- [ ] Commit all changes
- [ ] Create git tag: `git tag -a v{VERSION} -m "Release v{VERSION}"`
- [ ] Push tag: `git push origin v{VERSION}`

## Build & Package

### Production Build
- [ ] Clean build environment (`npm run clean`)
- [ ] Run production build (`npm run build:prod`)
- [ ] Verify build output in `.next` directory
- [ ] Check for build warnings or errors

### Desktop Packaging
- [ ] Generate app icons (`npm run tauri:icon`)
- [ ] Build Tauri application (`npm run tauri:build`)
- [ ] Verify installer files created in `src-tauri/target/release/bundle/`

### Platform-Specific Builds
#### Windows
- [ ] MSI installer created
- [ ] NSIS installer created
- [ ] Code signed (if certificate available)
- [ ] Test on Windows 10
- [ ] Test on Windows 11

#### macOS (if applicable)
- [ ] DMG created
- [ ] App signed and notarized
- [ ] Test on macOS 10.13+
- [ ] Test on Apple Silicon

#### Linux (if applicable)
- [ ] AppImage created
- [ ] DEB package created
- [ ] Test on Ubuntu/Debian
- [ ] Test on other distributions

## Testing

### Functional Testing
- [ ] Fresh installation on clean system
- [ ] App launches successfully
- [ ] All core features work:
  - [ ] Audio recording
  - [ ] Transcription
  - [ ] LLM enrichment
  - [ ] History/storage
  - [ ] Export functionality
  - [ ] Hotkey registration
  - [ ] System tray integration

### Integration Testing
- [ ] API integrations working (Whisper, GPT)
- [ ] File system operations
- [ ] Database/storage operations
- [ ] Network error handling

### Performance Testing
- [ ] App startup time acceptable
- [ ] Memory usage reasonable
- [ ] CPU usage during idle
- [ ] Recording performance smooth
- [ ] No memory leaks

### User Experience
- [ ] UI responsive and smooth
- [ ] Error messages clear and helpful
- [ ] Loading states appropriate
- [ ] Animations working correctly
- [ ] Dark mode (if implemented)

## Release Artifacts

### Create Distribution Package
- [ ] Gather all installer files
- [ ] Create checksums (SHA256) for each file
- [ ] Prepare release archive if needed
- [ ] Include LICENSE file
- [ ] Include README or quick start guide

### Documentation Package
- [ ] User guide (PDF or online)
- [ ] Installation instructions
- [ ] Configuration guide
- [ ] Troubleshooting guide
- [ ] API key setup instructions

## Release Notes

### Generate Release Notes
- [ ] List new features
- [ ] List bug fixes
- [ ] List breaking changes
- [ ] List known issues
- [ ] Include upgrade instructions
- [ ] Add screenshots/demos if applicable

### Communication
- [ ] Draft release announcement
- [ ] Prepare social media posts (if applicable)
- [ ] Update website (if applicable)
- [ ] Notify beta testers

## Distribution

### GitHub Release
- [ ] Create GitHub release
- [ ] Upload installer files
- [ ] Upload checksums
- [ ] Attach release notes
- [ ] Mark as pre-release or stable

### Other Channels (if applicable)
- [ ] Microsoft Store submission
- [ ] Mac App Store submission
- [ ] Linux package repositories
- [ ] Company website download page

## Post-Release

### Monitoring
- [ ] Monitor crash reports
- [ ] Monitor user feedback
- [ ] Track download statistics
- [ ] Monitor API usage/costs

### Support
- [ ] Respond to issues on GitHub
- [ ] Update FAQ based on questions
- [ ] Provide user support
- [ ] Document common problems

### Maintenance
- [ ] Plan next release
- [ ] Triage reported bugs
- [ ] Prioritize feature requests
- [ ] Update roadmap

## Rollback Plan

### If Critical Issues Found
- [ ] Document the issue
- [ ] Remove download links
- [ ] Post notice about the issue
- [ ] Prepare hotfix
- [ ] Test hotfix thoroughly
- [ ] Release hotfix version

## Version History

| Version | Release Date | Notes |
|---------|--------------|-------|
| 0.1.0   | TBD          | Initial release |

## Release Contacts

- **Release Manager:** [Name]
- **Technical Lead:** [Name]
- **QA Lead:** [Name]
- **Support Contact:** [Email]

## Notes

- Always test on a clean system before public release
- Keep installer files backed up
- Maintain release notes for all versions
- Document any issues encountered during release
- Update this checklist based on lessons learned

---

**Last Updated:** 2026-01-30
