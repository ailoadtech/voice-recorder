# Hotkey Configuration Service - Integration Guide

## Overview

The Hotkey Configuration Service provides a complete solution for managing, customizing, and persisting hotkey configurations in the Voice Intelligence Desktop App.

## Quick Start

### 1. Initialize on App Startup

Add this to your main app component or layout:

```typescript
import { hotkeyConfigService } from '@/services/hotkey';

useEffect(() => {
  const init = async () => {
    await hotkeyConfigService.initialize();
    console.log('Hotkey configuration loaded');
  };
  init();
}, []);
```

### 2. Register Hotkeys from Configuration

```typescript
import { hotkeyConfigService, hotkeyService, DEFAULT_HOTKEY_IDS } from '@/services/hotkey';

useEffect(() => {
  const registerHotkeys = async () => {
    await hotkeyConfigService.initialize();
    const hotkeys = hotkeyConfigService.getAllHotkeys();
    
    // Register toggle recording hotkey
    const toggleConfig = hotkeys[DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING];
    if (toggleConfig?.enabled) {
      await hotkeyService.register(toggleConfig, () => {
        // Your recording toggle logic
        console.log('Toggle recording');
      });
    }
  };
  
  registerHotkeys();
}, []);
```

### 3. Create Settings UI

```typescript
import { hotkeyConfigService } from '@/services/hotkey';

function HotkeySettings() {
  const [presets, setPresets] = useState([]);
  const [activePreset, setActivePreset] = useState('');
  
  useEffect(() => {
    setPresets(hotkeyConfigService.getAvailablePresets());
    setActivePreset(hotkeyConfigService.getActivePreset()?.name || '');
  }, []);
  
  const handlePresetChange = async (name: string) => {
    await hotkeyConfigService.setActivePreset(name);
    setActivePreset(name);
    // Re-register hotkeys with new preset
  };
  
  return (
    <select value={activePreset} onChange={(e) => handlePresetChange(e.target.value)}>
      {presets.map(p => (
        <option key={p.name} value={p.name}>{p.name}</option>
      ))}
    </select>
  );
}
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│         Application Layer                       │
│  (React Components, Hooks)                      │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│      HotkeyConfigService                        │
│  - Load/Save Configuration                      │
│  - Manage Presets                               │
│  - Custom Hotkey Overrides                      │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│         localStorage                            │
│  (Persistent Storage)                           │
└─────────────────────────────────────────────────┘
```

## Configuration Flow

1. **App Startup**
   - `hotkeyConfigService.initialize()` loads config from localStorage
   - If no config exists, default preset is used
   - Configuration is cached in memory

2. **Hotkey Registration**
   - Get hotkeys from config service
   - Register enabled hotkeys with `hotkeyService`
   - Hotkeys are now active and listening

3. **User Customization**
   - User changes hotkey in settings UI
   - `setHotkey()` validates and saves to config
   - App re-registers hotkeys with new configuration

4. **Preset Switching**
   - User selects different preset
   - `setActivePreset()` clears custom hotkeys
   - App re-registers hotkeys from new preset

## Best Practices

### 1. Initialize Early

Initialize the config service as early as possible in your app lifecycle:

```typescript
// In app/layout.tsx or _app.tsx
useEffect(() => {
  hotkeyConfigService.initialize();
}, []);
```

### 2. Re-register on Config Changes

When configuration changes, unregister old hotkeys and register new ones:

```typescript
const updateHotkeys = async () => {
  // Unregister all
  const oldHotkeys = hotkeyConfigService.getAllHotkeys();
  for (const id of Object.keys(oldHotkeys)) {
    await hotkeyService.unregister(id);
  }
  
  // Register new
  const newHotkeys = hotkeyConfigService.getAllHotkeys();
  for (const [id, config] of Object.entries(newHotkeys)) {
    if (config.enabled) {
      await hotkeyService.register(config, callbacks[id]);
    }
  }
};
```

### 3. Validate Before Saving

Always validate hotkey configurations before saving:

```typescript
const customizeHotkey = async (id: string, config: HotkeyConfig) => {
  const validation = hotkeyService.validate(config);
  if (!validation.valid) {
    alert(`Invalid hotkey: ${validation.errors.join(', ')}`);
    return;
  }
  
  await hotkeyConfigService.setHotkey(id, config);
};
```

### 4. Handle Conflicts

Check for conflicts and warn users:

```typescript
const conflicts = hotkeyService.checkConflicts(config);
if (conflicts.length > 0) {
  const confirmed = confirm(
    `This hotkey conflicts with: ${conflicts[0].conflictsWith.join(', ')}. Continue?`
  );
  if (!confirmed) return;
}
```

### 5. Provide Reset Option

Always give users a way to reset to defaults:

```typescript
<button onClick={() => hotkeyConfigService.resetToDefaults()}>
  Reset to Defaults
</button>
```

## Common Patterns

### Pattern 1: Settings Page

```typescript
function HotkeySettingsPage() {
  const [hotkeys, setHotkeys] = useState({});
  
  useEffect(() => {
    setHotkeys(hotkeyConfigService.getAllHotkeys());
  }, []);
  
  return (
    <div>
      {Object.entries(hotkeys).map(([id, config]) => (
        <HotkeyEditor
          key={id}
          id={id}
          config={config}
          onSave={(newConfig) => {
            hotkeyConfigService.setHotkey(id, newConfig);
            setHotkeys(hotkeyConfigService.getAllHotkeys());
          }}
        />
      ))}
    </div>
  );
}
```

### Pattern 2: Preset Selector

```typescript
function PresetSelector() {
  const presets = hotkeyConfigService.getAvailablePresets();
  const active = hotkeyConfigService.getActivePreset();
  
  return (
    <select
      value={active?.name}
      onChange={(e) => hotkeyConfigService.setActivePreset(e.target.value)}
    >
      {presets.map(p => (
        <option key={p.name} value={p.name}>
          {p.name} - {p.description}
        </option>
      ))}
    </select>
  );
}
```

### Pattern 3: Enable/Disable Toggle

```typescript
function HotkeyToggle({ id }: { id: string }) {
  const hotkey = hotkeyConfigService.getHotkey(id);
  
  return (
    <label>
      <input
        type="checkbox"
        checked={hotkey?.enabled}
        onChange={(e) => {
          hotkeyConfigService.setHotkeyEnabled(id, e.target.checked);
        }}
      />
      {hotkey?.description}
    </label>
  );
}
```

### Pattern 4: Import/Export

```typescript
function ConfigBackup() {
  const handleExport = () => {
    const config = hotkeyConfigService.exportConfig();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hotkey-config.json';
    a.click();
  };
  
  const handleImport = async (file: File) => {
    const text = await file.text();
    await hotkeyConfigService.importConfig(text);
  };
  
  return (
    <>
      <button onClick={handleExport}>Export</button>
      <input type="file" onChange={(e) => handleImport(e.target.files[0])} />
    </>
  );
}
```

## Testing

### Unit Tests

```typescript
import { HotkeyConfigService } from './HotkeyConfigService';

describe('HotkeyConfigService', () => {
  let service: HotkeyConfigService;
  
  beforeEach(() => {
    localStorage.clear();
    service = new HotkeyConfigService();
  });
  
  it('should load default config', async () => {
    await service.initialize();
    const config = service.getConfig();
    expect(config.version).toBe(1);
  });
  
  it('should save custom hotkey', async () => {
    await service.setHotkey('test', {
      key: 'r',
      modifiers: ['ctrl'],
      description: 'Test',
      enabled: true,
    });
    
    expect(service.isCustomized('test')).toBe(true);
  });
});
```

### Integration Tests

```typescript
it('should persist configuration across sessions', async () => {
  const service1 = new HotkeyConfigService();
  await service1.initialize();
  await service1.setHotkey('test', { /* config */ });
  
  // Simulate new session
  const service2 = new HotkeyConfigService();
  await service2.initialize();
  
  expect(service2.isCustomized('test')).toBe(true);
});
```

## Troubleshooting

### Configuration Not Persisting

**Problem**: Changes are lost on page reload

**Solution**: Ensure `initialize()` is called on app startup and `saveConfig()` is called after changes

### Hotkeys Not Working After Config Change

**Problem**: Hotkeys don't respond after customization

**Solution**: Re-register hotkeys with `hotkeyService` after configuration changes

### localStorage Quota Exceeded

**Problem**: Error when saving configuration

**Solution**: Implement cleanup of old data or use IndexedDB for larger storage

### Conflicts Not Detected

**Problem**: Multiple hotkeys with same combination

**Solution**: Always call `checkConflicts()` before saving and warn users

## Migration Guide

### From Manual Configuration

If you're currently managing hotkeys manually:

1. Replace manual hotkey definitions with config service:
   ```typescript
   // Before
   const HOTKEYS = {
     toggleRecording: { key: 'r', modifiers: ['ctrl', 'shift'] }
   };
   
   // After
   const hotkeys = hotkeyConfigService.getAllHotkeys();
   ```

2. Replace hardcoded registrations:
   ```typescript
   // Before
   hotkeyService.register(HOTKEYS.toggleRecording, callback);
   
   // After
   const config = hotkeyConfigService.getHotkey('toggle-recording');
   if (config?.enabled) {
     hotkeyService.register(config, callback);
   }
   ```

3. Add settings UI for customization

## Next Steps

1. **Add Settings Page**: Create a dedicated page for hotkey customization
2. **Add Hotkey Recorder**: Implement a widget to record key presses
3. **Add Profiles**: Support multiple configuration profiles
4. **Add Cloud Sync**: Sync configurations across devices

## References

- [HotkeyService Documentation](./README.md)
- [Example Usage](./config-example-usage.tsx)
- [Type Definitions](./types.ts)
