/**
 * Tauri Service
 * 
 * Provides a unified interface for interacting with Tauri desktop APIs.
 * Handles system tray, global shortcuts, window management, and more.
 */

import { invoke } from '@tauri-apps/api/core';
import { listen, emit } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';

export interface TauriServiceConfig {
  enableSystemTray?: boolean;
  enableGlobalShortcut?: boolean;
  minimizeToTray?: boolean;
}

export class TauriService {
  private static instance: TauriService;
  private config: TauriServiceConfig;
  private isDesktop: boolean;
  private listeners: Array<() => void> = [];

  private constructor(config: TauriServiceConfig = {}) {
    this.config = {
      enableSystemTray: true,
      enableGlobalShortcut: true,
      minimizeToTray: true,
      ...config,
    };
    
    // Check if running in Tauri environment
    this.isDesktop = typeof window !== 'undefined' && '__TAURI__' in window;
  }

  static getInstance(config?: TauriServiceConfig): TauriService {
    if (!TauriService.instance) {
      TauriService.instance = new TauriService(config);
    }
    return TauriService.instance;
  }

  /**
   * Check if running in Tauri desktop environment
   */
  isRunningInDesktop(): boolean {
    return this.isDesktop;
  }

  /**
   * Initialize Tauri listeners and setup
   */
  async initialize(): Promise<void> {
    if (!this.isDesktop) {
      console.warn('Not running in Tauri environment');
      return;
    }

    try {
      // Listen for toggle recording events from backend
      const unlistenToggle = await listen('toggle-recording', () => {
        // Emit custom event that components can listen to
        window.dispatchEvent(new CustomEvent('tauri:toggle-recording'));
      });
      this.listeners.push(unlistenToggle);

      console.log('Tauri service initialized');
    } catch (error) {
      console.error('Failed to initialize Tauri service:', error);
    }
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    this.listeners.forEach(unlisten => unlisten());
    this.listeners = [];
  }

  /**
   * Toggle recording via Tauri command
   */
  async toggleRecording(): Promise<void> {
    if (!this.isDesktop) {
      throw new Error('Not running in desktop environment');
    }

    try {
      await invoke('toggle_recording');
    } catch (error) {
      console.error('Failed to toggle recording:', error);
      throw error;
    }
  }

  /**
   * Minimize window to system tray
   */
  async minimizeToTray(): Promise<void> {
    if (!this.isDesktop) {
      throw new Error('Not running in desktop environment');
    }

    try {
      await invoke('minimize_to_tray');
    } catch (error) {
      console.error('Failed to minimize to tray:', error);
      throw error;
    }
  }

  /**
   * Show window from system tray
   */
  async showWindow(): Promise<void> {
    if (!this.isDesktop) {
      throw new Error('Not running in desktop environment');
    }

    try {
      await invoke('show_window');
    } catch (error) {
      console.error('Failed to show window:', error);
      throw error;
    }
  }

  /**
   * Hide window (minimize to tray if enabled)
   */
  async hideWindow(): Promise<void> {
    if (!this.isDesktop) {
      throw new Error('Not running in desktop environment');
    }

    try {
      const window = getCurrentWindow();
      await window.hide();
    } catch (error) {
      console.error('Failed to hide window:', error);
      throw error;
    }
  }

  /**
   * Focus window
   */
  async focusWindow(): Promise<void> {
    if (!this.isDesktop) {
      throw new Error('Not running in desktop environment');
    }

    try {
      const window = getCurrentWindow();
      await window.show();
      await window.setFocus();
    } catch (error) {
      console.error('Failed to focus window:', error);
      throw error;
    }
  }

  /**
   * Check if window is visible
   */
  async isWindowVisible(): Promise<boolean> {
    if (!this.isDesktop) {
      return true; // In browser, always visible
    }

    try {
      const window = getCurrentWindow();
      return await window.isVisible();
    } catch (error) {
      console.error('Failed to check window visibility:', error);
      return false;
    }
  }

  /**
   * Listen for global shortcut events
   */
  onGlobalShortcut(callback: () => void): () => void {
    const handler = () => callback();
    window.addEventListener('tauri:toggle-recording', handler);
    
    return () => {
      window.removeEventListener('tauri:toggle-recording', handler);
    };
  }

  /**
   * Emit event to Tauri backend
   */
  async emitToBackend(event: string, payload?: unknown): Promise<void> {
    if (!this.isDesktop) {
      console.warn('Cannot emit to backend: not in desktop environment');
      return;
    }

    try {
      await emit(event, payload);
    } catch (error) {
      console.error(`Failed to emit event ${event}:`, error);
      throw error;
    }
  }

  /**
   * Listen for events from Tauri backend
   */
  async listenToBackend<T>(
    event: string,
    callback: (payload: T) => void
  ): Promise<() => void> {
    if (!this.isDesktop) {
      console.warn('Cannot listen to backend: not in desktop environment');
      return () => {};
    }

    try {
      return await listen<T>(event, (event) => {
        callback(event.payload);
      });
    } catch (error) {
      console.error(`Failed to listen to event ${event}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const tauriService = TauriService.getInstance();
