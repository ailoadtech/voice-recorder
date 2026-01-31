# Changelog

All notable changes to Voice Intelligence Desktop App will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with Next.js and Tauri
- Audio recording service with MediaRecorder API
- OpenAI Whisper integration for transcription
- OpenAI GPT integration for text enrichment
- Multiple enrichment types (format, summarize, expand, bullet-points, action-items)
- Recording history with IndexedDB storage
- Export functionality (TXT, MD formats)
- Global hotkey support (Ctrl+Shift+Space)
- System tray integration
- Dark mode support
- Comprehensive error handling and retry logic
- API key configuration and validation
- State machine for recording workflow
- Monitoring and analytics (with user consent)
- Code signing setup scripts
- Extensive documentation

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- Secure API key storage
- Input validation for all user inputs
- HTTPS-only API communication

## [0.1.0] - TBD

### Added
- Initial release
- Core voice recording functionality
- AI-powered transcription
- Text enrichment with multiple presets
- Recording history and management
- Export capabilities
- Desktop integration with system tray
- Global hotkey activation
- Comprehensive documentation

---

## Version History

### Version Numbering

We use [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality in a backwards compatible manner
- **PATCH** version for backwards compatible bug fixes

### Release Types

- **Alpha**: Early development, unstable
- **Beta**: Feature complete, testing phase
- **RC (Release Candidate)**: Final testing before release
- **Stable**: Production-ready release

---

## How to Update This Changelog

When making changes, add entries under the `[Unreleased]` section in the appropriate category:

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

When releasing a new version:
1. Change `[Unreleased]` to the version number and date
2. Add a new `[Unreleased]` section at the top
3. Update the version comparison links at the bottom

---

[Unreleased]: https://github.com/your-org/voice-intelligence/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/your-org/voice-intelligence/releases/tag/v0.1.0
