/**
 * Hotkey Conflict Dialog Component
 * Displays hotkey conflicts and allows user to resolve them
 */

'use client';

import React, { useState } from 'react';
import type { HotkeyConflict, ConflictResolutionStrategy } from '@/services/hotkey/types';

export interface HotkeyConflictDialogProps {
  conflicts: HotkeyConflict[];
  hotkeyName: string;
  hotkeyDisplay: string;
  onResolve: (strategy: ConflictResolutionStrategy) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const HotkeyConflictDialog: React.FC<HotkeyConflictDialogProps> = ({
  conflicts,
  hotkeyName,
  hotkeyDisplay,
  onResolve,
  onCancel,
  isOpen,
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<ConflictResolutionStrategy>('disable-existing');

  if (!isOpen) return null;

  const hasSystemConflict = conflicts.some(c => c.systemLevel);
  const appConflicts = conflicts.filter(c => !c.systemLevel);

  const handleResolve = () => {
    onResolve(selectedStrategy);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Hotkey Conflict Detected
        </h2>

        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            The hotkey <span className="font-mono font-bold">{hotkeyDisplay}</span> for{' '}
            <span className="font-semibold">{hotkeyName}</span> conflicts with:
          </p>

          <ul className="list-disc list-inside space-y-2 mb-4">
            {conflicts.map((conflict, index) => (
              <li
                key={index}
                className={`text-sm ${
                  conflict.severity === 'error'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}
              >
                {conflict.systemLevel ? (
                  <>
                    <span className="font-semibold">System hotkey</span> - {conflict.reason}
                  </>
                ) : (
                  <>
                    <span className="font-semibold">
                      {conflict.conflictsWith.join(', ')}
                    </span>{' '}
                    - {conflict.reason}
                  </>
                )}
              </li>
            ))}
          </ul>

          {hasSystemConflict && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ This hotkey may be reserved by your operating system. It might not work as
                expected.
              </p>
            </div>
          )}
        </div>

        {appConflicts.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              How would you like to resolve this?
            </p>

            <div className="space-y-2">
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="strategy"
                  value="disable-existing"
                  checked={selectedStrategy === 'disable-existing'}
                  onChange={(e) => setSelectedStrategy(e.target.value as ConflictResolutionStrategy)}
                  className="mt-1"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Disable conflicting hotkeys
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Disable the existing hotkeys and use this one
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="strategy"
                  value="disable-new"
                  checked={selectedStrategy === 'disable-new'}
                  onChange={(e) => setSelectedStrategy(e.target.value as ConflictResolutionStrategy)}
                  className="mt-1"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Keep existing hotkeys
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Don't register this hotkey
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="strategy"
                  value="allow-both"
                  checked={selectedStrategy === 'allow-both'}
                  onChange={(e) => setSelectedStrategy(e.target.value as ConflictResolutionStrategy)}
                  className="mt-1"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Allow both (not recommended)
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Register both hotkeys (may cause unexpected behavior)
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleResolve}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            {selectedStrategy === 'disable-new' ? 'Keep Existing' : 'Resolve'}
          </button>
        </div>
      </div>
    </div>
  );
};
