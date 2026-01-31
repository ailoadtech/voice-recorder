# Tauri Global Hotkey API Research

## Overview

This document provides research findings on implementing global hotkeys in Tauri desktop applications. Global hotkeys allow users to trigger application actions even when the app is not in focus or is running in the background.

## Tauri Version Differences

### Tauri v1 (Legacy)
- Uses `@tauri-apps/api/globalShortcut` package
- Built-in API, no plugin installation required
- Requires allowlist configuration in `tauri.conf.json`

### Tauri v2 (Current/Recommended)
- Uses `@tauri-apps/plugin-global-shortcut` plugin
- Requires explicit plugin installation
- Uses capability-based permissions system
- More secure and modular architecture

## Platform Support

All three major desktop platforms are supported:
- **Windows**: Fully supported
- **macOS**: Fully supported (requires event loop on main thread)
- **Linux**: X11 only (Wayland support may be limited)

**Platform-specific notes:**
- Windows: Requires win32 event loop running on the thread where hotkey manager is created
- macOS: Event loop must run on main thread; hotkey manager must be created on main thread
- Linux: Currently supports X11 only

## Installation (Tauri v2)

### JavaScript/TypeScript
```bash
npm install @tauri-apps/plugin-global-shortcut
# or
yarn add @tauri-apps/plugin-global-shortcut
# or
pnpm add @tauri-apps/plugin-global-shortcut
```

### Rust (Cargo.toml)
```toml
[dependencies]
tauri-plugin-global-shortcut = "2.0"
```

Or use Tauri CLI:
```bash
npm run tauri add global-shortcut
```

## Configuration

### Permissions (src-tauri/capabilities/default.json)
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

### Rust Setup (src-tauri/src/lib.rs or main.rs)
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

## JavaScript/TypeScript API

### Register a Shortcut
```typescript
import { register } from '@tauri-apps/plugin-global-shortcut';

// Register single shortcut
await register('CommandOrControl+Shift+Space', (event) => {
  console.log('Shortcut triggered!', event);
  // Handle shortcut action
});

// Register multiple shortcuts
await register(['Ctrl+Shift+A', 'Ctrl+Shift+B'], (event) => {
  console.log('One of the shortcuts was triggered:', event.shortcut);
});
```

### Check if Registered
```typescript
import { isRegistered } from '@tauri-apps/plugin-global-shortcut';

const registered = await isRegistered('CommandOrControl+Shift+Space');
console.log('Is registered:', registered);
```

### Unregister Shortcuts
```typescript
import { unregister, unregisterAll } from '@tauri-apps/plugin-global-shortcut';

// Unregister specific shortcut
await unregister('CommandOrControl+Shift+Space');

// Unregister all shortcuts
await unregisterAll();
```

## Shortcut Format

Shortcuts use a cross-platform format with modifiers and keys separated by `+`:

### Modifiers
- `Command` or `Cmd` - macOS Command key
- `Control` or `Ctrl` - Control key
- `Alt` or `Option` - Alt/Option key
- `Shift` - Shift key
- `CommandOrControl` or `CmdOrCtrl` - Command on macOS, Control on Windows/Linux
- `Super` - Windows key (Windows/Linux)

### Keys
- Letter keys: `A-Z`
- Number keys: `0-9`
- Function keys: `F1-F24`
- Special keys: `Space`, `Enter`, `Tab`, `Escape`, `Backspace`, `Delete`
- Arrow keys: `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`

### Examples
- `CommandOrControl+Shift+Space` - Cross-platform
- `Ctrl+Alt+F12` - Windows/Linux specific
- `Command+Shift+C` - macOS specific
- `Super+T` - Windows key + T

## Rust API (Advanced Usage)

For more control, you can implement hotkeys directly in Rust:

```rust
use tauri::Manager;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

pub fn setup_hotkeys(app: &tauri::App) {
    let window = app.get_webview_window("main").unwrap();
    
    // Parse shortcut
    let shortcut = "CommandOrControl+Shift+Space"
        .parse::<Shortcut>()
        .expect("Invalid shortcut");
    
    // Register with handler
    app.global_shortcut()
        .on_shortcut(shortcut, move |_app, scut, event| {
            if let ShortcutState::Pressed = event.state() {
                // Toggle window visibility
                if window.is_visible().unwrap() {
                    window.hide().unwrap();
                } else {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            }
        })
        .expect("Failed to register shortcut");
}
```

## Best Practices

### 1. Choose Unique Shortcuts
- Avoid common system shortcuts (Ctrl+C, Ctrl+V, etc.)
- Use modifier combinations to reduce conflicts
- Recommended: `CommandOrControl+Shift+[Key]` for cross-platform apps

### 2. Handle Conflicts Gracefully
- Check if shortcut is already registered before registering
- Provide user feedback if shortcut registration fails
- Allow users to customize shortcuts

### 3. Unregister on Cleanup
```typescript
// In React component
useEffect(() => {
  register('CommandOrControl+Shift+Space', handler);
  
  return () => {
    unregister('CommandOrControl+Shift+Space');
  };
}, []);
```

### 4. Provide User Customization
- Allow users to change default shortcuts
- Store user preferences (localStorage, config file, etc.)
- Validate shortcuts before registration

### 5. Reserved Shortcuts to Avoid
Common system shortcuts that should not be overridden:
- `Ctrl+C`, `Ctrl+V`, `Ctrl+X` (Copy/Paste/Cut)
- `Ctrl+Z`, `Ctrl+Y` (Undo/Redo)
- `Ctrl+A` (Select All)
- `Alt+F4` (Close Window - Windows)
- `Command+Q` (Quit - macOS)
- `Command+W` (Close Window - macOS)

## Common Use Cases

### 1. Toggle Window Visibility
```typescript
await register('CommandOrControl+Shift+Space', async () => {
  const { appWindow } = await import('@tauri-apps/api/window');
  const isVisible = await appWindow.isVisible();
  
  if (isVisible) {
    await appWindow.hide();
  } else {
    await appWindow.show();
    await appWindow.setFocus();
  }
});
```

### 2. Quick Capture/Recording
```typescript
await register('CommandOrControl+Shift+R', () => {
  // Start/stop recording
  toggleRecording();
});
```

### 3. Show/Hide from System Tray
```typescript
await register('CommandOrControl+Shift+T', async () => {
  const { appWindow } = await import('@tauri-apps/api/window');
  await appWindow.show();
  await appWindow.setFocus();
});
```

## Error Handling

```typescript
try {
  await register('CommandOrControl+Shift+Space', handler);
  console.log('Shortcut registered successfully');
} catch (error) {
  console.error('Failed to register shortcut:', error);
  // Shortcut might be taken by another application
  // Provide fallback or alternative shortcut
}
```

## Testing Considerations

- Test on all target platforms (Windows, macOS, Linux)
- Test with different keyboard layouts
- Test conflict scenarios with other applications
- Test when app is in foreground vs background
- Test when app is minimized or in system tray

## Performance Considerations

- Hotkey handlers should be lightweight and fast
- Avoid blocking operations in hotkey handlers
- Use async operations for heavy tasks
- Debounce rapid key presses if needed

## Security Considerations

- Global hotkeys work even when app is not focused
- Be careful with sensitive operations triggered by hotkeys
- Consider requiring additional confirmation for destructive actions
- Use capability-based permissions in Tauri v2

## Migration from v1 to v2

### v1 Code
```typescript
import { register } from '@tauri-apps/api/globalShortcut';

await register('CommandOrControl+Shift+C', () => {
  console.log('Shortcut triggered');
});
```

### v2 Code
```typescript
import { register } from '@tauri-apps/plugin-global-shortcut';

await register('CommandOrControl+Shift+C', (event) => {
  console.log('Shortcut triggered', event);
});
```

**Key differences:**
- Different import path (plugin vs api)
- Handler receives event object in v2
- Requires plugin installation and setup in v2
- Uses capability-based permissions in v2

## Recommended Default Shortcut

For this voice recording application:
- **Recommended**: `CommandOrControl+Shift+Space`
- **Alternative**: `CommandOrControl+Shift+V` (V for Voice)
- **Rationale**: 
  - Uses cross-platform modifier
  - Unlikely to conflict with common shortcuts
  - Easy to remember and press
  - Space bar is large and accessible

## References

- [Tauri v2 Global Shortcut Plugin](https://v2.tauri.app/plugin/global-shortcut/)
- [Tauri v1 Global Shortcut API](https://tauri.app/v1/api/js/globalshortcut/)
- [global-hotkey Rust Crate](https://github.com/tauri-apps/global-hotkey)
- [Tauri Plugin System](https://v2.tauri.app/develop/plugins/)

---

*Content was rephrased for compliance with licensing restrictions*
