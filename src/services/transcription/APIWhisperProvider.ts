/**
 * APIWhisperProvider - OpenAI Whisper API Integration
 * Implements TranscriptionProvider interface for API-based transcription
 */

import { getEnv } from '@/lib/env';
import type {
  TranscriptionProvider,
  TranscriptionResult,
  TranscriptionOptions,
  TranscriptionStatus,
  TranscriptionError,
  WhisperAPIResponse,
} from './types';

// Constants
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const MAX_FILE_SIZE_MB = 25;

export class APIWhisperProvider implements TranscriptionProvider {
  private status: TranscriptionStatus = 'idle';
  private abortController: AbortController | null = null;
  private apiKey: string;
  private apiBaseUrl: string;
  private model: string;
  private maxRetries: number;

  constructor() {
    const env = getEnv();
    // API key is now handled server-side
    this.apiKey = ''; // Not needed on client
    this.apiBaseUrl = env.openaiApiBaseUrl;
    this.model = env.whisperModel;
    this.maxRetries = env.apiMaxRetries || MAX_RETRIES;
  }

  /**
   * Transcribe audio blob to text
   */
  async transcribe(
    audio: Blob,
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResult> {
    // Validate audio
    this.validateAudio(audio);

    this.status = 'processing';
    this.abortController = new AbortController();

    try {
      const result = await this.transcribeWithRetry(audio, options);
      this.status = 'complete';
      return {
        ...result,
        provider: 'api',
      };
    } catch (error) {
      this.status = 'error';
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Transcribe with automatic retry logic
   */
  private async transcribeWithRetry(
    audio: Blob,
    options: TranscriptionOptions,
    attempt: number = 1
  ): Promise<TranscriptionResult> {
    try {
      return await this.callWhisperAPI(audio, options);
    } catch (error) {
      const transcriptionError = error as TranscriptionError;

      // Don't retry if not retryable or max retries reached
      if (!transcriptionError.retryable || attempt >= this.maxRetries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      await this.sleep(delay);

      // Retry
      return this.transcribeWithRetry(audio, options, attempt + 1);
    }
  }

  /**
   * Call transcription API route
   */
  private async callWhisperAPI(
    audio: Blob,
    options: TranscriptionOptions
  ): Promise<TranscriptionResult> {
    // Convert blob to file for FormData
    const audioFile = new File([audio], 'recording.webm', { type: audio.type });

    // Prepare form data
    const formData = new FormData();
    formData.append('file', audioFile);

    if (options.language) {
      formData.append('language', options.language);
    }

    if (options.prompt) {
      formData.append('prompt', options.prompt);
    }

    if (options.temperature !== undefined) {
      formData.append('temperature', options.temperature.toString());
    }

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
        signal: this.abortController?.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.createError(
          errorData.error || 'Transcription failed',
          this.getErrorCodeFromStatus(response.status),
          response.status,
          response.status >= 500 || response.status === 429
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createError('Transcription cancelled', 'UNKNOWN_ERROR', undefined, false);
      }

      if ((error as TranscriptionError).name === 'TranscriptionError') {
        throw error;
      }

      throw this.createError(
        'Network error during transcription',
        'NETWORK_ERROR',
        undefined,
        true
      );
    }
  }

  /**
   * Get error code from HTTP status
   */
  private getErrorCodeFromStatus(status: number): TranscriptionError['code'] {
    switch (status) {
      case 400:
        return 'INVALID_AUDIO';
      case 401:
        return 'AUTHENTICATION_ERROR';
      case 429:
        return 'RATE_LIMIT';
      default:
        return 'API_ERROR';
    }
  }

  /**
   * Validate audio blob
   */
  private validateAudio(audio: Blob): void {
    // Check file size
    const sizeMB = audio.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      throw this.createError(
        `Audio file too large (${sizeMB.toFixed(1)}MB). Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
        'INVALID_AUDIO',
        undefined,
        false
      );
    }

    // Check if blob is empty
    if (audio.size === 0) {
      throw this.createError(
        'Audio file is empty',
        'INVALID_AUDIO',
        undefined,
        false
      );
    }
  }

  /**
   * Get current transcription status
   */
  getStatus(): TranscriptionStatus {
    return this.status;
  }

  /**
   * Check if service is available
   */
  async isAvailable(): Promise<boolean> {
    // For API provider, we assume it's available if we can reach the API endpoint
    // The actual API key validation happens server-side
    try {
      const response = await fetch('/api/transcribe', {
        method: 'HEAD',
      });
      return response.status !== 404;
    } catch {
      return false;
    }
  }

  /**
   * Create a transcription error
   */
  private createError(
    message: string,
    code: TranscriptionError['code'],
    statusCode?: number,
    retryable: boolean = false
  ): TranscriptionError {
    const error = new Error(message) as TranscriptionError;
    error.name = 'TranscriptionError';
    error.code = code;
    error.statusCode = statusCode;
    error.retryable = retryable;
    return error;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
