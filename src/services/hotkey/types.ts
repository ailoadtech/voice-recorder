/**
 * Hotkey Service Types
 * Defines types for global hotkey management
 */

/**
 * Modifier keys
 */
export type ModifierKey = 'ctrl' | 'shift' | 'alt' | 'meta';

/**
 * Hotkey configuration
 */
export interface HotkeyConfig {
  id: string;
  key: string;
  modifiers: ModifierKey[];
  description: string;
  enabled: boolean;
  global?: boolean; // Whether it works when app is not focused (Tauri only)
}

/**
 * Hotkey callback function
 */
export type HotkeyCallback = (event: KeyboardEvent) => void | Promise<void>;

/**
 * Hotkey registration
 */
export interface HotkeyRegistration {
  config: HotkeyConfig;
  callback: HotkeyCallback;
}

/**
 * Hotkey conflict
 */
export interface HotkeyConflict {
  hotkeyId: string;
  conflictsWith: string[];
  reason: string;
  severity: 'warning' | 'error';
  systemLevel?: boolean; // True if conflict is with system-level hotkey
}

/**
 * Conflict resolution strategy
 */
export type ConflictResolutionStrategy = 
  | 'disable-existing' // Disable the existing conflicting hotkey
  | 'disable-new' // Don't register the new hotkey
  | 'allow-both' // Allow both (may cause issues)
  | 'prompt-user'; // Ask user to decide

/**
 * Conflict resolution result
 */
export interface ConflictResolutionResult {
  resolved: boolean;
  strategy: ConflictResolutionStrategy;
  disabledHotkeys: string[];
  message: string;
}

/**
 * Hotkey validation result
 */
export interface HotkeyValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  conflicts: HotkeyConflict[];
}

/**
 * Hotkey preset
 */
export interface HotkeyPreset {
  name: string;
  description: string;
  hotkeys: Record<string, Omit<HotkeyConfig, 'id'>>;
}

/**
 * Platform-specific hotkey info
 */
export interface PlatformHotkeyInfo {
  platform: 'windows' | 'macos' | 'linux' | 'browser';
  supportsGlobalHotkeys: boolean;
  reservedKeys: string[];
  modifierKeyNames: Record<ModifierKey, string>;
}

/**
 * Hotkey service interface
 */
export interface IHotkeyService {
  /**
   * Register a hotkey
   */
  register(config: HotkeyConfig, callback: HotkeyCallback): Promise<void>;

  /**
   * Unregister a hotkey
   */
  unregister(id: string): Promise<void>;

  /**
   * Update hotkey configuration
   */
  updateConfig(id: string, config: Partial<HotkeyConfig>): void;

  /**
   * Get all registered hotkeys
   */
  getRegistrations(): HotkeyRegistration[];

  /**
   * Check if a hotkey is registered
   */
  isRegistered(id: string): boolean;

  /**
   * Validate hotkey configuration
   */
  validate(config: HotkeyConfig): HotkeyValidationResult;

  /**
   * Check for conflicts
   */
  checkConflicts(config: HotkeyConfig): HotkeyConflict[];

  /**
   * Resolve conflicts
   */
  resolveConflicts(
    config: HotkeyConfig,
    strategy: ConflictResolutionStrategy
  ): Promise<ConflictResolutionResult>;

  /**
   * Enable/disable a hotkey
   */
  setEnabled(id: string, enabled: boolean): void;

  /**
   * Get platform info
   */
  getPlatformInfo(): PlatformHotkeyInfo;

  /**
   * Format hotkey for display
   */
  formatHotkey(config: HotkeyConfig): string;

  /**
   * Parse hotkey string
   */
  parseHotkey(hotkeyString: string): Partial<HotkeyConfig> | null;
}

/**
 * Default hotkey IDs
 */
export const DEFAULT_HOTKEY_IDS = {
  TOGGLE_RECORDING: 'toggle-recording',
  STOP_RECORDING: 'stop-recording',
  OPEN_APP: 'open-app',
  SHOW_HISTORY: 'show-history',
} as const;
