# Documentation Index

Welcome to the Voice Intelligence Desktop App documentation. This index will help you find the information you need.

## Quick Links

- **New User?** Start with the [User Guide](USER_GUIDE.md)
- **Developer?** Check the [Developer Guide](DEVELOPER_GUIDE.md)
- **Setting Up?** See [Setup Guide](SETUP.md) or [API Key Setup](API_KEY_SETUP.md)
- **Having Issues?** Try the [FAQ](FAQ.md) or [Troubleshooting](#troubleshooting-guides)

## Documentation Structure

### Getting Started

| Document | Description | Audience |
|----------|-------------|----------|
| [README](../README.md) | Project overview and quick start | Everyone |
| [Setup Guide](SETUP.md) | Comprehensive setup instructions | New users |
| [API Key Setup](API_KEY_SETUP.md) | How to configure OpenAI API keys | New users |
| [Quick Reference](QUICK_REFERENCE.md) | Common commands and workflows | All users |
| [WSL Development](WSL_DEVELOPMENT.md) | WSL-specific setup and tips | WSL developers |

### User Documentation

| Document | Description | Audience |
|----------|-------------|----------|
| [User Guide](USER_GUIDE.md) | Complete user manual | End users |
| [FAQ](FAQ.md) | Frequently asked questions | All users |
| [Validation Guide](VALIDATION_GUIDE.md) | How to validate setup | All users |

### Developer Documentation

| Document | Description | Audience |
|----------|-------------|----------|
| [Developer Guide](DEVELOPER_GUIDE.md) | Development workflow and standards | Developers |
| [Architecture](ARCHITECTURE.md) | System architecture and design | Developers |
| [API Integration](API_INTEGRATION.md) | External API integration details | Developers |
| [Design System](../src/styles/DESIGN_SYSTEM.md) | UI design system and tokens | Developers |
| [Animations](ANIMATIONS.md) | Animation system documentation | Developers |

### Technical Documentation

| Document | Description | Audience |
|----------|-------------|----------|
| [Environment Setup](ENVIRONMENT_SETUP.md) | Environment configuration | Developers |
| [Implementation Summary](IMPLEMENTATION_SUMMARY.md) | Implementation details | Developers |
| [API Configuration Summary](API_KEY_CONFIGURATION_SUMMARY.md) | API setup summary | Developers |
| [Tauri Setup](TAURI_SETUP.md) | Desktop runtime configuration | Developers |
| [Tauri Integration Summary](TAURI_INTEGRATION_SUMMARY.md) | Desktop features overview | Developers |
| [Code Signing](CODE_SIGNING.md) | Code signing setup and configuration | Developers |
| [Code Signing Quick Start](CODE_SIGNING_QUICK_START.md) | Quick code signing reference | Developers |
| [Packaging Guide](PACKAGING.md) | Desktop app packaging and distribution | Developers |
| [Packaging Quick Start](PACKAGING_QUICK_START.md) | Quick packaging reference | Developers |
| [Packaging Checklist](PACKAGING_CHECKLIST.md) | Pre-release packaging checklist | Developers |
| [Monitoring](MONITORING.md) | Analytics and monitoring system | Developers |
| [Dependency Management](DEPENDENCY_MANAGEMENT.md) | Managing and updating dependencies | Developers |
| [Dependency Quick Reference](DEPENDENCY_QUICK_REFERENCE.md) | Quick dependency commands | Developers |
| [Security Monitoring](SECURITY_MONITORING.md) | Security vulnerability monitoring | Developers |
| [Security Quick Reference](SECURITY_QUICK_REFERENCE.md) | Quick security commands | Developers |

### Component Documentation

| Document | Description | Audience |
|----------|-------------|----------|
| [Audio Player](../src/components/AudioPlayer.README.md) | Audio player component | Developers |
| [Recording Button](../src/components/RecordingButton.README.md) | Recording button component | Developers |
| [Transcription Display](../src/components/TranscriptionDisplay.README.md) | Transcription display component | Developers |
| [State Debugger](../src/lib/stateDebugger.README.md) | State debugging tools | Developers |

### Service Documentation

| Document | Description | Audience |
|----------|-------------|----------|
| [Audio Service](../src/services/audio/README.md) | Audio recording service | Developers |
| [Transcription Service](../src/services/transcription/README.md) | Speech-to-text service | Developers |
| [LLM Service](../src/services/llm/README.md) | AI enrichment service | Developers |
| [Storage Service](../src/services/storage/README.md) | Data persistence service | Developers |
| [Monitoring Service](../src/services/monitoring/README.md) | Analytics and monitoring | Developers |

### Project Specifications

| Document | Description | Audience |
|----------|-------------|----------|
| [Requirements](../.kiro/specs/requirements.md) | Product requirements | Product team |
| [Design Document](../.kiro/specs/design.md) | Architecture and design decisions | Developers |
| [Task List](../.kiro/specs/tasklist.md) | Development roadmap | Developers |

## Documentation by Topic

### Setup and Configuration

1. [Quick Start](../README.md#quick-start)
2. [Manual Setup](SETUP.md#manual-setup)
3. [Automated Setup (WSL)](WSL_DEVELOPMENT.md#automated-setup)
4. [API Key Configuration](API_KEY_SETUP.md)
5. [Environment Variables](ENVIRONMENT_SETUP.md)
6. [Validation](VALIDATION_GUIDE.md)

### Using the Application

1. [Recording Audio](USER_GUIDE.md#recording-audio)
2. [Viewing Transcriptions](USER_GUIDE.md#viewing-transcriptions)
3. [AI Enrichment](USER_GUIDE.md#ai-enrichment)
4. [Managing History](USER_GUIDE.md#managing-history)
5. [Settings](USER_GUIDE.md#settings)
6. [Keyboard Shortcuts](USER_GUIDE.md#keyboard-shortcuts)

### Development

1. [Development Workflow](DEVELOPER_GUIDE.md#development-workflow)
2. [Project Structure](DEVELOPER_GUIDE.md#project-structure)
3. [Coding Standards](DEVELOPER_GUIDE.md#coding-standards)
4. [Testing Guidelines](DEVELOPER_GUIDE.md#testing-guidelines)
5. [Git Workflow](DEVELOPER_GUIDE.md#git-workflow)
6. [Build Process](DEVELOPER_GUIDE.md#build-process)

### Architecture

1. [System Overview](ARCHITECTURE.md#system-overview)
2. [Architecture Layers](ARCHITECTURE.md#architecture-layers)
3. [Data Flow](ARCHITECTURE.md#data-flow)
4. [API Integration](API_INTEGRATION.md)
5. [State Management](ARCHITECTURE.md#state-management-layer)
6. [Service Layer](ARCHITECTURE.md#service-layer)

### Troubleshooting Guides

1. [General Troubleshooting](../README.md#troubleshooting)
2. [WSL Issues](WSL_DEVELOPMENT.md#common-issues-and-solutions)
3. [Environment Issues](ENVIRONMENT_SETUP.md#troubleshooting)
4. [Recording Issues](FAQ.md#recording-issues)
5. [Transcription Issues](FAQ.md#transcription-issues)
6. [Enrichment Issues](FAQ.md#enrichment-issues)

## Documentation by Role

### End Users

**Getting Started:**
1. Read [README](../README.md)
2. Follow [Setup Guide](SETUP.md)
3. Configure [API Keys](API_KEY_SETUP.md)
4. Read [User Guide](USER_GUIDE.md)

**Using the App:**
- [User Guide](USER_GUIDE.md) - Complete manual
- [FAQ](FAQ.md) - Common questions
- [Quick Reference](QUICK_REFERENCE.md) - Quick tips

### Developers

**Getting Started:**
1. Read [README](../README.md)
2. Follow [Developer Guide](DEVELOPER_GUIDE.md#setting-up-development-environment)
3. Review [Architecture](ARCHITECTURE.md)
4. Check [Coding Standards](DEVELOPER_GUIDE.md#coding-standards)

**Development:**
- [Developer Guide](DEVELOPER_GUIDE.md) - Complete development guide
- [Architecture](ARCHITECTURE.md) - System design
- [API Integration](API_INTEGRATION.md) - API details
- [Design System](../src/styles/DESIGN_SYSTEM.md) - UI guidelines

**Contributing:**
- [Git Workflow](DEVELOPER_GUIDE.md#git-workflow)
- [Testing Guidelines](DEVELOPER_GUIDE.md#testing-guidelines)
- [Contributing](DEVELOPER_GUIDE.md#contributing)

### DevOps / Deployment

**Setup:**
- [Environment Setup](ENVIRONMENT_SETUP.md)
- [Build Process](DEVELOPER_GUIDE.md#build-process)
- [Deployment](DEVELOPER_GUIDE.md#deployment)

**Monitoring:**
- [Validation Guide](VALIDATION_GUIDE.md)
- [API Configuration](API_KEY_CONFIGURATION_SUMMARY.md)

## Search by Keyword

### A
- **API Keys:** [API Key Setup](API_KEY_SETUP.md), [API Configuration](API_KEY_CONFIGURATION_SUMMARY.md)
- **Architecture:** [Architecture Guide](ARCHITECTURE.md)
- **Audio Recording:** [Audio Service](../src/services/audio/README.md), [User Guide](USER_GUIDE.md#recording-audio)
- **Animations:** [Animations Guide](ANIMATIONS.md)

### B
- **Build:** [Build Process](DEVELOPER_GUIDE.md#build-process)
- **Bugs:** [FAQ](FAQ.md), [Troubleshooting](../README.md#troubleshooting)

### C
- **Configuration:** [Environment Setup](ENVIRONMENT_SETUP.md), [API Key Setup](API_KEY_SETUP.md)
- **Code Signing:** [Code Signing Guide](CODE_SIGNING.md)
- **Contributing:** [Developer Guide](DEVELOPER_GUIDE.md#contributing)
- **Components:** [Component Documentation](#component-documentation)

### D
- **Deployment:** [Developer Guide](DEVELOPER_GUIDE.md#deployment)
- **Dependencies:** [Dependency Management](DEPENDENCY_MANAGEMENT.md), [Dependency Quick Reference](DEPENDENCY_QUICK_REFERENCE.md)
- **Design System:** [Design System](../src/styles/DESIGN_SYSTEM.md)
- **Development:** [Developer Guide](DEVELOPER_GUIDE.md)

### E
- **Enrichment:** [User Guide](USER_GUIDE.md#ai-enrichment), [LLM Service](../src/services/llm/README.md)
- **Environment:** [Environment Setup](ENVIRONMENT_SETUP.md)
- **Errors:** [FAQ](FAQ.md), [Troubleshooting](#troubleshooting-guides)

### F
- **FAQ:** [Frequently Asked Questions](FAQ.md)

### G
- **Git:** [Git Workflow](DEVELOPER_GUIDE.md#git-workflow)
- **Getting Started:** [Quick Start](../README.md#quick-start)

### H
- **History:** [User Guide](USER_GUIDE.md#managing-history)
- **Hotkeys:** [User Guide](USER_GUIDE.md#keyboard-shortcuts)

### I
- **Installation:** [Setup Guide](SETUP.md)
- **Integration:** [API Integration](API_INTEGRATION.md)

### K
- **Keyboard Shortcuts:** [User Guide](USER_GUIDE.md#keyboard-shortcuts)

### L
- **LLM:** [LLM Service](../src/services/llm/README.md), [API Integration](API_INTEGRATION.md#openai-gpt-4-api)

### M
- **Monitoring:** [Monitoring Guide](MONITORING.md), [Monitoring Service](../src/services/monitoring/README.md)

### O
- **OpenAI:** [API Integration](API_INTEGRATION.md), [API Key Setup](API_KEY_SETUP.md)

### P
- **Performance:** [FAQ](FAQ.md#performance-issues)
- **Privacy:** [FAQ](FAQ.md#security-and-privacy)
- **Packaging:** [Packaging Guide](PACKAGING.md), [Packaging Quick Start](PACKAGING_QUICK_START.md), [Packaging Checklist](PACKAGING_CHECKLIST.md)

### R
- **Recording:** [User Guide](USER_GUIDE.md#recording-audio), [Audio Service](../src/services/audio/README.md)
- **Requirements:** [Requirements](../.kiro/specs/requirements.md)

### S
- **Setup:** [Setup Guide](SETUP.md), [API Key Setup](API_KEY_SETUP.md)
- **Security:** [Security Monitoring](SECURITY_MONITORING.md), [Security Quick Reference](SECURITY_QUICK_REFERENCE.md)
- **State Management:** [Architecture](ARCHITECTURE.md#state-management-layer)
- **Storage:** [Storage Service](../src/services/storage/README.md)

### T
- **Testing:** [Testing Guidelines](DEVELOPER_GUIDE.md#testing-guidelines)
- **Transcription:** [User Guide](USER_GUIDE.md#viewing-transcriptions), [Transcription Service](../src/services/transcription/README.md)
- **Troubleshooting:** [Troubleshooting Guides](#troubleshooting-guides)

### U
- **Updates:** [Dependency Management](DEPENDENCY_MANAGEMENT.md)
- **User Guide:** [User Guide](USER_GUIDE.md)

### V
- **Validation:** [Validation Guide](VALIDATION_GUIDE.md)

### W
- **WSL:** [WSL Development](WSL_DEVELOPMENT.md)

## Contributing to Documentation

Found an error or want to improve the documentation?

1. **Small Fixes:** Edit the file directly
2. **Large Changes:** Create an issue first
3. **New Documentation:** Follow existing structure
4. **Update Index:** Add new docs to this index

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add screenshots when helpful
- Keep formatting consistent
- Update related documents
- Test all commands and code

## Getting Help

Can't find what you're looking for?

1. **Search:** Use Ctrl+F to search this index
2. **FAQ:** Check [FAQ](FAQ.md) for common questions
3. **Issues:** Search existing issues
4. **Ask:** Create a new issue with your question

## Documentation Status

| Category | Status | Last Updated |
|----------|--------|--------------|
| Getting Started | ✅ Complete | 2024 |
| User Documentation | ✅ Complete | 2024 |
| Developer Documentation | ✅ Complete | 2024 |
| API Documentation | ✅ Complete | 2024 |
| Component Documentation | ✅ Complete | 2024 |
| Service Documentation | ✅ Complete | 2024 |

## Feedback

Have feedback on the documentation? Let us know:
- What was helpful?
- What was confusing?
- What's missing?
- What could be improved?

Your feedback helps make the documentation better for everyone!
