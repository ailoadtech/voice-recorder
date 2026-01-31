/**
 * Transcription Service Types
 * Defines interfaces and types for audio transcription functionality
 */

/**
 * Transcription status
 */
export type TranscriptionStatus = 'idle' | 'processing' | 'complete' | 'error';

/**
 * Transcription result
 */
export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
  confidence?: number;
  segments?: TranscriptionSegment[];
  provider?: 'api' | 'local';
}

/**
 * Transcription segment (for detailed results)
 */
export interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  confidence?: number;
}

/**
 * Transcription options
 */
export interface TranscriptionOptions {
  language?: string;
  prompt?: string;
  temperature?: number;
  model?: string;
}

/**
 * Transcription error
 */
export interface TranscriptionError extends Error {
  name: 'TranscriptionError';
  code: 'API_ERROR' | 'NETWORK_ERROR' | 'INVALID_AUDIO' | 'RATE_LIMIT' | 'AUTHENTICATION_ERROR' | 'UNKNOWN_ERROR';
  statusCode?: number;
  retryable?: boolean;
}

/**
 * Transcription service interface
 */
export interface ITranscriptionService {
  /**
   * Transcribe audio blob to text
   */
  transcribe(audio: Blob, options?: TranscriptionOptions): Promise<TranscriptionResult>;

  /**
   * Get current transcription status
   */
  getStatus(): TranscriptionStatus;

  /**
   * Cancel ongoing transcription
   */
  cancel(): void;

  /**
   * Check if service is available
   */
  isAvailable(): Promise<boolean>;
}

/**
 * Transcription provider interface for different backends
 */
export interface TranscriptionProvider {
  /**
   * Transcribe audio blob to text
   */
  transcribe(audio: Blob, options?: TranscriptionOptions): Promise<TranscriptionResult>;

  /**
   * Check if provider is available
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get provider status
   */
  getStatus(): TranscriptionStatus;
}

/**
 * Transcription settings
 */
export interface TranscriptionSettings {
  method: 'api' | 'local';
  localModelVariant?: string;
  enableFallback?: boolean;
  apiKey?: string;
}

/**
 * API response from OpenAI Whisper
 */
export interface WhisperAPIResponse {
  text: string;
  language?: string;
  duration?: number;
  segments?: Array<{
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    temperature: number;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
  }>;
}
