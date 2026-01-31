'use client';

import React from 'react';
import { useEffect, useState } from 'react';

export type TranscriptionStage = 'loading_model' | 'processing_audio' | 'finalizing' | 'complete' | 'idle';

export interface TranscriptionStatusProps {
  stage: TranscriptionStage;
  progress?: number; // 0.0 to 1.0
  onCancel?: () => void;
  className?: string;
}

/**
 * TranscriptionStatus Component
 * 
 * Displays the current status of transcription with visual feedback
 * Shows stages: "Loading model", "Processing audio", "Finalizing"
 * Includes a cancel button during processing
 * 
 * Requirements: 9.5, 5.3
 */
export function TranscriptionStatus({
  stage,
  progress = 0,
  onCancel,
  className = '',
}: TranscriptionStatusProps) {
  const [displayProgress, setDisplayProgress] = useState(progress);

  // Smooth progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        const diff = progress - prev;
        if (Math.abs(diff) < 0.01) return progress;
        return prev + diff * 0.1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [progress]);

  // Don't render if idle
  if (stage === 'idle') {
    return null;
  }

  const getStageInfo = () => {
    switch (stage) {
      case 'loading_model':
        return {
          label: 'Loading model',
          icon: '📥',
          description: 'Preparing Whisper model...',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
        };
      case 'processing_audio':
        return {
          label: 'Processing audio',
          icon: '🎵',
          description: 'Transcribing your recording...',
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-800',
        };
      case 'finalizing':
        return {
          label: 'Finalizing',
          icon: '✨',
          description: 'Almost done...',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
        };
      case 'complete':
        return {
          label: 'Complete',
          icon: '✓',
          description: 'Transcription finished!',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
        };
      default:
        return {
          label: 'Processing',
          icon: '⏳',
          description: 'Working...',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
        };
    }
  };

  const stageInfo = getStageInfo();
  const isProcessing = stage !== 'complete';
  const progressPercentage = Math.round(displayProgress * 100);

  return (
    <div
      className={`
        ${stageInfo.bgColor} ${stageInfo.borderColor}
        border rounded-lg p-4 shadow-sm
        transition-all duration-300 ease-in-out
        animate-fadeIn
        ${className}
      `}
      role="status"
      aria-live="polite"
      aria-label={`Transcription status: ${stageInfo.label}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 text-2xl animate-pulse">
          {stageInfo.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Stage label */}
          <div className={`font-semibold ${stageInfo.color} mb-1`}>
            {stageInfo.label}
          </div>

          {/* Description */}
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {stageInfo.description}
          </div>

          {/* Progress bar */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stageInfo.color.replace('text-', 'bg-')} transition-all duration-300 ease-out`}
                  style={{ width: `${progressPercentage}%` }}
                  role="progressbar"
                  aria-valuenow={progressPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                {progressPercentage}%
              </div>
            </div>
          )}
        </div>

        {/* Cancel button */}
        {isProcessing && onCancel && (
          <button
            onClick={onCancel}
            className="
              flex-shrink-0 px-3 py-1.5 
              text-sm font-medium
              text-red-600 dark:text-red-400
              hover:text-red-700 dark:hover:text-red-300
              hover:bg-red-100 dark:hover:bg-red-900/30
              rounded transition-colors
              border border-red-300 dark:border-red-700
            "
            aria-label="Cancel transcription"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * TranscriptionStatusIndicator - Compact version for inline display
 */
export interface TranscriptionStatusIndicatorProps {
  stage: TranscriptionStage;
  className?: string;
}

export function TranscriptionStatusIndicator({
  stage,
  className = '',
}: TranscriptionStatusIndicatorProps) {
  if (stage === 'idle') {
    return null;
  }

  const getStageLabel = () => {
    switch (stage) {
      case 'loading_model':
        return 'Loading model...';
      case 'processing_audio':
        return 'Processing...';
      case 'finalizing':
        return 'Finalizing...';
      case 'complete':
        return 'Complete';
      default:
        return 'Processing...';
    }
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1.5
        bg-blue-50 dark:bg-blue-900/20
        border border-blue-200 dark:border-blue-800
        rounded-full text-sm
        ${className}
      `}
      role="status"
      aria-label={getStageLabel()}
    >
      {stage !== 'complete' && (
        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      )}
      {stage === 'complete' && (
        <span className="text-green-600 dark:text-green-400">✓</span>
      )}
      <span className="text-blue-700 dark:text-blue-300 font-medium">
        {getStageLabel()}
      </span>
    </div>
  );
}
