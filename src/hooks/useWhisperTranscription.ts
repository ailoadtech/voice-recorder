'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getEnhancedTranscriptionService,
  type TranscriptionSettings,
  type TranscriptionResult,
  loadSettings,
  saveSettings,
} from '@/services/whisper';

export function useWhisperTranscription() {
  const [settings, setSettings] = useState<TranscriptionSettings | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load settings on mount
    loadSettings().then(setSettings);

    // Listen for fallback events
    const handleFallback = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.warn('Transcription fallback occurred:', customEvent.detail);
      
      // You could show a notification here
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('notification', {
            detail: {
              type: 'warning',
              message: `Local transcription failed: ${customEvent.detail.reason}. Using API fallback.`,
            },
          })
        );
      }
    };

    window.addEventListener('transcription-fallback', handleFallback);

    return () => {
      window.removeEventListener('transcription-fallback', handleFallback);
    };
  }, []);

  const updateSettings = useCallback(
    async (newSettings: Partial<TranscriptionSettings>) => {
      if (!settings) return;

      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      await saveSettings(updated);

      // Update the service
      const service = getEnhancedTranscriptionService(updated);
    },
    [settings]
  );

  const transcribe = useCallback(
    async (audio: AudioBuffer): Promise<TranscriptionResult> => {
      if (!settings) {
        throw new Error('Settings not loaded');
      }

      setIsTranscribing(true);
      setError(null);

      try {
        const service = getEnhancedTranscriptionService(settings);
        const result = await service.transcribe(audio);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Transcription failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsTranscribing(false);
      }
    },
    [settings]
  );

  const checkProviderAvailability = useCallback(
    async (provider: 'api' | 'local'): Promise<boolean> => {
      if (!settings) return false;

      try {
        const service = getEnhancedTranscriptionService(settings);
        return await service.isProviderAvailable(provider);
      } catch {
        return false;
      }
    },
    [settings]
  );

  return {
    settings,
    updateSettings,
    transcribe,
    isTranscribing,
    error,
    checkProviderAvailability,
  };
}
