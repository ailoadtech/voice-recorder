/**
 * Types for Whisper transcription service
 */

export type ModelVariant = 'tiny' | 'base' | 'small' | 'medium' | 'large';

export interface ModelMetadata {
  variant: ModelVariant;
  size: number; // bytes
  checksum: string;
  downloadUrl: string;
  accuracy: 'good' | 'better' | 'best';
  estimatedSpeed: 'fast' | 'medium' | 'slow';
}

export interface DownloadProgress {
  variant: ModelVariant;
  bytesDownloaded: number;
  totalBytes: number;
  percentage: number;
  status: 'downloading' | 'validating' | 'complete' | 'error';
}

export interface TranscriptionProgress {
  stage: 'loading_model' | 'processing_audio' | 'finalizing' | 'complete';
  progress: number; // 0.0 to 1.0
}

export interface TranscriptionResult {
  text: string;
  duration?: number;
  provider: 'local' | 'api';
  confidence?: number;
}

export interface WhisperModel {
  variant: ModelVariant;
  path: string;
  loaded: boolean;
  lastUsed: Date;
}

export interface ProviderStatus {
  available: boolean;
  error?: string;
  details?: Record<string, any>;
}

/**
 * Transcription settings for configuring the transcription service
 */
export interface TranscriptionSettings {
  method: 'api' | 'local';
  localModelVariant: ModelVariant;
  enableFallback: boolean;
  apiKey?: string;
  modelsStorageDirectory?: string;
}

/**
 * Tauri command interfaces for Whisper operations
 */
export interface WhisperCommands {
  /**
   * Load a Whisper model into memory
   * @param path - Full path to the model file
   * @param variant - Model variant (tiny, base, small, medium, large)
   */
  load_whisper_model(path: string, variant: ModelVariant): Promise<void>;

  /**
   * Unload the currently loaded Whisper model from memory
   */
  unload_whisper_model(): Promise<void>;

  /**
   * Transcribe audio data using the loaded Whisper model
   * @param audioData - Float32Array of PCM audio samples (16kHz, mono)
   * @param variant - Model variant (for reference, not used if model already loaded)
   * @returns Transcribed text
   * 
   * Progress events are emitted via 'transcription-progress' event:
   * - loading_model (0.0)
   * - processing_audio (0.33)
   * - finalizing (0.66)
   * - complete (1.0)
   */
  transcribe_audio(
    audioData: number[],
    variant: ModelVariant
  ): Promise<string>;

  /**
   * Get the status of the currently loaded model
   * @returns The variant of the loaded model, or null if no model is loaded
   */
  get_whisper_model_status(): Promise<ModelVariant | null>;
}
