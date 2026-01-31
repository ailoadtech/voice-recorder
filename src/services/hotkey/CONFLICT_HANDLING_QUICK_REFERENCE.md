# Hotkey Conflict Handling - Quick Reference

## Quick Start

### Check for Conflicts
```typescript
import { hotkeyService } from '@/services/hotkey/HotkeyService';

const conflicts = hotkeyService.checkConflicts(config);
```

### Register with Auto-Resolution
```typescript
// Automatically resolves conflicts by disabling existing hotkeys
await hotkeyService.register(config, callback);
```

### Manual Resolution
```typescript
const resolution = await hotkeyService.resolveConflicts(
  config,
  'disable-existing' // or 'disable-new', 'allow-both', 'prompt-user'
);
```

## Common Patterns

### Pattern 1: Safe Registration
```typescript
const config: HotkeyConfig = {
  id: 'my-action',
  key: 'r',
  modifiers: ['ctrl', 'shift'],
  description: 'My Action',
  enabled: true,
};

// Check first
const conflicts = hotkeyService.checkConflicts(config);
if (conflicts.length === 0) {
  await hotkeyService.register(config, handleAction);
} else {
  // Handle conflicts
  console.warn('Conflicts detected:', conflicts);
}
```

### Pattern 2: System Reserved Check
```typescript
if (hotkeyService.isSystemReserved(config)) {
  console.warn('This hotkey is reserved by the system');
  // Suggest alternative or warn user
}
```

### Pattern 3: UI Integration
```typescript
import { HotkeyConflictDialog } from '@/components/HotkeyConflictDialog';

function MyComponent() {
  const [conflicts, setConflicts] = useState([]);
  const [showDialog, setShowDialog] = useState(false);

  const handleSave = async () => {
    const conflicts = hotkeyService.checkConflicts(config);
    if (conflicts.length > 0) {
      setConflicts(conflicts);
      setShowDialog(true);
    } else {
      await save();
    }
  };

  return (
    <>
      <HotkeyConflictDialog
        conflicts={conflicts}
        hotkeyName="My Hotkey"
        hotkeyDisplay="Ctrl+Shift+R"
        onResolve={handleResolve}
        onCancel={() => setShowDialog(false)}
        isOpen={showDialog}
      />
      {/* Your UI */}
    </>
  );
}
```

## Resolution Strategies

| Strategy | When to Use | Result |
|----------|-------------|--------|
| `disable-existing` | New hotkey is more important | Disables conflicting hotkeys |
| `disable-new` | Keep existing hotkeys | New hotkey not registered |
| `allow-both` | Testing/special cases | Both registered (may conflict) |
| `prompt-user` | Interactive resolution | Shows dialog to user |

## Conflict Types

### Application Conflict
```typescript
{
  hotkeyId: 'new-hotkey',
  conflictsWith: ['existing-hotkey'],
  reason: 'Same key combination already registered',
  severity: 'error',
  systemLevel: false
}
```

### System Conflict
```typescript
{
  hotkeyId: 'my-hotkey',
  conflictsWith: ['system'],
  reason: 'Conflicts with system-reserved hotkey',
  severity: 'warning',
  systemLevel: true
}
```

## API Quick Reference

### Detection
- `checkConflicts(config)` - Check for conflicts
- `isSystemReserved(config)` - Check if system reserved
- `getSystemReservedHotkeys()` - Get all reserved hotkeys

### Resolution
- `resolveConflicts(config, strategy)` - Resolve conflicts
- `register(config, callback)` - Register with auto-resolution

### History
- `getConflictHistory(id)` - Get conflict history
- `clearConflictHistory(id?)` - Clear history

### Utility
- `formatHotkey(config)` - Format for display
- `getRegistrations()` - Get all registered hotkeys
- `setEnabled(id, enabled)` - Enable/disable hotkey

## Common Issues

### Issue: Hotkey not working
**Check:**
1. Is it system reserved? `isSystemReserved(config)`
2. Is it enabled? `getRegistrations()`
3. Any conflicts? `checkConflicts(config)`

### Issue: Conflict dialog not showing
**Check:**
1. Is dialog component rendered?
2. Is `isOpen` prop true?
3. Are conflicts passed correctly?

### Issue: Resolution not working
**Check:**
1. Is strategy valid?
2. Are system conflicts being resolved? (can't disable system)
3. Check resolution result message

## Testing

```typescript
import { HotkeyService } from '@/services/hotkey/HotkeyService';

describe('My Hotkey Tests', () => {
  let service: HotkeyService;

  beforeEach(() => {
    service = new HotkeyService();
  });

  afterEach(async () => {
    await service.destroy();
  });

  it('should detect conflicts', async () => {
    await service.register(config1, () => {});
    const conflicts = service.checkConflicts(config2);
    expect(conflicts.length).toBeGreaterThan(0);
  });
});
```

## Best Practices

1. ✅ Always check for conflicts before registration
2. ✅ Provide clear user feedback
3. ✅ Handle system reserved hotkeys gracefully
4. ✅ Test on all target platforms
5. ✅ Document custom hotkeys
6. ❌ Don't override system hotkeys
7. ❌ Don't ignore conflict warnings
8. ❌ Don't use single-key hotkeys without modifiers

## Examples

See `src/services/hotkey/conflict-example.tsx` for complete working examples.

## Documentation

- Full docs: `docs/HOTKEY_CONFLICT_HANDLING.md`
- Implementation: `docs/HOTKEY_CONFLICT_IMPLEMENTATION_SUMMARY.md`
- Hotkey service: `src/services/hotkey/README.md`
