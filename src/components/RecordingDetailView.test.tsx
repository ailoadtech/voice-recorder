import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RecordingDetailView } from './RecordingDetailView';
import type { Recording } from '@/services/storage/types';

// Mock AudioPlayer
jest.mock('./AudioPlayer', () => ({
  AudioPlayer: () => <div>Audio Player</div>,
}));

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

// Mock window.confirm
global.confirm = jest.fn(() => true);

describe('RecordingDetailView', () => {
  const mockRecording: Recording = {
    id: 'test-1',
    createdAt: new Date('2024-01-01T10:00:00'),
    updatedAt: new Date('2024-01-01T10:00:00'),
    title: 'Test Recording',
    notes: 'Test notes',
    tags: ['meeting', 'important'],
    audioDuration: 120,
    transcriptionText: 'This is a test transcription',
    enrichedText: 'This is enriched text',
    enrichmentType: 'format',
  };

  const mockOnClose = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders recording details', () => {
    render(<RecordingDetailView recording={mockRecording} />);

    expect(screen.getByText('Test Recording')).toBeInTheDocument();
    expect(screen.getByText('Test notes')).toBeInTheDocument();
    expect(screen.getByText('meeting')).toBeInTheDocument();
    expect(screen.getByText('important')).toBeInTheDocument();
  });

  it('displays transcription and enriched text', () => {
    render(<RecordingDetailView recording={mockRecording} />);

    expect(screen.getByText('This is a test transcription')).toBeInTheDocument();
    expect(screen.getByText('This is enriched text')).toBeInTheDocument();
  });

  it('enters edit mode when edit button is clicked', () => {
    render(<RecordingDetailView recording={mockRecording} />);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('saves changes when save button is clicked', () => {
    render(
      <RecordingDetailView
        recording={mockRecording}
        onUpdate={mockOnUpdate}
      />
    );

    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Change title
    const titleInput = screen.getByDisplayValue('Test Recording');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

    // Save
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(mockOnUpdate).toHaveBeenCalledWith('test-1', {
      title: 'Updated Title',
      notes: 'Test notes',
      tags: ['meeting', 'important'],
    });
  });

  it('cancels edit mode without saving', () => {
    render(<RecordingDetailView recording={mockRecording} />);

    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Change title
    const titleInput = screen.getByDisplayValue('Test Recording');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

    // Cancel
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Should show original title
    expect(screen.getByText('Test Recording')).toBeInTheDocument();
  });

  it('copies transcription to clipboard', () => {
    render(<RecordingDetailView recording={mockRecording} />);

    const copyButtons = screen.getAllByText(/📋 copy/i);
    fireEvent.click(copyButtons[0]);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'This is a test transcription'
    );
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <RecordingDetailView
        recording={mockRecording}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <RecordingDetailView
        recording={mockRecording}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByText('Delete Recording');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('test-1');
  });

  it('displays audio player when audio blob exists', () => {
    const recordingWithAudio = {
      ...mockRecording,
      audioBlob: new Blob(['audio'], { type: 'audio/webm' }),
    };

    render(<RecordingDetailView recording={recordingWithAudio} />);

    expect(screen.getByText('Audio Player')).toBeInTheDocument();
  });

  it('shows enrichment type in label', () => {
    render(<RecordingDetailView recording={mockRecording} />);

    expect(screen.getByText(/\(format\)/i)).toBeInTheDocument();
  });

  it('handles recording without optional fields', () => {
    const minimalRecording: Recording = {
      id: 'test-2',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(<RecordingDetailView recording={minimalRecording} />);

    expect(screen.getByText('Untitled Recording')).toBeInTheDocument();
    expect(screen.getByText('No tags')).toBeInTheDocument();
    expect(screen.getByText('No notes')).toBeInTheDocument();
  });
});
