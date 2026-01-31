# Tauri Desktop Integration

This document describes the Tauri desktop integration for the Voice Intelligence app.

## Overview

The app uses Tauri v2 to provide native desktop functionality including:
- System tray integration
- Global keyboard shortcuts
- Window management
- Native notifications
- File system access

## Architecture

### Frontend (Next.js)
- `src/services/tauri/` - Tauri service wrapper
- `src/hooks/useTauri.ts` - React hook for Tauri features
- `src/components/TrayControls.tsx` - UI for tray controls

### Backend (Rust)
- `src-tauri/src/main.rs` - Main Tauri application
- `src-tauri/tauri.conf.json` - Tauri configuration
- `src-tauri/Cargo.toml` - Rust dependencies

## Features

### 1. System Tray

The app runs in the system tray with the following menu items:
- **Show** - Brings the window to front
- **Start Recording** - Triggers recording via tray
- **Quit** - Exits the application

**Configuration:**
```json
{
  "app": {
    "trayIcon": {
      "iconPath": "icons/icon.png",
      "tooltip": "Voice Intelligence"
    }
  }
}
```

### 2. Global Shortcuts

Default shortcut: `Ctrl+Shift+Space` (Windows/Linux) or `Cmd+Shift+Space` (macOS)

**How it works:**
1. Shortcut registered in `src-tauri/src/main.rs`
2. Triggers `toggle_recording` command
3. Emits event to frontend
4. Frontend components listen via `useTauri` hook

**Customization:**
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

### 3. Window Management

**Minimize to Tray:**
- Clicking X button hides window instead of closing
- Window can be restored from tray menu or shortcut

**Window Configuration:**
```json
{
  "app": {
    "windows": [{
      "title": "Voice Intelligence",
      "width": 1200,
      "height": 800,
      "minWidth": 800,
      "minHeight": 600
    }]
  }
}
```

### 4. Background Operation

The app continues running in the background when minimized:
- System tray icon remains visible
- Global shortcuts remain active
- Can be triggered even when window is hidden

## Development

### Prerequisites

1. **Rust** (1.70+)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **System Dependencies** (Linux only)
   ```bash
   sudo apt-get update
   sudo apt-get install -y \
     libwebkit2gtk-4.1-dev \
     build-essential \
     curl \
     wget \
     file \
     libssl-dev \
     libayatana-appindicator3-dev \
     librsvg2-dev
   ```

3. **Node.js** (18+)

### Running in Development

```bash
# Start Next.js dev server and Tauri
npm run tauri:dev
```

This will:
1. Start Next.js on `localhost:3000`
2. Launch Tauri window pointing to dev server
3. Enable hot reload for both frontend and backend

### Building for Production

```bash
# Build Next.js static export
npm run build

# Build Tauri app
npm run tauri:build
```

Output locations:
- **Windows:** `src-tauri/target/release/bundle/msi/`
- **macOS:** `src-tauri/target/release/bundle/dmg/`
- **Linux:** `src-tauri/target/release/bundle/deb/` or `appimage/`

## Usage in Code

### Check if Running in Desktop

```typescript
import { tauriService } from '@/services/tauri';

if (tauriService.isRunningInDesktop()) {
  // Desktop-specific code
}
```

### Using the Hook

```typescript
import { useTauri } from '@/hooks/useTauri';

function MyComponent() {
  const { 
    isDesktop, 
    minimizeToTray, 
    showWindow,
    onGlobalShortcut 
  } = useTauri();

  useEffect(() => {
    if (isDesktop) {
      const unsubscribe = onGlobalShortcut(() => {
        console.log('Global shortcut pressed!');
      });
      return unsubscribe;
    }
  }, [isDesktop, onGlobalShortcut]);

  return (
    <button onClick={minimizeToTray}>
      Minimize to Tray
    </button>
  );
}
```

### Calling Tauri Commands

```typescript
import { invoke } from '@tauri-apps/api/core';

// Call Rust command
await invoke('toggle_recording');
```

### Listening to Events

```typescript
import { listen } from '@tauri-apps/api/event';

const unlisten = await listen('toggle-recording', () => {
  console.log('Recording toggled from backend');
});

// Cleanup
unlisten();
```

## Icons

### Required Icons

- `32x32.png` - Small icon
- `128x128.png` - Standard icon
- `128x128@2x.png` - Retina icon
- `icon.icns` - macOS bundle icon
- `icon.ico` - Windows executable icon
- `icon.png` - Linux/Tray icon

### Generating Icons

```bash
# Generate placeholder icons
node scripts/generate-icons.js

# For production, use proper icon tools
npm run tauri:icon path/to/your/icon.png
```

## Troubleshooting

### Global Shortcut Not Working

1. Check if another app is using the same shortcut
2. Try a different key combination
3. Check console for registration errors

### System Tray Not Showing

**Linux:**
- Ensure system tray extension is installed
- Install `libayatana-appindicator3-dev`

**Windows:**
- Check system tray settings
- Ensure icons are properly generated

### Window Not Hiding on Close

Check `src-tauri/src/main.rs` for the `CloseRequested` event handler.

## Security

Tauri uses a security model that:
- Restricts which commands can be called from frontend
- Validates all IPC messages
- Sandboxes the webview

**Important:** Never expose sensitive operations without proper validation in Rust backend.

## Platform-Specific Notes

### Windows (WSL)
- Build must be done in WSL with proper dependencies
- Resulting `.msi` can be installed on Windows host
- System tray works on Windows host, not in WSL

### macOS
- Requires Xcode Command Line Tools
- Code signing required for distribution
- Notarization required for Gatekeeper

### Linux
- Multiple package formats available (deb, AppImage, rpm)
- System tray support varies by desktop environment
- Test on target distributions

## Next Steps

1. **Design Custom Icons** - Replace placeholder icons
2. **Add Auto-Updater** - Implement Tauri updater plugin
3. **Code Signing** - Set up certificates for distribution
4. **Startup on Boot** - Add system startup integration
5. **Custom Protocols** - Add deep linking support

## Resources

- [Tauri Documentation](https://tauri.app/v2/guides/)
- [Tauri API Reference](https://tauri.app/v2/reference/)
- [Tauri Plugins](https://tauri.app/v2/plugins/)
