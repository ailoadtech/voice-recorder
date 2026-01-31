'use client';

import { useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';

/**
 * Hook for managing history UI state
 */
export function useHistory() {
  const { state, dispatch } = useAppContext();

  const selectRecording = useCallback((id: string | null) => {
    dispatch({
      type: 'SELECT_RECORDING',
      payload: id,
    });
  }, [dispatch]);

  const toggleHistory = useCallback(() => {
    dispatch({ type: 'TOGGLE_HISTORY' });
  }, [dispatch]);

  const openHistory = useCallback(() => {
    dispatch({ type: 'SET_HISTORY_OPEN', payload: true });
  }, [dispatch]);

  const closeHistory = useCallback(() => {
    dispatch({ type: 'SET_HISTORY_OPEN', payload: false });
  }, [dispatch]);

  return {
    // State
    selectedRecordingId: state.selectedRecordingId,
    isHistoryOpen: state.isHistoryOpen,
    
    // Actions
    selectRecording,
    toggleHistory,
    openHistory,
    closeHistory,
  };
}
