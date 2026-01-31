/**
 * Hotkey Configuration Service Tests
 */

import { HotkeyConfigService } from './HotkeyConfigService';
import { DEFAULT_HOTKEY_IDS } from './types';

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

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('HotkeyConfigService', () => {
  let service: HotkeyConfigService;

  beforeEach(() => {
    localStorageMock.clear();
    service = new HotkeyConfigService();
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      const config = service.getConfig();
      expect(config.version).toBe(1);
      expect(config.customHotkeys).toEqual({});
      expect(config.activePreset).toBeDefined();
    });

    it('should load config from storage', async () => {
      const testConfig = {
        version: 1,
        activePreset: 'Default',
        customHotkeys: {},
        lastUpdated: new Date().toISOString(),
      };
      localStorageMock.setItem('hotkey-config', JSON.stringify(testConfig));

      await service.initialize();
      const config = service.getConfig();
      expect(config.activePreset).toBe('Default');
    });
  });

  describe('hotkey management', () => {
    it('should get hotkey from preset', () => {
      const hotkey = service.getHotkey(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING);
      expect(hotkey).toBeDefined();
      expect(hotkey?.id).toBe(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING);
    });

    it('should set custom hotkey', async () => {
      await service.setHotkey(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING, {
        key: 'r',
        modifiers: ['ctrl', 'alt'],
        description: 'Custom toggle',
        enabled: true,
        global: true,
      });

      const hotkey = service.getHotkey(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING);
      expect(hotkey?.modifiers).toEqual(['ctrl', 'alt']);
      expect(service.isCustomized(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING)).toBe(true);
    });

    it('should remove custom hotkey', async () => {
      await service.setHotkey(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING, {
        key: 'r',
        modifiers: ['ctrl', 'alt'],
        description: 'Custom toggle',
        enabled: true,
      });

      await service.removeCustomHotkey(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING);
      expect(service.isCustomized(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING)).toBe(false);
    });

    it('should get all hotkeys', () => {
      const hotkeys = service.getAllHotkeys();
      expect(Object.keys(hotkeys).length).toBeGreaterThan(0);
    });
  });

  describe('preset management', () => {
    it('should get active preset', () => {
      const preset = service.getActivePreset();
      expect(preset).toBeDefined();
      expect(preset?.name).toBeDefined();
    });

    it('should set active preset', async () => {
      await service.setActivePreset('Minimal');
      const preset = service.getActivePreset();
      expect(preset?.name).toBe('Minimal');
    });

    it('should throw error for invalid preset', async () => {
      await expect(service.setActivePreset('NonExistent')).rejects.toThrow();
    });

    it('should get available presets', () => {
      const presets = service.getAvailablePresets();
      expect(presets.length).toBeGreaterThan(0);
      expect(presets[0].name).toBeDefined();
    });

    it('should clear custom hotkeys when switching presets', async () => {
      await service.setHotkey(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING, {
        key: 'r',
        modifiers: ['ctrl', 'alt'],
        description: 'Custom',
        enabled: true,
      });

      await service.setActivePreset('Minimal');
      expect(service.isCustomized(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING)).toBe(false);
    });
  });

  describe('enable/disable', () => {
    it('should enable/disable hotkey', async () => {
      await service.setHotkeyEnabled(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING, false);
      const hotkey = service.getHotkey(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING);
      expect(hotkey?.enabled).toBe(false);

      await service.setHotkeyEnabled(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING, true);
      const enabledHotkey = service.getHotkey(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING);
      expect(enabledHotkey?.enabled).toBe(true);
    });
  });

  describe('import/export', () => {
    it('should export config', () => {
      const exported = service.exportConfig();
      expect(exported).toBeDefined();
      const parsed = JSON.parse(exported);
      expect(parsed.version).toBe(1);
    });

    it('should import valid config', async () => {
      const config = {
        version: 1,
        activePreset: 'Minimal',
        customHotkeys: {},
        lastUpdated: new Date().toISOString(),
      };

      await service.importConfig(JSON.stringify(config));
      const imported = service.getConfig();
      expect(imported.activePreset).toBe('Minimal');
    });

    it('should reject invalid config', async () => {
      await expect(service.importConfig('invalid json')).rejects.toThrow();
    });
  });

  describe('reset and clear', () => {
    it('should reset to defaults', async () => {
      await service.setHotkey(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING, {
        key: 'r',
        modifiers: ['ctrl', 'alt'],
        description: 'Custom',
        enabled: true,
      });

      await service.resetToDefaults();
      expect(service.isCustomized(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING)).toBe(false);
    });

    it('should clear config', async () => {
      await service.setHotkey(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING, {
        key: 'r',
        modifiers: ['ctrl', 'alt'],
        description: 'Custom',
        enabled: true,
      });

      await service.clearConfig();
      const config = service.getConfig();
      expect(Object.keys(config.customHotkeys).length).toBe(0);
    });
  });

  describe('statistics', () => {
    it('should get stats', () => {
      const stats = service.getStats();
      expect(stats.totalHotkeys).toBeGreaterThan(0);
      expect(stats.customizedHotkeys).toBe(0);
      expect(stats.activePreset).toBeDefined();
      expect(stats.lastUpdated).toBeDefined();
    });

    it('should update stats after customization', async () => {
      await service.setHotkey(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING, {
        key: 'r',
        modifiers: ['ctrl', 'alt'],
        description: 'Custom',
        enabled: true,
      });

      const stats = service.getStats();
      expect(stats.customizedHotkeys).toBe(1);
    });
  });

  describe('persistence', () => {
    it('should persist config to localStorage', async () => {
      await service.setHotkey(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING, {
        key: 'r',
        modifiers: ['ctrl', 'alt'],
        description: 'Custom',
        enabled: true,
      });

      const stored = localStorageMock.getItem('hotkey-config');
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!);
      expect(parsed.customHotkeys[DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING]).toBeDefined();
    });

    it('should load persisted config', async () => {
      const config = {
        version: 1,
        activePreset: 'Gaming',
        customHotkeys: {
          [DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING]: {
            id: DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING,
            key: 'f9',
            modifiers: [],
            description: 'Toggle',
            enabled: true,
          },
        },
        lastUpdated: new Date().toISOString(),
      };
      localStorageMock.setItem('hotkey-config', JSON.stringify(config));

      const newService = new HotkeyConfigService();
      await newService.initialize();
      
      const preset = newService.getActivePreset();
      expect(preset?.name).toBe('Gaming');
      expect(newService.isCustomized(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING)).toBe(true);
    });
  });
});
