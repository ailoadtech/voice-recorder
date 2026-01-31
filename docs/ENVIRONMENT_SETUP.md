# Environment Variable Setup

> **📖 New to the project?** See the [Complete Setup Guide](SETUP.md) for step-by-step instructions covering all platforms.

This document explains how to configure environment variables for the Voice Intelligence Desktop App.

## Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your API keys:
   ```bash
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Files

The application uses the following environment files:

- `.env.example` - Template with all available variables (committed to git)
- `.env.local` - Your local development settings (NOT committed to git)
- `.env` - General environment settings (NOT committed to git)

## Required Variables

### API Keys

**OPENAI_API_KEY** (Required)
- Your OpenAI API key for both Whisper (transcription) and GPT (enrichment)
- Get your key from: https://platform.openai.com/api-keys
- Example: `sk-proj-abc123...`

Alternatively, you can use separate keys:
- **WHISPER_API_KEY** - Dedicated key for transcription
- **GPT_API_KEY** - Dedicated key for text enrichment

## Optional Variables

### AI Model Configuration

**WHISPER_MODEL** (Default: `whisper-1`)
- The Whisper model to use for transcription
- Options: `whisper-1`

**GPT_MODEL** (Default: `gpt-4`)
- The GPT model to use for text enrichment
- Options: `gpt-4`, `gpt-4-turbo`, `gpt-3.5-turbo`

### Application Settings

**HOTKEY_COMBINATION** (Default: `CommandOrControl+Shift+R`)
- Global hotkey for recording activation
- Format uses Electron accelerator syntax
- Cross-platform: `CommandOrControl` = Ctrl on Windows/Linux, Cmd on macOS

**NODE_ENV** (Default: `development`)
- Application environment
- Options: `development`, `production`, `test`

### API Configuration

**OPENAI_API_BASE_URL** (Default: `https://api.openai.com/v1`)
- Custom OpenAI API endpoint (for proxies or alternative providers)

**API_TIMEOUT** (Default: `30000`)
- API request timeout in milliseconds

**API_MAX_RETRIES** (Default: `3`)
- Maximum number of retries for failed API requests

### Storage Configuration

**STORAGE_PATH** (Default: `recordings`)
- Local storage path for recordings (relative to app data directory)

**MAX_HISTORY_ITEMS** (Default: `100`)
- Maximum number of recordings to keep in history

### Audio Configuration

**AUDIO_FORMAT** (Default: `webm`)
- Audio recording format
- Options: `webm`, `mp3`, `wav`

**AUDIO_BITRATE** (Default: `128000`)
- Audio quality/bitrate in bits per second

### Feature Flags

**AUTO_ENRICH** (Default: `false`)
- Automatically enrich transcription with AI after recording

**ENABLE_SYSTEM_TRAY** (Default: `true`)
- Enable system tray integration

**STARTUP_ON_BOOT** (Default: `false`)
- Start application automatically on system boot

**ENABLE_TELEMETRY** (Default: `false`)
- Enable anonymous usage telemetry (with user consent)

### Development Settings

**DEBUG** (Default: `false`)
- Enable debug logging

**LOG_LEVEL** (Default: `info`)
- Logging verbosity
- Options: `error`, `warn`, `info`, `debug`

## Usage in Code

### Server-Side (API Routes, Server Components)

```typescript
import { getEnv, validateEnv } from '@/lib/env';

// Validate environment on startup
validateEnv();

// Access environment variables
const env = getEnv();
console.log(env.openaiApiKey); // Access API key
console.log(env.whisperModel); // Access model configuration
```

### Client-Side (React Components)

For security, sensitive variables (like API keys) are NOT available on the client side. Only non-sensitive configuration is exposed:

```typescript
import { getEnv } from '@/lib/env';

const env = getEnv();
console.log(env.hotkeyCombination); // ✅ Available
console.log(env.audioFormat); // ✅ Available
console.log(env.openaiApiKey); // ❌ Empty string on client
```

### Type Safety

The environment configuration is fully typed:

```typescript
import type { EnvConfig } from '@/lib/env';

function useConfig(): EnvConfig {
  return getEnv();
}
```

## Security Best Practices

1. **Never commit API keys** - Always use `.env.local` for sensitive data
2. **Use separate keys** - Consider using different API keys for development and production
3. **Rotate keys regularly** - Change your API keys periodically
4. **Limit key permissions** - Use API keys with minimal required permissions
5. **Monitor usage** - Keep track of API usage to detect unauthorized access

## Troubleshooting

### Missing API Key Error

If you see an error about missing API keys:
1. Ensure `.env.local` exists in the project root
2. Verify `OPENAI_API_KEY` is set in `.env.local`
3. Restart the development server after changing environment variables

### Environment Variables Not Loading

1. Check file naming: `.env.local` (not `.env.local.txt`)
2. Ensure no spaces around the `=` sign: `KEY=value` not `KEY = value`
3. Restart the development server
4. Clear Next.js cache: `rm -rf .next`

### Client-Side Access Issues

Remember: Sensitive variables are NOT available on the client side for security. If you need client-side configuration:
1. Use non-sensitive variables only
2. Consider using Next.js API routes to proxy sensitive operations
3. For desktop apps, use Tauri commands to access sensitive data securely

## Desktop App Considerations

When building the desktop app with Tauri:

1. **API Keys in Tauri**: Store sensitive keys in Tauri's secure storage or environment
2. **Build-time Variables**: Some variables are embedded at build time
3. **Runtime Configuration**: Consider using Tauri's configuration system for user-specific settings

## Next Steps

After setting up environment variables:
1. Test the configuration: `npm run dev`
2. Verify API connectivity in the application
3. Configure Tauri-specific environment handling (when Tauri is set up)
