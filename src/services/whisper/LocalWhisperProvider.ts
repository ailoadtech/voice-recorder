import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import type {
  ModelVariant,
  WhisperModel,
  TranscriptionResult,
  ProviderStatus,
  TranscriptionProgress,
} from './types';
import { ModelManager } from './ModelManager';

export interface TranscriptionProvider {
  transcribe(audio: AudioBuffer, onProgress?: (progress: TranscriptionProgress) => void): Promise<TranscriptionResult>;
  isAvailable(): Promise<boolean>;
  getStatus(): ProviderStatus;
}

/**
 * Transcription request in the queue
 */
interface TranscriptionRequest {
  audio: AudioBuffer;
  onProgress?: (progress: TranscriptionProgress) => void;
  resolve: (result: TranscriptionResult) => void;
  reject: (error: Error) => void;
}

export class LocalWhisperProvider implements TranscriptionProvider {
  private modelManager: ModelManager;
  private currentModel: WhisperModel | null = null;
  private modelUnloadTimer: NodeJS.Timeout | null = null;
  private selectedVariant: ModelVariant = 'small';
  
  // Request queue for sequential processing
  private requestQueue: TranscriptionRequest[] = [];
  private isProcessing: boolean = false;

  constructor(modelManager: ModelManager, selectedVariant: ModelVariant = 'small') {
    this.modelManager = modelManager;
    this.selectedVariant = selectedVariant;
  }

  setSelectedVariant(variant: ModelVariant): void {
    this.selectedVariant = variant;
  }

  async transcribe(audio: AudioBuffer, onProgress?: (progress: TranscriptionProgress) => void): Promise<TranscriptionResult> {
    // Create a promise that will be resolved when the request is processed
    return new Promise<TranscriptionResult>((resolve, reject) => {
      // Add request to queue
      this.requestQueue.push({
        audio,
        onProgress,
        resolve,
        reject,
      });

      // Start processing if not already processing
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process transcription requests sequentially from the queue
   * Requirement 10.3: Process requests sequentially to prevent multiple model instances
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (!request) break;

      try {
        const result = await this.processTranscription(
          request.audio,
          request.onProgress
        );
        request.resolve(result);
      } catch (error) {
        request.reject(error instanceof Error ? error : new Error(String(error)));
      }
    }

    this.isProcessing = false;
  }

  /**
   * Process a single transcription request
   */
  private async processTranscription(
    audio: AudioBuffer,
    onProgress?: (progress: TranscriptionProgress) => void
  ): Promise<TranscriptionResult> {
    const model = await this.ensureModelLoaded();

    // Set up progress listener
    let unlisten: UnlistenFn | null = null;
    if (onProgress) {
      unlisten = await listen<TranscriptionProgress>('transcription-progress', (event) => {
        onProgress(event.payload);
      });
    }

    try {
      const startTime = Date.now();
      const audioData = this.convertAudioBuffer(audio);
      const text = await this.invokeWhisper(model, audioData);
      const duration = Date.now() - startTime;

      this.resetUnloadTimer();

      return {
        text,
        duration,
        provider: 'local',
      };
    } catch (error) {
      await this.unloadModel();
      throw new Error(`Local transcription failed: ${error}`);
    } finally {
      // Clean up progress listener
      if (unlisten) {
        unlisten();
      }
    }
  }

  private async ensureModelLoaded(): Promise<WhisperModel> {
    // Check if we have a loaded model and it matches the selected variant
    if (this.currentModel?.loaded && this.currentModel.variant === this.selectedVariant) {
      // Update last used timestamp for model reuse tracking
      this.currentModel.lastUsed = new Date();
      return this.currentModel;
    }

    // If a different model is loaded, unload it first
    if (this.currentModel?.loaded && this.currentModel.variant !== this.selectedVariant) {
      await this.unloadModel();
    }

    const variant = this.selectedVariant;
    const modelPath = this.modelManager.getModelPath(variant);

    const exists = await invoke<boolean>('file_exists', { path: modelPath });
    if (!exists) {
      throw new Error(`Model ${variant} not downloaded`);
    }

    await this.loadModel(modelPath, variant);
    return this.currentModel!;
  }

  private async loadModel(path: string, variant: ModelVariant): Promise<void> {
    await invoke('load_whisper_model', { path, variant });

    this.currentModel = {
      variant,
      path,
      loaded: true,
      lastUsed: new Date(),
    };
  }

  private async invokeWhisper(
    model: WhisperModel,
    audioData: Float32Array
  ): Promise<string> {
    const result = await invoke<string>('transcribe_audio', {
      audioData: Array.from(audioData),
      variant: model.variant,
    });

    return result;
  }

  private convertAudioBuffer(audio: AudioBuffer): Float32Array {
    // Whisper expects mono audio at 16kHz
    const targetSampleRate = 16000;
    const sourceData = audio.getChannelData(0); // Get first channel (mono)

    // Resample if necessary
    if (audio.sampleRate === targetSampleRate) {
      return sourceData;
    }

    // Simple resampling (linear interpolation)
    const ratio = audio.sampleRate / targetSampleRate;
    const newLength = Math.floor(sourceData.length / ratio);
    const result = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const srcIndex = i * ratio;
      const srcIndexFloor = Math.floor(srcIndex);
      const srcIndexCeil = Math.min(srcIndexFloor + 1, sourceData.length - 1);
      const t = srcIndex - srcIndexFloor;

      result[i] =
        sourceData[srcIndexFloor] * (1 - t) + sourceData[srcIndexCeil] * t;
    }

    return result;
  }

  private resetUnloadTimer(): void {
    if (this.modelUnloadTimer) {
      clearTimeout(this.modelUnloadTimer);
    }

    // Unload model after 5 minutes of inactivity
    this.modelUnloadTimer = setTimeout(() => {
      this.unloadModel();
    }, 5 * 60 * 1000);
  }

  private async unloadModel(): Promise<void> {
    if (!this.currentModel) return;

    await invoke('unload_whisper_model');
    this.currentModel = null;

    if (this.modelUnloadTimer) {
      clearTimeout(this.modelUnloadTimer);
      this.modelUnloadTimer = null;
    }
  }

  async isAvailable(): Promise<boolean> {
    const variant = this.selectedVariant;
    return await this.modelManager.isModelDownloaded(variant);
  }

  getStatus(): ProviderStatus {
    return {
      available: this.currentModel?.loaded ?? false,
      details: {
        model: this.currentModel?.variant,
        lastUsed: this.currentModel?.lastUsed,
        queueLength: this.requestQueue.length,
        isProcessing: this.isProcessing,
      },
    };
  }

  /**
   * Get the current queue length
   * @returns Number of pending transcription requests
   */
  getQueueLength(): number {
    return this.requestQueue.length;
  }

  /**
   * Check if currently processing a request
   * @returns true if processing, false otherwise
   */
  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }
}
