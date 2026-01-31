# Global Hotkey Implementation

## Overview

This document describes the implementation of global hotkey registration for the Voice Intelligence Desktop App. The implementation provides a unified API that works in both browser and Tauri desktop environments.

## Implementation Status

✅ **Completed**: Global hotkey registration infrastructure
✅ **Completed**: Browser-based hotkey support (local, when app has focus)
✅ **Completed**: Tauri global hotkey support (system-wide, works when app is not focused)
✅ **Completed**: React hook for easy integration
✅ **Completed**: Integration with RecordingButton component
✅ **Ready**: Automatic environment detection

## Architecture

### Components

1. **HotkeyService** (`src/services/hotkey/HotkeyService.ts`)
   - Core service for hotkey management
   - Automatically detects browser vs Tauri environment
   - Provides unified API for both environments
   - Handles registration, validation, and conflict detection

2. **useHotkey Hook** (`src/hooks/useHotkey.ts`)
   - React hook for declarative hotkey registration
   - Automatically handles cleanup on unmount
   - Keeps callback reference up-to-date

3. **RecordingButton** (`src/components/RecordingButton.tsx`)
   - Updated to expose `toggleRecording` method via ref
   - Allows external control (e.g., from hotkeys)
   - Maintains existing UI functionality

4. **Record Page** (`src/app/record/page.tsx`)
   - Integrates global hotkey for recording toggle
   - Uses `Ctrl+Shift+Space` as default hotkey
   - Displays hotkey hint in UI

## How It Works

### Environment Detection

```typescript
function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}
```

The service automatically detects if it's running in Tauri by checking for the `__TAURI__` global object.

### Browser Mode

In browser mode:
- Uses standard `keydown` event listeners
- Only works when app has focus
- Ignores `global: true` flag
- No additional dependencies required

### Tauri Mode

In Tauri mode:
- Dynamically imports `@tauri-apps/plugin-global-shortcut`
- Registers system-wide hotkeys
- Works even when app is not focused
- Falls back to browser mode if plugin unavailable

### Hotkey Registration Flow

```
User Component
    ↓
useHotkey Hook
    ↓
HotkeyService
    ↓
Environment Detection
    ↓
┌─────────────┬─────────────┐
│   Browser   │    Tauri    │
│   Handler   │   Plugin    │
└─────────────┴─────────────┘
```

## Usage Examples

### Basic Usage (React Hook)

```tsx
import { useHotkey } from '@/hooks/useHotkey';

function MyComponent() {
  useHotkey(
    {
      id: 'my-action',
      key: 'r',
      modifiers: ['ctrl', 'shift'],
      description: 'My action',
      enabled: true,
      global: true,
    },
    () => {
      console.log('Hotkey triggered!');
    }
  );

  return <div>Press Ctrl+Shift+R</div>;
}
```

### Direct Service Usage

```typescript
import { hotkeyService } from '@/services/hotkey/HotkeyService';

await hotkeyService.register(
  {
    id: 'custom-hotkey',
    key: 'space',
    modifiers: ['ctrl', 'shift'],
    description: 'Custom hotkey',
    enabled: true,
    global: true,
  },
  (event) => {
    console.log('Hotkey pressed!');
  }
);
```

### Integration with Components

```tsx
const recordingButtonRef = useRef<RecordingButtonHandle>(null);

useHotkey(
  {
    id: 'toggle-recording',
    key: 'space',
    modifiers: ['ctrl', 'shift'],
    description: 'Toggle recording',
    enabled: true,
    global: true,
  },
  () => {
    recordingButtonRef.current?.toggleRecording();
  }
);

<RecordingButton ref={recordingButtonRef} ... />
```

## Default Hotkeys

| Action | Hotkey | Description |
|--------|--------|-------------|
| Toggle Recording | `Ctrl+Shift+Space` | Start/stop voice recording |

## Tauri Setup Requirements

For global hotkeys to work in Tauri, the following setup is required:

### 1. Install Plugin

```bash
npm install @tauri-apps/plugin-global-shortcut
```

### 2. Configure Permissions

Add to `src-tauri/capabilities/default.json`:

```json
{
  "permissions": [
    "global-shortcut:allow-register",
    "global-shortcut:allow-unregister",
    "global-shortcut:allow-is-registered",
    "global-shortcut:allow-unregister-all"
  ]
}
```

### 3. Initialize Plugin

Add to `src-tauri/src/lib.rs` or `main.rs`:

```rust
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(desktop)]
            app.handle().plugin(
                tauri_plugin_global_shortcut::Builder::new()
                    .build()
            )?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## Testing

### Browser Testing

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/record`

3. Ensure the app has focus

4. Press `Ctrl+Shift+Space` to toggle recording

### Tauri Testing

1. Initialize Tauri (if not already done):
   ```bash
   npm run tauri init
   ```

2. Run Tauri development mode:
   ```bash
   npm run tauri:dev
   ```

3. Press `Ctrl+Shift+Space` from anywhere (app doesn't need focus)

4. Recording should toggle

## Features

### ✅ Implemented

- [x] Environment detection (browser vs Tauri)
- [x] Browser-based hotkey support
- [x] Tauri global hotkey support
- [x] Automatic fallback to browser mode
- [x] Hotkey validation
- [x] Conflict detection
- [x] React hook integration
- [x] Component ref integration
- [x] Cross-platform modifier keys
- [x] Comprehensive documentation

### 🔄 Future Enhancements

- [ ] User-customizable hotkeys via settings UI
- [ ] Hotkey recording widget
- [ ] Multiple hotkey profiles
- [ ] Visual hotkey cheat sheet
- [ ] Hotkey conflict resolution UI
- [ ] Import/export hotkey configurations

## API Reference

### HotkeyService

#### Methods

- `register(config, callback): Promise<void>` - Register a hotkey
- `unregister(id): Promise<void>` - Unregister a hotkey
- `validate(config): HotkeyValidationResult` - Validate configuration
- `checkConflicts(config): HotkeyConflict[]` - Check for conflicts
- `getPlatformInfo(): PlatformHotkeyInfo` - Get platform information
- `formatHotkey(config): string` - Format for display
- `parseHotkey(string): Partial<HotkeyConfig>` - Parse hotkey string

### useHotkey Hook

```typescript
useHotkey(config: HotkeyConfig, callback: HotkeyCallback): void
```

### RecordingButtonHandle

```typescript
interface RecordingButtonHandle {
  toggleRecording: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
}
```

## Troubleshooting

### Hotkeys Not Working

1. **Check console for errors**: Look for registration failures
2. **Verify app has focus** (browser mode only)
3. **Check Tauri setup**: Ensure plugin is installed and configured
4. **Verify permissions**: Check Tauri capabilities configuration
5. **Test with different hotkey**: Some keys may be reserved by OS

### Conflicts with System Hotkeys

Avoid these reserved combinations:
- `Ctrl+C`, `Ctrl+V`, `Ctrl+X` (Copy/Paste/Cut)
- `Alt+F4` (Close window - Windows)
- `Command+Q` (Quit - macOS)
- `F11` (Fullscreen)

### Plugin Not Loading

If Tauri plugin fails to load:
1. Service automatically falls back to browser mode
2. Check console for warning message
3. Verify plugin installation: `npm list @tauri-apps/plugin-global-shortcut`
4. Ensure Tauri is properly initialized

## Performance Considerations

- Hotkey handlers are lightweight and execute immediately
- No performance impact when app is idle
- Browser mode uses passive event listeners
- Tauri mode uses native OS hotkey registration

## Security Considerations

- Global hotkeys work even when app is not focused
- Validate user input before executing sensitive operations
- Consider requiring confirmation for destructive actions
- Use Tauri's capability-based permissions system

## Related Documentation

- [Hotkey Service README](../src/services/hotkey/README.md)
- [Hotkey API Research](./HOTKEY_API_RESEARCH.md)
- [Example Usage](../src/services/hotkey/example-usage.tsx)
- [Tauri Global Shortcut Plugin](https://v2.tauri.app/plugin/global-shortcut/)

## Conclusion

The global hotkey implementation provides a robust, cross-platform solution for keyboard shortcuts in the Voice Intelligence Desktop App. It works seamlessly in both browser and Tauri environments, with automatic detection and graceful fallback. The implementation is ready for use and will automatically enable global hotkeys once Tauri is fully set up.
