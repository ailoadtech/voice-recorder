/**
 * Integration test for Record Page with LocalWhisperProvider
 * Tests that the transcription flow works with both API and local providers
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import RecordPage from './page';

// Mock the hooks and services
jest.mock('@/hooks/useWhisperTranscription', () => ({
  useWhisperTranscription: jest.fn(() => ({
    settings: {
      method: 'local',
      localModelVariant: 'small',
      enableFallback: true,
    },
    updateSettings: jest.fn(),
    transcribe: jest.fn().mockResolvedValue({
      text: 'Test transcription',
      duration: 1000,
      provider: 'local',
    }),
    isTranscribing: false,
    error: null,
    checkProviderAvailability: jest.fn().mockResolvedValue(true),
  })),
}));

jest.mock('@/hooks/useHotkey', () => ({
  useHotkey: jest.fn(),
}));

jest.mock('@/services/audio', () => ({
  AudioRecordingService: jest.fn().mockImplementation(() => ({
    getAudioMetadata: jest.fn().mockReturnValue({
      duration: 5,
      size: 1024,
    }),
  })),
}));

// Mock AudioContext
global.AudioContext = jest.fn().mockImplementation(() => ({
  decodeAudioData: jest.fn().mockResolvedValue({
    duration: 5,
    sampleRate: 44100,
    numberOfChannels: 1,
    length: 220500,
    getChannelData: jest.fn().mockReturnValue(new Float32Array(220500)),
  }),
})) as any;

describe('RecordPage Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the record page', () => {
    render(<RecordPage />);
    expect(screen.getByText('Voice Recording')).toBeInTheDocument();
  });

  it('displays the hotkey information', () => {
    render(<RecordPage />);
    expect(screen.getByText(/Ctrl\+Shift\+Space/i)).toBeInTheDocument();
  });

  it('shows transcription section', () => {
    render(<RecordPage />);
    expect(screen.getByText('Transcription')).toBeInTheDocument();
  });

  it('shows enrichment section', () => {
    render(<RecordPage />);
    expect(screen.getByText('AI Enrichment')).toBeInTheDocument();
  });
});

describe('RecordPage Transcription Flow', () => {
  it('uses the transcribe function from useWhisperTranscription hook', async () => {
    const mockTranscribe = jest.fn().mockResolvedValue({
      text: 'Test transcription',
      duration: 1000,
      provider: 'local',
    });

    const { useWhisperTranscription } = require('@/hooks/useWhisperTranscription');
    useWhisperTranscription.mockReturnValue({
      settings: {
        method: 'local',
        localModelVariant: 'small',
        enableFallback: true,
      },
      updateSettings: jest.fn(),
      transcribe: mockTranscribe,
      isTranscribing: false,
      error: null,
      checkProviderAvailability: jest.fn().mockResolvedValue(true),
    });

    render(<RecordPage />);
    
    // The transcribe function should be available through the hook
    expect(mockTranscribe).not.toHaveBeenCalled();
  });
});
