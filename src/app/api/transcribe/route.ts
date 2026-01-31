/**
 * API Route: Transcribe Audio
 * 
 * Handles audio transcription using OpenAI Whisper API
 * Keeps API keys secure on the server side
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWhisperApiKey, getEnv } from '@/lib/env';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB limit

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    const apiKey = getWhisperApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;
    const language = formData.get('language') as string;
    const prompt = formData.get('prompt') as string;
    const temperature = formData.get('temperature') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Check file size
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Prepare form data for OpenAI API
    const openaiFormData = new FormData();
    openaiFormData.append('file', audioFile);
    openaiFormData.append('model', getEnv().whisperModel);
    openaiFormData.append('response_format', 'verbose_json');

    if (language) {
      openaiFormData.append('language', language);
    }

    if (prompt) {
      openaiFormData.append('prompt', prompt);
    }

    if (temperature) {
      openaiFormData.append('temperature', temperature);
    }

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: openaiFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: errorData.error?.message || 'Transcription failed',
          statusCode: response.status 
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform response to match our interface
    const result = {
      text: data.text,
      language: data.language,
      duration: data.duration,
      segments: data.segments?.map((seg: any) => ({
        id: seg.id,
        start: seg.start,
        end: seg.end,
        text: seg.text,
        confidence: 1 - seg.no_speech_prob,
      })),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Transcription API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}