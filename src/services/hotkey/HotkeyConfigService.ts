/**
 * Hotkey Configuration Service
 * Manages hotkey settings persistence and customization
 */

import type { HotkeyConfig, HotkeyPreset } from './types';
import { hotkeyService } from './HotkeyService';
import { getDefaultPresetForPlatform, getPresetByName, hotkeyPresets } from './presets';

/**
 * Storage key for hotkey configurations
 */
const STORAGE_KEY = 'hotkey-config';

/**
 * Hotkey configuration data
 */
export interface HotkeyConfigData {
  version: number;
  activePreset?: string;
  customHotkeys: Record<string, HotkeyConfig>;
  lastUpdated: string;
}

/**
 * Hotkey Configuration Service
 * Handles saving, loading, and managing hotkey configurations
 */
export class HotkeyConfigService {
  private configData: HotkeyConfigData;
  private storageAvailable: boolean = false;

  constructor() {
    this.configData = this.getDefaultConfig();
    this.storageAvailable = this.checkStorageAvailable();
  }

  /**
   * Initialize the configuration service
   */
  async initialize(): Promise<void> {
    await this.loadConfig();
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): HotkeyConfigData {
    const defaultPreset = getDefaultPresetForPlatform();
    return {
      version: 1,
      activePreset: defaultPreset.name,
      customHotkeys: {},
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Check if localStorage is available
   */
  private checkStorageAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Load configuration from storage
   */
  async loadConfig(): Promise<HotkeyConfigData> {
    if (!this.storageAvailable) {
      console.warn('localStorage not available, using default config');
      return this.configData;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HotkeyConfigData;
        this.configData = this.migrateConfig(parsed);
        console.log('Loaded hotkey configuration:', this.configData);
      } else {
        // First time - save default config
        await this.saveConfig();
      }
    } catch (error) {
      console.error('Failed to load hotkey config:', error);
      this.configData = this.getDefaultConfig();
    }

    return this.configData;
  }

  /**
   * Save configuration to storage
   */
  async saveConfig(): Promise<void> {
    if (!this.storageAvailable) {
      console.warn('localStorage not available, cannot save config');
      return;
    }

    try {
      this.configData.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.configData));
      console.log('Saved hotkey configuration');
    } catch (error) {
      console.error('Failed to save hotkey config:', error);
      throw new Error('Failed to save hotkey configuration');
    }
  }

  /**
   * Migrate old config versions to current version
   */
  private migrateConfig(config: HotkeyConfigData): HotkeyConfigData {
    // Future: handle version migrations
    if (config.version < 1) {
      config.version = 1;
    }
    return config;
  }

  /**
   * Get current configuration
   */
  getConfig(): HotkeyConfigData {
    return { ...this.configData };
  }

  /**
   * Get all hotkeys (preset + custom overrides)
   */
  getAllHotkeys(): Record<string, HotkeyConfig> {
    const preset = this.getActivePreset();
    const hotkeys: Record<string, HotkeyConfig> = {};

    // Start with preset hotkeys
    if (preset) {
      for (const [id, config] of Object.entries(preset.hotkeys)) {
        hotkeys[id] = { ...config, id };
      }
    }

    // Apply custom overrides
    for (const [id, config] of Object.entries(this.configData.customHotkeys)) {
      hotkeys[id] = config;
    }

    return hotkeys;
  }

  /**
   * Get a specific hotkey configuration
   */
  getHotkey(id: string): HotkeyConfig | null {
    // Check custom first
    if (this.configData.customHotkeys[id]) {
      return { ...this.configData.customHotkeys[id] };
    }

    // Check preset
    const preset = this.getActivePreset();
    if (preset && preset.hotkeys[id]) {
      return { ...preset.hotkeys[id], id };
    }

    return null;
  }

  /**
   * Set a custom hotkey configuration
   */
  async setHotkey(id: string, config: Omit<HotkeyConfig, 'id'>): Promise<void> {
    const fullConfig: HotkeyConfig = { ...config, id };

    // Validate the configuration
    const validation = hotkeyService.validate(fullConfig);
    if (!validation.valid) {
      throw new Error(`Invalid hotkey configuration: ${validation.errors.join(', ')}`);
    }

    // Check for conflicts
    const conflicts = hotkeyService.checkConflicts(fullConfig);
    if (conflicts.length > 0) {
      console.warn(`Hotkey conflicts detected for ${id}:`, conflicts);
    }

    // Save to custom hotkeys
    this.configData.customHotkeys[id] = fullConfig;
    await this.saveConfig();

    console.log(`Set custom hotkey for ${id}:`, fullConfig);
  }

  /**
   * Remove a custom hotkey (revert to preset)
   */
  async removeCustomHotkey(id: string): Promise<void> {
    if (this.configData.customHotkeys[id]) {
      delete this.configData.customHotkeys[id];
      await this.saveConfig();
      console.log(`Removed custom hotkey for ${id}`);
    }
  }

  /**
   * Get active preset
   */
  getActivePreset(): HotkeyPreset | null {
    if (!this.configData.activePreset) {
      return getDefaultPresetForPlatform();
    }
    return getPresetByName(this.configData.activePreset) || null;
  }

  /**
   * Set active preset
   */
  async setActivePreset(presetName: string): Promise<void> {
    const preset = getPresetByName(presetName);
    if (!preset) {
      throw new Error(`Preset not found: ${presetName}`);
    }

    this.configData.activePreset = presetName;
    // Clear custom hotkeys when switching presets
    this.configData.customHotkeys = {};
    await this.saveConfig();

    console.log(`Set active preset to: ${presetName}`);
  }

  /**
   * Get all available presets
   */
  getAvailablePresets(): HotkeyPreset[] {
    return [...hotkeyPresets];
  }

  /**
   * Check if a hotkey is customized
   */
  isCustomized(id: string): boolean {
    return id in this.configData.customHotkeys;
  }

  /**
   * Reset all hotkeys to preset defaults
   */
  async resetToDefaults(): Promise<void> {
    this.configData.customHotkeys = {};
    await this.saveConfig();
    console.log('Reset all hotkeys to defaults');
  }

  /**
   * Export configuration as JSON
   */
  exportConfig(): string {
    return JSON.stringify(this.configData, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  async importConfig(jsonString: string): Promise<void> {
    try {
      const imported = JSON.parse(jsonString) as HotkeyConfigData;
      
      // Validate imported config
      if (!imported.version || typeof imported.customHotkeys !== 'object') {
        throw new Error('Invalid configuration format');
      }

      // Validate each hotkey
      for (const [id, config] of Object.entries(imported.customHotkeys)) {
        const validation = hotkeyService.validate(config);
        if (!validation.valid) {
          throw new Error(`Invalid hotkey "${id}": ${validation.errors.join(', ')}`);
        }
      }

      this.configData = this.migrateConfig(imported);
      await this.saveConfig();
      console.log('Imported hotkey configuration');
    } catch (error) {
      console.error('Failed to import config:', error);
      throw new Error('Failed to import configuration: ' + (error as Error).message);
    }
  }

  /**
   * Enable/disable a hotkey
   */
  async setHotkeyEnabled(id: string, enabled: boolean): Promise<void> {
    const hotkey = this.getHotkey(id);
    if (!hotkey) {
      throw new Error(`Hotkey not found: ${id}`);
    }

    // Update or create custom hotkey
    this.configData.customHotkeys[id] = { ...hotkey, enabled };
    await this.saveConfig();

    // Update in hotkey service if registered
    if (hotkeyService.isRegistered(id)) {
      hotkeyService.setEnabled(id, enabled);
    }

    console.log(`Hotkey ${id} ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get configuration statistics
   */
  getStats(): {
    totalHotkeys: number;
    customizedHotkeys: number;
    activePreset: string;
    lastUpdated: string;
  } {
    const allHotkeys = this.getAllHotkeys();
    return {
      totalHotkeys: Object.keys(allHotkeys).length,
      customizedHotkeys: Object.keys(this.configData.customHotkeys).length,
      activePreset: this.configData.activePreset || 'None',
      lastUpdated: this.configData.lastUpdated,
    };
  }

  /**
   * Clear all configuration (reset to defaults)
   */
  async clearConfig(): Promise<void> {
    if (!this.storageAvailable) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
      this.configData = this.getDefaultConfig();
      console.log('Cleared hotkey configuration');
    } catch (error) {
      console.error('Failed to clear config:', error);
    }
  }
}

/**
 * Singleton instance
 */
export const hotkeyConfigService = new HotkeyConfigService();
