/**
 * Tests for LocalWhisperProvider
 * Validates Requirements: 2.1, 2.4, 4.3
 */

import { LocalWhisperProvider } from './LocalWhisperProvider';
import { ModelManager } from './ModelManager';
import type { ModelVariant, ProviderStatus } from './types';

// Mock Tauri invoke
jest.mock('@tauri-apps/api/core', () => ({
  invoke: jest.fn(),
}));

import { invoke } from '@tauri-apps/api/core';

describe('LocalWhisperProvider', () => {
  let provider: LocalWhisperProvider;
  let mockModelManager: ModelManager;

  beforeEach(() => {
    jest.clearAllMocks();
    mockModelManager = {
      getModelPath: jest.fn((variant: ModelVariant) => `/models/ggml-${variant}.bin`),
      isModelDownloaded: jest.fn().mockResolvedValue(true),
    } as any;

    provider = new LocalWhisperProvider(mockModelManager, 'small');
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Interface Implementation', () => {
    it('should implement transcribe method', () => {
      expect(provider.transcribe).toBeDefined();
      expect(typeof provider.transcribe).toBe('function');
    });

    it('should implement isAvailable method', () => {
      expect(provider.isAvailable).toBeDefined();
      expect(typeof provider.isAvailable).toBe('function');
    });

    it('should implement getStatus method', () => {
      expect(provider.getStatus).toBeDefined();
      expect(typeof provider.getStatus).toBe('function');
    });
  });

  describe('transcribe', () => {
    it('should transcribe audio and return result with correct format (Requirement 2.4, 4.3)', async () => {
      // Mock file exists check
      (invoke as jest.Mock).mockImplementation(async (cmd: string) => {
        if (cmd === 'file_exists') return true;
        if (cmd === 'load_whisper_model') return undefined;
        if (cmd === 'transcribe_audio') return 'Hello world';
        return undefined;
      });

      // Create mock AudioBuffer
      const mockAudioBuffer = {
        sampleRate: 16000,
        numberOfChannels: 1,
        length: 16000,
        duration: 1,
        getChannelData: jest.fn().mockReturnValue(new Float32Array(16000)),
      } as any;

      const result = await provider.transcribe(mockAudioBuffer);

      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('provider');
      expect(result.text).toBe('Hello world');
      expect(result.provider).toBe('local');
      expect(typeof result.duration).toBe('number');
    });

    it('should load model before transcription if not loaded', async () => {
      (invoke as jest.Mock).mockImplementation(async (cmd: string) => {
        if (cmd === 'file_exists') return true;
        if (cmd === 'load_whisper_model') return undefined;
        if (cmd === 'transcribe_audio') return 'Test';
        return undefined;
      });

      const mockAudioBuffer = {
        sampleRate: 16000,
        numberOfChannels: 1,
        length: 16000,
        duration: 1,
        getChannelData: jest.fn().mockReturnValue(new Float32Array(16000)),
      } as any;

      await provider.transcribe(mockAudioBuffer);

      expect(invoke).toHaveBeenCalledWith('load_whisper_model', {
        path: '/models/ggml-small.bin',
        variant: 'small',
      });
    });

    it('should throw error if model is not downloaded', async () => {
      (invoke as jest.Mock).mockImplementation(async (cmd: string) => {
        if (cmd === 'file_exists') return false;
        return undefined;
      });

      const mockAudioBuffer = {
        sampleRate: 16000,
        numberOfChannels: 1,
        length: 16000,
        duration: 1,
        getChannelData: jest.fn().mockReturnValue(new Float32Array(16000)),
      } as any;

      await expect(provider.transcribe(mockAudioBuffer)).rejects.toThrow(
        'Model small not downloaded'
      );
    });

    it('should unload model on transcription failure', async () => {
      (invoke as jest.Mock).mockImplementation(async (cmd: string) => {
        if (cmd === 'file_exists') return true;
        if (cmd === 'load_whisper_model') return undefined;
        if (cmd === 'transcribe_audio') throw new Error('Transcription failed');
        if (cmd === 'unload_whisper_model') return undefined;
        return undefined;
      });

      const mockAudioBuffer = {
        sampleRate: 16000,
        numberOfChannels: 1,
        length: 16000,
        duration: 1,
        getChannelData: jest.fn().mockReturnValue(new Float32Array(16000)),
      } as any;

      await expect(provider.transcribe(mockAudioBuffer)).rejects.toThrow();

      expect(invoke).toHaveBeenCalledWith('unload_whisper_model');
    });
  });

  describe('isAvailable', () => {
    it('should check if selected model is downloaded (Requirement 2.1)', async () => {
      (mockModelManager.isModelDownloaded as jest.Mock).mockResolvedValue(true);

      const available = await provider.isAvailable();

      expect(available).toBe(true);
      expect(mockModelManager.isModelDownloaded).toHaveBeenCalledWith('small');
    });

    it('should return false if model is not downloaded', async () => {
      (mockModelManager.isModelDownloaded as jest.Mock).mockResolvedValue(false);

      const available = await provider.isAvailable();

      expect(available).toBe(false);
    });
  });

  describe('getStatus', () => {
    it('should return status with available false when no model loaded', () => {
      const status: ProviderStatus = provider.getStatus();

      expect(status).toHaveProperty('available');
      expect(status.available).toBe(false);
      expect(status).toHaveProperty('details');
    });

    it('should return status with model details when model is loaded', async () => {
      (invoke as jest.Mock).mockImplementation(async (cmd: string) => {
        if (cmd === 'file_exists') return true;
        if (cmd === 'load_whisper_model') return undefined;
        if (cmd === 'transcribe_audio') return 'Test';
        return undefined;
      });

      const mockAudioBuffer = {
        sampleRate: 16000,
        numberOfChannels: 1,
        length: 16000,
        duration: 1,
        getChannelData: jest.fn().mockReturnValue(new Float32Array(16000)),
      } as any;

      await provider.transcribe(mockAudioBuffer);

      const status = provider.getStatus();

      expect(status.available).toBe(true);
      expect(status.details?.model).toBe('small');
      expect(status.details?.lastUsed).toBeInstanceOf(Date);
    });
  });

  describe('setSelectedVariant', () => {
    it('should update the selected variant', () => {
      provider.setSelectedVariant('tiny');

      // Verify by checking isAvailable calls the correct variant
      provider.isAvailable();

      expect(mockModelManager.isModelDownloaded).toHaveBeenCalledWith('tiny');
    });
  });

  describe('Model Loading and Caching (Task 4.2)', () => {
    it('should load model only once for multiple transcriptions with same variant', async () => {
      (invoke as jest.Mock).mockImplementation(async (cmd: string) => {
        if (cmd === 'file_exists') return true;
        if (cmd === 'load_whisper_model') return undefined;
        if (cmd === 'transcribe_audio') return 'Test';
        return undefined;
      });

      const mockAudioBuffer = {
        sampleRate: 16000,
        numberOfChannels: 1,
        length: 16000,
        duration: 1,
        getChannelData: jest.fn().mockReturnValue(new Float32Array(16000)),
      } as any;

      // First transcription - should load model
      await provider.transcribe(mockAudioBuffer);
      
      // Clear mock calls to track only subsequent calls
      (invoke as jest.Mock).mockClear();

      // Second transcription - should reuse loaded model
      await provider.transcribe(mockAudioBuffer);

      // Verify load_whisper_model was NOT called again
      const loadCalls = (invoke as jest.Mock).mock.calls.filter(
        (call) => call[0] === 'load_whisper_model'
      );
      expect(loadCalls.length).toBe(0);

      // But transcribe_audio should still be called
      expect(invoke).toHaveBeenCalledWith('transcribe_audio', {
        audioData: expect.any(Array),
        variant: 'small',
      });
    });

    it('should unload old model and load new model when variant changes', async () => {
      (invoke as jest.Mock).mockImplementation(async (cmd: string) => {
        if (cmd === 'file_exists') return true;
        if (cmd === 'load_whisper_model') return undefined;
        if (cmd === 'transcribe_audio') return 'Test';
        if (cmd === 'unload_whisper_model') return undefined;
        return undefined;
      });

      const mockAudioBuffer = {
        sampleRate: 16000,
        numberOfChannels: 1,
        length: 16000,
        duration: 1,
        getChannelData: jest.fn().mockReturnValue(new Float32Array(16000)),
      } as any;

      // First transcription with 'small' variant
      await provider.transcribe(mockAudioBuffer);

      // Change variant
      provider.setSelectedVariant('tiny');

      // Clear mock calls
      (invoke as jest.Mock).mockClear();

      // Second transcription with 'tiny' variant
      await provider.transcribe(mockAudioBuffer);

      // Verify old model was unloaded
      expect(invoke).toHaveBeenCalledWith('unload_whisper_model');

      // Verify new model was loaded
      expect(invoke).toHaveBeenCalledWith('load_whisper_model', {
        path: '/models/ggml-tiny.bin',
        variant: 'tiny',
      });
    });

    it('should update lastUsed timestamp when reusing model', async () => {
      jest.useFakeTimers();
      
      (invoke as jest.Mock).mockImplementation(async (cmd: string) => {
        if (cmd === 'file_exists') return true;
        if (cmd === 'load_whisper_model') return undefined;
        if (cmd === 'transcribe_audio') return 'Test';
        return undefined;
      });

      const mockAudioBuffer = {
        sampleRate: 16000,
        numberOfChannels: 1,
        length: 16000,
        duration: 1,
        getChannelData: jest.fn().mockReturnValue(new Float32Array(16000)),
      } as any;

      // First transcription
      await provider.transcribe(mockAudioBuffer);
      const status1 = provider.getStatus();
      const firstUsedTime = status1.details?.lastUsed;

      // Advance time
      jest.advanceTimersByTime(1000);

      // Second transcription
      await provider.transcribe(mockAudioBuffer);
      const status2 = provider.getStatus();
      const secondUsedTime = status2.details?.lastUsed;

      // Verify lastUsed was updated
      expect(secondUsedTime).not.toEqual(firstUsedTime);
      expect(secondUsedTime.getTime()).toBeGreaterThan(firstUsedTime.getTime());

      jest.useRealTimers();
    });

    it('should track currentModel state correctly', async () => {
      (invoke as jest.Mock).mockImplementation(async (cmd: string) => {
        if (cmd === 'file_exists') return true;
        if (cmd === 'load_whisper_model') return undefined;
        if (cmd === 'transcribe_audio') return 'Test';
        return undefined;
      });

      const mockAudioBuffer = {
        sampleRate: 16000,
        numberOfChannels: 1,
        length: 16000,
        duration: 1,
        getChannelData: jest.fn().mockReturnValue(new Float32Array(16000)),
      } as any;

      // Before transcription, no model should be loaded
      let status = provider.getStatus();
      expect(status.available).toBe(false);
      expect(status.details?.model).toBeUndefined();

      // After transcription, model should be loaded
      await provider.transcribe(mockAudioBuffer);
      status = provider.getStatus();
      expect(status.available).toBe(true);
      expect(status.details?.model).toBe('small');
      expect(status.details?.lastUsed).toBeInstanceOf(Date);
    });
  });

  describe('Audio Conversion', () => {
    it('should handle audio at 16kHz without resampling', async () => {
      (invoke as jest.Mock).mockImplementation(async (cmd: string) => {
        if (cmd === 'file_exists') return true;
        if (cmd === 'load_whisper_model') return undefined;
        if (cmd === 'transcribe_audio') return 'Test';
        return undefined;
      });

      const audioData = new Float32Array(16000);
      const mockAudioBuffer = {
        sampleRate: 16000,
        numberOfChannels: 1,
        length: 16000,
        duration: 1,
        getChannelData: jest.fn().mockReturnValue(audioData),
      } as any;

      await provider.transcribe(mockAudioBuffer);

      // Verify transcribe_audio was called with the audio data
      expect(invoke).toHaveBeenCalledWith('transcribe_audio', {
        audioData: expect.any(Array),
        variant: 'small',
      });
    });

    it('should resample audio from different sample rates', async () => {
      (invoke as jest.Mock).mockImplementation(async (cmd: string) => {
        if (cmd === 'file_exists') return true;
        if (cmd === 'load_whisper_model') return undefined;
        if (cmd === 'transcribe_audio') return 'Test';
        return undefined;
      });

      const audioData = new Float32Array(48000); // 48kHz audio
      const mockAudioBuffer = {
        sampleRate: 48000,
        numberOfChannels: 1,
        length: 48000,
        duration: 1,
        getChannelData: jest.fn().mockReturnValue(audioData),
      } as any;

      await provider.transcribe(mockAudioBuffer);

      // Verify transcribe_audio was called
      expect(invoke).toHaveBeenCalledWith('transcribe_audio', {
        audioData: expect.any(Array),
        variant: 'small',
      });

      // Verify the resampled data length is correct (48000 / 3 = 16000)
      const call = (invoke as jest.Mock).mock.calls.find(
        (call) => call[0] === 'transcribe_audio'
      );
      expect(call).toBeDefined();
      const audioDataArg = (call![1] as any).audioData;
      expect(audioDataArg.length).toBe(16000);
    });
  });

  describe('Request Queuing (Task 9.5)', () => {
    it('should process transcription requests sequentially (Requirement 10.3)', async () => {
      const transcriptionOrder: number[] = [];
      
      (invoke as jest.Mock).mockImplementation(async (cmd: string, args?: any) => {
        if (cmd === 'file_exists') return true;
        if (cmd === 'load_whisper_model') return undefined;
        if (cmd === 'transcribe_audio') {
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 100));
          return 'Test';
        }
        return undefined;
      });

      const mockAudioBuffer = {
        sampleRate: 16000,
        numberOfChannels: 1,
        length: 16000,
        duration: 1,
        getChannelData: jest.fn().mockReturnValue(new Float32Array(16000)),
      } as any;

      // Start multiple transcriptions concurrently
      const promise1 = provider.transcribe(mockAudioBuffer).then(() => transcriptionOrder.push(1));
      const promise2 = provider.transcribe(mockAudioBuffer).then(() => transcriptionOrder.push(2));
      const promise3 = provider.transcribe(mockAudioBuffer).then(() => transcriptionOrder.push(3));

      // Wait for all to complete
      await Promise.all([promise1, promise2, promise3]);

      // Verify they completed in order
      expect(transcriptionOrder).toEqual([1, 2, 3]);
    });

    it('should track queue length correctly', async () => {
      (invoke as jest.Mock).mockImplementation(async (cmd: string) => {
        if (cmd === 'file_exists') return true;
        if (cmd === 'load_whisper_model') return undefined;
        if (cmd === 'transcribe_audio') {
          // Simulate long processing time
          await new Promise(resolve => setTimeout(resolve, 200));
          return 'Test';
        }
        return undefined;
      });

      const mockAudioBuffer = {
        sampleRate: 16000,
        numberOfChannels: 1,
        length: 16000,
        duration: 1,
        getChannelData: jest.fn().mockReturnValue(new Float32Array(16000)),
      } as any;

      // Initial queue should be empty
      expect(provider.getQueueLength()).toBe(0);

      // Start multiple transcriptions
      const promise1 = provider.transcribe(mockAudioBuffer);
      const promise2 = provider.transcribe(mockAudioBuffer);
      const promise3 = provider.transcribe(mockAudioBuffer);

      // Queue should have pending requests (may vary based on timing)
      // At least one should be processing, others queued
      const queueLength = provider.getQueueLength();
      expect(queueLength).toBeGreaterThanOrEqual(0);
      expect(queueLength).toBeLessThanOrEqual(3);

      // Wait for all to complete
      await Promise.all([promise1, promise2, promise3]);

      // Queue should be empty after all complete
      expect(provider.getQueueLength()).toBe(0);
    });

    it('should indicate processing status correctly', async () => {
      (invoke as jest.Mock).mockImplementation(async (cmd: string) => {
        if (cmd === 'file_exists') return true;
        if (cmd === 'load_whisper_model') return undefined;
        if (cmd === 'transcribe_audio') {
          await new Promise(resolve => setTimeout(resolve, 100));
          return 'Test';
        }
        return undefined;
      });

      const mockAudioBuffer = {
        sampleRate: 16000,
        numberOfChannels: 1,
        length: 16000,
        duration: 1,
        getChannelData: jest.fn().mockReturnValue(new Float32Array(16000)),
      } as any;

      // Initially not processing
      expect(provider.isCurrentlyProcessing()).toBe(false);

      // Start transcription
      const promise = provider.transcribe(mockAudioBuffer);

      // Should be processing (may need small delay for async)
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(provider.isCurrentlyProcessing()).toBe(true);

      // Wait for completion
      await promise;

      // Should not be processing after completion
      expect(provider.isCurrentlyProcessing()).toBe(false);
    });

    it('should include queue info in status', async () => {
      (invoke as jest.Mock).mockImplementation(async (cmd: string) => {
        if (cmd === 'file_exists') return true;
        if (cmd === 'load_whisper_model') return undefined;
        if (cmd === 'transcribe_audio') {
          await new Promise(resolve => setTimeout(resolve, 100));
          return 'Test';
        }
        return undefined;
      });

      const mockAudioBuffer = {
        sampleRate: 16000,
        numberOfChannels: 1,
        length: 16000,
        duration: 1,
        getChannelData: jest.fn().mockReturnValue(new Float32Array(16000)),
      } as any;

      // Start transcription
      const promise = provider.transcribe(mockAudioBuffer);

      // Check status includes queue info
      await new Promise(resolve => setTimeout(resolve, 10));
      const status = provider.getStatus();
      
      expect(status.details).toHaveProperty('queueLength');
      expect(status.details).toHaveProperty('isProcessing');
      expect(typeof status.details?.queueLength).toBe('number');
      expect(typeof status.details?.isProcessing).toBe('boolean');

      await promise;
    });

    it('should handle errors in queued requests without affecting other requests', async () => {
      let callCount = 0;
      
      (invoke as jest.Mock).mockImplementation(async (cmd: string) => {
        if (cmd === 'file_exists') return true;
        if (cmd === 'load_whisper_model') return undefined;
        if (cmd === 'transcribe_audio') {
          callCount++;
          if (callCount === 2) {
            throw new Error('Transcription failed');
          }
          return 'Test';
        }
        if (cmd === 'unload_whisper_model') return undefined;
        return undefined;
      });

      const mockAudioBuffer = {
        sampleRate: 16000,
        numberOfChannels: 1,
        length: 16000,
        duration: 1,
        getChannelData: jest.fn().mockReturnValue(new Float32Array(16000)),
      } as any;

      // Start three transcriptions
      const promise1 = provider.transcribe(mockAudioBuffer);
      const promise2 = provider.transcribe(mockAudioBuffer);
      const promise3 = provider.transcribe(mockAudioBuffer);

      // First should succeed
      await expect(promise1).resolves.toBeDefined();

      // Second should fail
      await expect(promise2).rejects.toThrow();

      // Third should still succeed
      await expect(promise3).resolves.toBeDefined();
    });

    it('should prevent multiple model instances by queuing (Requirement 10.3)', async () => {
      let concurrentCalls = 0;
      let maxConcurrentCalls = 0;

      (invoke as jest.Mock).mockImplementation(async (cmd: string) => {
        if (cmd === 'file_exists') return true;
        if (cmd === 'load_whisper_model') return undefined;
        if (cmd === 'transcribe_audio') {
          concurrentCalls++;
          maxConcurrentCalls = Math.max(maxConcurrentCalls, concurrentCalls);
          await new Promise(resolve => setTimeout(resolve, 50));
          concurrentCalls--;
          return 'Test';
        }
        return undefined;
      });

      const mockAudioBuffer = {
        sampleRate: 16000,
        numberOfChannels: 1,
        length: 16000,
        duration: 1,
        getChannelData: jest.fn().mockReturnValue(new Float32Array(16000)),
      } as any;

      // Start multiple transcriptions concurrently
      const promises = [
        provider.transcribe(mockAudioBuffer),
        provider.transcribe(mockAudioBuffer),
        provider.transcribe(mockAudioBuffer),
        provider.transcribe(mockAudioBuffer),
      ];

      await Promise.all(promises);

      // Verify only one transcription was processed at a time
      expect(maxConcurrentCalls).toBe(1);
    });
  });

  describe('Automatic Model Unloading (Task 4.3)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should set unload timer after successful transcription (Requirement 10.1)', async () => {
      (invoke as jest.Mock).mockImplementation(async (cmd: string) => {
        if (cmd === 'file_exists') return true;
        if (cmd === 'load_whisper_model') return undefined;
        if (cmd === 'transcribe_audio') return 'Test';
        if (cmd === 'unload_whisper_model') return undefined;
        return undefined;
      });

      const mockAudioBuffer = {
        sampleRate: 16000,
        numberOfChannels: 1,
        length: 16000,
        duration: 1,
        getChannelData: jest.fn().mockReturnValue(new Float32Array(16000)),
      } as any;

      await provider.transcribe(mockAudioBuffer);

      // Model should still be loaded immediately after transcription
      let status = provider.getStatus();
      expect(status.available).toBe(true);

      // Clear previous invoke calls
      (invoke as jest.Mock).mockClear();

      // Advance time by 5 minutes
      jest.advanceTimersByTime(5 * 60 * 1000);

      // Wait for any pending promises
      await Promise.resolve();

      // Model should be unloaded after 5 minutes
      expect(invoke).toHaveBeenCalledWith('unload_whisper_model');

      // Status should reflect model is no longer loaded
      status = provider.getStatus();
      expect(status.available).toBe(false);
    });

    it('should reset timer on new transcription request (Requirement 10.1)', async () => {
      (invoke as jest.Mock).mockImplementation(async (cmd: string) => {
        if (cmd === 'file_exists') return true;
        if (cmd === 'load_whisper_model') return undefined;
        if (cmd === 'transcribe_audio') return 'Test';
        if (cmd === 'unload_whisper_model') return undefined;
        return undefined;
      });

      const mockAudioBuffer = {
        sampleRate: 16000,
        numberOfChannels: 1,
        length: 16000,
        duration: 1,
        getChannelData: jest.fn().mockReturnValue(new Float32Array(16000)),
      } as any;

      // First transcription
      await provider.transcribe(mockAudioBuffer);

      // Advance time by 4 minutes (not enough to trigger unload)
      jest.advanceTimersByTime(4 * 60 * 1000);

      // Clear invoke calls
      (invoke as jest.Mock).mockClear();

      // Second transcription (should reset timer)
      await provider.transcribe(mockAudioBuffer);

      // Advance time by another 4 minutes (total 8 minutes from first, but only 4 from second)
      jest.advanceTimersByTime(4 * 60 * 1000);

      // Model should NOT be unloaded yet (timer was reset)
      expect(invoke).not.toHaveBeenCalledWith('unload_whisper_model');

      // Model should still be loaded
      let status = provider.getStatus();
      expect(status.available).toBe(true);

      // Advance time by 1 more minute (5 minutes from second transcription)
      jest.advanceTimersByTime(1 * 60 * 1000);

      // Wait for any pending promises
      await Promise.resolve();

      // Now model should be unloaded
      expect(invoke).toHaveBeenCalledWith('unload_whisper_model');

      status = provider.getStatus();
      expect(status.available).toBe(false);
    });

    it('should clear timer when model is manually unloaded (Requirement 10.2)', async () => {
      (invoke as jest.Mock).mockImplementation(async (cmd: string) => {
        if (cmd === 'file_exists') return true;
        if (cmd === 'load_whisper_model') return undefined;
        if (cmd === 'transcribe_audio') return 'Test';
        if (cmd === 'unload_whisper_model') return undefined;
        return undefined;
      });

      const mockAudioBuffer = {
        sampleRate: 16000,
        numberOfChannels: 1,
        length: 16000,
        duration: 1,
        getChannelData: jest.fn().mockReturnValue(new Float32Array(16000)),
      } as any;

      // Transcribe to load model and set timer
      await provider.transcribe(mockAudioBuffer);

      // Clear invoke calls
      (invoke as jest.Mock).mockClear();

      // Manually trigger unload (simulating transcription failure or variant change)
      await provider['unloadModel']();

      // Verify unload was called
      expect(invoke).toHaveBeenCalledWith('unload_whisper_model');

      // Clear invoke calls again
      (invoke as jest.Mock).mockClear();

      // Advance time by 5 minutes
      jest.advanceTimersByTime(5 * 60 * 1000);

      // Wait for any pending promises
      await Promise.resolve();

      // unload_whisper_model should NOT be called again (timer was cleared)
      expect(invoke).not.toHaveBeenCalledWith('unload_whisper_model');
    });

    it('should not attempt to unload if no model is loaded', async () => {
      (invoke as jest.Mock).mockImplementation(async (cmd: string) => {
        if (cmd === 'unload_whisper_model') return undefined;
        return undefined;
      });

      // Call unloadModel without loading a model first
      await provider['unloadModel']();

      // unload_whisper_model should NOT be called
      expect(invoke).not.toHaveBeenCalledWith('unload_whisper_model');
    });

    it('should handle multiple timer resets correctly', async () => {
      (invoke as jest.Mock).mockImplementation(async (cmd: string) => {
        if (cmd === 'file_exists') return true;
        if (cmd === 'load_whisper_model') return undefined;
        if (cmd === 'transcribe_audio') return 'Test';
        if (cmd === 'unload_whisper_model') return undefined;
        return undefined;
      });

      const mockAudioBuffer = {
        sampleRate: 16000,
        numberOfChannels: 1,
        length: 16000,
        duration: 1,
        getChannelData: jest.fn().mockReturnValue(new Float32Array(16000)),
      } as any;

      // First transcription
      await provider.transcribe(mockAudioBuffer);

      // Multiple transcriptions within 5 minutes
      for (let i = 0; i < 5; i++) {
        jest.advanceTimersByTime(1 * 60 * 1000); // 1 minute
        (invoke as jest.Mock).mockClear();
        await provider.transcribe(mockAudioBuffer);
        
        // Model should not be unloaded
        expect(invoke).not.toHaveBeenCalledWith('unload_whisper_model');
      }

      // Model should still be loaded
      let status = provider.getStatus();
      expect(status.available).toBe(true);

      // Clear invoke calls
      (invoke as jest.Mock).mockClear();

      // Now wait 5 minutes without any transcription
      jest.advanceTimersByTime(5 * 60 * 1000);

      // Wait for any pending promises
      await Promise.resolve();

      // Model should be unloaded
      expect(invoke).toHaveBeenCalledWith('unload_whisper_model');

      status = provider.getStatus();
      expect(status.available).toBe(false);
    });
  });
});
