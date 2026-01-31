# API Configuration Module

This module provides type-safe access to environment variables with validation and helper functions for API key management.

## Overview

The `env.ts` module centralizes all environment variable access and provides:
- Type-safe configuration interface
- Validation of required variables
- Helper functions for API key access
- Client/server-side handling
- Default values for optional settings

## Usage

### Basic Usage

```typescript
import { getEnv, validateEnv } from '@/lib/env';

// Get environment configuration
const env = getEnv();
console.log(env.whisperModel); // 'whisper-1'
console.log(env.gptModel); // 'gpt-4'

// Validate environment (call during app initialization)
validateEnv(); // Throws error if required vars are missing
```

### API Key Access

```typescript
import { getWhisperApiKey, getGPTApiKey, hasApiKeys } from '@/lib/env';

// Get API keys for specific services
const whisperKey = getWhisperApiKey(); // Returns WHISPER_API_KEY or OPENAI_API_KEY
const gptKey = getGPTApiKey(); // Returns GPT_API_KEY or OPENAI_API_KEY

// Check if API keys are configured
if (hasApiKeys()) {
  // Proceed with API calls
}
```

### Environment Checks

```typescript
import { isDevelopment, isProduction } from '@/lib/env';

if (isDevelopment()) {
  console.log('Running in development mode');
}

if (isProduction()) {
  // Enable production optimizations
}
```

## Configuration

### Required Environment Variables

These must be set in `.env.local`:

```bash
# Primary API key (used for both services if separate keys not provided)
OPENAI_API_KEY=sk-your-api-key-here
```

### Optional Environment Variables

```bash
# Separate API keys (optional)
WHISPER_API_KEY=sk-whisper-key-here
GPT_API_KEY=sk-gpt-key-here

# Model configuration
WHISPER_MODEL=whisper-1
GPT_MODEL=gpt-4

# API configuration
OPENAI_API_BASE_URL=https://api.openai.com/v1
API_TIMEOUT=30000
API_MAX_RETRIES=3
```

## API Key Priority

The module supports flexible API key configuration:

1. **Single Key Mode** (Recommended for most users)
   - Set `OPENAI_API_KEY` only
   - Used for both Whisper and GPT services

2. **Separate Keys Mode** (For advanced users)
   - Set `WHISPER_API_KEY` for transcription
   - Set `GPT_API_KEY` for enrichment
   - Falls back to `OPENAI_API_KEY` if specific keys not set

## Validation

### Automatic Validation

Call `validateEnv()` during app initialization to ensure all required variables are set:

```typescript
// In your app entry point (e.g., layout.tsx or _app.tsx)
import { validateEnv } from '@/lib/env';

// Validate on server-side only
if (typeof window === 'undefined') {
  validateEnv();
}
```

### Manual Validation

Use the validation script to check configuration:

```bash
npm run validate:api-keys
```

This script checks:
- Environment file exists
- API keys are configured
- API key format is valid
- Connection to OpenAI API works

## Error Handling

### Missing API Keys

If required API keys are not configured, `validateEnv()` throws an error:

```
Environment validation failed:
  - OPENAI_API_KEY or WHISPER_API_KEY is required
  - OPENAI_API_KEY or GPT_API_KEY is required

Please check your .env.local file and ensure all required API keys are configured.
See docs/API_KEY_SETUP.md for detailed setup instructions.
```

### Invalid API Key Format

If API keys don't start with `sk-`, validation fails:

```
Environment validation failed:
  - Invalid API key format. OpenAI keys should start with "sk-"
```

## Client vs Server

The module handles client/server differences automatically:

- **Server-side**: Full access to all environment variables
- **Client-side**: API keys are hidden (return empty string)

This prevents exposing sensitive keys in the browser.

## Type Safety

The module exports a TypeScript interface for type-safe access:

```typescript
interface EnvConfig {
  // API Keys
  openaiApiKey: string;
  whisperApiKey?: string;
  gptApiKey?: string;

  // AI Model Configuration
  whisperModel: string;
  gptModel: string;

  // Application Settings
  hotkeyCombination: string;
  nodeEnv: 'development' | 'production' | 'test';

  // ... more fields
}
```

## Best Practices

1. **Always validate on startup**
   ```typescript
   validateEnv(); // Fail fast if config is wrong
   ```

2. **Use helper functions**
   ```typescript
   // Good
   const key = getWhisperApiKey();
   
   // Avoid
   const key = process.env.OPENAI_API_KEY;
   ```

3. **Check availability before API calls**
   ```typescript
   if (!hasApiKeys()) {
     throw new Error('API keys not configured');
   }
   ```

4. **Never expose keys client-side**
   ```typescript
   // Server-side only
   if (typeof window === 'undefined') {
     const key = getWhisperApiKey();
   }
   ```

## Integration with Services

### TranscriptionService

```typescript
import { getWhisperApiKey } from '@/lib/env';

class TranscriptionService {
  constructor() {
    this.apiKey = getWhisperApiKey();
  }
}
```

### LLMService

```typescript
import { getGPTApiKey } from '@/lib/env';

class LLMService {
  constructor() {
    this.apiKey = getGPTApiKey();
  }
}
```

## Troubleshooting

### "API key not configured" warning

**Cause**: `.env.local` file is missing or `OPENAI_API_KEY` is not set

**Solution**:
1. Copy `.env.example` to `.env.local`
2. Add your OpenAI API key
3. Restart the development server

### "Invalid API key format" error

**Cause**: API key doesn't start with `sk-`

**Solution**:
1. Verify you copied the key correctly
2. Check for extra spaces or characters
3. Generate a new key if needed

### Environment changes not reflected

**Cause**: Next.js caches environment variables

**Solution**:
1. Stop the development server
2. Clear Next.js cache: `rm -rf .next`
3. Restart: `npm run dev`

## Related Documentation

- [API Key Setup Guide](../../docs/API_KEY_SETUP.md) - How to get and configure API keys
- [Environment Setup Guide](../../docs/ENVIRONMENT_SETUP.md) - Complete environment configuration
- [TranscriptionService](../services/transcription/README.md) - Whisper API integration
- [LLMService](../services/llm/README.md) - GPT API integration
