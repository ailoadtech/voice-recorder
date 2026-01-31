/**
 * LLMService - Provider Orchestrator
 * Manages LLM provider selection and delegates enrichment requests
 */

import { getEnv } from '@/lib/env';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { OllamaProvider } from './providers/OllamaProvider';
import type {
  ILLMService,
  EnrichmentResult,
  EnrichmentOptions,
  LLMStatus,
  LLMError,
  EnrichmentType,
  LLMProvider,
} from './types';
import {
  LLMProviderError,
  ConfigurationError,
  ConnectionError,
  APIError,
} from './types';

// Constants
const MAX_INPUT_LENGTH = 10000;

export class LLMService implements ILLMService {
  private status: LLMStatus = 'idle';
  private abortController: AbortController | null = null;
  private provider: LLMProvider;

  constructor() {
    this.provider = this.initializeProvider();
  }

  /**
   * Initialize the appropriate provider based on environment configuration
   */
  private initializeProvider(): LLMProvider {
    const env = getEnv();
    const providerName = env.llmProvider?.toLowerCase();

    // Log provider selection
    console.log(`[LLMService] Initializing LLM provider: ${providerName || 'default (openai)'}`);

    let provider: LLMProvider;

    // Select provider based on configuration
    if (providerName === 'ollama') {
      console.log(`[LLMService] Using Ollama provider with base URL: ${env.ollamaBaseUrl || 'http://localhost:11434'}`);
      provider = new OllamaProvider();
    } else if (providerName === 'openai' || !providerName) {
      // Default to OpenAI
      console.log('[LLMService] Using OpenAI provider');
      provider = new OpenAIProvider();
    } else {
      // Invalid provider name - log error and default to OpenAI
      console.error(`[LLMService] Invalid provider name: "${providerName}". Defaulting to OpenAI.`);
      provider = new OpenAIProvider();
    }

    // Validate provider configuration
    this.validateProviderConfiguration(provider, providerName);

    // Perform health check for Ollama provider
    if (provider.getProviderName() === 'ollama') {
      this.performOllamaHealthCheck(provider);
    }

    return provider;
  }

  /**
   * Validate provider configuration and log warnings
   */
  private validateProviderConfiguration(provider: LLMProvider, requestedProvider?: string): void {
    const providerName = provider.getProviderName();
    const isValid = provider.validateConfig();

    if (!isValid) {
      if (providerName === 'openai') {
        console.warn(
          '[LLMService] OpenAI provider configuration is invalid or incomplete. ' +
          'Missing or invalid OPENAI_API_KEY environment variable. ' +
          'Please ensure your API key is properly configured.'
        );
      } else if (providerName === 'ollama') {
        const env = getEnv();
        const baseUrl = env.ollamaBaseUrl || 'http://localhost:11434';
        const model = env.ollamaModel || 'llama2';
        
        console.warn(
          '[LLMService] Ollama provider configuration is invalid. ' +
          `Base URL: ${baseUrl}, Model: ${model}. ` +
          'Please ensure OLLAMA_BASE_URL is a valid HTTP/HTTPS URL and OLLAMA_MODEL is set.'
        );
      }
    } else {
      console.log(`[LLMService] ${providerName} provider configuration validated successfully`);
    }
  }

  /**
   * Perform health check for Ollama provider
   */
  private async performOllamaHealthCheck(provider: LLMProvider): Promise<void> {
    try {
      console.log('[LLMService] Performing health check for Ollama provider...');
      const isHealthy = await provider.healthCheck();
      
      if (isHealthy) {
        console.log('[LLMService] Ollama provider health check passed');
      } else {
        const env = getEnv();
        const baseUrl = env.ollamaBaseUrl || 'http://localhost:11434';
        console.warn(
          '[LLMService] Ollama provider health check failed. ' +
          `Unable to connect to Ollama server at ${baseUrl}. ` +
          'Please ensure the Ollama server is running and accessible.'
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn(
        '[LLMService] Ollama provider health check encountered an error: ' +
        errorMessage
      );
    }
  }

  /**
   * Enrich text using AI
   */
  async enrich(
    text: string,
    options: EnrichmentOptions
  ): Promise<EnrichmentResult> {
    const startTime = Date.now();

    // Validate input
    this.validateInput(text);

    this.status = 'processing';
    this.abortController = new AbortController();

    try {
      // Delegate to provider with options
      const enrichedText = await this.provider.enrich(
        text,
        options.type,
        options.customPrompt,
        {
          temperature: options.temperature,
          maxTokens: options.maxTokens,
          signal: this.abortController?.signal,
        }
      );
      
      const processingTime = Date.now() - startTime;
      const providerName = this.provider.getProviderName();

      this.status = 'complete';

      // Get model name from environment based on provider
      const env = getEnv();
      const modelName = providerName === 'ollama' 
        ? (env.ollamaModel || 'llama2')
        : (options.model || env.gptModel || 'gpt-4');

      return {
        enrichedText,
        originalText: text,
        enrichmentType: options.type,
        model: modelName,
        processingTime,
      };
    } catch (error) {
      this.status = 'error';
      
      // Check if it was cancelled
      if (error instanceof Error && error.name === 'AbortError') {
        this.status = 'idle';
        throw this.createError(
          'Enrichment cancelled',
          'UNKNOWN_ERROR',
          undefined,
          false
        );
      }
      
      // Log error with provider details
      const providerName = this.provider.getProviderName();
      const env = getEnv();
      const modelName = providerName === 'ollama' 
        ? (env.ollamaModel || 'llama2')
        : (env.gptModel || 'gpt-4');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(
        `[LLMService] Enrichment failed - ` +
        `Provider: ${providerName}, ` +
        `Model: ${modelName}, ` +
        `Error: ${errorMessage}`
      );
      
      // Convert provider errors to legacy LLMError format for backward compatibility
      if (error instanceof ConfigurationError) {
        throw this.createError(
          error.message,
          'AUTHENTICATION_ERROR',
          undefined,
          false
        );
      } else if (error instanceof ConnectionError) {
        throw this.createError(
          error.message,
          'NETWORK_ERROR',
          undefined,
          true
        );
      } else if (error instanceof APIError) {
        const code = error.statusCode === 429 ? 'RATE_LIMIT' : 'API_ERROR';
        const retryable = error.statusCode === 429 || (error.statusCode !== undefined && error.statusCode >= 500);
        throw this.createError(
          error.message,
          code,
          error.statusCode,
          retryable
        );
      } else {
        throw this.createError(
          errorMessage,
          'UNKNOWN_ERROR',
          undefined,
          false
        );
      }
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Validate input text
   */
  private validateInput(text: string): void {
    if (!text || text.trim().length === 0) {
      throw this.createError(
        'Input text is empty',
        'INVALID_INPUT',
        undefined,
        false
      );
    }

    if (text.length > MAX_INPUT_LENGTH) {
      throw this.createError(
        `Input text too long (${text.length} characters). Maximum is ${MAX_INPUT_LENGTH}.`,
        'INVALID_INPUT',
        undefined,
        false
      );
    }
  }

  /**
   * Get current processing status
   */
  getStatus(): LLMStatus {
    return this.status;
  }

  /**
   * Cancel ongoing enrichment
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.status = 'idle';
    }
  }

  /**
   * Check if service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      return await this.provider.healthCheck();
    } catch {
      return false;
    }
  }

  /**
   * Get current provider name
   */
  getProviderName(): string {
    return this.provider.getProviderName();
  }

  /**
   * Check if provider is properly configured
   */
  isConfigured(): boolean {
    return this.provider.validateConfig();
  }

  /**
   * Get available enrichment types
   */
  getAvailableTypes(): EnrichmentType[] {
    return ['format', 'summarize', 'expand', 'bullet-points', 'action-items', 'custom'];
  }

  /**
   * Get model information
   */
  getModelInfo(): { model: string; maxTokens: number; provider: string } {
    const env = getEnv();
    const providerName = this.provider.getProviderName();
    
    if (providerName === 'ollama') {
      return {
        model: env.ollamaModel || 'llama2',
        maxTokens: 2048, // Ollama default context window
        provider: 'ollama',
      };
    } else {
      return {
        model: env.gptModel || 'gpt-4',
        maxTokens: 8192, // GPT-4 default
        provider: 'openai',
      };
    }
  }

  /**
   * Create an LLM error
   */
  private createError(
    message: string,
    code: LLMError['code'],
    statusCode?: number,
    retryable: boolean = false
  ): LLMError {
    const error = new Error(message) as LLMError;
    error.name = 'LLMError';
    error.code = code;
    error.statusCode = statusCode;
    error.retryable = retryable;
    return error;
  }

  /**
   * Estimate token count (rough approximation)
   */
  static estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}
