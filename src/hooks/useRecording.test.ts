import { renderHook, act } from '@testing-library/react';
import { AppProvider } from '@/contexts/AppContext';
import { useRecording } from './useRecording';
import React from 'react';

describe('useRecording', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppProvider>{children}</AppProvider>
  );

  it('provides initial recording state', () => {
    const { result } = renderHook(() => useRecording(), { wrapper });

    expect(result.current.recordingState).toBe('idle');
    expect(result.current.isRecording).toBe(false);
    expect(result.current.hasAudio).toBe(false);
  });

  it('starts recording', () => {
    const { result } = renderHook(() => useRecording(), { wrapper });

    act(() => {
      result.current.startRecording();
    });

    expect(result.current.recordingState).toBe('recording');
    expect(result.current.isRecording).toBe(true);
  });

  it('stops recording with audio', () => {
    const { result } = renderHook(() => useRecording(), { wrapper });
    const audioBlob = new Blob(['audio'], { type: 'audio/webm' });

    act(() => {
      result.current.stopRecording(audioBlob, 120);
    });

    expect(result.current.recordingState).toBe('processing');
    expect(result.current.hasAudio).toBe(true);
    expect(result.current.currentRecording.audioBlob).toBe(audioBlob);
  });

  it('completes transcription', () => {
    const { result } = renderHook(() => useRecording(), { wrapper });
    const transcription = {
      text: 'Test',
      language: 'en',
      duration: 120,
    };

    act(() => {
      result.current.completeTranscription(transcription);
    });

    expect(result.current.recordingState).toBe('transcribed');
    expect(result.current.hasTranscription).toBe(true);
  });

  it('completes enrichment', () => {
    const { result } = renderHook(() => useRecording(), { wrapper });
    const enrichment = {
      enrichedText: 'Enriched',
      originalText: 'Original',
      enrichmentType: 'format' as const,
      model: 'gpt-4',
    };

    act(() => {
      result.current.completeEnrichment(enrichment);
    });

    expect(result.current.recordingState).toBe('complete');
    expect(result.current.hasEnrichment).toBe(true);
    expect(result.current.isComplete).toBe(true);
  });

  it('resets recording', () => {
    const { result } = renderHook(() => useRecording(), { wrapper });

    // Set some state
    act(() => {
      result.current.stopRecording(new Blob(), 60);
    });

    // Reset
    act(() => {
      result.current.resetRecording();
    });

    expect(result.current.recordingState).toBe('idle');
    expect(result.current.hasAudio).toBe(false);
  });

  it('sets and clears error', () => {
    const { result } = renderHook(() => useRecording(), { wrapper });

    act(() => {
      result.current.setError('Test error', 'TEST_CODE');
    });

    expect(result.current.hasError).toBe(true);
    expect(result.current.error?.message).toBe('Test error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('computes isProcessing correctly', () => {
    const { result } = renderHook(() => useRecording(), { wrapper });

    act(() => {
      result.current.startTranscription();
    });

    expect(result.current.isProcessing).toBe(true);
  });
});
