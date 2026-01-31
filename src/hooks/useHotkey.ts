/**
 * useHotkey Hook
 * React hook for registering and managing hotkeys
 */

import { useEffect, useRef } from 'react';
import { hotkeyService } from '@/services/hotkey/HotkeyService';
import type { HotkeyConfig, HotkeyCallback } from '@/services/hotkey/types';

/**
 * Hook for registering a hotkey
 * 
 * @param config - Hotkey configuration
 * @param callback - Function to call when hotkey is triggered
 * 
 * @example
 * ```tsx
 * useHotkey(
 *   {
 *     id: 'toggle-recording',
 *     key: 'r',
 *     modifiers: ['ctrl', 'shift'],
 *     description: 'Toggle recording',
 *     enabled: true,
 *     global: true,
 *   },
 *   () => {
 *     console.log('Hotkey triggered!');
 *   }
 * );
 * ```
 */
export function useHotkey(config: HotkeyConfig, callback: HotkeyCallback): void {
  const callbackRef = useRef(callback);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!config.enabled) {
      return;
    }

    // Wrap callback to use latest version
    const wrappedCallback: HotkeyCallback = (event) => {
      callbackRef.current(event);
    };

    // Register hotkey
    const register = async () => {
      try {
        await hotkeyService.register(config, wrappedCallback);
      } catch (error) {
        console.error('Failed to register hotkey:', error);
      }
    };

    register();

    // Cleanup: unregister on unmount
    return () => {
      const unregister = async () => {
        try {
          await hotkeyService.unregister(config.id);
        } catch (error) {
          console.error('Failed to unregister hotkey:', error);
        }
      };

      unregister();
    };
  }, [config.id, config.key, config.modifiers, config.enabled, config.global]);
}
