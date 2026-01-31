/**
 * useTauri Hook
 * 
 * React hook for interacting with Tauri desktop features
 */

import { useEffect, useState, useCallback } from 'react';
import { tauriService } from '@/services/tauri';

export function useTauri() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isWindowVisible, setIsWindowVisible] = useState(true);

  useEffect(() => {
    // Check if running in desktop environment
    const desktop = tauriService.isRunningInDesktop();
    setIsDesktop(desktop);

    if (desktop) {
      // Initialize Tauri service
      tauriService.initialize().catch(console.error);

      // Check initial window visibility
      tauriService.isWindowVisible().then(setIsWindowVisible).catch(console.error);

      // Cleanup on unmount
      return () => {
        tauriService.cleanup();
      };
    }
  }, []);

  const minimizeToTray = useCallback(async () => {
    if (!isDesktop) return;
    try {
      await tauriService.minimizeToTray();
      setIsWindowVisible(false);
    } catch (error) {
      console.error('Failed to minimize to tray:', error);
    }
  }, [isDesktop]);

  const showWindow = useCallback(async () => {
    if (!isDesktop) return;
    try {
      await tauriService.showWindow();
      setIsWindowVisible(true);
    } catch (error) {
      console.error('Failed to show window:', error);
    }
  }, [isDesktop]);

  const hideWindow = useCallback(async () => {
    if (!isDesktop) return;
    try {
      await tauriService.hideWindow();
      setIsWindowVisible(false);
    } catch (error) {
      console.error('Failed to hide window:', error);
    }
  }, [isDesktop]);

  const focusWindow = useCallback(async () => {
    if (!isDesktop) return;
    try {
      await tauriService.focusWindow();
      setIsWindowVisible(true);
    } catch (error) {
      console.error('Failed to focus window:', error);
    }
  }, [isDesktop]);

  const onGlobalShortcut = useCallback(
    (callback: () => void) => {
      if (!isDesktop) return () => {};
      return tauriService.onGlobalShortcut(callback);
    },
    [isDesktop]
  );

  return {
    isDesktop,
    isWindowVisible,
    minimizeToTray,
    showWindow,
    hideWindow,
    focusWindow,
    onGlobalShortcut,
  };
}
