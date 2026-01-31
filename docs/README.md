# Documentation Index

Welcome to the Voice Intelligence Desktop App documentation!

## Getting Started

New to the project? Start here:

1. **[Complete Setup Guide](SETUP.md)** - Follow this first for step-by-step setup instructions
2. **[Quick Reference](QUICK_REFERENCE.md)** - Bookmark this for common commands and workflows

## Core Documentation

### Setup & Configuration

- **[Complete Setup Guide](SETUP.md)**
  - Prerequisites and installation
  - Automated and manual setup options
  - Verification steps
  - Troubleshooting common issues
  - Platform-specific notes

- **[Environment Setup](ENVIRONMENT_SETUP.md)**
  - Detailed environment variable documentation
  - Required and optional configuration
  - Security best practices
  - Usage in code
  - Desktop app considerations

- **[WSL Development](WSL_DEVELOPMENT.md)**
  - WSL-specific setup and workflow
  - File system performance tips
  - Tauri development in WSL
  - Common issues and solutions
  - Git workflow in WSL

### Reference

- **[Quick Reference](QUICK_REFERENCE.md)**
  - Essential commands
  - WSL-specific commands
  - Git commands
  - File operations
  - Troubleshooting commands
  - Useful aliases
  - Keyboard shortcuts

### Project Planning

- **[Requirements](../.kiro/specs/requirements.md)**
  - Problem statement
  - User stories
  - Acceptance criteria
  - Technical requirements

- **[Design Document](../.kiro/specs/design.md)**
  - Architecture overview
  - Technology decisions
  - Component design
  - Data flow
  - UI/UX design

- **[Task List](../.kiro/specs/tasklist.md)**
  - Development roadmap
  - Phase breakdown
  - Task dependencies
  - Timeline estimates

## Documentation by Role

### For New Developers

Start with these in order:

1. [Complete Setup Guide](SETUP.md) - Get your environment running
2. [Quick Reference](QUICK_REFERENCE.md) - Learn common commands
3. [Requirements](../.kiro/specs/requirements.md) - Understand what we're building
4. [Design Document](../.kiro/specs/design.md) - Learn the architecture
5. [Task List](../.kiro/specs/tasklist.md) - See what's next

### For WSL Users

Essential reading:

1. [Complete Setup Guide](SETUP.md) - General setup
2. [WSL Development](WSL_DEVELOPMENT.md) - WSL-specific workflow
3. [Quick Reference](QUICK_REFERENCE.md) - Common commands

### For Configuration

When setting up environment variables:

1. [Complete Setup Guide](SETUP.md#step-2-configure-environment-variables) - Quick start
2. [Environment Setup](ENVIRONMENT_SETUP.md) - Detailed reference

### For Troubleshooting

When things go wrong:

1. [Complete Setup Guide](SETUP.md#troubleshooting) - Common issues
2. [WSL Development](WSL_DEVELOPMENT.md#common-issues-and-solutions) - WSL-specific
3. [Environment Setup](ENVIRONMENT_SETUP.md#troubleshooting) - Environment issues
4. [Quick Reference](QUICK_REFERENCE.md#troubleshooting-commands) - Diagnostic commands

## Quick Links

### Setup

- [Automated Setup Script](../scripts/wsl-setup.sh) - Run this in WSL
- [Environment Template](../.env.example) - Copy to `.env.local`
- [WSL Config Example](.wslconfig.example) - Optimize WSL performance

### Configuration Files

- `.env.local` - Your local environment (create from `.env.example`)
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `eslint.config.mjs` - ESLint rules
- `.prettierrc` - Prettier formatting

### Project Structure

```
/
├── docs/                    # Documentation (you are here!)
│   ├── README.md           # This file
│   ├── SETUP.md            # Complete setup guide
│   ├── QUICK_REFERENCE.md  # Command reference
│   ├── ENVIRONMENT_SETUP.md # Environment variables
│   └── WSL_DEVELOPMENT.md  # WSL workflow
├── .kiro/specs/            # Project specifications
│   ├── requirements.md     # Requirements
│   ├── design.md          # Design document
│   └── tasklist.md        # Task list
├── src/                    # Source code
│   ├── app/               # Next.js pages
│   ├── components/        # React components
│   ├── lib/               # Utilities
│   ├── services/          # External services
│   └── hooks/             # Custom hooks
├── scripts/               # Build and utility scripts
└── public/                # Static assets
```

## External Resources

### Technologies

- [Next.js Documentation](https://nextjs.org/docs) - Framework docs
- [React Documentation](https://react.dev/) - React docs
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - TypeScript docs
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Styling docs
- [Tauri Documentation](https://tauri.app/v1/guides/) - Desktop runtime docs

### APIs & Services

- [OpenAI API Documentation](https://platform.openai.com/docs) - Whisper & GPT
- [OpenAI API Keys](https://platform.openai.com/api-keys) - Get your API key
- [OpenAI Pricing](https://openai.com/pricing) - API pricing

### Development Tools

- [WSL Documentation](https://docs.microsoft.com/en-us/windows/wsl/) - WSL setup
- [VS Code Remote-WSL](https://code.visualstudio.com/docs/remote/wsl) - VS Code in WSL
- [Git Documentation](https://git-scm.com/doc) - Git reference
- [npm Documentation](https://docs.npmjs.com/) - npm reference

## Contributing to Documentation

When adding or updating documentation:

1. **Keep it practical** - Focus on actionable information
2. **Use examples** - Show commands and code snippets
3. **Test instructions** - Verify steps work before documenting
4. **Link related docs** - Help users find related information
5. **Update this index** - Add new docs to this file

### Documentation Standards

- Use Markdown format
- Include table of contents for long documents
- Use code blocks with language specification
- Add cross-references to related docs
- Keep line length reasonable (80-100 chars)
- Use clear, concise language

## Getting Help

If you can't find what you need in the documentation:

1. **Search the docs** - Use your editor's search (Ctrl+F)
2. **Check troubleshooting sections** - Most common issues are covered
3. **Review related docs** - The answer might be in a related guide
4. **Check external resources** - Official docs for technologies used
5. **Ask for help** - Reach out to the team

## Documentation Status

### Complete ✅

- Complete Setup Guide
- Quick Reference
- Environment Setup
- WSL Development
- Requirements
- Design Document
- Task List

### In Progress 🚧

- API Integration Guide (coming in Phase 4)
- Testing Guide (coming in Phase 10)
- Deployment Guide (coming in Phase 12)

### Planned 📋

- Component Library Documentation
- Service API Documentation
- Troubleshooting FAQ
- Performance Optimization Guide
- Security Best Practices

## Feedback

Found an issue with the documentation? Have a suggestion?

- Check if it's already in the [Task List](../.kiro/specs/tasklist.md)
- Open an issue or submit a pull request
- Reach out to the development team

---

**Last Updated:** January 2026  
**Project Phase:** Phase 1 - Project Setup & Foundation
