'use client';

import { useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { TranscriptionResult } from '@/services/transcription/types';
import type { EnrichmentResult } from '@/services/llm/types';

/**
 * Hook for managing recording workflow
 */
export function useRecording() {
  const { state, dispatch } = useAppContext();

  const startRecording = useCallback(() => {
    dispatch({ type: 'START_RECORDING' });
  }, [dispatch]);

  const stopRecording = useCallback((audioBlob: Blob, duration: number) => {
    dispatch({
      type: 'STOP_RECORDING',
      payload: { audioBlob, duration },
    });
  }, [dispatch]);

  const startTranscription = useCallback(() => {
    dispatch({ type: 'START_TRANSCRIPTION' });
  }, [dispatch]);

  const completeTranscription = useCallback((result: TranscriptionResult) => {
    dispatch({
      type: 'TRANSCRIPTION_COMPLETE',
      payload: result,
    });
  }, [dispatch]);

  const startEnrichment = useCallback(() => {
    dispatch({ type: 'START_ENRICHMENT' });
  }, [dispatch]);

  const completeEnrichment = useCallback((result: EnrichmentResult) => {
    dispatch({
      type: 'ENRICHMENT_COMPLETE',
      payload: result,
    });
  }, [dispatch]);

  const completeRecording = useCallback(() => {
    dispatch({ type: 'RECORDING_COMPLETE' });
  }, [dispatch]);

  const resetRecording = useCallback(() => {
    dispatch({ type: 'RESET_RECORDING' });
  }, [dispatch]);

  const setError = useCallback((message: string, code?: string) => {
    dispatch({
      type: 'SET_ERROR',
      payload: { message, code },
    });
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, [dispatch]);

  return {
    // State
    recordingState: state.recordingState,
    currentRecording: state.currentRecording,
    error: state.error,
    
    // Actions
    startRecording,
    stopRecording,
    startTranscription,
    completeTranscription,
    startEnrichment,
    completeEnrichment,
    completeRecording,
    resetRecording,
    setError,
    clearError,
    
    // Computed values
    isRecording: state.recordingState === 'recording',
    isProcessing: ['processing', 'transcribing', 'enriching'].includes(state.recordingState),
    isComplete: state.recordingState === 'complete',
    hasError: state.recordingState === 'error',
    hasAudio: state.currentRecording.audioBlob !== null,
    hasTranscription: state.currentRecording.transcription !== null,
    hasEnrichment: state.currentRecording.enrichment !== null,
  };
}
