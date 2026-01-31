/**
 * Tauri Service Types
 */

export interface TauriWindow {
  show: () => Promise<void>;
  hide: () => Promise<void>;
  setFocus: () => Promise<void>;
  isVisible: () => Promise<boolean>;
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  unmaximize: () => Promise<void>;
  close: () => Promise<void>;
}

export interface TauriEvent<T = unknown> {
  event: string;
  payload: T;
  id: number;
}

export interface SystemTrayConfig {
  tooltip?: string;
  icon?: string;
}

export interface GlobalShortcutConfig {
  shortcut: string;
  callback: () => void;
}

export interface TauriCapabilities {
  hasSystemTray: boolean;
  hasGlobalShortcut: boolean;
  hasNotifications: boolean;
  hasFileSystem: boolean;
}
