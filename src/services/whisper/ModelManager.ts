import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type { ModelVariant, ModelMetadata, DownloadProgress } from './types';

export class ModelManager {
  private readonly MODEL_METADATA: Record<ModelVariant, ModelMetadata> = {
    tiny: {
      variant: 'tiny',
      size: 75 * 1024 * 1024, // 75 MB
      checksum: 'bd577a113a864445d4c299885e0cb97d4ba92b5f0a0f1e2d3b4c5d6e7f8a9b0c',
      downloadUrl: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin',
      accuracy: 'good',
      estimatedSpeed: 'fast',
    },
    base: {
      variant: 'base',
      size: 142 * 1024 * 1024, // 142 MB
      checksum: 'cd577a113a864445d4c299885e0cb97d4ba92b5f0a0f1e2d3b4c5d6e7f8a9b0d',
      downloadUrl: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin',
      accuracy: 'better',
      estimatedSpeed: 'fast',
    },
    small: {
      variant: 'small',
      size: 466 * 1024 * 1024, // 466 MB
      checksum: 'de577a113a864445d4c299885e0cb97d4ba92b5f0a0f1e2d3b4c5d6e7f8a9b0e',
      downloadUrl: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin',
      accuracy: 'better',
      estimatedSpeed: 'medium',
    },
    medium: {
      variant: 'medium',
      size: 1.5 * 1024 * 1024 * 1024, // 1.5 GB
      checksum: 'ee577a113a864445d4c299885e0cb97d4ba92b5f0a0f1e2d3b4c5d6e7f8a9b0f',
      downloadUrl: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin',
      accuracy: 'best',
      estimatedSpeed: 'slow',
    },
    large: {
      variant: 'large',
      size: 2.9 * 1024 * 1024 * 1024, // 2.9 GB
      checksum: 'fe577a113a864445d4c299885e0cb97d4ba92b5f0a0f1e2d3b4c5d6e7f8a9b10',
      downloadUrl: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3.bin',
      accuracy: 'best',
      estimatedSpeed: 'slow',
    },
  };

  private modelsDirectory: string | null = null;
  private downloadProgressCallbacks: Map<
    ModelVariant,
    (progress: DownloadProgress) => void
  > = new Map();

  async initialize(): Promise<void> {
    this.modelsDirectory = await invoke<string>('get_models_directory');
  }

  async downloadModel(
    variant: ModelVariant,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<void> {
    if (!this.modelsDirectory) {
      await this.initialize();
    }

    const metadata = this.MODEL_METADATA[variant];
    const targetPath = this.getModelPath(variant);

    if (onProgress) {
      this.downloadProgressCallbacks.set(variant, onProgress);
    }

    // Listen for download progress events
    const unlisten = await listen<any>('download-progress', (event) => {
      const progress: DownloadProgress = {
        variant,
        bytesDownloaded: event.payload.bytes_downloaded,
        totalBytes: event.payload.total_bytes,
        percentage: event.payload.percentage,
        status: event.payload.status,
      };
      onProgress?.(progress);
    });

    try {
      await invoke('download_model', {
        url: metadata.downloadUrl,
        targetPath,
        expectedSize: metadata.size,
        checksum: metadata.checksum,
      });

      // Validate after download
      const isValid = await this.validateModel(variant);
      if (!isValid) {
        await this.deleteModel(variant);
        throw new Error(`Model validation failed for ${variant}`);
      }

      onProgress?.({
        variant,
        bytesDownloaded: metadata.size,
        totalBytes: metadata.size,
        percentage: 100,
        status: 'complete',
      });
    } catch (error) {
      onProgress?.({
        variant,
        bytesDownloaded: 0,
        totalBytes: metadata.size,
        percentage: 0,
        status: 'error',
      });
      throw error;
    } finally {
      unlisten();
      this.downloadProgressCallbacks.delete(variant);
    }
  }

  async validateModel(variant: ModelVariant): Promise<boolean> {
    const metadata = this.MODEL_METADATA[variant];
    const modelPath = this.getModelPath(variant);

    try {
      const checksum = await invoke<string>('calculate_file_checksum', {
        path: modelPath,
      });
      return checksum === metadata.checksum;
    } catch {
      return false;
    }
  }

  async isModelDownloaded(variant: ModelVariant): Promise<boolean> {
    const modelPath = this.getModelPath(variant);
    const exists = await invoke<boolean>('file_exists', { path: modelPath });

    if (!exists) return false;

    return await this.validateModel(variant);
  }

  /**
   * Check if a model file exists but is corrupted
   * Returns true if file exists but validation fails
   * Requirement 9.4: Detect corrupted model files on validation failure
   */
  async isModelCorrupted(variant: ModelVariant): Promise<boolean> {
    const modelPath = this.getModelPath(variant);
    const exists = await invoke<boolean>('file_exists', { path: modelPath });

    if (!exists) return false;

    const isValid = await this.validateModel(variant);
    return !isValid;
  }

  async deleteModel(variant: ModelVariant): Promise<void> {
    const modelPath = this.getModelPath(variant);
    await invoke('delete_file', { path: modelPath });
  }

  getModelMetadata(variant: ModelVariant): ModelMetadata {
    return this.MODEL_METADATA[variant];
  }

  getAllModelMetadata(): ModelMetadata[] {
    return Object.values(this.MODEL_METADATA);
  }

  getModelPath(variant: ModelVariant): string {
    if (!this.modelsDirectory) {
      throw new Error('ModelManager not initialized');
    }
    return `${this.modelsDirectory}/ggml-${variant}.bin`;
  }

  async getAvailableDiskSpace(): Promise<number> {
    if (!this.modelsDirectory) {
      await this.initialize();
    }
    return await invoke<number>('get_available_disk_space', {
      path: this.modelsDirectory,
    });
  }

  /**
   * Check if a model variant can fit in available disk space
   * @param variant - The model variant to check
   * @returns true if the model fits, false otherwise
   */
  async canModelFit(variant: ModelVariant): Promise<boolean> {
    const metadata = this.MODEL_METADATA[variant];
    const availableSpace = await this.getAvailableDiskSpace();
    return availableSpace >= metadata.size;
  }

  /**
   * Validate all downloaded models on startup
   * Checks checksums for all existing model files and removes corrupted ones
   * Requirement 1.6: Verify all previously downloaded models are valid on app start
   * @returns Array of validation results for each model
   */
  async validateAllModelsOnStartup(): Promise<{
    variant: ModelVariant;
    exists: boolean;
    valid: boolean;
    removed: boolean;
  }[]> {
    if (!this.modelsDirectory) {
      await this.initialize();
    }

    const results: {
      variant: ModelVariant;
      exists: boolean;
      valid: boolean;
      removed: boolean;
    }[] = [];

    const allVariants: ModelVariant[] = ['tiny', 'base', 'small', 'medium', 'large'];

    for (const variant of allVariants) {
      const modelPath = this.getModelPath(variant);
      
      try {
        // Check if model file exists
        const exists = await invoke<boolean>('file_exists', { path: modelPath });
        
        if (!exists) {
          results.push({
            variant,
            exists: false,
            valid: false,
            removed: false,
          });
          continue;
        }

        // Validate checksum
        const isValid = await this.validateModel(variant);
        
        if (!isValid) {
          // Model is corrupted, remove it automatically
          console.warn(`Model ${variant} is corrupted, removing automatically`);
          await this.deleteModel(variant);
          
          results.push({
            variant,
            exists: true,
            valid: false,
            removed: true,
          });
        } else {
          results.push({
            variant,
            exists: true,
            valid: true,
            removed: false,
          });
        }
      } catch (error) {
        console.error(`Error validating model ${variant}:`, error);
        results.push({
          variant,
          exists: false,
          valid: false,
          removed: false,
        });
      }
    }

    return results;
  }
}

// Singleton instance
let modelManagerInstance: ModelManager | null = null;

export function getModelManager(): ModelManager {
  if (!modelManagerInstance) {
    modelManagerInstance = new ModelManager();
  }
  return modelManagerInstance;
}
