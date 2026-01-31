/**
 * API Route: Check API Keys
 * 
 * Validates that API keys are configured and can connect to OpenAI services.
 * Returns status information for the UI to display.
 */

import { NextResponse } from 'next/server';
import { hasApiKeys, getWhisperApiKey } from '@/lib/env';

export async function GET() {
  try {
    // Check if API keys are configured
    const configured = hasApiKeys();

    if (!configured) {
      return NextResponse.json({
        configured: false,
        valid: null,
        error: 'API keys not configured',
      });
    }

    // Get API key for validation
    const apiKey = getWhisperApiKey();

    if (!apiKey) {
      return NextResponse.json({
        configured: false,
        valid: null,
        error: 'API key not found',
      });
    }

    // Validate API key format
    if (!apiKey.startsWith('sk-')) {
      return NextResponse.json({
        configured: true,
        valid: false,
        error: 'Invalid API key format',
      });
    }

    // Test connection to OpenAI API
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        return NextResponse.json({
          configured: true,
          valid: true,
          error: null,
        });
      } else if (response.status === 401) {
        return NextResponse.json({
          configured: true,
          valid: false,
          error: 'Invalid API key',
        });
      } else {
        return NextResponse.json({
          configured: true,
          valid: null,
          error: `API returned status ${response.status}`,
        });
      }
    } catch (error) {
      return NextResponse.json({
        configured: true,
        valid: null,
        error: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  } catch (error) {
    return NextResponse.json({
      configured: false,
      valid: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
