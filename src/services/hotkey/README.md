# Global Hotkey Service

## Overview

The Global Hotkey Service provides a unified API for registering and managing keyboard shortcuts that work across both browser and Tauri desktop environments. It automatically detects the runtime environment and uses the appropriate implementation.

## Features

- **Cross-platform support**: Works on Windows, macOS, and Linux
- **Dual-mode operation**: 
  - Browser mode: Local hotkeys (only when app has focus)
  - Tauri mode: Global hotkeys (works even when app is not focused)
- **Automatic detection**: Seamlessly switches between browser and Tauri implementations
- **Conflict detection**: Warns about duplicate or conflicting hotkey registrations
- **Validation**: Validates hotkey configurations before registration
- **React integration**: Provides a convenient `useHotkey` hook

## Architecture

```
┌─────────────────────────────────────────┐
│         HotkeyService                    │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Environment Detection              │ │
│  │  (Browser vs Tauri)                 │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │   Browser    │  │     Tauri        │ │
│  │   Handler    │  │  Global Shortcut │ │
│  │  (KeyEvent)  │  │     Plugin       │ │
│  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────┘
```

## Installation

The service is already included in the project. For Tauri support, ensure the global shortcut plugin is installed:

```bash
npm install @tauri-apps/plugin-global-shortcut
```

## Usage

### Using the React Hook (Recommended)

```tsx
import { useHotkey } from '@/hooks/useHotkey';

function MyComponent() {
  useHotkey(
    {
      id: 'toggle-recording',
      key: 'r',
      modifiers: ['ctrl', 'shift'],
      description: 'Toggle recording',
      enabled: true,
      global: true, // Works globally in Tauri
    },
    () => {
      console.log('Hotkey triggered!');
      // Your action here
    }
  );

  return <div>Press Ctrl+Shift+R</div>;
}
```

### Using the Service Directly

```typescript
import { hotkeyService } from '@/services/hotkey/HotkeyService';

// Register a hotkey
await hotkeyService.register(
  {
    id: 'my-hotkey',
    key: 'space',
    modifiers: ['ctrl', 'shift'],
    description: 'My custom hotkey',
    enabled: true,
    global: true,
  },
  (event) => {
    console.log('Hotkey pressed!');
  }
);

// Unregister when done
await hotkeyService.unregister('my-hotkey');
```

## API Reference

### HotkeyConfig

```typescript
interface HotkeyConfig {
  id: string;              // Unique identifier
  key: string;             // Key to press (e.g., 'r', 'space', 'f1')
  modifiers: ModifierKey[]; // ['ctrl', 'shift', 'alt', 'meta']
  description: string;     // Human-readable description
  enabled: boolean;        // Whether the hotkey is active
  global?: boolean;        // Global hotkey (Tauri only)
}
```

### HotkeyService Methods

#### `register(config: HotkeyConfig, callback: HotkeyCallback): Promise<void>`
Register a new hotkey.

#### `unregister(id: string): Promise<void>`
Unregister a hotkey by ID.

#### `validate(config: HotkeyConfig): HotkeyValidationResult`
Validate a hotkey configuration.

#### `checkConflicts(config: HotkeyConfig): HotkeyConflict[]`
Check for conflicts with existing hotkeys.

#### `getPlatformInfo(): PlatformHotkeyInfo`
Get information about the current platform and capabilities.

#### `formatHotkey(config: HotkeyConfig): string`
Format a hotkey for display (e.g., "Ctrl+Shift+R").

#### `parseHotkey(hotkeyString: string): Partial<HotkeyConfig> | null`
Parse a hotkey string into a config object.

## Environment Detection

The service automatically detects whether it's running in a browser or Tauri environment:

```typescript
// Check if global hotkeys are supported
const platformInfo = hotkeyService.getPlatformInfo();
console.log(platformInfo.supportsGlobalHotkeys); // true in Tauri, false in browser
```

## Browser Mode

In browser mode:
- Hotkeys only work when the app has focus
- Uses standard keyboard event listeners
- `global: true` flag is ignored
- Works in development with `npm run dev`

## Tauri Mode

In Tauri mode:
- Hotkeys work even when app is not focused
- Uses Tauri's global shortcut plugin
- Requires proper Tauri setup and permissions
- `global: true` enables system-wide hotkeys

## Hotkey Format

### Modifiers
- `ctrl` - Control key (⌃ on macOS)
- `shift` - Shift key (⇧ on macOS)
- `alt` - Alt/Option key (⌥ on macOS)
- `meta` - Windows/Command key (⌘ on macOS)

### Keys
- Single characters: `'a'`, `'b'`, `'1'`, etc.
- Special keys: `'space'`, `'enter'`, `'escape'`, `'tab'`
- Function keys: `'f1'`, `'f2'`, ..., `'f12'`
- Arrow keys: `'arrowup'`, `'arrowdown'`, `'arrowleft'`, `'arrowright'`

### Examples
- `Ctrl+Shift+R` - Cross-platform recording toggle
- `Ctrl+Shift+Space` - Quick capture
- `Alt+F1` - Help menu
- `Meta+T` - New tab (Command+T on macOS, Win+T on Windows)

## Best Practices

### 1. Use Unique IDs
```typescript
// Good
id: 'toggle-recording'

// Bad
id: 'hotkey1'
```

### 2. Always Use Modifiers
```typescript
// Good - unlikely to conflict
modifiers: ['ctrl', 'shift']

// Bad - conflicts with typing
modifiers: []
```

### 3. Validate Before Registering
```typescript
const validation = hotkeyService.validate(config);
if (!validation.valid) {
  console.error('Invalid hotkey:', validation.errors);
  return;
}
```

### 4. Handle Conflicts
```typescript
const conflicts = hotkeyService.checkConflicts(config);
if (conflicts.length > 0) {
  console.warn('Hotkey conflicts:', conflicts);
  // Prompt user to choose different hotkey
}
```

### 5. Clean Up on Unmount
```typescript
useEffect(() => {
  hotkeyService.register(config, callback);
  
  return () => {
    hotkeyService.unregister(config.id);
  };
}, []);
```

## Recommended Hotkeys

For this voice recording application:

- **Primary**: `Ctrl+Shift+Space` - Toggle recording
- **Alternative**: `Ctrl+Shift+R` - Toggle recording
- **Stop**: `Escape` - Stop recording
- **History**: `Ctrl+Shift+H` - Show history

## Troubleshooting

### Hotkeys Not Working in Tauri

1. Ensure Tauri is properly initialized
2. Check that the global shortcut plugin is installed
3. Verify permissions in `src-tauri/capabilities/default.json`
4. Check console for error messages

### Hotkeys Not Working in Browser

1. Ensure the app has focus
2. Check that you're not typing in an input field
3. Verify the hotkey is enabled
4. Check for JavaScript errors in console

### Conflicts with System Hotkeys

Some hotkeys are reserved by the operating system:
- `Ctrl+C`, `Ctrl+V`, `Ctrl+X` - Copy/Paste/Cut
- `Alt+F4` - Close window (Windows)
- `Command+Q` - Quit (macOS)
- `F11` - Fullscreen

Choose different combinations to avoid conflicts.

## Testing

Run the hotkey service tests:

```bash
npm test -- src/services/hotkey
```

## Future Enhancements

- [x] User-customizable hotkeys via configuration service
- [ ] Hotkey recording widget (press keys to set)
- [ ] Import/export hotkey configurations
- [ ] Hotkey profiles (different sets for different workflows)
- [ ] Visual hotkey cheat sheet overlay

## Configuration Service

The `HotkeyConfigService` provides persistent storage and management of hotkey configurations.

### Features

- **Persistent Storage**: Saves hotkey configurations to localStorage
- **Preset Management**: Switch between predefined hotkey presets
- **Custom Hotkeys**: Override preset hotkeys with custom configurations
- **Import/Export**: Backup and restore hotkey configurations
- **Statistics**: Track customization and usage

### Usage

```typescript
import { hotkeyConfigService } from '@/services/hotkey';

// Initialize (load from storage)
await hotkeyConfigService.initialize();

// Get all configured hotkeys
const hotkeys = hotkeyConfigService.getAllHotkeys();

// Customize a hotkey
await hotkeyConfigService.setHotkey('toggle-recording', {
  key: 'r',
  modifiers: ['ctrl', 'alt'],
  description: 'Toggle recording',
  enabled: true,
  global: true,
});

// Switch preset
await hotkeyConfigService.setActivePreset('Minimal');

// Enable/disable a hotkey
await hotkeyConfigService.setHotkeyEnabled('toggle-recording', false);

// Export configuration
const config = hotkeyConfigService.exportConfig();

// Import configuration
await hotkeyConfigService.importConfig(config);

// Reset to defaults
await hotkeyConfigService.resetToDefaults();
```

### API Reference

#### Configuration Management

- `initialize()` - Load configuration from storage
- `getConfig()` - Get current configuration data
- `saveConfig()` - Save configuration to storage
- `clearConfig()` - Clear all configuration

#### Hotkey Management

- `getAllHotkeys()` - Get all hotkeys (preset + custom)
- `getHotkey(id)` - Get specific hotkey configuration
- `setHotkey(id, config)` - Set custom hotkey
- `removeCustomHotkey(id)` - Remove custom hotkey (revert to preset)
- `setHotkeyEnabled(id, enabled)` - Enable/disable hotkey

#### Preset Management

- `getActivePreset()` - Get currently active preset
- `setActivePreset(name)` - Switch to different preset
- `getAvailablePresets()` - Get all available presets

#### Utilities

- `isCustomized(id)` - Check if hotkey is customized
- `getStats()` - Get configuration statistics
- `exportConfig()` - Export as JSON string
- `importConfig(json)` - Import from JSON string
- `resetToDefaults()` - Reset all to preset defaults

### Storage Format

Configuration is stored in localStorage with the following structure:

```json
{
  "version": 1,
  "activePreset": "Default",
  "customHotkeys": {
    "toggle-recording": {
      "id": "toggle-recording",
      "key": "r",
      "modifiers": ["ctrl", "alt"],
      "description": "Toggle recording",
      "enabled": true,
      "global": true
    }
  },
  "lastUpdated": "2024-01-30T12:00:00.000Z"
}
```

### Integration Example

See `config-example-usage.tsx` for complete examples including:
- Settings UI components
- Preset selector
- Hotkey list with enable/disable
- Import/export functionality
- Configuration statistics

## Future Enhancements

- [ ] Hotkey recording widget (press keys to set)
- [ ] Hotkey profiles (different sets for different workflows)
- [ ] Visual hotkey cheat sheet overlay

## References

- [Tauri Global Shortcut Plugin](https://v2.tauri.app/plugin/global-shortcut/)
- [MDN KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
- [Hotkey API Research](../../../docs/HOTKEY_API_RESEARCH.md)
