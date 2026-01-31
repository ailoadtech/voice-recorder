/**
 * Environment Variable Configuration
 * 
 * This module provides type-safe access to environment variables
 * with validation and default values.
 */

// Environment variable schema
interface EnvConfig {
  // API Keys
  openaiApiKey: string;
  whisperApiKey?: string;
  gptApiKey?: string;

  // AI Model Configuration
  whisperModel: string;
  gptModel: string;

  // LLM Provider Configuration
  llmProvider?: 'openai' | 'ollama';
  ollamaBaseUrl?: string;
  ollamaModel?: string;
  ollamaTimeout?: string;

  // Application Settings
  hotkeyCombination: string;
  nodeEnv: 'development' | 'production' | 'test';

  // API Configuration
  openaiApiBaseUrl: string;
  apiTimeout: number;
  apiMaxRetries: number;

  // Storage Configuration
  storagePath: string;
  maxHistoryItems: number;

  // Audio Configuration
  audioFormat: 'webm' | 'mp3' | 'wav';
  audioBitrate: number;

  // Feature Flags
  autoEnrich: boolean;
  enableSystemTray: boolean;
  startupOnBoot: boolean;
  enableTelemetry: boolean;

  // Development Settings
  debug: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

/**
 * Parse boolean environment variable
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Parse number environment variable
 */
function parseNumber(value: string | undefined, defaultValue: number): number {
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue || '';
}

/**
 * Load and validate environment variables
 */
function loadEnv(): EnvConfig {
  // In Next.js, client-side env vars must be prefixed with NEXT_PUBLIC_
  // For server-side only vars, no prefix is needed
  const isClient = typeof window !== 'undefined';

  return {
    // API Keys (server-side only for security)
    openaiApiKey: isClient ? '' : getEnvVar('OPENAI_API_KEY', ''),
    whisperApiKey: isClient ? undefined : process.env.WHISPER_API_KEY,
    gptApiKey: isClient ? undefined : process.env.GPT_API_KEY,

    // AI Model Configuration (can be public)
    whisperModel: getEnvVar('NEXT_PUBLIC_WHISPER_MODEL', 'whisper-1'),
    gptModel: getEnvVar('NEXT_PUBLIC_GPT_MODEL', 'gpt-4'),

    // LLM Provider Configuration (server-side only)
    llmProvider: isClient ? undefined : (process.env.LLM_PROVIDER as 'openai' | 'ollama' | undefined),
    ollamaBaseUrl: isClient ? undefined : process.env.OLLAMA_BASE_URL,
    ollamaModel: isClient ? undefined : process.env.OLLAMA_MODEL,
    ollamaTimeout: isClient ? undefined : process.env.OLLAMA_TIMEOUT,

    // Application Settings (can be public)
    hotkeyCombination: getEnvVar('NEXT_PUBLIC_HOTKEY_COMBINATION', 'CommandOrControl+Shift+R'),
    nodeEnv: (process.env.NODE_ENV as EnvConfig['nodeEnv']) || 'development',

    // API Configuration (can be public for base URL)
    openaiApiBaseUrl: getEnvVar('NEXT_PUBLIC_OPENAI_API_BASE_URL', 'https://api.openai.com/v1'),
    apiTimeout: parseNumber(process.env.NEXT_PUBLIC_API_TIMEOUT, 30000),
    apiMaxRetries: parseNumber(process.env.NEXT_PUBLIC_API_MAX_RETRIES, 3),

    // Storage Configuration (can be public)
    storagePath: getEnvVar('NEXT_PUBLIC_STORAGE_PATH', 'recordings'),
    maxHistoryItems: parseNumber(process.env.NEXT_PUBLIC_MAX_HISTORY_ITEMS, 100),

    // Audio Configuration (can be public)
    audioFormat: (process.env.NEXT_PUBLIC_AUDIO_FORMAT as EnvConfig['audioFormat']) || 'webm',
    audioBitrate: parseNumber(process.env.NEXT_PUBLIC_AUDIO_BITRATE, 128000),

    // Feature Flags (can be public)
    autoEnrich: parseBoolean(process.env.NEXT_PUBLIC_AUTO_ENRICH, false),
    enableSystemTray: parseBoolean(process.env.NEXT_PUBLIC_ENABLE_SYSTEM_TRAY, true),
    startupOnBoot: parseBoolean(process.env.NEXT_PUBLIC_STARTUP_ON_BOOT, false),
    enableTelemetry: parseBoolean(process.env.NEXT_PUBLIC_ENABLE_TELEMETRY, false),

    // Development Settings (can be public)
    debug: parseBoolean(process.env.NEXT_PUBLIC_DEBUG, false),
    logLevel: (process.env.NEXT_PUBLIC_LOG_LEVEL as EnvConfig['logLevel']) || 'info',
  };
}

// Export singleton instance
let envConfig: EnvConfig | null = null;

/**
 * Get environment configuration
 * Lazily loads and caches the configuration
 */
export function getEnv(): EnvConfig {
  if (!envConfig) {
    envConfig = loadEnv();
  }
  return envConfig;
}

/**
 * Validate required environment variables
 * Call this during app initialization to fail fast
 */
export function validateEnv(): void {
  const isClient = typeof window !== 'undefined';
  
  // Skip validation on client side
  if (isClient) {
    return;
  }

  const env = getEnv();
  const errors: string[] = [];

  // Validate required API keys
  if (!env.openaiApiKey && !env.whisperApiKey) {
    errors.push('OPENAI_API_KEY or WHISPER_API_KEY is required');
  }

  if (!env.openaiApiKey && !env.gptApiKey) {
    errors.push('OPENAI_API_KEY or GPT_API_KEY is required');
  }

  // Validate API key format
  const whisperKey = env.whisperApiKey || env.openaiApiKey;
  const gptKey = env.gptApiKey || env.openaiApiKey;

  if (whisperKey && !whisperKey.startsWith('sk-')) {
    errors.push('Invalid API key format. OpenAI keys should start with "sk-"');
  }

  if (gptKey && !gptKey.startsWith('sk-')) {
    errors.push('Invalid API key format. OpenAI keys should start with "sk-"');
  }

  // Validate model names
  if (!env.whisperModel) {
    errors.push('WHISPER_MODEL is required');
  }

  if (!env.gptModel) {
    errors.push('GPT_MODEL is required');
  }

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}\n\n` +
      `Please check your .env.local file and ensure all required API keys are configured.\n` +
      `See docs/API_KEY_SETUP.md for detailed setup instructions.`
    );
  }
}

/**
 * Get API key for Whisper service
 */
export function getWhisperApiKey(): string {
  const env = getEnv();
  return env.whisperApiKey || env.openaiApiKey;
}

/**
 * Get API key for GPT service
 */
export function getGPTApiKey(): string {
  const env = getEnv();
  return env.gptApiKey || env.openaiApiKey;
}

/**
 * Check if API keys are configured
 */
export function hasApiKeys(): boolean {
  const isClient = typeof window !== 'undefined';
  if (isClient) return false;
  
  const env = getEnv();
  return !!(env.openaiApiKey || (env.whisperApiKey && env.gptApiKey));
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return getEnv().nodeEnv === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return getEnv().nodeEnv === 'production';
}

/**
 * Export type for use in other modules
 */
export type { EnvConfig };
