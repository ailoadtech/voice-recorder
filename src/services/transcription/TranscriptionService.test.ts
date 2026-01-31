import { TranscriptionService } from './TranscriptionService';
import type { TranscriptionError } from './types';

// Mock environment
jest.mock('@/lib/env', () => ({
  getEnv: jest.fn(() => ({
    openaiApiKey: 'test-api-key',
    openaiApiBaseUrl: 'https://api.openai.com/v1',
    whisperModel: 'whisper-1',
    apiMaxRetries: 3,
  })),
  getWhisperApiKey: jest.fn(() => 'test-api-key'),
}));

// Mock fetch
global.fetch = jest.fn();

describe('TranscriptionService', () => {
  let service: TranscriptionService;
  let mockAudioBlob: Blob;

  beforeEach(() => {
    service = new TranscriptionService();
    mockAudioBlob = new Blob(['test audio data'], { type: 'audio/webm' });
    jest.clearAllMocks();
  });

  describe('transcribe', () => {
    it('successfully transcribes audio', async () => {
      const mockResponse = {
        text: 'Hello, this is a test transcription.',
        language: 'en',
        duration: 5.2,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.transcribe(mockAudioBlob);

      expect(result.text).toBe(mockResponse.text);
      expect(result.language).toBe(mockResponse.language);
      expect(result.duration).toBe(mockResponse.duration);
      expect(service.getStatus()).toBe('complete');
    });

    it('throws error for empty audio blob', async () => {
      const emptyBlob = new Blob([], { type: 'audio/webm' });

      await expect(service.transcribe(emptyBlob)).rejects.toThrow('Audio file is empty');
    });

    it('throws error for oversized audio file', async () => {
      // Create a blob larger than 25MB
      const largeBlob = new Blob([new ArrayBuffer(26 * 1024 * 1024)], { type: 'audio/webm' });

      await expect(service.transcribe(largeBlob)).rejects.toThrow('Audio file too large');
    });

    it('handles API authentication error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Invalid API key' } }),
      });

      await expect(service.transcribe(mockAudioBlob)).rejects.toMatchObject({
        name: 'TranscriptionError',
        code: 'AUTHENTICATION_ERROR',
        retryable: false,
      });
    });

    it('handles rate limit error with retry', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          json: async () => ({ error: { message: 'Rate limit exceeded' } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ text: 'Success after retry' }),
        });

      const result = await service.transcribe(mockAudioBlob);

      expect(result.text).toBe('Success after retry');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('handles network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

      await expect(service.transcribe(mockAudioBlob)).rejects.toMatchObject({
        name: 'TranscriptionError',
        code: 'NETWORK_ERROR',
        retryable: true,
      });
    });

    it('respects custom options', async () => {
      const mockResponse = { text: 'Transcribed text' };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await service.transcribe(mockAudioBlob, {
        language: 'es',
        temperature: 0.5,
        prompt: 'Custom prompt',
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const formData = fetchCall[1].body as FormData;

      expect(formData.get('language')).toBe('es');
      expect(formData.get('temperature')).toBe('0.5');
      expect(formData.get('prompt')).toBe('Custom prompt');
    });
  });

  describe('cancel', () => {
    it('cancels ongoing transcription', async () => {
      let abortSignal: AbortSignal | undefined;
      
      (global.fetch as jest.Mock).mockImplementationOnce(
        (_url: string, options: any) => {
          abortSignal = options.signal;
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              if (abortSignal?.aborted) {
                reject(new DOMException('The operation was aborted', 'AbortError'));
              } else {
                resolve({ ok: true, json: async () => ({ text: 'Success' }) });
              }
            }, 1000);
          });
        }
      );

      const transcribePromise = service.transcribe(mockAudioBlob);
      
      // Give it a moment to start
      await new Promise(resolve => setTimeout(resolve, 10));
      
      service.cancel();

      await expect(transcribePromise).rejects.toThrow('Transcription cancelled');
      expect(service.getStatus()).toBe('idle');
    });
  });

  describe('isAvailable', () => {
    it('returns true when API is accessible', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      const available = await service.isAvailable();

      expect(available).toBe(true);
    });

    it('returns false when API is not accessible', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const available = await service.isAvailable();

      expect(available).toBe(false);
    });
  });

  describe('getStatus', () => {
    it('returns correct status', () => {
      expect(service.getStatus()).toBe('idle');
    });
  });

  describe('getSupportedFormats', () => {
    it('returns list of supported audio formats', () => {
      const formats = TranscriptionService.getSupportedFormats();

      expect(formats).toContain('audio/webm');
      expect(formats).toContain('audio/mp3');
      expect(formats).toContain('audio/wav');
      expect(formats.length).toBeGreaterThan(0);
    });
  });
});
