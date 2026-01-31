import type { TranscriptionSettings } from './types';

const SETTINGS_KEY = 'transcription-settings';
const STORAGE_DIRECTORY_KEY = 'models-storage-directory';

const DEFAULT_SETTINGS: TranscriptionSettings = {
  method: 'api',
  localModelVariant: 'small',
  enableFallback: true,
};

/**
 * Save transcription settings to localStorage
 */
export async function saveSettings(settings: TranscriptionSettings): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  } catch (error) {
    console.error('Failed to save transcription settings:', error);
    throw new Error('Failed to save settings');
  }
}

/**
 * Load transcription settings from localStorage
 * Returns default settings if none are saved
 */
export async function loadSettings(): Promise<TranscriptionSettings> {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to load transcription settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Reset transcription settings to defaults
 */
export async function resetSettings(): Promise<TranscriptionSettings> {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SETTINGS_KEY);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to reset transcription settings:', error);
    throw new Error('Failed to reset settings');
  }
}

/**
 * Update the storage directory for model files
 * Validates the directory path before saving
 */
export async function updateStorageDirectory(directory: string): Promise<void> {
  // Validate directory path
  if (!directory || directory.trim() === '') {
    throw new Error('Invalid directory path: path cannot be empty');
  }

  // Basic path validation - check for invalid characters
  const invalidChars = /[<>"|?*]/;
  if (invalidChars.test(directory)) {
    throw new Error('Invalid directory path: contains invalid characters');
  }

  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_DIRECTORY_KEY, directory);
    }
  } catch (error) {
    console.error('Failed to update storage directory:', error);
    throw new Error('Failed to update storage directory');
  }
}

/**
 * Get the configured storage directory for model files
 * Returns null if no custom directory is configured
 */
export async function getStorageDirectory(): Promise<string | null> {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_DIRECTORY_KEY);
    }
    return null;
  } catch (error) {
    console.error('Failed to get storage directory:', error);
    return null;
  }
}

/**
 * Get the default settings
 */
export function getDefaultSettings(): TranscriptionSettings {
  return { ...DEFAULT_SETTINGS };
}
