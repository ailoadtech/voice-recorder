'use client';

import { useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { AppState } from '@/contexts/AppContext';
import type { ExportFormat } from '@/services/export/types';

/**
 * Hook for managing application settings
 */
export function useSettings() {
  const { state, dispatch } = useAppContext();

  const updateSettings = useCallback((updates: Partial<AppState['settings']>) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: updates,
    });
  }, [dispatch]);

  const setAutoSave = useCallback((enabled: boolean) => {
    updateSettings({ autoSave: enabled });
  }, [updateSettings]);

  const setDefaultEnrichmentType = useCallback((type: string) => {
    updateSettings({ defaultEnrichmentType: type });
  }, [updateSettings]);

  const updateExportSettings = useCallback((updates: Partial<AppState['settings']['exportSettings']>) => {
    updateSettings({
      exportSettings: {
        ...state.settings.exportSettings,
        ...updates,
      },
    });
  }, [updateSettings, state.settings.exportSettings]);

  const setDefaultExportFormat = useCallback((format: ExportFormat) => {
    updateExportSettings({ defaultFormat: format });
  }, [updateExportSettings]);

  return {
    // State
    settings: state.settings,
    exportSettings: state.settings.exportSettings,
    
    // Actions
    updateSettings,
    setAutoSave,
    setDefaultEnrichmentType,
    updateExportSettings,
    setDefaultExportFormat,
  };
}
