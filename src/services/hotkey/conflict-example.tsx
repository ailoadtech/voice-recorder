/**
 * Hotkey Conflict Handling Example
 * Demonstrates how to use the conflict detection and resolution features
 */

'use client';

import React, { useState, useEffect } from 'react';
import { hotkeyService } from './HotkeyService';
import { HotkeyConflictDialog } from '@/components/HotkeyConflictDialog';
import type { HotkeyConfig, HotkeyConflict, ConflictResolutionStrategy } from './types';

export function HotkeyConflictExample() {
  const [conflicts, setConflicts] = useState<HotkeyConflict[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState('');

  // Example 1: Check for conflicts before registration
  const registerWithConflictCheck = async () => {
    const config: HotkeyConfig = {
      id: 'example-hotkey',
      key: 'r',
      modifiers: ['ctrl', 'shift'],
      description: 'Example Recording Hotkey',
      enabled: true,
      global: true,
    };

    // Check for conflicts
    const detectedConflicts = hotkeyService.checkConflicts(config);
    
    if (detectedConflicts.length > 0) {
      setConflicts(detectedConflicts);
      setShowDialog(true);
      return;
    }

    // No conflicts, register directly
    try {
      await hotkeyService.register(config, () => {
        console.log('Hotkey triggered!');
      });
      setMessage('Hotkey registered successfully!');
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

  // Example 2: Auto-resolve conflicts
  const registerWithAutoResolve = async () => {
    const config: HotkeyConfig = {
      id: 'auto-resolve-hotkey',
      key: 's',
      modifiers: ['ctrl', 'shift'],
      description: 'Auto-Resolve Hotkey',
      enabled: true,
      global: true,
    };

    try {
      // Register will auto-resolve conflicts using 'disable-existing' strategy
      await hotkeyService.register(config, () => {
        console.log('Auto-resolved hotkey triggered!');
      });
      setMessage('Hotkey registered with auto-resolution!');
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

  // Example 3: Check system reserved hotkeys
  const checkSystemReserved = () => {
    const config: HotkeyConfig = {
      id: 'system-check',
      key: 'c',
      modifiers: ['ctrl'],
      description: 'System Reserved Check',
      enabled: true,
    };

    const isReserved = hotkeyService.isSystemReserved(config);
    const reservedList = hotkeyService.getSystemReservedHotkeys();

    setMessage(
      isReserved
        ? `Ctrl+C is system reserved. Reserved hotkeys: ${reservedList.slice(0, 5).join(', ')}...`
        : 'Not system reserved'
    );
  };

  // Example 4: Manual conflict resolution
  const handleConflictResolution = async (strategy: ConflictResolutionStrategy) => {
    setShowDialog(false);

    const config: HotkeyConfig = {
      id: 'example-hotkey',
      key: 'r',
      modifiers: ['ctrl', 'shift'],
      description: 'Example Recording Hotkey',
      enabled: true,
      global: true,
    };

    try {
      const resolution = await hotkeyService.resolveConflicts(config, strategy);
      
      if (resolution.resolved) {
        if (strategy !== 'disable-new') {
          await hotkeyService.register(config, () => {
            console.log('Hotkey triggered after resolution!');
          });
        }
        setMessage(`Resolved: ${resolution.message}`);
      } else {
        setMessage(`Failed to resolve: ${resolution.message}`);
      }
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

  // Example 5: View conflict history
  const viewConflictHistory = () => {
    const history = hotkeyService.getConflictHistory('example-hotkey');
    
    if (history.length === 0) {
      setMessage('No conflict history for this hotkey');
    } else {
      const historyText = history
        .map(c => `Conflicts with: ${c.conflictsWith.join(', ')} - ${c.reason}`)
        .join('\n');
      setMessage(`Conflict History:\n${historyText}`);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Hotkey Conflict Handling Examples</h2>

      {/* Conflict Dialog */}
      <HotkeyConflictDialog
        conflicts={conflicts}
        hotkeyName="Example Hotkey"
        hotkeyDisplay="Ctrl+Shift+R"
        onResolve={handleConflictResolution}
        onCancel={() => setShowDialog(false)}
        isOpen={showDialog}
      />

      {/* Message Display */}
      {message && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <pre className="text-sm whitespace-pre-wrap">{message}</pre>
        </div>
      )}

      {/* Example Buttons */}
      <div className="space-y-2">
        <div>
          <button
            onClick={registerWithConflictCheck}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Example 1: Register with Conflict Check
          </button>
          <p className="text-sm text-gray-600 mt-1">
            Checks for conflicts before registration and shows dialog if found
          </p>
        </div>

        <div>
          <button
            onClick={registerWithAutoResolve}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Example 2: Register with Auto-Resolve
          </button>
          <p className="text-sm text-gray-600 mt-1">
            Automatically resolves conflicts by disabling existing hotkeys
          </p>
        </div>

        <div>
          <button
            onClick={checkSystemReserved}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Example 3: Check System Reserved
          </button>
          <p className="text-sm text-gray-600 mt-1">
            Checks if a hotkey conflicts with system reserved keys
          </p>
        </div>

        <div>
          <button
            onClick={viewConflictHistory}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Example 4: View Conflict History
          </button>
          <p className="text-sm text-gray-600 mt-1">
            Shows historical conflicts for a hotkey
          </p>
        </div>
      </div>

      {/* Current Registrations */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Current Registrations</h3>
        <div className="space-y-2">
          {hotkeyService.getRegistrations().map((reg) => (
            <div
              key={reg.config.id}
              className="p-3 bg-gray-50 border rounded text-sm"
            >
              <div className="font-medium">{reg.config.description}</div>
              <div className="text-gray-600">
                {hotkeyService.formatHotkey(reg.config)} -{' '}
                {reg.config.enabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
