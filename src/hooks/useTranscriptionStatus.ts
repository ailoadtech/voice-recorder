'use client';

import { useState, useCallback, useRef } from 'react';
import type { TranscriptionProgress } from '@/services/whisper/types';
import type { TranscriptionStage } from '@/components/TranscriptionStatus';

export interface UseTranscriptionStatusReturn {
  stage: TranscriptionStage;
  progress: number;
  isTranscribing: boolean;
  startTranscription: () => void;
  handleProgress: (progress: TranscriptionProgress) => void;
  completeTranscription: () => void;
  cancelTranscription: () => void;
  resetStatus: () => void;
}

/**
 * Hook for managing transcription status display
 * Tracks the current stage and progress of transcription
 * 
 * Requirements: 9.5, 5.3
 */
export function useTranscriptionStatus(): UseTranscriptionStatusReturn {
  const [stage, setStage] = useState<TranscriptionStage>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const cancelledRef = useRef(false);

  const startTranscription = useCallback(() => {
    setStage('loading_model');
    setProgress(0);
    setIsTranscribing(true);
    cancelledRef.current = false;
  }, []);

  const handleProgress = useCallback((progressData: TranscriptionProgress) => {
    if (cancelledRef.current) return;

    // Map the stage from the progress data
    const stageMap: Record<string, TranscriptionStage> = {
      loading_model: 'loading_model',
      processing_audio: 'processing_audio',
      finalizing: 'finalizing',
      complete: 'complete',
    };

    const newStage = stageMap[progressData.stage] || 'processing_audio';
    setStage(newStage);
    setProgress(progressData.progress);

    if (newStage === 'complete') {
      setIsTranscribing(false);
    }
  }, []);

  const completeTranscription = useCallback(() => {
    if (cancelledRef.current) return;

    setStage('complete');
    setProgress(1.0);
    setIsTranscribing(false);

    // Auto-reset after a delay
    setTimeout(() => {
      if (!cancelledRef.current) {
        setStage('idle');
        setProgress(0);
      }
    }, 2000);
  }, []);

  const cancelTranscription = useCallback(() => {
    cancelledRef.current = true;
    setStage('idle');
    setProgress(0);
    setIsTranscribing(false);
  }, []);

  const resetStatus = useCallback(() => {
    cancelledRef.current = false;
    setStage('idle');
    setProgress(0);
    setIsTranscribing(false);
  }, []);

  return {
    stage,
    progress,
    isTranscribing,
    startTranscription,
    handleProgress,
    completeTranscription,
    cancelTranscription,
    resetStatus,
  };
}
