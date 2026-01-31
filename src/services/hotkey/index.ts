/**
 * Hotkey Service
 * Public API for hotkey management
 */

export { HotkeyService, hotkeyService } from './HotkeyService';
export { HotkeyConfigService, hotkeyConfigService } from './HotkeyConfigService';
export { hotkeyPresets, getPresetByName, getDefaultPresetForPlatform } from './presets';
export { DEFAULT_HOTKEY_IDS } from './types';
export type {
  HotkeyConfig,
  HotkeyCallback,
  HotkeyRegistration,
  HotkeyConflict,
  HotkeyValidationResult,
  HotkeyPreset,
  PlatformHotkeyInfo,
  ModifierKey,
  IHotkeyService,
} from './types';
export type { HotkeyConfigData } from './HotkeyConfigService';
