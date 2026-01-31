/**
 * Hotkey Presets
 * Predefined hotkey configurations for common use cases
 */

import type { HotkeyPreset } from './types';
import { DEFAULT_HOTKEY_IDS } from './types';

/**
 * Default hotkey preset
 */
export const defaultPreset: HotkeyPreset = {
  name: 'Default',
  description: 'Standard hotkey configuration',
  hotkeys: {
    [DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING]: {
      key: ' ',
      modifiers: ['ctrl', 'shift'],
      description: 'Toggle recording on/off',
      enabled: true,
      global: true,
    },
    [DEFAULT_HOTKEY_IDS.STOP_RECORDING]: {
      key: 'escape',
      modifiers: ['ctrl'],
      description: 'Stop recording',
      enabled: true,
      global: false,
    },
    [DEFAULT_HOTKEY_IDS.SHOW_HISTORY]: {
      key: 'h',
      modifiers: ['ctrl', 'shift'],
      description: 'Show recording history',
      enabled: true,
      global: false,
    },
  },
};

/**
 * Minimal hotkey preset (fewer conflicts)
 */
export const minimalPreset: HotkeyPreset = {
  name: 'Minimal',
  description: 'Minimal hotkeys to avoid conflicts',
  hotkeys: {
    [DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING]: {
      key: 'r',
      modifiers: ['ctrl', 'shift', 'alt'],
      description: 'Toggle recording on/off',
      enabled: true,
      global: true,
    },
  },
};

/**
 * Mac-friendly preset
 */
export const macPreset: HotkeyPreset = {
  name: 'Mac',
  description: 'Mac-optimized hotkeys using Command key',
  hotkeys: {
    [DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING]: {
      key: ' ',
      modifiers: ['meta', 'shift'],
      description: 'Toggle recording on/off',
      enabled: true,
      global: true,
    },
    [DEFAULT_HOTKEY_IDS.STOP_RECORDING]: {
      key: 'escape',
      modifiers: ['meta'],
      description: 'Stop recording',
      enabled: true,
      global: false,
    },
    [DEFAULT_HOTKEY_IDS.SHOW_HISTORY]: {
      key: 'h',
      modifiers: ['meta', 'shift'],
      description: 'Show recording history',
      enabled: true,
      global: false,
    },
  },
};

/**
 * Gaming-friendly preset (avoids common game hotkeys)
 */
export const gamingPreset: HotkeyPreset = {
  name: 'Gaming',
  description: 'Avoids common gaming hotkeys',
  hotkeys: {
    [DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING]: {
      key: 'f9',
      modifiers: [],
      description: 'Toggle recording on/off',
      enabled: true,
      global: true,
    },
    [DEFAULT_HOTKEY_IDS.STOP_RECORDING]: {
      key: 'f10',
      modifiers: [],
      description: 'Stop recording',
      enabled: true,
      global: true,
    },
  },
};

/**
 * All available presets
 */
export const hotkeyPresets: HotkeyPreset[] = [
  defaultPreset,
  minimalPreset,
  macPreset,
  gamingPreset,
];

/**
 * Get preset by name
 */
export function getPresetByName(name: string): HotkeyPreset | undefined {
  return hotkeyPresets.find((p) => p.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get default preset for current platform
 */
export function getDefaultPresetForPlatform(): HotkeyPreset {
  if (typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)) {
    return macPreset;
  }
  return defaultPreset;
}
