import type { TranscriptionResult, ProviderStatus, TranscriptionSettings, ModelVariant } from './types';
import { LocalWhisperProvider, TranscriptionProvider } from './LocalWhisperProvider';
import { TranscriptionService as APITranscriptionService } from '../transcription/TranscriptionService';
import { ModelManager, getModelManager } from './ModelManager';

// Adapter to make the existing API service compatible with TranscriptionProvider interface
class APIWhisperProviderAdapter implements TranscriptionProvider {
  private apiService: APITranscriptionService;

  constructor() {
    this.apiService = new APITranscriptionService();
  }

  async transcribe(audio: AudioBuffer): Promise<TranscriptionResult> {
    // Convert AudioBuffer to Blob
    const blob = await this.audioBufferToBlob(audio);
    
    const result = await this.apiService.transcribe(blob);
    
    return {
      text: result.text,
      duration: result.duration || 0,
      provider: 'api',
      confidence: result.segments?.[0]?.confidence,
    };
  }

  async isAvailable(): Promise<boolean> {
    return await this.apiService.isAvailable();
  }

  getStatus(): ProviderStatus {
    const status = this.apiService.getStatus();
    return {
      available: status !== 'error',
      details: { status },
    };
  }

  private async audioBufferToBlob(audioBuffer: AudioBuffer): Promise<Blob> {
    // Create a WAV file from AudioBuffer
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numberOfChannels * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    const channels: Float32Array[] = [];
    let offset = 0;
    let pos = 0;

    // Write WAV header
    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    // "RIFF" chunk descriptor
    setUint32(0x46464952); // "RIFF"
    setUint32(36 + length); // file length - 8
    setUint32(0x45564157); // "WAVE"

    // "fmt " sub-chunk
    setUint32(0x20746d66); // "fmt "
    setUint32(16); // subchunk1size
    setUint16(1); // audio format (1 = PCM)
    setUint16(numberOfChannels);
    setUint32(audioBuffer.sampleRate);
    setUint32(audioBuffer.sampleRate * 2 * numberOfChannels); // byte rate
    setUint16(numberOfChannels * 2); // block align
    setUint16(16); // bits per sample

    // "data" sub-chunk
    setUint32(0x61746164); // "data"
    setUint32(length);

    // Write interleaved data
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    while (pos < buffer.byteLength) {
      for (let i = 0; i < numberOfChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }
}

export class EnhancedTranscriptionService {
  private apiProvider: TranscriptionProvider;
  private localProvider: LocalWhisperProvider;
  private settings: TranscriptionSettings;
  private modelManager: ModelManager;

  constructor(settings?: Partial<TranscriptionSettings>) {
    this.modelManager = getModelManager();
    this.apiProvider = new APIWhisperProviderAdapter();
    this.localProvider = new LocalWhisperProvider(
      this.modelManager,
      settings?.localModelVariant || 'small'
    );

    this.settings = {
      method: settings?.method || 'api',
      localModelVariant: settings?.localModelVariant || 'small',
      enableFallback: settings?.enableFallback ?? true,
      apiKey: settings?.apiKey,
    };
  }

  async transcribe(audio: AudioBuffer): Promise<TranscriptionResult> {
    const provider = this.getActiveProvider();

    try {
      return await provider.transcribe(audio);
    } catch (error) {
      if (this.settings.enableFallback && provider === this.localProvider) {
        console.warn('Local transcription failed, falling back to API', error);
        
        // Emit fallback notification
        this.notifyFallback(error);
        
        return await this.apiProvider.transcribe(audio);
      }
      throw error;
    }
  }

  private getActiveProvider(): TranscriptionProvider {
    return this.settings.method === 'local'
      ? this.localProvider
      : this.apiProvider;
  }

  updateSettings(settings: Partial<TranscriptionSettings>): void {
    this.settings = { ...this.settings, ...settings };
    
    if (settings.localModelVariant) {
      this.localProvider.setSelectedVariant(settings.localModelVariant);
    }
  }

  getSettings(): TranscriptionSettings {
    return { ...this.settings };
  }

  async getProviderStatus(provider: 'api' | 'local'): Promise<ProviderStatus> {
    const targetProvider =
      provider === 'local' ? this.localProvider : this.apiProvider;
    return targetProvider.getStatus();
  }

  async isProviderAvailable(provider: 'api' | 'local'): Promise<boolean> {
    const targetProvider =
      provider === 'local' ? this.localProvider : this.apiProvider;
    return await targetProvider.isAvailable();
  }

  getModelManager(): ModelManager {
    return this.modelManager;
  }

  private notifyFallback(error: unknown): void {
    // Emit custom event for UI to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('transcription-fallback', {
          detail: {
            reason: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
          },
        })
      );
    }
  }
}

// Singleton instance
let enhancedServiceInstance: EnhancedTranscriptionService | null = null;

export function getEnhancedTranscriptionService(
  settings?: Partial<TranscriptionSettings>
): EnhancedTranscriptionService {
  if (!enhancedServiceInstance) {
    enhancedServiceInstance = new EnhancedTranscriptionService(settings);
  } else if (settings) {
    enhancedServiceInstance.updateSettings(settings);
  }
  return enhancedServiceInstance;
}
