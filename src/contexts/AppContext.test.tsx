import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { 
  AppProvider, 
  useAppContext, 
  useAppState, 
  useAppDispatch,
  useRecordingStateDescription 
} from './AppContext';

describe('AppContext', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test
    localStorage.clear();
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppProvider>{children}</AppProvider>
  );

  it('provides initial state', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    expect(result.current.recordingState).toBe('idle');
    expect(result.current.currentRecording.audioBlob).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('handles START_RECORDING action', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'START_RECORDING' });
    });

    expect(result.current.state.recordingState).toBe('recording');
  });

  it('handles STOP_RECORDING action', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    const audioBlob = new Blob(['audio'], { type: 'audio/webm' });

    // First start recording to have valid state transition
    act(() => {
      result.current.dispatch({ type: 'START_RECORDING' });
    });

    act(() => {
      result.current.dispatch({
        type: 'STOP_RECORDING',
        payload: { audioBlob, duration: 120 },
      });
    });

    expect(result.current.state.recordingState).toBe('processing');
    expect(result.current.state.currentRecording.audioBlob).toBe(audioBlob);
    expect(result.current.state.currentRecording.audioDuration).toBe(120);
  });

  it('handles TRANSCRIPTION_COMPLETE action', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    const transcription = {
      text: 'Test transcription',
      language: 'en',
      duration: 120,
    };

    // Set up valid state flow: idle -> recording -> processing -> transcribing
    act(() => {
      result.current.dispatch({ type: 'START_RECORDING' });
    });

    act(() => {
      result.current.dispatch({
        type: 'STOP_RECORDING',
        payload: { audioBlob: new Blob(), duration: 120 },
      });
    });

    act(() => {
      result.current.dispatch({ type: 'START_TRANSCRIPTION' });
    });

    act(() => {
      result.current.dispatch({
        type: 'TRANSCRIPTION_COMPLETE',
        payload: transcription,
      });
    });

    expect(result.current.state.recordingState).toBe('transcribed');
    expect(result.current.state.currentRecording.transcription).toEqual(transcription);
  });

  it('handles ENRICHMENT_COMPLETE action', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    const enrichment = {
      enrichedText: 'Enriched text',
      originalText: 'Original text',
      enrichmentType: 'format' as const,
      model: 'gpt-4',
    };

    // Set up valid state flow: idle -> recording -> processing -> transcribing -> transcribed -> enriching
    act(() => {
      result.current.dispatch({ type: 'START_RECORDING' });
    });

    act(() => {
      result.current.dispatch({
        type: 'STOP_RECORDING',
        payload: { audioBlob: new Blob(), duration: 120 },
      });
    });

    act(() => {
      result.current.dispatch({ type: 'START_TRANSCRIPTION' });
    });

    act(() => {
      result.current.dispatch({
        type: 'TRANSCRIPTION_COMPLETE',
        payload: { text: 'Test', language: 'en', duration: 120 },
      });
    });

    act(() => {
      result.current.dispatch({ type: 'START_ENRICHMENT' });
    });

    act(() => {
      result.current.dispatch({
        type: 'ENRICHMENT_COMPLETE',
        payload: enrichment,
      });
    });

    expect(result.current.state.recordingState).toBe('complete');
    expect(result.current.state.currentRecording.enrichment).toEqual(enrichment);
  });

  it('handles RESET_RECORDING action', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    // Set some state first with valid transitions
    act(() => {
      result.current.dispatch({ type: 'START_RECORDING' });
    });

    act(() => {
      result.current.dispatch({
        type: 'STOP_RECORDING',
        payload: { audioBlob: new Blob(), duration: 60 },
      });
    });

    // Reset
    act(() => {
      result.current.dispatch({ type: 'RESET_RECORDING' });
    });

    expect(result.current.state.recordingState).toBe('idle');
    expect(result.current.state.currentRecording.audioBlob).toBeNull();
  });

  it('handles SELECT_RECORDING action', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.dispatch({
        type: 'SELECT_RECORDING',
        payload: 'recording-123',
      });
    });

    expect(result.current.state.selectedRecordingId).toBe('recording-123');
  });

  it('handles TOGGLE_HISTORY action', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.state.isHistoryOpen).toBe(false);

    act(() => {
      result.current.dispatch({ type: 'TOGGLE_HISTORY' });
    });

    expect(result.current.state.isHistoryOpen).toBe(true);

    act(() => {
      result.current.dispatch({ type: 'TOGGLE_HISTORY' });
    });

    expect(result.current.state.isHistoryOpen).toBe(false);
  });

  it('handles SET_ERROR action', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.dispatch({
        type: 'SET_ERROR',
        payload: { message: 'Test error', code: 'TEST_ERROR' },
      });
    });

    expect(result.current.state.recordingState).toBe('error');
    expect(result.current.state.error).toEqual({
      message: 'Test error',
      code: 'TEST_ERROR',
    });
  });

  it('handles CLEAR_ERROR action', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    // Set error first
    act(() => {
      result.current.dispatch({
        type: 'SET_ERROR',
        payload: { message: 'Test error' },
      });
    });

    // Clear error
    act(() => {
      result.current.dispatch({ type: 'CLEAR_ERROR' });
    });

    expect(result.current.state.error).toBeNull();
  });

  it('handles UPDATE_SETTINGS action', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.dispatch({
        type: 'UPDATE_SETTINGS',
        payload: { autoSave: false, defaultEnrichmentType: 'summarize' },
      });
    });

    expect(result.current.state.settings.autoSave).toBe(false);
    expect(result.current.state.settings.defaultEnrichmentType).toBe('summarize');
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      renderHook(() => useAppContext());
    }).toThrow('useAppContext must be used within an AppProvider');

    consoleSpy.mockRestore();
  });

  it('accepts custom initial state', () => {
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider initialState={{ recordingState: 'recording' }}>
        {children}
      </AppProvider>
    );

    const { result } = renderHook(() => useAppState(), { wrapper: customWrapper });

    expect(result.current.recordingState).toBe('recording');
  });

  describe('State Machine Integration', () => {
    it('provides state description', () => {
      const { result } = renderHook(() => useRecordingStateDescription(), { wrapper });

      expect(result.current).toBe('Ready to record');
    });

    it('validates state transitions and sets error state on invalid transition', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Try invalid transition: idle -> transcribing (should be rejected)
      act(() => {
        result.current.dispatch({ type: 'START_TRANSCRIPTION' });
      });

      // State should transition to error
      expect(result.current.state.recordingState).toBe('error');
      expect(result.current.state.error).toBeTruthy();
      expect(result.current.state.error?.code).toBe('STATE_TRANSITION_ERROR');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('State transition error'),
        expect.stringContaining('START_TRANSCRIPTION'),
        expect.stringContaining('idle')
      );

      consoleErrorSpy.mockRestore();
    });

    it('allows valid state transitions', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      // Valid transition: idle -> recording
      act(() => {
        result.current.dispatch({ type: 'START_RECORDING' });
      });

      expect(result.current.state.recordingState).toBe('recording');

      // Valid transition: recording -> processing
      act(() => {
        result.current.dispatch({
          type: 'STOP_RECORDING',
          payload: { audioBlob: new Blob(), duration: 60 },
        });
      });

      expect(result.current.state.recordingState).toBe('processing');
    });

    it('allows error transition from any state', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      // Start recording
      act(() => {
        result.current.dispatch({ type: 'START_RECORDING' });
      });

      // Error can happen from recording state
      act(() => {
        result.current.dispatch({
          type: 'SET_ERROR',
          payload: { message: 'Test error' },
        });
      });

      expect(result.current.state.recordingState).toBe('error');
    });

    it('allows reset to idle from most states', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      // Go to recording state
      act(() => {
        result.current.dispatch({ type: 'START_RECORDING' });
      });

      // Reset to idle
      act(() => {
        result.current.dispatch({ type: 'RESET_RECORDING' });
      });

      expect(result.current.state.recordingState).toBe('idle');
    });
  });
});
