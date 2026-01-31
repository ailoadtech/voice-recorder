/**
 * TrayControls Component
 * 
 * Provides UI controls for system tray functionality
 */

'use client';

import React from 'react';
import { useTauri } from '@/hooks/useTauri';

export function TrayControls() {
  const { isDesktop, isWindowVisible, minimizeToTray, showWindow } = useTauri();

  // Only show controls in desktop environment
  if (!isDesktop) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {isWindowVisible ? (
        <button
          onClick={minimizeToTray}
          className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Minimize to system tray"
        >
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            Minimize to Tray
          </span>
        </button>
      ) : (
        <button
          onClick={showWindow}
          className="px-3 py-1.5 text-sm rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          title="Show window"
        >
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
            Show Window
          </span>
        </button>
      )}
    </div>
  );
}
