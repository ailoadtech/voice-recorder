/**
 * Example Usage of Environment Configuration
 * 
 * This file demonstrates how to use the environment configuration
 * in different parts of the application.
 */

import React from 'react';
import { getEnv, validateEnv, isDevelopment, isProduction } from './env';

// ============================================================================
// Example 1: Server-Side Usage (API Routes, Server Components)
// ============================================================================

/**
 * Example: Using environment in an API route
 */
export async function exampleApiRoute() {
  // Validate environment on startup (do this once in your app initialization)
  validateEnv();
  
  const env = getEnv();
  
  // Access API keys (only available server-side)
  const apiKey = env.openaiApiKey;
  
  // Use configuration
  const response = await fetch(`${env.openaiApiBaseUrl}/models`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });
  
  return response.json();
}

// ============================================================================
// Example 2: Client-Side Usage (React Components)
// ============================================================================

/**
 * Example: Using environment in a React component
 */
export function ExampleComponent() {
  const env = getEnv();
  
  // ✅ Non-sensitive configuration is available
  const hotkey = env.hotkeyCombination;
  const audioFormat = env.audioFormat;
  
  // ❌ Sensitive data (API keys) will be empty on client
  // const apiKey = env.openaiApiKey; // This will be empty string
  
  return (
    <div>
      <p>Hotkey: {hotkey}</p>
      <p>Audio Format: {audioFormat}</p>
    </div>
  );
}

// ============================================================================
// Example 3: Conditional Logic Based on Environment
// ============================================================================

/**
 * Example: Different behavior in development vs production
 */
export function exampleConditionalLogic() {
  if (isDevelopment()) {
    console.log('Running in development mode');
    // Enable debug features
  }
  
  if (isProduction()) {
    console.log('Running in production mode');
    // Disable debug features
  }
  
  const env = getEnv();
  
  if (env.debug) {
    console.log('Debug mode enabled');
  }
}

// ============================================================================
// Example 4: Service Configuration
// ============================================================================

/**
 * Example: Configuring a service with environment variables
 */
export class ExampleService {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private maxRetries: number;
  
  constructor() {
    const env = getEnv();
    
    this.apiKey = env.openaiApiKey;
    this.baseUrl = env.openaiApiBaseUrl;
    this.timeout = env.apiTimeout;
    this.maxRetries = env.apiMaxRetries;
  }
  
  async makeRequest(endpoint: string) {
    const url = `${this.baseUrl}${endpoint}`;
    
    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
          signal: AbortSignal.timeout(this.timeout),
        });
        
        return await response.json();
      } catch (error) {
        retries++;
        if (retries >= this.maxRetries) {
          throw error;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
  }
}

// ============================================================================
// Example 5: Feature Flags
// ============================================================================

/**
 * Example: Using feature flags from environment
 */
export function exampleFeatureFlags() {
  const env = getEnv();
  
  // Check if auto-enrichment is enabled
  if (env.autoEnrich) {
    console.log('Auto-enrichment is enabled');
    // Automatically enrich transcriptions
  }
  
  // Check if system tray is enabled
  if (env.enableSystemTray) {
    console.log('System tray integration enabled');
    // Initialize system tray
  }
  
  // Check if telemetry is enabled
  if (env.enableTelemetry) {
    console.log('Telemetry enabled');
    // Initialize analytics
  }
}

// ============================================================================
// Example 6: Type-Safe Configuration Access
// ============================================================================

/**
 * Example: Creating a typed configuration object
 */
export function getAudioConfig() {
  const env = getEnv();
  
  return {
    format: env.audioFormat,
    bitrate: env.audioBitrate,
  } as const;
}

/**
 * Example: Creating a typed API configuration object
 */
export function getApiConfig() {
  const env = getEnv();
  
  return {
    baseUrl: env.openaiApiBaseUrl,
    timeout: env.apiTimeout,
    maxRetries: env.apiMaxRetries,
    whisperModel: env.whisperModel,
    gptModel: env.gptModel,
  } as const;
}
