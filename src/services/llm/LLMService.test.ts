import { LLMService } from './LLMService';
import type { LLMError, EnrichmentOptions } from './types';

// Mock environment
jest.mock('@/lib/env', () => ({
  getEnv: jest.fn(() => ({
    openaiApiKey: 'test-api-key',
    openaiApiBaseUrl: 'https://api.openai.com/v1',
    gptModel: 'gpt-4',
    apiMaxRetries: 3,
  })),
  getGPTApiKey: jest.fn(() => 'test-api-key'),
}));

// Mock fetch
global.fetch = jest.fn();

describe('LLMService', () => {
  let service: LLMService;

  beforeEach(() => {
    service = new LLMService();
    jest.clearAllMocks();
  });

  describe('enrich', () => {
    const testText = 'This is a test transcription that needs formatting.';
    const options: EnrichmentOptions = { type: 'format' };

    it('successfully enriches text', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'This is a test transcription that needs formatting.',
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.enrich(testText, options);

      expect(result.enrichedText).toBe(mockResponse.choices[0].message.content);
      expect(result.originalText).toBe(testText);
      expect(result.enrichmentType).toBe('format');
      expect(service.getStatus()).toBe('complete');
    });

    it('throws error for empty text', async () => {
      await expect(service.enrich('', options)).rejects.toThrow('Input text is empty');
    });

    it('throws error for text too long', async () => {
      const longText = 'a'.repeat(10001);
      await expect(service.enrich(longText, options)).rejects.toThrow('Input text too long');
    });

    it('handles API authentication error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Invalid API key' } }),
      });

      await expect(service.enrich(testText, options)).rejects.toMatchObject({
        name: 'LLMError',
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
          json: async () => ({
            choices: [{ message: { content: 'Success after retry' } }],
          }),
        });

      const result = await service.enrich(testText, options);

      expect(result.enrichedText).toBe('Success after retry');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('handles network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

      await expect(service.enrich(testText, options)).rejects.toMatchObject({
        name: 'LLMError',
        code: 'NETWORK_ERROR',
        retryable: true,
      });
    });

    it('uses custom prompt for custom type', async () => {
      const customOptions: EnrichmentOptions = {
        type: 'custom',
        customPrompt: 'Make this funny',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Funny version' } }],
        }),
      });

      await service.enrich(testText, customOptions);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.messages[1].content).toContain('Make this funny');
    });

    it('respects custom temperature and maxTokens', async () => {
      const customOptions: EnrichmentOptions = {
        type: 'format',
        temperature: 0.9,
        maxTokens: 500,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Result' } }],
        }),
      });

      await service.enrich(testText, customOptions);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.temperature).toBe(0.9);
      expect(requestBody.max_tokens).toBe(500);
    });
  });

  describe('cancel', () => {
    it('cancels ongoing enrichment', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      const enrichPromise = service.enrich('Test', { type: 'format' });
      service.cancel();

      await expect(enrichPromise).rejects.toThrow('Enrichment cancelled');
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

  describe('getAvailableTypes', () => {
    it('returns list of enrichment types', () => {
      const types = service.getAvailableTypes();

      expect(types).toContain('format');
      expect(types).toContain('summarize');
      expect(types).toContain('expand');
      expect(types).toContain('bullet-points');
      expect(types).toContain('action-items');
      expect(types).toContain('custom');
    });
  });

  describe('estimateTokens', () => {
    it('estimates token count', () => {
      const text = 'This is a test';
      const tokens = LLMService.estimateTokens(text);

      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(text.length);
    });
  });

  describe('getModelInfo', () => {
    it('returns model information', () => {
      const info = service.getModelInfo();

      expect(info.model).toBe('gpt-4');
      expect(info.maxTokens).toBeGreaterThan(0);
    });
  });
});
