/**
 * LLM Service Types
 * Defines interfaces and types for AI text enrichment functionality
 */

/**
 * Enrichment types available
 */
export type EnrichmentType = 
  | 'format'
  | 'summarize'
  | 'expand'
  | 'bullet-points'
  | 'action-items'
  | 'custom';

/**
 * LLM Provider Interface
 * Core abstraction that all LLM providers must implement
 */
export interface LLMProvider {
  /**
   * Enriches text based on the specified enrichment type
   * @param text - The input text to enrich
   * @param enrichmentType - The type of enrichment to apply
   * @param customPrompt - Optional custom prompt for 'custom' enrichment type
   * @param options - Optional enrichment options (temperature, maxTokens, signal)
   * @returns Promise resolving to enriched text
   * @throws Error if enrichment fails
   */
  enrich(
    text: string,
    enrichmentType: EnrichmentType,
    customPrompt?: string,
    options?: { temperature?: number; maxTokens?: number; signal?: AbortSignal }
  ): Promise<string>;

  /**
   * Validates the provider configuration
   * @returns true if configuration is valid, false otherwise
   */
  validateConfig(): boolean;

  /**
   * Gets the provider name for logging and debugging
   * @returns The provider name (e.g., "openai", "ollama")
   */
  getProviderName(): string;

  /**
   * Performs a health check on the provider
   * @returns Promise resolving to true if provider is healthy
   */
  healthCheck(): Promise<boolean>;
}

/**
 * LLM processing status
 */
export type LLMStatus = 'idle' | 'processing' | 'complete' | 'error';

/**
 * OpenAI Provider Configuration
 */
export interface OpenAIConfig {
  apiKey: string;
  model: string;        // Default: "gpt-4"
  temperature: number;  // Default: 0.7
  maxTokens: number;    // Default: 1000
  maxRetries: number;   // Default: 3
}

/**
 * Ollama Provider Configuration
 */
export interface OllamaConfig {
  baseUrl: string;      // Default: "http://localhost:11434"
  model: string;        // Default: "llama2"
  timeout: number;      // Default: 30000 (30 seconds)
  maxRetries: number;   // Default: 3
}

/**
 * Enrichment result
 */
export interface EnrichmentResult {
  enrichedText: string;
  originalText: string;
  enrichmentType: EnrichmentType;
  model: string;
  tokensUsed?: number;
  processingTime?: number;
}

/**
 * Ollama API Request
 */
export interface OllamaRequest {
  model: string;
  prompt: string;
  stream: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
  };
}

/**
 * Ollama API Response
 */
export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
  eval_duration?: number;
}

/**
 * Enrichment options
 */
export interface EnrichmentOptions {
  type: EnrichmentType;
  customPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

/**
 * Base LLM Provider Error
 */
export class LLMProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'LLMProviderError';
    Object.setPrototypeOf(this, LLMProviderError.prototype);
  }
}

/**
 * Configuration Error
 * Thrown when provider configuration is invalid or missing
 */
export class ConfigurationError extends LLMProviderError {
  constructor(message: string, provider: string) {
    super(message, provider);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * Connection Error
 * Thrown when unable to connect to the provider service
 */
export class ConnectionError extends LLMProviderError {
  constructor(message: string, provider: string, originalError?: Error) {
    super(message, provider, originalError);
    this.name = 'ConnectionError';
    Object.setPrototypeOf(this, ConnectionError.prototype);
  }
}

/**
 * API Error
 * Thrown when the provider API returns an error response
 */
export class APIError extends LLMProviderError {
  constructor(
    message: string,
    provider: string,
    public statusCode?: number,
    originalError?: Error
  ) {
    super(message, provider, originalError);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * LLM error (legacy interface for backward compatibility)
 */
export interface LLMError extends Error {
  name: 'LLMError';
  code: 'API_ERROR' | 'NETWORK_ERROR' | 'RATE_LIMIT' | 'AUTHENTICATION_ERROR' | 'INVALID_INPUT' | 'UNKNOWN_ERROR';
  statusCode?: number;
  retryable?: boolean;
}

/**
 * LLM service interface
 */
export interface ILLMService {
  /**
   * Enrich text using AI
   */
  enrich(text: string, options: EnrichmentOptions): Promise<EnrichmentResult>;

  /**
   * Get current processing status
   */
  getStatus(): LLMStatus;

  /**
   * Cancel ongoing enrichment
   */
  cancel(): void;

  /**
   * Check if service is available
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get available enrichment types
   */
  getAvailableTypes(): EnrichmentType[];
}

/**
 * Prompt template
 */
export interface PromptTemplate {
  type: EnrichmentType;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  temperature: number;
  maxTokens: number;
}

/**
 * OpenAI API response
 */
export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Enrichment Request
 */
export interface EnrichmentRequest {
  text: string;
  enrichmentType: EnrichmentType;
  customPrompt?: string;
}

/**
 * Enrichment Response
 */
export interface EnrichmentResponse {
  success: boolean;
  enrichedText?: string;
  error?: string;
  provider: string;
  metadata?: {
    model: string;
    duration?: number;
  };
}

/**
 * Error Response
 */
export interface ErrorResponse {
  success: false;
  error: string;
  provider: string;
  errorType: 'configuration' | 'connection' | 'api' | 'unknown';
  retryable: boolean;
}

/**
 * Environment Configuration
 */
export interface EnvironmentConfig {
  // Provider selection
  LLM_PROVIDER?: 'openai' | 'ollama';  // Default: 'openai'
  
  // OpenAI configuration
  OPENAI_API_KEY?: string;
  GPT_MODEL?: string;                   // Default: 'gpt-4'
  GPT_TEMPERATURE?: string;             // Default: '0.7'
  GPT_MAX_TOKENS?: string;              // Default: '1000'
  
  // Ollama configuration
  OLLAMA_BASE_URL?: string;             // Default: 'http://localhost:11434'
  OLLAMA_MODEL?: string;                // Default: 'llama2'
  OLLAMA_TIMEOUT?: string;              // Default: '30000'
}
