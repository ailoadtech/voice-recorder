# Tauri Quick Start

Quick reference for working with Tauri desktop features.

## Running the App

```bash
# Development mode (with hot reload)
npm run tauri:dev

# Build for production
npm run build && npm run tauri:build
```

## Using Tauri in Code

### Check if Running in Desktop

```typescript
import { tauriService } from '@/services/tauri';

if (tauriService.isRunningInDesktop()) {
  // Desktop-specific code
}
```

### React Hook

```typescript
import { useTauri } from '@/hooks/useTauri';

function MyComponent() {
  const { 
    isDesktop,
    isWindowVisible,
    minimizeToTray,
    showWindow,
    onGlobalShortcut 
  } = useTauri();

  // Listen for global shortcut
  useEffect(() => {
    if (isDesktop) {
      return onGlobalShortcut(() => {
        console.log('Shortcut pressed!');
      });
    }
  }, [isDesktop, onGlobalShortcut]);

  return (
    <button onClick={minimizeToTray}>
      Minimize to Tray
    </button>
  );
}
```

### Call Tauri Commands

```typescript
import { invoke } from '@tauri-apps/api/core';

// Toggle recording
await invoke('toggle_recording');

// Minimize to tray
await invoke('minimize_to_tray');

// Show window
await invoke('show_window');
```

### Listen to Events

```typescript
import { listen } from '@tauri-apps/api/event';

const unlisten = await listen('toggle-recording', () => {
  console.log('Recording toggled from backend');
});

// Cleanup
unlisten();
```

## Configuration

### Change Global Shortcut

Edit `src-tauri/tauri.conf.json`:

```json
{
  "plugins": {
    "globalShortcut": {
      "shortcuts": {
        "record": "CommandOrControl+Shift+R"
      }
    }
  }
}
```

### Change Window Size

Edit `src-tauri/tauri.conf.json`:

```json
{
  "app": {
    "windows": [{
      "width": 1400,
      "height": 900,
      "minWidth": 800,
      "minHeight": 600
    }]
  }
}
```

### Change Tray Icon

Replace files in `src-tauri/icons/`:
- `icon.png` - System tray icon
- `32x32.png`, `128x128.png`, etc.

Or use:
```bash
npm run tauri:icon path/to/your/icon.png
```

## Troubleshooting

### Build Fails

```bash
# Check Rust installation
rustc --version

# Update Rust
rustup update

# Clean and rebuild
cd src-tauri
cargo clean
cd ..
npm run tauri:build
```

### Global Shortcut Not Working

1. Check if another app uses the same shortcut
2. Try different key combination
3. Check console for errors

### System Tray Not Showing (Linux)

```bash
# Install required packages
sudo apt-get install libayatana-appindicator3-dev

# Ensure system tray extension is enabled
```

## File Locations

- **Tauri Config:** `src-tauri/tauri.conf.json`
- **Rust Code:** `src-tauri/src/main.rs`
- **Icons:** `src-tauri/icons/`
- **Build Output:** `src-tauri/target/release/bundle/`

## Common Tasks

### Add New Tauri Command

1. Add function in `src-tauri/src/main.rs`:
```rust
#[tauri::command]
fn my_command(arg: String) -> Result<String, String> {
    Ok(format!("Received: {}", arg))
}
```

2. Register in `invoke_handler`:
```rust
.invoke_handler(tauri::generate_handler![
    toggle_recording,
    my_command  // Add here
])
```

3. Call from frontend:
```typescript
await invoke('my_command', { arg: 'hello' });
```

### Add Tray Menu Item

Edit `create_system_tray()` in `src-tauri/src/main.rs`:

```rust
let my_item = CustomMenuItem::new("my_id".to_string(), "My Item");
let tray_menu = SystemTrayMenu::new()
    .add_item(my_item)
    // ... other items
```

Handle click in `handle_system_tray_event()`:

```rust
"my_id" => {
    println!("My item clicked!");
}
```

## Resources

- [Full Setup Guide](./TAURI_SETUP.md)
- [Integration Summary](./TAURI_INTEGRATION_SUMMARY.md)
- [Tauri Docs](https://tauri.app/v2/guides/)
- [Tauri API Reference](https://tauri.app/v2/reference/)
