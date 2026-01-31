/**
 * Hotkey Service
 * Manages global hotkey registration and handling
 * 
 * Browser Implementation:
 * - Uses keyboard event listeners
 * - Only works when app has focus
 * 
 * Tauri Implementation:
 * - Uses Tauri's global shortcut API
 * - Works even when app is not focused
 * - Automatically detects Tauri environment
 */

import type {
  HotkeyConfig,
  HotkeyCallback,
  HotkeyRegistration,
  HotkeyConflict,
  HotkeyValidationResult,
  PlatformHotkeyInfo,
  ModifierKey,
  IHotkeyService,
  ConflictResolutionStrategy,
  ConflictResolutionResult,
} from './types';

/**
 * Check if running in Tauri environment
 */
function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

/**
 * Hotkey Service Implementation
 * Supports both browser and Tauri environments
 */
export class HotkeyService implements IHotkeyService {
  private registrations: Map<string, HotkeyRegistration> = new Map();
  private isListening: boolean = false;
  private boundHandler: ((event: KeyboardEvent) => void) | null = null;
  private isTauri: boolean = false;
  private tauriGlobalShortcut: any = null;
  private systemReservedHotkeys: Set<string> = new Set();
  private conflictHistory: Map<string, HotkeyConflict[]> = new Map();

  constructor() {
    this.isTauri = isTauriEnvironment();
    this.initialize();
    this.initializeSystemReservedHotkeys();
  }

  /**
   * Initialize the hotkey service
   */
  private async initialize(): Promise<void> {
    if (this.isTauri) {
      await this.initializeTauri();
    } else {
      this.startListening();
    }
  }

  /**
   * Initialize system reserved hotkeys
   */
  private initializeSystemReservedHotkeys(): void {
    const platform = this.getPlatformInfo();
    
    // Common system hotkeys across platforms
    const commonReserved = [
      'ctrl+alt+delete', // Windows task manager
      'ctrl+shift+escape', // Windows task manager
      'alt+f4', // Close window
      'alt+tab', // Switch windows
      'meta+tab', // macOS app switcher
      'ctrl+c', // Copy
      'ctrl+v', // Paste
      'ctrl+x', // Cut
      'ctrl+z', // Undo
      'ctrl+y', // Redo
      'f11', // Fullscreen
      'f12', // Dev tools
    ];

    // Platform-specific reserved hotkeys
    if (platform.platform === 'windows') {
      commonReserved.push(
        'meta+l', // Lock screen
        'meta+d', // Show desktop
        'meta+e', // File explorer
        'meta+r', // Run dialog
        'meta+x', // Quick link menu
        'ctrl+shift+n', // New incognito window (browsers)
      );
    } else if (platform.platform === 'macos') {
      commonReserved.push(
        'meta+space', // Spotlight
        'meta+q', // Quit app
        'meta+w', // Close window
        'meta+h', // Hide app
        'meta+m', // Minimize
        'ctrl+meta+space', // Emoji picker
      );
    } else if (platform.platform === 'linux') {
      commonReserved.push(
        'ctrl+alt+t', // Terminal
        'meta+l', // Lock screen
        'alt+f2', // Run command
      );
    }

    this.systemReservedHotkeys = new Set(commonReserved);
  }

  /**
   * Initialize Tauri global shortcut plugin
   */
  private async initializeTauri(): Promise<void> {
    try {
      // Dynamically import Tauri plugin
      const { register: tauriRegister, isRegistered, unregister } = await import(
        '@tauri-apps/plugin-global-shortcut'
      );
      
      this.tauriGlobalShortcut = {
        register: tauriRegister,
        isRegistered,
        unregister,
      };
      
      console.log('Tauri global shortcut plugin initialized');
    } catch (error) {
      console.warn('Failed to initialize Tauri global shortcut plugin:', error);
      console.warn('Falling back to browser-based hotkeys');
      this.isTauri = false;
      this.startListening();
    }
  }

  /**
   * Register a hotkey
   */
  async register(config: HotkeyConfig, callback: HotkeyCallback): Promise<void> {
    // Validate configuration
    const validation = this.validate(config);
    if (!validation.valid) {
      throw new Error(`Invalid hotkey configuration: ${validation.errors.join(', ')}`);
    }

    // Check for conflicts
    const conflicts = this.checkConflicts(config);
    if (conflicts.length > 0) {
      const hasSystemConflict = conflicts.some(c => c.systemLevel);
      const hasAppConflict = conflicts.some(c => !c.systemLevel);

      if (hasSystemConflict) {
        console.warn(`Hotkey ${config.id} conflicts with system hotkey:`, conflicts);
        // Allow registration but warn user
      }

      if (hasAppConflict) {
        // Attempt to resolve conflicts automatically
        const resolution = await this.resolveConflicts(config, 'disable-existing');
        if (!resolution.resolved) {
          throw new Error(
            `Hotkey conflicts detected: ${conflicts.map(c => c.reason).join(', ')}`
          );
        }
        console.log(`Resolved conflicts: ${resolution.message}`);
      }
    }

    // Register with Tauri if available and global hotkey requested
    if (this.isTauri && config.global && this.tauriGlobalShortcut) {
      await this.registerTauriHotkey(config, callback);
    }

    // Always register browser handler as fallback
    this.registrations.set(config.id, { config, callback });

    console.log(`Registered hotkey: ${this.formatHotkey(config)} (${this.isTauri && config.global ? 'global' : 'local'})`);
  }

  /**
   * Register hotkey with Tauri
   */
  private async registerTauriHotkey(config: HotkeyConfig, callback: HotkeyCallback): Promise<void> {
    if (!this.tauriGlobalShortcut) {
      throw new Error('Tauri global shortcut not initialized');
    }

    const shortcut = this.configToTauriShortcut(config);
    
    try {
      // Check if already registered
      const isRegistered = await this.tauriGlobalShortcut.isRegistered(shortcut);
      if (isRegistered) {
        console.warn(`Shortcut ${shortcut} is already registered, unregistering first`);
        await this.tauriGlobalShortcut.unregister(shortcut);
      }

      // Register with Tauri
      await this.tauriGlobalShortcut.register(shortcut, (event: any) => {
        if (config.enabled) {
          try {
            // Create a synthetic KeyboardEvent for consistency
            const syntheticEvent = new KeyboardEvent('keydown', {
              key: config.key,
              ctrlKey: config.modifiers.includes('ctrl'),
              shiftKey: config.modifiers.includes('shift'),
              altKey: config.modifiers.includes('alt'),
              metaKey: config.modifiers.includes('meta'),
            });
            callback(syntheticEvent);
          } catch (error) {
            console.error(`Error executing Tauri hotkey callback for ${config.id}:`, error);
          }
        }
      });

      console.log(`Tauri global shortcut registered: ${shortcut}`);
    } catch (error) {
      console.error(`Failed to register Tauri shortcut ${shortcut}:`, error);
      throw error;
    }
  }

  /**
   * Convert HotkeyConfig to Tauri shortcut string
   */
  private configToTauriShortcut(config: HotkeyConfig): string {
    const modifiers: string[] = [];
    
    for (const mod of config.modifiers) {
      switch (mod) {
        case 'ctrl':
          modifiers.push('CommandOrControl');
          break;
        case 'shift':
          modifiers.push('Shift');
          break;
        case 'alt':
          modifiers.push('Alt');
          break;
        case 'meta':
          modifiers.push('Super');
          break;
      }
    }

    // Capitalize key for Tauri format
    const key = config.key.length === 1 
      ? config.key.toUpperCase() 
      : this.capitalizeKey(config.key);

    return [...modifiers, key].join('+');
  }

  /**
   * Unregister a hotkey
   */
  async unregister(id: string): Promise<void> {
    const registration = this.registrations.get(id);
    
    if (registration) {
      // Unregister from Tauri if it was a global hotkey
      if (this.isTauri && registration.config.global && this.tauriGlobalShortcut) {
        try {
          const shortcut = this.configToTauriShortcut(registration.config);
          await this.tauriGlobalShortcut.unregister(shortcut);
          console.log(`Unregistered Tauri shortcut: ${shortcut}`);
        } catch (error) {
          console.error(`Failed to unregister Tauri shortcut:`, error);
        }
      }

      this.registrations.delete(id);
      console.log(`Unregistered hotkey: ${id}`);
    }
  }

  /**
   * Update hotkey configuration
   */
  updateConfig(id: string, updates: Partial<HotkeyConfig>): void {
    const registration = this.registrations.get(id);
    if (!registration) {
      throw new Error(`Hotkey not found: ${id}`);
    }

    const newConfig = { ...registration.config, ...updates };
    const validation = this.validate(newConfig);
    if (!validation.valid) {
      throw new Error(`Invalid hotkey configuration: ${validation.errors.join(', ')}`);
    }

    registration.config = newConfig;
    console.log(`Updated hotkey: ${this.formatHotkey(newConfig)}`);
  }

  /**
   * Get all registered hotkeys
   */
  getRegistrations(): HotkeyRegistration[] {
    return Array.from(this.registrations.values());
  }

  /**
   * Check if a hotkey is registered
   */
  isRegistered(id: string): boolean {
    return this.registrations.has(id);
  }

  /**
   * Validate hotkey configuration
   */
  validate(config: HotkeyConfig): HotkeyValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const conflicts = this.checkConflicts(config);

    // Validate ID
    if (!config.id || config.id.trim().length === 0) {
      errors.push('Hotkey ID is required');
    }

    // Validate key
    if (!config.key || config.key.trim().length === 0) {
      errors.push('Key is required');
    }

    // Validate key format
    if (config.key && config.key.length > 1 && !this.isValidSpecialKey(config.key)) {
      errors.push(`Invalid key: ${config.key}`);
    }

    // Validate modifiers
    if (!config.modifiers || config.modifiers.length === 0) {
      warnings.push('No modifiers specified - hotkey may conflict with normal typing');
    }

    // Check for duplicate modifiers
    const uniqueModifiers = new Set(config.modifiers);
    if (uniqueModifiers.size !== config.modifiers.length) {
      errors.push('Duplicate modifiers detected');
    }

    // Platform-specific validation
    const platform = this.getPlatformInfo();
    if (config.global && !platform.supportsGlobalHotkeys) {
      warnings.push('Global hotkeys not supported on this platform');
    }

    // Check reserved keys
    if (platform.reservedKeys.includes(config.key.toLowerCase())) {
      warnings.push(`Key "${config.key}" may be reserved by the system`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      conflicts,
    };
  }

  /**
   * Check for conflicts with existing hotkeys
   */
  checkConflicts(config: HotkeyConfig): HotkeyConflict[] {
    const conflicts: HotkeyConflict[] = [];
    const conflictsWith: string[] = [];

    // Check for conflicts with registered hotkeys
    for (const [id, registration] of this.registrations) {
      if (id === config.id) continue;

      if (this.hotkeyMatches(config, registration.config)) {
        conflictsWith.push(id);
      }
    }

    if (conflictsWith.length > 0) {
      conflicts.push({
        hotkeyId: config.id,
        conflictsWith,
        reason: 'Same key combination already registered',
        severity: 'error',
        systemLevel: false,
      });
    }

    // Check for conflicts with system reserved hotkeys
    const hotkeyString = this.formatHotkeyForComparison(config);
    if (this.systemReservedHotkeys.has(hotkeyString)) {
      conflicts.push({
        hotkeyId: config.id,
        conflictsWith: ['system'],
        reason: 'Conflicts with system-reserved hotkey',
        severity: 'warning',
        systemLevel: true,
      });
    }

    // Store conflict history
    if (conflicts.length > 0) {
      this.conflictHistory.set(config.id, conflicts);
    }

    return conflicts;
  }

  /**
   * Format hotkey for comparison (lowercase, normalized)
   */
  private formatHotkeyForComparison(config: HotkeyConfig): string {
    const sortedModifiers = [...config.modifiers].sort();
    return [...sortedModifiers, config.key.toLowerCase()].join('+');
  }

  /**
   * Resolve conflicts using specified strategy
   */
  async resolveConflicts(
    config: HotkeyConfig,
    strategy: ConflictResolutionStrategy
  ): Promise<ConflictResolutionResult> {
    const conflicts = this.checkConflicts(config);
    
    if (conflicts.length === 0) {
      return {
        resolved: true,
        strategy,
        disabledHotkeys: [],
        message: 'No conflicts detected',
      };
    }

    const disabledHotkeys: string[] = [];
    let resolved = false;
    let message = '';

    switch (strategy) {
      case 'disable-existing':
        // Disable all conflicting hotkeys
        for (const conflict of conflicts) {
          if (conflict.systemLevel) {
            message = 'Cannot disable system-level hotkeys. Choose a different combination.';
            break;
          }
          
          for (const conflictId of conflict.conflictsWith) {
            if (conflictId !== 'system') {
              this.setEnabled(conflictId, false);
              disabledHotkeys.push(conflictId);
            }
          }
        }
        
        if (disabledHotkeys.length > 0) {
          resolved = true;
          message = `Disabled conflicting hotkeys: ${disabledHotkeys.join(', ')}`;
        }
        break;

      case 'disable-new':
        resolved = true;
        message = 'New hotkey not registered due to conflicts';
        break;

      case 'allow-both':
        resolved = true;
        message = 'Allowing both hotkeys (may cause unexpected behavior)';
        break;

      case 'prompt-user':
        resolved = false;
        message = 'User intervention required to resolve conflicts';
        break;

      default:
        resolved = false;
        message = 'Unknown resolution strategy';
    }

    return {
      resolved,
      strategy,
      disabledHotkeys,
      message,
    };
  }

  /**
   * Enable/disable a hotkey
   */
  setEnabled(id: string, enabled: boolean): void {
    const registration = this.registrations.get(id);
    if (registration) {
      registration.config.enabled = enabled;
      console.log(`Hotkey ${id} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Get conflict history for a hotkey
   */
  getConflictHistory(id: string): HotkeyConflict[] {
    return this.conflictHistory.get(id) || [];
  }

  /**
   * Clear conflict history
   */
  clearConflictHistory(id?: string): void {
    if (id) {
      this.conflictHistory.delete(id);
    } else {
      this.conflictHistory.clear();
    }
  }

  /**
   * Check if hotkey conflicts with system hotkeys
   */
  isSystemReserved(config: HotkeyConfig): boolean {
    const hotkeyString = this.formatHotkeyForComparison(config);
    return this.systemReservedHotkeys.has(hotkeyString);
  }

  /**
   * Get all system reserved hotkeys
   */
  getSystemReservedHotkeys(): string[] {
    return Array.from(this.systemReservedHotkeys);
  }

  /**
   * Get platform info
   */
  getPlatformInfo(): PlatformHotkeyInfo {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    const isWindows = typeof navigator !== 'undefined' && /Win/.test(navigator.platform);
    const isLinux = typeof navigator !== 'undefined' && /Linux/.test(navigator.platform);

    return {
      platform: isMac ? 'macos' : isWindows ? 'windows' : isLinux ? 'linux' : 'browser',
      supportsGlobalHotkeys: this.isTauri && this.tauriGlobalShortcut !== null,
      reservedKeys: ['f1', 'f5', 'f11', 'f12'],
      modifierKeyNames: {
        ctrl: isMac ? '⌃' : 'Ctrl',
        shift: isMac ? '⇧' : 'Shift',
        alt: isMac ? '⌥' : 'Alt',
        meta: isMac ? '⌘' : 'Win',
      },
    };
  }

  /**
   * Format hotkey for display
   */
  formatHotkey(config: HotkeyConfig): string {
    const platform = this.getPlatformInfo();
    const modifierNames = config.modifiers.map((m) => platform.modifierKeyNames[m]);
    const keyName = config.key.length === 1 ? config.key.toUpperCase() : this.capitalizeKey(config.key);
    return [...modifierNames, keyName].join('+');
  }

  /**
   * Parse hotkey string (e.g., "Ctrl+Shift+R")
   */
  parseHotkey(hotkeyString: string): Partial<HotkeyConfig> | null {
    try {
      const parts = hotkeyString.split('+').map((p) => p.trim().toLowerCase());
      if (parts.length === 0) return null;

      const modifiers: ModifierKey[] = [];
      let key = '';

      for (const part of parts) {
        if (part === 'ctrl' || part === 'control') {
          modifiers.push('ctrl');
        } else if (part === 'shift') {
          modifiers.push('shift');
        } else if (part === 'alt') {
          modifiers.push('alt');
        } else if (part === 'meta' || part === 'cmd' || part === 'win') {
          modifiers.push('meta');
        } else {
          key = part;
        }
      }

      if (!key) return null;

      return { key, modifiers };
    } catch {
      return null;
    }
  }

  /**
   * Start listening for keyboard events
   */
  private startListening(): void {
    if (this.isListening || typeof window === 'undefined') return;

    this.boundHandler = this.handleKeyDown.bind(this);
    window.addEventListener('keydown', this.boundHandler);
    this.isListening = true;
  }

  /**
   * Stop listening for keyboard events
   */
  stopListening(): void {
    if (!this.isListening || !this.boundHandler || typeof window === 'undefined') return;

    window.removeEventListener('keydown', this.boundHandler);
    this.isListening = false;
    this.boundHandler = null;
  }

  /**
   * Handle keyboard events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Don't trigger hotkeys when typing in input fields
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    // Check each registered hotkey
    for (const registration of this.registrations.values()) {
      if (!registration.config.enabled) continue;

      if (this.eventMatchesHotkey(event, registration.config)) {
        event.preventDefault();
        event.stopPropagation();

        try {
          registration.callback(event);
        } catch (error) {
          console.error(`Error executing hotkey callback for ${registration.config.id}:`, error);
        }

        break; // Only trigger one hotkey per event
      }
    }
  }

  /**
   * Check if keyboard event matches hotkey config
   */
  private eventMatchesHotkey(event: KeyboardEvent, config: HotkeyConfig): boolean {
    // Check key
    const eventKey = event.key.toLowerCase();
    const configKey = config.key.toLowerCase();

    if (eventKey !== configKey) {
      return false;
    }

    // Check modifiers
    const hasCtrl = config.modifiers.includes('ctrl');
    const hasShift = config.modifiers.includes('shift');
    const hasAlt = config.modifiers.includes('alt');
    const hasMeta = config.modifiers.includes('meta');

    return (
      event.ctrlKey === hasCtrl &&
      event.shiftKey === hasShift &&
      event.altKey === hasAlt &&
      event.metaKey === hasMeta
    );
  }

  /**
   * Check if two hotkey configs match
   */
  private hotkeyMatches(config1: HotkeyConfig, config2: HotkeyConfig): boolean {
    if (config1.key.toLowerCase() !== config2.key.toLowerCase()) {
      return false;
    }

    const mods1 = new Set(config1.modifiers);
    const mods2 = new Set(config2.modifiers);

    if (mods1.size !== mods2.size) {
      return false;
    }

    for (const mod of mods1) {
      if (!mods2.has(mod)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if key is a valid special key
   */
  private isValidSpecialKey(key: string): boolean {
    const specialKeys = [
      'enter',
      'escape',
      'space',
      'tab',
      'backspace',
      'delete',
      'insert',
      'home',
      'end',
      'pageup',
      'pagedown',
      'arrowup',
      'arrowdown',
      'arrowleft',
      'arrowright',
      'f1',
      'f2',
      'f3',
      'f4',
      'f5',
      'f6',
      'f7',
      'f8',
      'f9',
      'f10',
      'f11',
      'f12',
    ];

    return specialKeys.includes(key.toLowerCase());
  }

  /**
   * Capitalize key name for display
   */
  private capitalizeKey(key: string): string {
    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  /**
   * Cleanup
   */
  async destroy(): Promise<void> {
    // Unregister all Tauri shortcuts
    if (this.isTauri && this.tauriGlobalShortcut) {
      for (const registration of this.registrations.values()) {
        if (registration.config.global) {
          try {
            const shortcut = this.configToTauriShortcut(registration.config);
            await this.tauriGlobalShortcut.unregister(shortcut);
          } catch (error) {
            console.error('Error unregistering Tauri shortcut:', error);
          }
        }
      }
    }

    this.stopListening();
    this.registrations.clear();
  }
}

/**
 * Hotkey service singleton instance
 */
export const hotkeyService = new HotkeyService();
