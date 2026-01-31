/**
 * API Route: Enrich Text
 * 
 * Handles text enrichment using configured LLM provider (OpenAI or Ollama)
 * Keeps API keys secure on the server side
 */

import { NextRequest, NextResponse } from 'next/server';
import { LLMService } from '@/services/llm/LLMService';
import type { EnrichmentType } from '@/services/llm/types';

const MAX_INPUT_LENGTH = 10000;

// Initialize LLM service (provider selection happens automatically)
const llmService = new LLMService();

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { text, type, customPrompt, temperature, maxTokens, model } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (text.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `Text too long. Maximum length is ${MAX_INPUT_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (!type || !['format', 'summarize', 'expand', 'bullet-points', 'action-items', 'custom'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid enrichment type' },
        { status: 400 }
      );
    }

    // Check if service is configured
    if (!llmService.isConfigured()) {
      const providerName = llmService.getProviderName();
      return NextResponse.json(
        { 
          error: `${providerName} provider is not properly configured. Please check your environment variables.`,
          provider: providerName
        },
        { status: 500 }
      );
    }

    // Enrich text using LLM service
    const result = await llmService.enrich(text, {
      type: type as EnrichmentType,
      customPrompt,
      temperature,
      maxTokens,
      model,
    });

    // Return consistent response format
    const response = {
      enrichedText: result.enrichedText,
      originalText: result.originalText,
      enrichmentType: result.enrichmentType,
      model: result.model,
      processingTime: result.processingTime,
      provider: llmService.getProviderName(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Enrichment API error:', errorMessage);
    
    // Determine appropriate status code
    let statusCode = 500;
    if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
      statusCode = 401;
    } else if (errorMessage.includes('Rate limit')) {
      statusCode = 429;
    } else if (errorMessage.includes('Invalid input') || errorMessage.includes('empty')) {
      statusCode = 400;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        provider: llmService.getProviderName()
      },
      { status: statusCode }
    );
  }
}