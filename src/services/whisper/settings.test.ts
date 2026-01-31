/**
 * Tests for settings persistence layer
 * Task 6: Create settings persistence layer
 */

import {
  saveSettings,
  loadSettings,
  resetSettings,
  updateStorageDirectory,
  getStorageDirectory,
  getDefaultSettings,
} from './settings';
import type { TranscriptionSettings } from './types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Settings Persistence Layer', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('saveSettings and loadSettings (Task 6.2)', () => {
    it('should save and load settings correctly (Requirements 3.4, 3.5, 8.1, 8.2)', async () => {
      const settings: TranscriptionSettings = {
        method: 'local',
        localModelVariant: 'tiny',
        enableFallback: false,
        apiKey: 'test-key',
      };

      await saveSettings(settings);
      const loaded = await loadSettings();

      expect(loaded).toEqual(settings);
    });

    it('should return default settings when no settings are saved', async () => {
      const loaded = await loadSettings();
      const defaults = getDefaultSettings();

      expect(loaded).toEqual(defaults);
      expect(loaded.method).toBe('api');
      expect(loaded.enableFallback).toBe(true);
    });

    it('should merge saved settings with defaults', async () => {
      const partialSettings = {
        method: 'local' as const,
        localModelVariant: 'medium' as const,
        enableFallback: true,
      };

      localStorageMock.setItem('transcription-settings', JSON.stringify(partialSettings));
      const loaded = await loadSettings();

      expect(loaded.method).toBe('local');
      expect(loaded.localModelVariant).toBe('medium');
      expect(loaded.enableFallback).toBe(true);
    });

    it('should handle save errors gracefully', async () => {
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = () => {
        throw new Error('Storage full');
      };

      const settings: TranscriptionSettings = {
        method: 'local',
        localModelVariant: 'tiny',
        enableFallback: true,
      };

      await expect(saveSettings(settings)).rejects.toThrow('Failed to save settings');

      localStorageMock.setItem = originalSetItem;
    });

    it('should handle load errors by returning defaults', async () => {
      localStorageMock.setItem('transcription-settings', 'invalid-json');
      
      const loaded = await loadSettings();
      const defaults = getDefaultSettings();

      expect(loaded).toEqual(defaults);
    });
  });

  describe('resetSettings (Task 6.2)', () => {
    it('should reset settings to defaults (Requirement 8.4)', async () => {
      const customSettings: TranscriptionSettings = {
        method: 'local',
        localModelVariant: 'large',
        enableFallback: false,
        apiKey: 'custom-key',
      };

      await saveSettings(customSettings);
      const reset = await resetSettings();
      const defaults = getDefaultSettings();

      expect(reset).toEqual(defaults);
      
      const loaded = await loadSettings();
      expect(loaded).toEqual(defaults);
    });

    it('should handle reset errors gracefully', async () => {
      const originalRemoveItem = localStorageMock.removeItem;
      localStorageMock.removeItem = () => {
        throw new Error('Cannot remove');
      };

      await expect(resetSettings()).rejects.toThrow('Failed to reset settings');

      localStorageMock.removeItem = originalRemoveItem;
    });
  });

  describe('Storage Directory Configuration (Task 6.5)', () => {
    it('should update and retrieve storage directory (Requirement 8.5)', async () => {
      const directory = '/path/to/models';

      await updateStorageDirectory(directory);
      const retrieved = await getStorageDirectory();

      expect(retrieved).toBe(directory);
    });

    it('should validate directory path is not empty', async () => {
      await expect(updateStorageDirectory('')).rejects.toThrow('Invalid directory path: path cannot be empty');
      await expect(updateStorageDirectory('   ')).rejects.toThrow('Invalid directory path: path cannot be empty');
    });

    it('should validate directory path does not contain invalid characters', async () => {
      const invalidPaths = [
        '/path/with<bracket',
        '/path/with>bracket',
        '/path/with"quote',
        '/path/with|pipe',
        '/path/with?question',
        '/path/with*asterisk',
      ];

      for (const path of invalidPaths) {
        await expect(updateStorageDirectory(path)).rejects.toThrow('Invalid directory path: contains invalid characters');
      }
    });

    it('should return null when no storage directory is configured', async () => {
      const retrieved = await getStorageDirectory();
      expect(retrieved).toBeNull();
    });

    it('should handle update errors gracefully', async () => {
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = () => {
        throw new Error('Storage full');
      };

      await expect(updateStorageDirectory('/valid/path')).rejects.toThrow('Failed to update storage directory');

      localStorageMock.setItem = originalSetItem;
    });

    it('should handle retrieval errors by returning null', async () => {
      const originalGetItem = localStorageMock.getItem;
      localStorageMock.getItem = () => {
        throw new Error('Cannot read');
      };

      const retrieved = await getStorageDirectory();
      expect(retrieved).toBeNull();

      localStorageMock.getItem = originalGetItem;
    });
  });

  describe('Default Settings (Task 6.1)', () => {
    it('should have correct default values (Requirement 8.3)', () => {
      const defaults = getDefaultSettings();

      expect(defaults.method).toBe('api');
      expect(defaults.localModelVariant).toBe('small');
      expect(defaults.enableFallback).toBe(true);
      expect(defaults.apiKey).toBeUndefined();
      expect(defaults.modelsStorageDirectory).toBeUndefined();
    });

    it('should return a new object each time to prevent mutation', () => {
      const defaults1 = getDefaultSettings();
      const defaults2 = getDefaultSettings();

      expect(defaults1).toEqual(defaults2);
      expect(defaults1).not.toBe(defaults2);
    });
  });
});
