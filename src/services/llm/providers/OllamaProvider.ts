/**
 * Ollama Provider Implementation
 * Handles text enrichment using Ollama's local/remote LLM API
 */

import { getEnv } from '@/lib/env';
import { getPromptTemplate, buildPrompt } from '../prompts';
import type {
  LLMProvider,
  EnrichmentType,
  OllamaConfig,
  OllamaRequest,
  OllamaResponse,
} from '../types';
import {
  ConfigurationError,
  ConnectionError,
  APIError,
} from '../types';
import { retryWithBackoff } from '../utils/retry';

// Constants
const DEFAULT_BASE_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama2';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_MAX_RETRIES = 3;

export class OllamaProvider implements LLMProvider {
  private config: OllamaConfig;

  constructor(config?: Partial<OllamaConfig>) {
    const env = getEnv();
    
    this.config = {
      baseUrl: config?.baseUrl || env.ollamaBaseUrl || DEFAULT_BASE_URL,
      model: config?.model || env.ollamaModel || DEFAULT_MODEL,
      timeout: config?.timeout ?? (env.ollamaTimeout ? parseInt(env.ollamaTimeout, 10) : DEFAULT_TIMEOUT),
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
        'Ollama configuration is invalid',
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

    // Build prompt based on enrichment type using shared templates
    const prompt = this.buildOllamaPrompt(text, enrichmentType, customPrompt);

    // Make request with retry logic
    try {
      return await retryWithBackoff(
        () => this.makeRequest(prompt, options),
        {
          maxRetries: this.config.maxRetries,
          baseDelay: 1000,
          maxDelay: 10000,
        }
      );
    } catch (error) {
      // If the error is from retry exhaustion, enhance the error message
      if (error instanceof Error && error.message.includes('Failed after')) {
        throw new APIError(
          error.message,
          this.getProviderName(),
          500,
          error
        );
      }
      // Otherwise, rethrow the original error
      throw error;
    }
  }

  /**
   * Validates the provider configuration
   */
  validateConfig(): boolean {
    // Validate base URL format
    if (!this.config.baseUrl || this.config.baseUrl.trim().length === 0) {
      return false;
    }

    // Validate URL format (must be HTTP or HTTPS)
    try {
      const url = new URL(this.config.baseUrl);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return false;
      }
    } catch {
      return false;
    }

    // Validate model is set
    if (!this.config.model || this.config.model.trim().length === 0) {
      return false;
    }

    return true;
  }

  /**
   * Gets the provider name for logging and debugging
   */
  getProviderName(): string {
    return 'ollama';
  }

  /**
   * Performs a health check on the provider
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.validateConfig()) {
        return false;
      }

      // Make a request to the Ollama API to verify connectivity
      const url = `${this.config.baseUrl}/api/tags`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for health check

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Build prompt based on enrichment type using shared templates
   */
  private buildOllamaPrompt(
    text: string,
    enrichmentType: EnrichmentType,
    customPrompt?: string
  ): string {
    // Get prompt template
    const template = getPromptTemplate(enrichmentType);
    
    // Build prompt using shared template
    const { system, user } = buildPrompt(template, text, customPrompt);
    
    // Ollama doesn't have separate system/user messages in the /api/generate endpoint
    // Combine system and user prompts into a single prompt
    return `${system}\n\n${user}`;
  }

  /**
   * Make request to Ollama API
   */
  private async makeRequest(
    prompt: string,
    options?: { temperature?: number; maxTokens?: number; signal?: AbortSignal }
  ): Promise<string> {
    const url = `${this.config.baseUrl}/api/generate`;
    
    const requestBody: OllamaRequest = {
      model: this.config.model,
      prompt: prompt,
      stream: false,
    };

    // Add options if provided
    if (options?.temperature !== undefined) {
      requestBody.options = requestBody.options || {};
      requestBody.options.temperature = options.temperature;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      // Use provided signal if available, otherwise use timeout controller
      const signal = options?.signal || controller.signal;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleAPIError(response);
      }

      const data: OllamaResponse = await response.json();

      if (!data.response) {
        throw new APIError(
          'Received invalid response from Ollama server. Please check server logs.',
          this.getProviderName(),
          500
        );
      }

      return data.response;
    } catch (error) {
      // Handle abort/timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        // Check if it was from the provided signal (cancellation) or timeout
        if (options?.signal) {
          throw error; // Rethrow to preserve AbortError for cancellation
        }
        throw new ConnectionError(
          `Request to Ollama server timed out after ${this.config.timeout}ms. The model may be loading or the server may be overloaded.`,
          this.getProviderName(),
          error
        );
      }

      // If it's already an LLMProviderError, rethrow it
      if (error instanceof ConfigurationError || 
          error instanceof ConnectionError || 
          error instanceof APIError) {
        throw error;
      }

      // Handle network/connection errors - provide specific message for fetch errors
      if (error instanceof TypeError && 
          (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        throw new ConnectionError(
          `Unable to connect to Ollama server at ${this.config.baseUrl}. Please ensure the server is running.`,
          this.getProviderName(),
          error
        );
      }

      // Catch-all for any other connection issues
      throw new ConnectionError(
        `Unable to connect to Ollama server: ${(error as Error).message}`,
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
      errorMessage = errorData.error || errorMessage;
    } catch {
      // Failed to parse error response
    }

    switch (response.status) {
      case 404:
        throw new APIError(
          `Model '${this.config.model}' not found on Ollama server. Please check the model name or pull the model first.`,
          this.getProviderName(),
          404
        );
      
      case 400:
        throw new APIError(
          errorMessage || 'Invalid request to Ollama server',
          this.getProviderName(),
          400
        );
      
      case 500:
      case 502:
      case 503:
      case 504:
        throw new APIError(
          'Ollama server error. Please check server logs.',
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
}
