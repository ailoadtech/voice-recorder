/**
 * OpenAI Provider Implementation
 * Handles text enrichment using OpenAI's GPT API
 */

import { getGPTApiKey, getEnv } from '@/lib/env';
import { getPromptTemplate, buildPrompt } from '../prompts';
import type {
  LLMProvider,
  EnrichmentType,
  OpenAIConfig,
  OpenAIResponse,
} from '../types';
import {
  LLMProviderError,
  ConfigurationError,
  ConnectionError,
  APIError,
} from '../types';

// Constants
const DEFAULT_MODEL = 'gpt-4';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1000;
const DEFAULT_MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export class OpenAIProvider implements LLMProvider {
  private config: OpenAIConfig;

  constructor(config?: Partial<OpenAIConfig>) {
    const env = getEnv();
    
    this.config = {
      apiKey: config?.apiKey || getGPTApiKey() || '',
      model: config?.model || env.gptModel || DEFAULT_MODEL,
      temperature: config?.temperature ?? DEFAULT_TEMPERATURE,
      maxTokens: config?.maxTokens ?? DEFAULT_MAX_TOKENS,
      maxRetries: config?.maxRetries ?? DEFAULT_MAX_RETRIES,
    };
  }

  /**
   * Enriches text based on the specified enrichment type
   */
  async enrich(
    text: string,
    enrichmentType: EnrichmentType,
    customPrompt?: string,
    options?: { temperature?: number; maxTokens?: number; signal?: AbortSignal }
  ): Promise<string> {
    // Validate configuration
    if (!this.validateConfig()) {
      throw new ConfigurationError(
        'OpenAI API key is not configured',
        this.getProviderName()
      );
    }

    // Validate input
    if (!text || text.trim().length === 0) {
      throw new APIError(
        'Input text is empty',
        this.getProviderName(),
        400
      );
    }

    // Get prompt template and build prompt
    const template = getPromptTemplate(enrichmentType);
    const { system, user } = buildPrompt(template, text, customPrompt);

    // Make request with retry logic, passing options
    return await this.enrichWithRetry(system, user, template, 1, options);
  }

  /**
   * Validates the provider configuration
   */
  validateConfig(): boolean {
    // Check if API key exists and is not empty after trimming
    if (!this.config.apiKey) {
      return false;
    }
    
    const trimmedKey = this.config.apiKey.trim();
    return trimmedKey.length > 0;
  }

  /**
   * Gets the provider name for logging and debugging
   */
  getProviderName(): string {
    return 'openai';
  }

  /**
   * Performs a health check on the provider
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.validateConfig()) {
        return false;
      }

      // Make a minimal request to verify API key and connectivity
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Enrich with automatic retry logic
   */
  private async enrichWithRetry(
    system: string,
    user: string,
    template: any,
    attempt: number,
    options?: { temperature?: number; maxTokens?: number; signal?: AbortSignal }
  ): Promise<string> {
    try {
      return await this.makeRequest(system, user, template, options);
    } catch (error) {
      // Don't retry configuration errors
      if (error instanceof ConfigurationError) {
        throw error;
      }

      // Don't retry if cancelled
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }

      // Don't retry if max retries reached
      if (attempt >= this.config.maxRetries) {
        throw error;
      }

      // Check if error is retryable
      const isRetryable = this.isRetryableError(error);
      if (!isRetryable) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      await this.sleep(delay);

      // Retry
      return this.enrichWithRetry(system, user, template, attempt + 1, options);
    }
  }

  /**
   * Make request to OpenAI API
   */
  private async makeRequest(
    system: string,
    user: string,
    template: any,
    options?: { temperature?: number; maxTokens?: number; signal?: AbortSignal }
  ): Promise<string> {
    // Double-check API key before making request
    if (!this.config.apiKey || this.config.apiKey.trim().length === 0) {
      throw new ConfigurationError(
        'OpenAI API key is not configured',
        this.getProviderName()
      );
    }

    const requestBody = {
      model: this.config.model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: options?.temperature ?? template.temperature ?? this.config.temperature,
      max_tokens: options?.maxTokens ?? template.maxTokens ?? this.config.maxTokens,
    };

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: options?.signal,
      });

      if (!response.ok) {
        await this.handleAPIError(response);
      }

      const data: OpenAIResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new APIError(
          'No response from OpenAI API',
          this.getProviderName(),
          500
        );
      }

      return data.choices[0].message.content;
    } catch (error) {
      // If it's already an LLMProviderError, rethrow it
      if (error instanceof LLMProviderError) {
        throw error;
      }

      // Handle abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ConnectionError(
          'Network error during enrichment',
          this.getProviderName(),
          error
        );
      }

      // Unknown error - treat as connection error
      throw new ConnectionError(
        `Unexpected error: ${(error as Error).message}`,
        this.getProviderName(),
        error as Error
      );
    }
  }

  /**
   * Handle API error responses
   */
  private async handleAPIError(response: Response): Promise<never> {
    let errorMessage = 'Enrichment failed';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      // Failed to parse error response
    }

    switch (response.status) {
      case 400:
        throw new APIError(
          errorMessage || 'Invalid input or request format',
          this.getProviderName(),
          400
        );
      case 401:
        throw new ConfigurationError(
          'Invalid API key',
          this.getProviderName()
        );
      case 429:
        throw new APIError(
          'Rate limit exceeded. Please try again later.',
          this.getProviderName(),
          429
        );
      case 500:
      case 502:
      case 503:
      case 504:
        throw new APIError(
          'OpenAI service temporarily unavailable',
          this.getProviderName(),
          response.status
        );
      default:
        throw new APIError(
          errorMessage,
          this.getProviderName(),
          response.status
        );
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof APIError) {
      // Retry on rate limits and server errors
      return error.statusCode === 429 || 
             (error.statusCode !== undefined && error.statusCode >= 500);
    }
    
    if (error instanceof ConnectionError) {
      return true;
    }

    return false;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
