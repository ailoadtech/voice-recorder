import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RecordingButton } from './RecordingButton';
import { AudioRecordingService } from '@/services/audio';

// Mock the AudioRecordingService
jest.mock('@/services/audio', () => {
  return {
    AudioRecordingService: jest.fn().mockImplementation(() => ({
      startRecording: jest.fn().mockResolvedValue(undefined),
      stopRecording: jest.fn().mockResolvedValue(new Blob(['test'], { type: 'audio/webm' })),
      getDuration: jest.fn().mockReturnValue(5000),
      getState: jest.fn().mockReturnValue('idle'),
    })),
  };
});

describe('RecordingButton', () => {
  let mockAudioService: jest.Mocked<AudioRecordingService>;

  beforeEach(() => {
    jest.useFakeTimers();
    mockAudioService = new AudioRecordingService() as jest.Mocked<AudioRecordingService>;
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders in idle state', () => {
    render(<RecordingButton audioService={mockAudioService} />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Press to Record')).toBeInTheDocument();
  });

  it('starts recording when clicked in idle state', async () => {
    render(<RecordingButton audioService={mockAudioService} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockAudioService.startRecording).toHaveBeenCalledTimes(1);
    });
  });

  it('displays recording state with timer', async () => {
    render(<RecordingButton audioService={mockAudioService} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Recording\.\.\. Click to stop/i)).toBeInTheDocument();
    });
    
    // Advance timers to update duration
    jest.advanceTimersByTime(100);
  });

  it('stops recording when clicked in recording state', async () => {
    const onRecordingComplete = jest.fn();
    render(
      <RecordingButton 
        audioService={mockAudioService} 
        onRecordingComplete={onRecordingComplete}
      />
    );
    
    const button = screen.getByRole('button');
    
    // Start recording
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockAudioService.startRecording).toHaveBeenCalled();
    });

    // Stop recording
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockAudioService.stopRecording).toHaveBeenCalled();
      expect(onRecordingComplete).toHaveBeenCalledWith(expect.any(Blob));
    });
  });

  it('displays error state when recording fails', async () => {
    const onError = jest.fn();
    const errorMessage = 'Microphone permission denied';
    mockAudioService.startRecording.mockRejectedValueOnce(new Error(errorMessage));

    render(
      <RecordingButton 
        audioService={mockAudioService} 
        onError={onError}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Recording Error')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  it('allows retry after error', async () => {
    mockAudioService.startRecording
      .mockRejectedValueOnce(new Error('Test error'))
      .mockResolvedValueOnce(undefined);

    render(<RecordingButton audioService={mockAudioService} />);
    
    const button = screen.getByRole('button');
    
    // First attempt - should fail
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Recording Error')).toBeInTheDocument();
    });

    // Click retry button
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Press to Record')).toBeInTheDocument();
    });
  });

  it('formats duration correctly', async () => {
    mockAudioService.getDuration.mockReturnValue(65000); // 1:05

    render(<RecordingButton audioService={mockAudioService} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('01:05')).toBeInTheDocument();
    });
    
    jest.advanceTimersByTime(100);
  });

  it('disables button during processing', async () => {
    render(<RecordingButton audioService={mockAudioService} />);
    
    const button = screen.getByRole('button');
    
    // Start recording
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockAudioService.startRecording).toHaveBeenCalled();
    });

    // Stop recording (triggers processing state)
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('shows complete state after successful recording', async () => {
    render(<RecordingButton audioService={mockAudioService} />);
    
    const button = screen.getByRole('button');
    
    // Start and stop recording
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockAudioService.startRecording).toHaveBeenCalled();
    });

    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Recording saved!')).toBeInTheDocument();
    });
    
    // Fast-forward the auto-reset timer
    jest.advanceTimersByTime(2000);
  });
});
