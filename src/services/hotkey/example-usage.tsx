/**
 * Example Usage of Global Hotkey Service
 * 
 * This file demonstrates how to use the global hotkey registration
 * in both browser and Tauri environments.
 */

import React from 'react';
import { useHotkey } from '@/hooks/useHotkey';
import { DEFAULT_HOTKEY_IDS } from '@/services/hotkey/types';

/**
 * Example 1: Using the useHotkey hook in a component
 */
export function RecordingComponent() {
  const [isRecording, setIsRecording] = React.useState(false);

  // Register global hotkey for toggling recording
  useHotkey(
    {
      id: DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING,
      key: 'r',
      modifiers: ['ctrl', 'shift'],
      description: 'Toggle voice recording',
      enabled: true,
      global: true, // Works even when app is not focused (Tauri only)
    },
    () => {
      setIsRecording((prev) => !prev);
      console.log('Recording toggled via hotkey');
    }
  );

  return (
    <div>
      <h2>Recording Status: {isRecording ? 'Recording' : 'Idle'}</h2>
      <p>Press Ctrl+Shift+R to toggle recording</p>
    </div>
  );
}

/**
 * Example 2: Using the hotkey service directly
 */
import { hotkeyService } from '@/services/hotkey/HotkeyService';

export async function registerCustomHotkeys() {
  // Register a hotkey programmatically
  await hotkeyService.register(
    {
      id: 'custom-action',
      key: 'space',
      modifiers: ['ctrl', 'shift'],
      description: 'Custom action',
      enabled: true,
      global: true,
    },
    (event) => {
      console.log('Custom hotkey triggered!', event);
      // Perform your action here
    }
  );

  // Check platform support
  const platformInfo = hotkeyService.getPlatformInfo();
  console.log('Platform:', platformInfo.platform);
  console.log('Supports global hotkeys:', platformInfo.supportsGlobalHotkeys);

  // Get all registered hotkeys
  const registrations = hotkeyService.getRegistrations();
  console.log('Registered hotkeys:', registrations);

  // Unregister when done
  await hotkeyService.unregister('custom-action');
}

/**
 * Example 3: Validating hotkey configuration
 */
export function validateHotkeyExample() {
  const config = {
    id: 'test-hotkey',
    key: 'f5',
    modifiers: ['ctrl'] as const,
    description: 'Test hotkey',
    enabled: true,
  };

  const validation = hotkeyService.validate(config);
  
  if (!validation.valid) {
    console.error('Invalid hotkey:', validation.errors);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('Hotkey warnings:', validation.warnings);
  }
  
  if (validation.conflicts.length > 0) {
    console.warn('Hotkey conflicts:', validation.conflicts);
  }
}

/**
 * Example 4: Formatting hotkeys for display
 */
export function HotkeyDisplay() {
  const config = {
    id: 'display-example',
    key: 'r',
    modifiers: ['ctrl', 'shift'] as const,
    description: 'Example hotkey',
    enabled: true,
  };

  const formatted = hotkeyService.formatHotkey(config);
  // On Windows/Linux: "Ctrl+Shift+R"
  // On macOS: "⌃⇧R"

  return <div>Press {formatted} to activate</div>;
}

/**
 * Example 5: Parsing hotkey strings
 */
export function parseHotkeyExample() {
  const parsed = hotkeyService.parseHotkey('Ctrl+Shift+R');
  
  if (parsed) {
    console.log('Key:', parsed.key); // 'r'
    console.log('Modifiers:', parsed.modifiers); // ['ctrl', 'shift']
  }
}

/**
 * Example 6: Conditional hotkey registration based on environment
 */
export function ConditionalHotkeyComponent() {
  const platformInfo = hotkeyService.getPlatformInfo();

  useHotkey(
    {
      id: 'conditional-hotkey',
      key: 'g',
      modifiers: ['ctrl', 'shift'],
      description: 'Conditional hotkey',
      enabled: true,
      // Only use global hotkeys if supported
      global: platformInfo.supportsGlobalHotkeys,
    },
    () => {
      console.log('Conditional hotkey triggered');
    }
  );

  return (
    <div>
      <p>Global hotkeys: {platformInfo.supportsGlobalHotkeys ? 'Supported' : 'Not supported'}</p>
      <p>Running in: {platformInfo.platform}</p>
    </div>
  );
}

/**
 * Example 7: Dynamic hotkey enable/disable
 */
export function DynamicHotkeyComponent() {
  const [enabled, setEnabled] = React.useState(true);

  useHotkey(
    {
      id: 'dynamic-hotkey',
      key: 'd',
      modifiers: ['ctrl', 'shift'],
      description: 'Dynamic hotkey',
      enabled: enabled,
      global: true,
    },
    () => {
      console.log('Dynamic hotkey triggered');
    }
  );

  return (
    <div>
      <button onClick={() => setEnabled(!enabled)}>
        {enabled ? 'Disable' : 'Enable'} Hotkey
      </button>
    </div>
  );
}
