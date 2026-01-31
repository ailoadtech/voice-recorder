import {
  validateAudioBlob,
  validateAudioDuration,
  validateTranscriptionResponse,
  validateEnrichmentResponse,
  validateApiKey,
  validateEnvironmentConfig,
  validateTextInput,
  validateMediaStream,
  handleValidationFailure,
} from './validation';

describe('validation', () => {
  describe('validateAudioBlob', () => {
    it('validates null blob', () => {
      const result = validateAudioBlob(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Audio blob is null or undefined');
    });

    it('validates empty blob', () => {
      const blob = new Blob([], { type: 'audio/webm' });
      const result = validateAudioBlob(blob);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Audio blob is empty (0 bytes)');
    });

    it('validates valid audio blob', () => {
      const blob = new Blob(['audio data'], { type: 'audio/webm' });
      const result = validateAudioBlob(blob);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('warns about small blob', () => {
      const blob = new Blob(['a'], { type: 'audio/webm' });
      const result = validateAudioBlob(blob);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('validates blob type', () => {
      const blob = new Blob(['data'], { type: 'text/plain' });
      const result = validateAudioBlob(blob);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid MIME type'))).toBe(true);
    });

    it('rejects oversized blob', () => {
      const largeData = new Array(26 * 1024 * 1024).fill('a').join('');
      const blob = new Blob([largeData], { type: 'audio/webm' });
      const result = validateAudioBlob(blob);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('too large'))).toBe(true);
    });
  });

  describe('validateAudioDuration', () => {
    it('validates null duration', () => {
      const result = validateAudioDuration(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Audio duration is null or undefined');
    });

    it('validates negative duration', () => {
      const result = validateAudioDuration(-100);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Audio duration cannot be negative');
    });

    it('validates zero duration', () => {
      const result = validateAudioDuration(0);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Audio duration is zero');
    });

    it('validates valid duration', () => {
      const result = validateAudioDuration(5000);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('warns about short duration', () => {
      const result = validateAudioDuration(500);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('warns about long duration', () => {
      const result = validateAudioDuration(15 * 60 * 1000);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('validateTranscriptionResponse', () => {
    it('validates null response', () => {
      const result = validateTranscriptionResponse(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Response is null or undefined');
    });

    it('validates non-object response', () => {
      const result = validateTranscriptionResponse('string');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Response is not an object');
    });

    it('validates missing text field', () => {
      const result = validateTranscriptionResponse({});
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('text'))).toBe(true);
    });

    it('validates valid response', () => {
      const response = {
        text: 'transcribed text',
        language: 'en',
        duration: 5000,
      };
      const result = validateTranscriptionResponse(response);
      expect(result.valid).toBe(true);
      expect(result.data).toEqual(response);
    });

    it('validates minimal valid response', () => {
      const response = { text: 'transcribed text' };
      const result = validateTranscriptionResponse(response);
      expect(result.valid).toBe(true);
    });

    it('validates empty string text', () => {
      const response = { text: '' };
      const result = validateTranscriptionResponse(response);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateEnrichmentResponse', () => {
    it('validates null response', () => {
      const result = validateEnrichmentResponse(null);
      expect(result.valid).toBe(false);
    });

    it('validates missing required fields', () => {
      const result = validateEnrichmentResponse({});
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('validates valid response', () => {
      const response = {
        enrichedText: 'enriched content',
        originalText: 'original content',
        enrichmentType: 'format',
        model: 'gpt-4',
      };
      const result = validateEnrichmentResponse(response);
      expect(result.valid).toBe(true);
      expect(result.data).toEqual(response);
    });
  });

  describe('validateApiKey', () => {
    it('validates missing key', () => {
      const result = validateApiKey(undefined, 'OpenAI');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('OpenAI API key is missing');
    });

    it('validates empty key', () => {
      const result = validateApiKey('', 'OpenAI');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('OpenAI API key is empty');
    });

    it('validates valid OpenAI key', () => {
      const result = validateApiKey('sk-1234567890abcdefghij', 'OpenAI');
      expect(result.valid).toBe(true);
    });

    it('warns about invalid OpenAI key format', () => {
      const result = validateApiKey('invalid-key-format', 'OpenAI');
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('validateEnvironmentConfig', () => {
    it('validates missing API key', () => {
      const result = validateEnvironmentConfig({});
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('API key'))).toBe(true);
    });

    it('validates valid config', () => {
      const config = {
        OPENAI_API_KEY: 'sk-1234567890abcdefghij',
        WHISPER_MODEL: 'whisper-1',
        GPT_MODEL: 'gpt-4',
      };
      const result = validateEnvironmentConfig(config);
      expect(result.valid).toBe(true);
    });

    it('validates invalid model types', () => {
      const config = {
        OPENAI_API_KEY: 'sk-1234567890abcdefghij',
        WHISPER_MODEL: 123,
      };
      const result = validateEnvironmentConfig(config);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateTextInput', () => {
    it('validates null text', () => {
      const result = validateTextInput(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Text input is null or undefined');
    });

    it('validates empty text', () => {
      const result = validateTextInput('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Text input is empty');
    });

    it('validates whitespace-only text', () => {
      const result = validateTextInput('   ');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Text input is empty');
    });

    it('validates valid text', () => {
      const result = validateTextInput('valid text input');
      expect(result.valid).toBe(true);
      expect(result.data).toBe('valid text input');
    });

    it('rejects oversized text', () => {
      const largeText = new Array(100001).fill('a').join('');
      const result = validateTextInput(largeText);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('too long'))).toBe(true);
    });
  });

  describe('handleValidationFailure', () => {
    it('returns data for valid result', () => {
      const result = { valid: true, data: 'test data', errors: [] };
      const handled = handleValidationFailure(result, 'test');
      expect(handled).toBe('test data');
    });

    it('returns fallback for invalid result', () => {
      const result = { valid: false, errors: ['error'] };
      const handled = handleValidationFailure(result, 'test', { fallbackValue: 'fallback' });
      expect(handled).toBe('fallback');
    });

    it('throws error when requested', () => {
      const result = { valid: false, errors: ['error'] };
      expect(() => {
        handleValidationFailure(result, 'test', { throwError: true });
      }).toThrow();
    });

    it('logs errors by default', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = { valid: false, errors: ['error'] };
      handleValidationFailure(result, 'test');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('validateMediaStream', () => {
    it('validates null stream', () => {
      const result = validateMediaStream(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('MediaStream is null or undefined');
    });

    it('validates stream with no audio tracks', () => {
      const mockStream = {
        getAudioTracks: () => [],
      } as MediaStream;
      const result = validateMediaStream(mockStream);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('MediaStream has no audio tracks');
    });

    it('validates valid stream', () => {
      const mockTrack = {
        readyState: 'live',
        enabled: true,
        muted: false,
      } as MediaStreamTrack;
      const mockStream = {
        getAudioTracks: () => [mockTrack],
      } as MediaStream;
      const result = validateMediaStream(mockStream);
      expect(result.valid).toBe(true);
    });

    it('warns about non-live tracks', () => {
      const mockTrack = {
        readyState: 'ended',
        enabled: true,
        muted: false,
      } as MediaStreamTrack;
      const mockStream = {
        getAudioTracks: () => [mockTrack],
      } as MediaStream;
      const result = validateMediaStream(mockStream);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
});
