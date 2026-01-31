/**
 * OpenAIProvider Tests
 * Tests for OpenAI provider implementation
 */

import { OpenAIProvider } from './OpenAIProvider';
import { ConfigurationError, APIError, ConnectionError } from '../types';

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

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;

  beforeEach(() => {
    provider = new OpenAIProvider();
    jest.clearAllMocks();
  });

  describe('getProviderName', () => {
    it('returns "openai"', () => {
      expect(provider.getProviderName()).toBe('openai');
    });
  });

  describe('validateConfig', () => {
    it('returns true when API key is configured', () => {
      expect(provider.validateConfig()).toBe(true);
    });

    it('returns false when API key is missing', () => {
      const providerWithoutKey = new OpenAIProvider({ apiKey: '' });
      expect(providerWithoutKey.validateConfig()).toBe(false);
    });
  });

  describe('healthCheck', () => {
    it('returns true when API is accessible', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      const result = await provider.healthCheck();
      expect(result).toBe(true);
    });

    it('returns false when API is not accessible', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await provider.healthCheck();
      expect(result).toBe(false);
    });

    it('returns false when API key is invalid', () => {
      const providerWithoutKey = new OpenAIProvider({ apiKey: '' });
      expect(providerWithoutKey.healthCheck()).resolves.toBe(false);
    });
  });

  describe('enrich', () => {
    const testText = 'This is a test transcription.';

    it('successfully enriches text with format type', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'This is a formatted test transcription.',
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await provider.enrich(testText, 'format');
      expect(result).toBe('This is a formatted test transcription.');
    });

    it('successfully enriches text with summarize type', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Summary of the text.',
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await provider.enrich(testText, 'summarize');
      expect(result).toBe('Summary of the text.');
    });

    it('successfully enriches text with custom prompt', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Custom enriched text.',
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await provider.enrich(testText, 'custom', 'Make this funny');
      expect(result).toBe('Custom enriched text.');
    });

    it('throws ConfigurationError when API key is missing', async () => {
      const providerWithoutKey = new OpenAIProvider({ apiKey: '' });

      await expect(
        providerWithoutKey.enrich(testText, 'format')
      ).rejects.toThrow(ConfigurationError);
    });

    it('throws APIError for empty text', async () => {
      await expect(
        provider.enrich('', 'format')
      ).rejects.toThrow(APIError);
    });

    it('throws APIError for whitespace-only text', async () => {
      await expect(
        provider.enrich('   ', 'format')
      ).rejects.toThrow(APIError);
    });

    it('handles 401 authentication error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Invalid API key' } }),
      });

      await expect(
        provider.enrich(testText, 'format')
      ).rejects.toThrow(ConfigurationError);
    });

    it('handles 400 bad request error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: 'Bad request' } }),
      });

      await expect(
        provider.enrich(testText, 'format')
      ).rejects.toThrow(APIError);
    });

    it('handles 429 rate limit error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: 'Rate limit exceeded' } }),
      });

      await expect(
        provider.enrich(testText, 'format')
      ).rejects.toThrow(APIError);
    });

    it('handles 500 server error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: { message: 'Server error' } }),
      });

      await expect(
        provider.enrich(testText, 'format')
      ).rejects.toThrow(APIError);
    });

    it('retries on rate limit error and succeeds', async () => {
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

      const result = await provider.enrich(testText, 'format');
      expect(result).toBe('Success after retry');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('retries on 500 error and succeeds', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: { message: 'Server error' } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: 'Success after retry' } }],
          }),
        });

      const result = await provider.enrich(testText, 'format');
      expect(result).toBe('Success after retry');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('does not retry on 400 error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: 'Bad request' } }),
      });

      await expect(
        provider.enrich(testText, 'format')
      ).rejects.toThrow(APIError);
      
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('does not retry on configuration error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Invalid API key' } }),
      });

      await expect(
        provider.enrich(testText, 'format')
      ).rejects.toThrow(ConfigurationError);
      
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('handles network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new TypeError('Failed to fetch')
      );

      await expect(
        provider.enrich(testText, 'format')
      ).rejects.toThrow(ConnectionError);
    });

    it('throws APIError when response has no choices', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [] }),
      });

      await expect(
        provider.enrich(testText, 'format')
      ).rejects.toThrow(APIError);
    });

    it('uses correct model from config', async () => {
      const customProvider = new OpenAIProvider({ model: 'gpt-3.5-turbo' });
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Result' } }],
        }),
      });

      await customProvider.enrich(testText, 'format');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.model).toBe('gpt-3.5-turbo');
    });

    it('includes authorization header', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Result' } }],
        }),
      });

      await provider.enrich(testText, 'format');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const headers = fetchCall[1].headers;
      expect(headers['Authorization']).toBe('Bearer test-api-key');
    });

    it('includes content-type header', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Result' } }],
        }),
      });

      await provider.enrich(testText, 'format');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const headers = fetchCall[1].headers;
      expect(headers['Content-Type']).toBe('application/json');
    });
  });
});
