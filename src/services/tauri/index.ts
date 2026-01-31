/**
 * Tauri Service Module
 * 
 * Exports Tauri service and types for desktop integration
 */

export { TauriService, tauriService } from './TauriService';
export type {
  TauriWindow,
  TauriEvent,
  SystemTrayConfig,
  GlobalShortcutConfig,
  TauriCapabilities,
} from './types';
