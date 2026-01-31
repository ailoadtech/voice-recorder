/**
 * TranscriptionService - Multi-Provider Transcription Service
 * Handles audio-to-text transcription with support for API and local providers
 * Includes automatic fallback mechanism
 */

import { getEnv } from '@/lib/env';
import type {
  ITranscriptionService,
  TranscriptionProvider,
  TranscriptionResult,
  TranscriptionOptions,
  TranscriptionStatus,
  TranscriptionSettings,
} from './types';
import { APIWhisperProvider } from './APIWhisperProvider';

export class TranscriptionService implements ITranscriptionService {
  private apiProvider: TranscriptionProvider;
  private localProvider: TranscriptionProvider | null = null;
  private settings: TranscriptionSettings;

  constructor(settings?: Partial<TranscriptionSettings>) {
    this.apiProvider = new APIWhisperProvider();
    
    // Initialize settings with defaults
    this.settings = {
      method: settings?.method || 'api',
      localModelVariant: settings?.localModelVariant,
      enableFallback: settings?.enableFallback ?? true,
      apiKey: settings?.apiKey,
    };
  }

  /**
   * Set the local provider (injected from outside to avoid circular dependencies)
   */
  setLocalProvider(provider: TranscriptionProvider): void {
    this.localProvider = provider;
  }

  /**
   * Update transcription settings
   */
  updateSettings(settings: Partial<TranscriptionSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Get current settings
   */
  getSettings(): TranscriptionSettings {
    return { ...this.settings };
  }

  /**
   * Get the active provider based on settings
   */
  private getActiveProvider(): TranscriptionProvider {
    if (this.settings.method === 'local' && this.localProvider) {
      return this.localProvider;
    }
    return this.apiProvider;
  }

  /**
   * Transcribe audio blob to text
   */
  async transcribe(
    audio: Blob,
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResult> {
    const provider = this.getActiveProvider();
    
    try {
      const result = await provider.transcribe(audio, options);
      return result;
    } catch (error) {
      // Implement fallback mechanism
      if (
        this.settings.enableFallback &&
        this.settings.method === 'local' &&
        this.localProvider &&
        provider === this.localProvider
      ) {
        // Log fallback reason
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('Local transcription failed, falling back to API', {
          error: errorMessage,
          timestamp: new Date().toISOString(),
        });

        // Emit fallback notification event
        this.emitFallbackNotification(errorMessage);

        try {
          // Attempt API transcription as fallback
          const fallbackResult = await this.apiProvider.transcribe(audio, options);
          return fallbackResult;
        } catch (fallbackError) {
          // If fallback also fails, throw the original error with context
          const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown error';
          throw new Error(
            `Local transcription failed: ${errorMessage}. API fallback also failed: ${fallbackMessage}`
          );
        }
      }

      // If fallback is not enabled or not applicable, throw the original error
      throw error;
    }
  }

  /**
   * Emit fallback notification event
   */
  private emitFallbackNotification(reason: string): void {
    // Emit custom event for UI to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('transcription-fallback', {
          detail: {
            reason,
            timestamp: new Date().toISOString(),
            from: 'local',
            to: 'api',
          },
        })
      );
    }
  }

  /**
   * Get current transcription status
   */
  getStatus(): TranscriptionStatus {
    const provider = this.getActiveProvider();
    return provider.getStatus();
  }

  /**
   * Cancel ongoing transcription
   */
  cancel(): void {
    // Cancel on the active provider
    // Note: This requires the provider to support cancellation
    // For now, we'll implement this in the API provider
    if (this.apiProvider instanceof APIWhisperProvider) {
      // The APIWhisperProvider doesn't expose a cancel method yet
      // This will need to be added if cancellation is required
    }
  }

  /**
   * Check if service is available
   */
  async isAvailable(): Promise<boolean> {
    const provider = this.getActiveProvider();
    return await provider.isAvailable();
  }

  /**
   * Convert audio blob to different format if needed
   * Note: This is a placeholder for future audio format conversion
   */
  async convertAudioFormat(audio: Blob, targetFormat: string): Promise<Blob> {
    // TODO: Implement audio format conversion if needed
    // For now, Whisper API accepts most common formats
    return audio;
  }

  /**
   * Get supported audio formats
   */
  static getSupportedFormats(): string[] {
    return [
      'audio/webm',
      'audio/mp3',
      'audio/mpeg',
      'audio/mp4',
      'audio/m4a',
      'audio/wav',
      'audio/ogg',
      'audio/flac',
    ];
  }
}
