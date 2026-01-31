/**
 * Tests for /api/enrich endpoint
 * Verifies backward compatibility and provider abstraction
 * @jest-environment node
 */

import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock the LLMService
jest.mock('@/services/llm/LLMService');

describe('/api/enrich endpoint', () => {
  let mockLLMService: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Get the mocked LLMService class
    const { LLMService } = require('@/services/llm/LLMService');
    
    // Create mock instance methods
    mockLLMService = {
      isConfigured: jest.fn().mockReturnValue(true),
      getProviderName: jest.fn().mockReturnValue('openai'),
      enrich: jest.fn().mockResolvedValue({
        enrichedText: 'Enriched text result',
        originalText: 'Test input',
        enrichmentType: 'format',
        model: 'gpt-4',
        processingTime: 1000,
      }),
    };

    // Mock the constructor to return our mock instance
    LLMService.mockImplementation(() => mockLLMService);
  });

  describe('Input Validation', () => {
    it('should return 400 if text is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/enrich', {
        method: 'POST',
        body: JSON.stringify({ type: 'format' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Text is required');
    });

    it('should return 400 if text is not a string', async () => {
      const request = new NextRequest('http://localhost:3000/api/enrich', {
        method: 'POST',
        body: JSON.stringify({ text: 123, type: 'format' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Text is required');
    });

    it('should return 400 if text exceeds maximum length', async () => {
      const longText = 'a'.repeat(10001);
      const request = new NextRequest('http://localhost:3000/api/enrich', {
        method: 'POST',
        body: JSON.stringify({ text: longText, type: 'format' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Text too long');
    });

    it('should return 400 if enrichment type is invalid', async () => {
      const request = new NextRequest('http://localhost:3000/api/enrich', {
        method: 'POST',
        body: JSON.stringify({ text: 'Test', type: 'invalid-type' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid enrichment type');
    });

    it('should return 400 if enrichment type is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/enrich', {
        method: 'POST',
        body: JSON.stringify({ text: 'Test' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid enrichment type');
    });
  });

  describe('OpenAI Provider', () => {
    beforeEach(() => {
      mockLLMService.getProviderName.mockReturnValue('openai');
    });

    it('should successfully enrich text with OpenAI provider', async () => {
      const request = new NextRequest('http://localhost:3000/api/enrich', {
        method: 'POST',
        body: JSON.stringify({
          text: 'Test input',
          type: 'format',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        enrichedText: 'Enriched text result',
        originalText: 'Test input',
        enrichmentType: 'format',
        model: 'gpt-4',
        processingTime: 1000,
        provider: 'openai',
      });
    });

    it('should handle all enrichment types with OpenAI', async () => {
      const types = ['format', 'summarize', 'expand', 'bullet-points', 'action-items', 'custom'];

      for (const type of types) {
        mockLLMService.enrich.mockResolvedValue({
          enrichedText: `Enriched ${type}`,
          originalText: 'Test',
          enrichmentType: type,
          model: 'gpt-4',
          processingTime: 1000,
        });

        const request = new NextRequest('http://localhost:3000/api/enrich', {
          method: 'POST',
          body: JSON.stringify({
            text: 'Test input',
            type,
            customPrompt: type === 'custom' ? 'Custom prompt' : undefined,
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.enrichmentType).toBe(type);
        expect(data.provider).toBe('openai');
      }
    });

    it('should return 500 if OpenAI provider is not configured', async () => {
      mockLLMService.isConfigured.mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/enrich', {
        method: 'POST',
        body: JSON.stringify({
          text: 'Test input',
          type: 'format',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('not properly configured');
      expect(data.provider).toBe('openai');
    });
  });

  describe('Ollama Provider', () => {
    beforeEach(() => {
      mockLLMService.getProviderName.mockReturnValue('ollama');
      mockLLMService.enrich.mockResolvedValue({
        enrichedText: 'Enriched text from Ollama',
        originalText: 'Test input',
        enrichmentType: 'format',
        model: 'llama2',
        processingTime: 2000,
      });
    });

    it('should successfully enrich text with Ollama provider', async () => {
      const request = new NextRequest('http://localhost:3000/api/enrich', {
        method: 'POST',
        body: JSON.stringify({
          text: 'Test input',
          type: 'format',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        enrichedText: 'Enriched text from Ollama',
        originalText: 'Test input',
        enrichmentType: 'format',
        model: 'llama2',
        processingTime: 2000,
        provider: 'ollama',
      });
    });

    it('should handle all enrichment types with Ollama', async () => {
      const types = ['format', 'summarize', 'expand', 'bullet-points', 'action-items', 'custom'];

      for (const type of types) {
        mockLLMService.enrich.mockResolvedValue({
          enrichedText: `Enriched ${type}`,
          originalText: 'Test',
          enrichmentType: type,
          model: 'llama2',
          processingTime: 2000,
        });

        const request = new NextRequest('http://localhost:3000/api/enrich', {
          method: 'POST',
          body: JSON.stringify({
            text: 'Test input',
            type,
            customPrompt: type === 'custom' ? 'Custom prompt' : undefined,
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.enrichmentType).toBe(type);
        expect(data.provider).toBe('ollama');
      }
    });

    it('should return 500 if Ollama provider is not configured', async () => {
      mockLLMService.isConfigured.mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/enrich', {
        method: 'POST',
        body: JSON.stringify({
          text: 'Test input',
          type: 'format',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('not properly configured');
      expect(data.provider).toBe('ollama');
    });
  });

  describe('Response Format Consistency', () => {
    it('should return consistent response format for OpenAI', async () => {
      mockLLMService.getProviderName.mockReturnValue('openai');

      const request = new NextRequest('http://localhost:3000/api/enrich', {
        method: 'POST',
        body: JSON.stringify({
          text: 'Test input',
          type: 'summarize',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Verify all expected fields are present
      expect(data).toHaveProperty('enrichedText');
      expect(data).toHaveProperty('originalText');
      expect(data).toHaveProperty('enrichmentType');
      expect(data).toHaveProperty('model');
      expect(data).toHaveProperty('processingTime');
      expect(data).toHaveProperty('provider');
      
      // Verify field types
      expect(typeof data.enrichedText).toBe('string');
      expect(typeof data.originalText).toBe('string');
      expect(typeof data.enrichmentType).toBe('string');
      expect(typeof data.model).toBe('string');
      expect(typeof data.processingTime).toBe('number');
      expect(typeof data.provider).toBe('string');
    });

    it('should return consistent response format for Ollama', async () => {
      mockLLMService.getProviderName.mockReturnValue('ollama');

      const request = new NextRequest('http://localhost:3000/api/enrich', {
        method: 'POST',
        body: JSON.stringify({
          text: 'Test input',
          type: 'summarize',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Verify all expected fields are present
      expect(data).toHaveProperty('enrichedText');
      expect(data).toHaveProperty('originalText');
      expect(data).toHaveProperty('enrichmentType');
      expect(data).toHaveProperty('model');
      expect(data).toHaveProperty('processingTime');
      expect(data).toHaveProperty('provider');
      
      // Verify field types
      expect(typeof data.enrichedText).toBe('string');
      expect(typeof data.originalText).toBe('string');
      expect(typeof data.enrichmentType).toBe('string');
      expect(typeof data.model).toBe('string');
      expect(typeof data.processingTime).toBe('number');
      expect(typeof data.provider).toBe('string');
    });

    it('should have identical response structure regardless of provider', async () => {
      // Test with OpenAI
      mockLLMService.getProviderName.mockReturnValue('openai');
      const openaiRequest = new NextRequest('http://localhost:3000/api/enrich', {
        method: 'POST',
        body: JSON.stringify({ text: 'Test', type: 'format' }),
      });
      const openaiResponse = await POST(openaiRequest);
      const openaiData = await openaiResponse.json();
      const openaiKeys = Object.keys(openaiData).sort();

      // Test with Ollama
      mockLLMService.getProviderName.mockReturnValue('ollama');
      const ollamaRequest = new NextRequest('http://localhost:3000/api/enrich', {
        method: 'POST',
        body: JSON.stringify({ text: 'Test', type: 'format' }),
      });
      const ollamaResponse = await POST(ollamaRequest);
      const ollamaData = await ollamaResponse.json();
      const ollamaKeys = Object.keys(ollamaData).sort();

      // Verify both have the same keys
      expect(openaiKeys).toEqual(ollamaKeys);
    });
  });

  describe('Error Handling', () => {
    it('should handle enrichment errors gracefully', async () => {
      mockLLMService.enrich.mockRejectedValue(new Error('Enrichment failed'));

      const request = new NextRequest('http://localhost:3000/api/enrich', {
        method: 'POST',
        body: JSON.stringify({
          text: 'Test input',
          type: 'format',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Enrichment failed');
      expect(data.provider).toBe('openai');
    });

    it('should return 401 for authentication errors', async () => {
      mockLLMService.enrich.mockRejectedValue(new Error('Invalid API key'));

      const request = new NextRequest('http://localhost:3000/api/enrich', {
        method: 'POST',
        body: JSON.stringify({
          text: 'Test input',
          type: 'format',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('API key');
    });

    it('should return 429 for rate limit errors', async () => {
      mockLLMService.enrich.mockRejectedValue(new Error('Rate limit exceeded'));

      const request = new NextRequest('http://localhost:3000/api/enrich', {
        method: 'POST',
        body: JSON.stringify({
          text: 'Test input',
          type: 'format',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain('Rate limit');
    });

    it('should return 400 for invalid input errors', async () => {
      mockLLMService.enrich.mockRejectedValue(new Error('Invalid input text'));

      const request = new NextRequest('http://localhost:3000/api/enrich', {
        method: 'POST',
        body: JSON.stringify({
          text: 'Test input',
          type: 'format',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid input');
    });
  });

  describe('Custom Prompt Support', () => {
    it('should pass custom prompt to LLM service for OpenAI', async () => {
      const request = new NextRequest('http://localhost:3000/api/enrich', {
        method: 'POST',
        body: JSON.stringify({
          text: 'Test input',
          type: 'custom',
          customPrompt: 'Make it funny',
        }),
      });

      await POST(request);

      expect(mockLLMService.enrich).toHaveBeenCalledWith('Test input', {
        type: 'custom',
        customPrompt: 'Make it funny',
        temperature: undefined,
        maxTokens: undefined,
        model: undefined,
      });
    });

    it('should pass custom prompt to LLM service for Ollama', async () => {
      mockLLMService.getProviderName.mockReturnValue('ollama');

      const request = new NextRequest('http://localhost:3000/api/enrich', {
        method: 'POST',
        body: JSON.stringify({
          text: 'Test input',
          type: 'custom',
          customPrompt: 'Make it professional',
        }),
      });

      await POST(request);

      expect(mockLLMService.enrich).toHaveBeenCalledWith('Test input', {
        type: 'custom',
        customPrompt: 'Make it professional',
        temperature: undefined,
        maxTokens: undefined,
        model: undefined,
      });
    });
  });
});
