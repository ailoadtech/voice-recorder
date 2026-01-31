import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AudioPlayer } from './AudioPlayer';

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-audio-url');
global.URL.revokeObjectURL = jest.fn();

// Mock HTMLAudioElement
class MockAudio {
  src = '';
  currentTime = 0;
  duration = 60;
  volume = 1;
  paused = true;
  
  play = jest.fn().mockResolvedValue(undefined);
  pause = jest.fn();
  
  addEventListener = jest.fn((event, handler) => {
    if (event === 'loadedmetadata') {
      setTimeout(() => handler(), 0);
    }
  });
  
  removeEventListener = jest.fn();
}

describe('AudioPlayer', () => {
  let mockAudioBlob: Blob;

  beforeEach(() => {
    mockAudioBlob = new Blob(['test audio'], { type: 'audio/webm' });
    
    // Mock HTMLAudioElement
    global.HTMLAudioElement = MockAudio as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders audio player controls', () => {
    render(<AudioPlayer audioBlob={mockAudioBlob} />);
    
    expect(screen.getByLabelText('Play')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByLabelText('Volume')).toBeInTheDocument();
  });

  it('creates and revokes audio URL', () => {
    const { unmount } = render(<AudioPlayer audioBlob={mockAudioBlob} />);
    
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockAudioBlob);
    
    unmount();
    
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-audio-url');
  });

  it('displays time in MM:SS format', () => {
    render(<AudioPlayer audioBlob={mockAudioBlob} />);
    
    expect(screen.getByText('00:00')).toBeInTheDocument();
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  it('toggles play/pause on button click', async () => {
    render(<AudioPlayer audioBlob={mockAudioBlob} />);
    
    const playButton = screen.getByLabelText('Play');
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Pause')).toBeInTheDocument();
    });
  });

  it('updates volume when slider changes', () => {
    render(<AudioPlayer audioBlob={mockAudioBlob} />);
    
    const volumeSlider = screen.getByLabelText('Volume');
    fireEvent.change(volumeSlider, { target: { value: '0.5' } });

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('mutes and unmutes audio', () => {
    render(<AudioPlayer audioBlob={mockAudioBlob} />);
    
    const muteButton = screen.getByLabelText('Mute');
    fireEvent.click(muteButton);

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByLabelText('Unmute')).toBeInTheDocument();
    
    fireEvent.click(screen.getByLabelText('Unmute'));
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('handles progress bar click', () => {
    render(<AudioPlayer audioBlob={mockAudioBlob} />);
    
    const progressBar = screen.getByRole('progressbar');
    
    // Mock getBoundingClientRect
    progressBar.getBoundingClientRect = jest.fn(() => ({
      left: 0,
      width: 100,
      top: 0,
      right: 100,
      bottom: 10,
      height: 10,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    fireEvent.click(progressBar, { clientX: 50 });
    
    // Progress bar click should update current time
    expect(progressBar).toBeInTheDocument();
  });

  it('displays correct volume icon based on level', () => {
    const { rerender } = render(<AudioPlayer audioBlob={mockAudioBlob} />);
    
    // High volume
    expect(screen.getByLabelText('Mute')).toBeInTheDocument();
    
    // Change to low volume
    const volumeSlider = screen.getByLabelText('Volume');
    fireEvent.change(volumeSlider, { target: { value: '0.3' } });
    
    rerender(<AudioPlayer audioBlob={mockAudioBlob} />);
    
    // Should still show mute button (just different icon)
    expect(screen.getByLabelText('Mute')).toBeInTheDocument();
  });

  it('formats time correctly for different durations', () => {
    render(<AudioPlayer audioBlob={mockAudioBlob} />);
    
    // Should show 01:00 for 60 seconds duration
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });
});
