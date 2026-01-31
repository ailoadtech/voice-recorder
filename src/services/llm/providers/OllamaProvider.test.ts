/**
 * OllamaProvider Tests
 * Tests for response parsing and error handling
 */

import { OllamaProvider } from './OllamaProvider';
import { ConnectionError, APIError } from '../types';

// Mock the env module
jest.mock('@/lib/env', () => ({
  getEnv: jest.fn(() => ({
    ollamaBaseUrl: 'http://localhost:11434',
    ollamaModel: 'llama2',
    ollamaTimeout: '5000',
  })),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('OllamaProvider - Response Parsing and Error Handling', () => {
  let provider: OllamaProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new OllamaProvider({
      baseUrl: 'http://localhost:11434',
      model: 'llama2',
      timeout: 5000,
    });
  });

  describe('Response Parsing', () => {
    it('should parse JSON response and extract text from "response" field', async () => {
      const mockResponse = {
        model: 'llama2',
        created_at: '2024-01-01T00:00:00Z',
        response: 'This is the enriched text',
        done: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await provider.enrich('test text', 'format');
      expect(result).toBe('This is the enriched text');
    });

    it('should throw APIError when response field is missing', async () => {
      const mockResponse = {
        model: 'llama2',
        created_at: '2024-01-01T00:00:00Z',
        done: true,
        // Missing 'response' field
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await expect(provider.enrich('test text', 'format')).rejects.toThrow(APIError);
      await expect(provider.enrich('test text', 'format')).rejects.toThrow(
        'Received invalid response from Ollama server'
      );
    });
  });

  describe('Connection Error Handling', () => {
    it('should handle connection refused with descriptive message', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new TypeError('Failed to fetch')
      );

      await expect(provider.enrich('test text', 'format')).rejects.toThrow(ConnectionError);
      await expect(provider.enrich('test text', 'format')).rejects.toThrow(
        'Unable to connect to Ollama server at http://localhost:11434'
      );
    });

    it('should handle timeout with descriptive message', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => {
        return new Promise((_, reject) => {
          const error = new Error('The operation was aborted');
          error.name = 'AbortError';
          setTimeout(() => reject(error), 100);
        });
      });

      await expect(provider.enrich('test text', 'format')).rejects.toThrow(ConnectionError);
      await expect(provider.enrich('test text', 'format')).rejects.toThrow(
        /Request to Ollama server timed out after \d+ms/
      );
    });
  });

  describe('404 Error Handling', () => {
    it('should handle 404 error for missing models', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'model not found' }),
      });

      await expect(provider.enrich('test text', 'format')).rejects.toThrow(APIError);
      await expect(provider.enrich('test text', 'format')).rejects.toThrow(
        "Model 'llama2' not found on Ollama server"
      );
    });
  });

  describe('Other API Errors', () => {
    it('should handle 400 bad request errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid prompt' }),
      });

      await expect(provider.enrich('test text', 'format')).rejects.toThrow(APIError);
    });

    it('should handle 500 server errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      await expect(provider.enrich('test text', 'format')).rejects.toThrow(APIError);
      await expect(provider.enrich('test text', 'format')).rejects.toThrow(
        'Ollama server error'
      );
    });
  });
});
