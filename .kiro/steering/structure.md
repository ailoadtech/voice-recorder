# Project Structure

## Current State

This project is in the initial setup phase. The following structure is recommended for a Next.js desktop application:

## Recommended Organization

```
/
├── .kiro/                    # Kiro configuration and steering
│   └── steering/             # AI assistant guidance documents
├── src/
│   ├── app/                  # Next.js app directory (App Router)
│   ├── components/           # React components
│   ├── lib/                  # Utility functions and helpers
│   ├── services/             # External service integrations
│   │   ├── transcription/    # Voice-to-text service
│   │   └── llm/              # LLM integration
│   └── hooks/                # Custom React hooks
├── public/                   # Static assets
├── requirements.txt          # Project specification document
├── README.md                 # Project documentation
└── package.json              # Dependencies and scripts
```

## Key Directories

- **src/app**: Next.js pages and routing (App Router pattern)
- **src/components**: Reusable UI components
- **src/services**: External API integrations and service wrappers
- **src/lib**: Shared utilities, helpers, and business logic
- **src/hooks**: Custom React hooks for voice recording, hotkeys, etc.

## Desktop Integration

Desktop-specific files for Tauri:
- **src-tauri/**: Rust backend code
- **src-tauri/src/main.rs**: Main Tauri application entry point
- **src-tauri/tauri.conf.json**: Tauri configuration

## Documentation Requirements

The README.md must include:
1. Problem description
2. Architecture overview
3. Setup instructions
4. Design decisions and rationale
