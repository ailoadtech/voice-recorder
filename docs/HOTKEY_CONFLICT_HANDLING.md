# Hotkey Conflict Handling

## Overview

The Voice Intelligence Desktop App includes comprehensive hotkey conflict detection and resolution to ensure smooth operation and prevent unexpected behavior when multiple hotkeys use the same key combination.

## Features

### 1. Conflict Detection

The system detects two types of conflicts:

#### Application-Level Conflicts
- Conflicts between hotkeys registered within the application
- Detected when two or more hotkeys use the same key combination
- Severity: **Error** (prevents registration without resolution)

#### System-Level Conflicts
- Conflicts with operating system reserved hotkeys
- Examples: Ctrl+C (copy), Ctrl+V (paste), Alt+F4 (close window)
- Severity: **Warning** (allows registration but warns user)

### 2. Conflict Resolution Strategies

When a conflict is detected, the system offers four resolution strategies:

#### Disable Existing
- Disables the existing conflicting hotkey(s)
- Registers the new hotkey
- **Use case**: When the new hotkey is more important

#### Disable New
- Keeps existing hotkey(s) enabled
- Does not register the new hotkey
- **Use case**: When existing hotkeys should take precedence

#### Allow Both
- Registers both hotkeys (not recommended)
- May cause unexpected behavior
- **Use case**: Testing or special scenarios

#### Prompt User
- Shows a dialog asking the user to choose
- Provides detailed conflict information
- **Use case**: Default behavior for interactive resolution

### 3. System Reserved Hotkeys

The system maintains a list of commonly reserved hotkeys per platform:

#### Common (All Platforms)
- `Ctrl+C` - Copy
- `Ctrl+V` - Paste
- `Ctrl+X` - Cut
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Alt+F4` - Close window
- `Alt+Tab` - Switch windows
- `F11` - Fullscreen
- `F12` - Developer tools

#### Windows-Specific
- `Win+L` - Lock screen
- `Win+D` - Show desktop
- `Win+E` - File explorer
- `Win+R` - Run dialog
- `Ctrl+Shift+Esc` - Task manager

#### macOS-Specific
- `Cmd+Space` - Spotlight
- `Cmd+Q` - Quit app
- `Cmd+W` - Close window
- `Cmd+H` - Hide app
- `Cmd+M` - Minimize

#### Linux-Specific
- `Ctrl+Alt+T` - Terminal
- `Win+L` - Lock screen
- `Alt+F2` - Run command

## Usage

### Programmatic Usage

```typescript
import { hotkeyService } from '@/services/hotkey/HotkeyService';
import type { HotkeyConfig } from '@/services/hotkey/types';

// Check for conflicts before registration
const config: HotkeyConfig = {
  id: 'my-hotkey',
  key: 'r',
  modifiers: ['ctrl', 'shift'],
  description: 'My Custom Hotkey',
  enabled: true,
  global: true,
};

const conflicts = hotkeyService.checkConflicts(config);

if (conflicts.length > 0) {
  console.log('Conflicts detected:', conflicts);
  
  // Resolve conflicts
  const resolution = await hotkeyService.resolveConflicts(
    config,
    'disable-existing'
  );
  
  console.log('Resolution:', resolution);
}

// Register hotkey (auto-resolves conflicts)
await hotkeyService.register(config, (event) => {
  console.log('Hotkey triggered!');
});
```

### UI Integration

The `HotkeyCustomizer` component automatically handles conflicts:

```typescript
import { HotkeyCustomizer } from '@/components/HotkeyCustomizer';

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <HotkeyCustomizer />
    </div>
  );
}
```

When a user tries to set a conflicting hotkey:
1. The system detects the conflict
2. A dialog appears showing conflict details
3. User chooses a resolution strategy
4. The system applies the chosen strategy

### Conflict Dialog

The `HotkeyConflictDialog` component displays:
- Conflicting hotkey information
- Conflict severity (error/warning)
- System vs. application conflicts
- Resolution options
- Clear action buttons

## API Reference

### HotkeyService Methods

#### `checkConflicts(config: HotkeyConfig): HotkeyConflict[]`
Checks for conflicts with existing hotkeys and system reserved hotkeys.

**Returns**: Array of conflicts with details

#### `resolveConflicts(config: HotkeyConfig, strategy: ConflictResolutionStrategy): Promise<ConflictResolutionResult>`
Resolves conflicts using the specified strategy.

**Parameters**:
- `config`: Hotkey configuration to resolve
- `strategy`: Resolution strategy to apply

**Returns**: Resolution result with status and message

#### `isSystemReserved(config: HotkeyConfig): boolean`
Checks if a hotkey conflicts with system reserved hotkeys.

**Returns**: `true` if reserved, `false` otherwise

#### `getSystemReservedHotkeys(): string[]`
Gets the list of system reserved hotkeys for the current platform.

**Returns**: Array of reserved hotkey strings

#### `getConflictHistory(id: string): HotkeyConflict[]`
Gets the conflict history for a specific hotkey.

**Returns**: Array of historical conflicts

#### `clearConflictHistory(id?: string): void`
Clears conflict history for a specific hotkey or all hotkeys.

### Types

```typescript
interface HotkeyConflict {
  hotkeyId: string;
  conflictsWith: string[];
  reason: string;
  severity: 'warning' | 'error';
  systemLevel?: boolean;
}

type ConflictResolutionStrategy = 
  | 'disable-existing'
  | 'disable-new'
  | 'allow-both'
  | 'prompt-user';

interface ConflictResolutionResult {
  resolved: boolean;
  strategy: ConflictResolutionStrategy;
  disabledHotkeys: string[];
  message: string;
}
```

## Best Practices

### 1. Choose Unique Combinations
- Use multiple modifiers (Ctrl+Shift+Key)
- Avoid common system hotkeys
- Test on target platforms

### 2. Handle Conflicts Gracefully
- Always check for conflicts before registration
- Provide clear user feedback
- Offer resolution options

### 3. Document Custom Hotkeys
- Document all custom hotkeys in your app
- Provide a UI for users to view/customize
- Include conflict warnings in documentation

### 4. Platform Considerations
- Test on all target platforms
- Be aware of platform-specific reserved keys
- Provide platform-specific defaults

## Troubleshooting

### Hotkey Not Working

**Possible causes**:
1. Conflict with system hotkey
2. Conflict with another app hotkey
3. Hotkey disabled
4. Tauri global shortcut not initialized

**Solutions**:
1. Check conflict history: `hotkeyService.getConflictHistory(id)`
2. Verify hotkey is enabled: `hotkeyService.isRegistered(id)`
3. Check system reserved list: `hotkeyService.getSystemReservedHotkeys()`
4. Try a different key combination

### Conflict Dialog Not Showing

**Possible causes**:
1. Conflicts auto-resolved
2. Dialog component not rendered
3. State not updated

**Solutions**:
1. Check console for conflict logs
2. Verify `HotkeyConflictDialog` is in component tree
3. Check `showConflictDialog` state

### System Hotkey Override

**Note**: System hotkeys cannot be overridden by the application. If a user tries to use a system reserved hotkey:
1. A warning is shown
2. The hotkey is registered but may not work
3. User should choose a different combination

## Testing

Run the conflict resolution tests:

```bash
npm test -- src/services/hotkey/HotkeyConflictResolution.test.ts
```

Test coverage includes:
- Conflict detection (app and system level)
- All resolution strategies
- Conflict history tracking
- Auto-resolution during registration
- Platform-specific reserved keys

## Future Enhancements

1. **Smart Suggestions**: Suggest alternative key combinations when conflicts occur
2. **Conflict Analytics**: Track most common conflicts to improve defaults
3. **Import/Export**: Allow users to share hotkey configurations
4. **Cloud Sync**: Sync hotkey preferences across devices
5. **Conflict Prediction**: Warn before conflicts occur during key recording

## Related Documentation

- [Hotkey Service README](../src/services/hotkey/README.md)
- [Hotkey Configuration Guide](../src/services/hotkey/CONFIGURATION_GUIDE.md)
- [Global Hotkey Implementation](./GLOBAL_HOTKEY_IMPLEMENTATION.md)
