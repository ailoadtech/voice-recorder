import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TranscriptionDisplay } from './TranscriptionDisplay';
import type { TranscriptionResult } from '@/services/transcription';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

describe('TranscriptionDisplay', () => {
  const mockResult: TranscriptionResult = {
    text: 'This is a test transcription.',
    language: 'en',
    duration: 5.5,
    confidence: 0.95,
    segments: [
      { id: 0, start: 0, end: 2.5, text: 'This is a test', confidence: 0.96 },
      { id: 1, start: 2.5, end: 5.5, text: 'transcription.', confidence: 0.94 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no result', () => {
    render(<TranscriptionDisplay result={null} />);
    
    expect(screen.getByText(/Transcribed text will appear here/i)).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<TranscriptionDisplay result={null} isLoading={true} />);
    
    expect(screen.getByText(/Transcribing audio/i)).toBeInTheDocument();
    expect(screen.getByText(/This may take a few moments/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(<TranscriptionDisplay result={null} error="API key invalid" />);
    
    expect(screen.getByText(/Transcription Failed/i)).toBeInTheDocument();
    expect(screen.getByText(/API key invalid/i)).toBeInTheDocument();
  });

  it('displays transcription result', () => {
    render(<TranscriptionDisplay result={mockResult} />);
    
    expect(screen.getByText(mockResult.text)).toBeInTheDocument();
  });

  it('displays metadata', () => {
    render(<TranscriptionDisplay result={mockResult} />);
    
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('0:05')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('copies text to clipboard', async () => {
    render(<TranscriptionDisplay result={mockResult} />);
    
    const copyButton = screen.getByText(/Copy/i);
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockResult.text);
      expect(screen.getByText(/Copied!/i)).toBeInTheDocument();
    });
  });

  it('enables edit mode', () => {
    render(<TranscriptionDisplay result={mockResult} />);
    
    const editButton = screen.getByText(/Edit/i);
    fireEvent.click(editButton);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue(mockResult.text);
  });

  it('saves edited text', () => {
    const onTextChange = jest.fn();
    render(<TranscriptionDisplay result={mockResult} onTextChange={onTextChange} />);
    
    // Enter edit mode
    const editButton = screen.getByText(/Edit/i);
    fireEvent.click(editButton);

    // Edit text
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Edited text' } });

    // Save
    const saveButton = screen.getByText(/Save/i);
    fireEvent.click(saveButton);

    expect(onTextChange).toHaveBeenCalledWith('Edited text');
  });

  it('displays segments count', () => {
    render(<TranscriptionDisplay result={mockResult} />);
    
    expect(screen.getByText(/View Segments \(2\)/i)).toBeInTheDocument();
  });

  it('shows detailed segments when expanded', () => {
    render(<TranscriptionDisplay result={mockResult} />);
    
    const detailsElement = screen.getByText(/Show detailed segments/i);
    fireEvent.click(detailsElement);

    expect(screen.getByText('This is a test')).toBeInTheDocument();
    expect(screen.getByText('transcription.')).toBeInTheDocument();
  });

  it('formats duration correctly', () => {
    const resultWithLongDuration: TranscriptionResult = {
      text: 'Test',
      duration: 125, // 2:05
    };

    render(<TranscriptionDisplay result={resultWithLongDuration} />);
    
    expect(screen.getByText('2:05')).toBeInTheDocument();
  });

  it('handles missing metadata gracefully', () => {
    const minimalResult: TranscriptionResult = {
      text: 'Test transcription',
    };

    render(<TranscriptionDisplay result={minimalResult} />);
    
    expect(screen.getByText('Test transcription')).toBeInTheDocument();
    expect(screen.queryByText(/Language:/i)).not.toBeInTheDocument();
  });
});
