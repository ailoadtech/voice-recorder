'use client';

import React from 'react';
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { AudioRecordingService } from '@/services/audio';

export type RecordingUIState = 'idle' | 'recording' | 'processing' | 'complete' | 'error';

interface RecordingButtonProps {
  audioService: AudioRecordingService;
  onRecordingComplete?: (blob: Blob) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export interface RecordingButtonHandle {
  toggleRecording: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
}

// Constants
const TIMER_UPDATE_INTERVAL = 100;
const AUTO_RESET_DELAY = 2000;

/**
 * RecordingButton - Main recording control component
 * Handles all recording states with visual feedback
 */
export const RecordingButton = forwardRef<RecordingButtonHandle, RecordingButtonProps>(
  function RecordingButton(
    {
      audioService,
      onRecordingComplete,
      onError,
      className = '',
    },
    ref
  ) {
  const [uiState, setUiState] = useState<RecordingUIState>('idle');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // TODO: Audio level visualization - requires Web Audio API integration
  // const [audioLevel, setAudioLevel] = useState(0);
  const autoResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect for recording duration
  useEffect(() => {
    if (uiState !== 'recording') return;

    const interval = setInterval(() => {
      setDuration(audioService.getDuration());
    }, TIMER_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [uiState, audioService]);

  // Cleanup auto-reset timeout on unmount
  useEffect(() => {
    return () => {
      if (autoResetTimeoutRef.current) {
        clearTimeout(autoResetTimeoutRef.current);
      }
    };
  }, []);

  // Expose methods via ref for external control (e.g., hotkeys)
  useImperativeHandle(ref, () => ({
    toggleRecording: () => {
      if (uiState === 'idle') {
        handleStartRecording();
      } else if (uiState === 'recording') {
        handleStopRecording();
      }
    },
    startRecording: handleStartRecording,
    stopRecording: handleStopRecording,
  }));

  // Format duration as MM:SS
  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle recording start
  const handleStartRecording = async () => {
    try {
      setError(null);
      setUiState('recording');
      setDuration(0);
      await audioService.startRecording();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      setUiState('error');
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  };

  // Handle recording stop
  const handleStopRecording = async () => {
    try {
      setUiState('processing');
      const blob = await audioService.stopRecording();
      setUiState('complete');
      onRecordingComplete?.(blob);
      
      // Reset to idle after delay with cleanup
      autoResetTimeoutRef.current = setTimeout(() => {
        setUiState('idle');
        setDuration(0);
        autoResetTimeoutRef.current = null;
      }, AUTO_RESET_DELAY);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop recording';
      setError(errorMessage);
      setUiState('error');
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  };

  // Handle button click
  const handleClick = () => {
    if (uiState === 'idle') {
      handleStartRecording();
    } else if (uiState === 'recording') {
      handleStopRecording();
    } else if (uiState === 'error') {
      setError(null);
      setUiState('idle');
    }
  };

  // Retry after error
  const handleRetry = () => {
    setError(null);
    setUiState('idle');
  };

  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
      {/* Main Recording Button */}
      <button
        onClick={handleClick}
        disabled={uiState === 'processing' || uiState === 'complete'}
        className={`
          relative w-24 h-24 sm:w-32 sm:h-32 rounded-full text-3xl sm:text-4xl 
          flex items-center justify-center
          transition-all duration-300 transform
          ${uiState === 'idle' ? 'bg-red-500 hover:bg-red-600 hover:scale-105 animate-fadeIn' : ''}
          ${uiState === 'recording' ? 'bg-red-600 animate-pulse' : ''}
          ${uiState === 'processing' ? 'bg-gray-400 cursor-not-allowed animate-scaleIn' : ''}
          ${uiState === 'complete' ? 'bg-green-500 animate-successPulse' : ''}
          ${uiState === 'error' ? 'bg-red-700 hover:bg-red-800 animate-shake' : ''}
          disabled:cursor-not-allowed
          shadow-lg hover:shadow-xl
        `}
        aria-label={
          uiState === 'idle' ? 'Start recording' :
          uiState === 'recording' ? 'Stop recording' :
          uiState === 'processing' ? 'Processing...' :
          uiState === 'complete' ? 'Complete' :
          'Error - Click to retry'
        }
      >
        {/* Recording indicator ring */}
        {uiState === 'recording' && (
          <div className="absolute inset-0 rounded-full border-4 border-white animate-recordingPulse" />
        )}
        
        {/* Icon based on state */}
        <span className="relative z-10 text-white">
          {uiState === 'idle' && '🎤'}
          {uiState === 'recording' && '⏹️'}
          {uiState === 'processing' && (
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-4 border-white" />
          )}
          {uiState === 'complete' && <span className="animate-scaleIn">✓</span>}
          {uiState === 'error' && '⚠️'}
        </span>
      </button>

      {/* Timer Display */}
      {uiState === 'recording' && (
        <div className="mt-3 sm:mt-4 text-xl sm:text-2xl font-mono font-bold text-gray-800 dark:text-neutral-200 animate-slideUp">
          {formatDuration(duration)}
        </div>
      )}

      {/* Status Text */}
      <div className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-neutral-400 text-center px-4">
        {uiState === 'idle' && (
          <div className="animate-fadeIn">
            <div className="font-medium">Press to Record</div>
            <div className="text-xs text-gray-400 dark:text-neutral-500 mt-1 hidden sm:block">or use Ctrl+Shift+R</div>
          </div>
        )}
        {uiState === 'recording' && (
          <div className="font-medium text-red-600 dark:text-red-400 animate-fadeIn">Recording... Click to stop</div>
        )}
        {uiState === 'processing' && (
          <div className="font-medium text-gray-600 dark:text-neutral-400 animate-fadeIn">Processing audio...</div>
        )}
        {uiState === 'complete' && (
          <div className="font-medium text-green-600 dark:text-green-400 animate-slideUp">Recording saved!</div>
        )}
        {uiState === 'error' && (
          <div className="font-medium text-red-600 dark:text-red-400 animate-fadeIn">Click to retry</div>
        )}
      </div>

      {/* Error Message */}
      {error && uiState === 'error' && (
        <div className="mt-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg w-full max-w-md mx-auto animate-slideIn">
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl">⚠️</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1 text-sm sm:text-base">Recording Error</h3>
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-400 break-words">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white text-xs sm:text-sm rounded transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audio Level Visualization (Optional) */}
      {/* TODO: Implement Web Audio API integration for real-time audio level monitoring */}
      {/* {uiState === 'recording' && (
        <div className="mt-3 sm:mt-4 w-full max-w-xs px-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-100"
              style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-center mt-1">Audio Level</div>
        </div>
      )} */}
    </div>
  );
});
