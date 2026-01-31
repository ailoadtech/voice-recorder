# HotkeyCustomizer Component

A comprehensive UI component for customizing global keyboard shortcuts in the Voice Intelligence Desktop App.

## Features

### Preset Management
- Select from predefined hotkey presets (Default, Minimal, Mac, Gaming)
- Each preset optimized for different use cases and platforms
- Automatic platform detection for Mac users

### Individual Hotkey Customization
- Edit any hotkey independently
- Visual modifier key selection (Ctrl, Shift, Alt, Meta)
- Interactive key recording - press any key to capture it
- Real-time validation and conflict detection

### Hotkey Management
- Enable/disable individual hotkeys
- Visual indicators for custom hotkeys
- Global hotkey badges for system-wide shortcuts
- Reset to defaults functionality

### User Feedback
- Success messages for configuration changes
- Error messages for validation failures
- Conflict warnings when hotkeys overlap
- Loading states during configuration updates

## Usage

```tsx
import { HotkeyCustomizer } from '@/components';

// Standalone usage
<HotkeyCustomizer />

// With close callback
<HotkeyCustomizer onClose={() => setShowCustomizer(false)} />
```

## Integration

The component is integrated into the Settings page (`src/app/settings/page.tsx`):

1. Click "Customize Hotkeys" button to open the customizer
2. The customizer replaces the simple hotkey display
3. Close button returns to the simple view

## Configuration Persistence

All hotkey configurations are automatically saved to localStorage via the `HotkeyConfigService`:

- Preset selection
- Custom hotkey overrides
- Enable/disable states
- Last updated timestamp

## Keyboard Recording

The component includes a keyboard event listener that captures key presses when in "recording" mode:

1. Click "Record" button next to a hotkey
2. Press any key on your keyboard
3. The key is captured and displayed
4. Special keys (Space, Escape, F1-F12) are handled correctly

## Validation

The component validates hotkeys before saving:

- Non-empty key requirement
- Conflict detection with other hotkeys
- Integration with `HotkeyService.validate()`
- User-friendly error messages

## Testing

Comprehensive test coverage in `HotkeyCustomizer.test.tsx`:

- Rendering and display
- Preset switching
- Hotkey editing workflow
- Modifier toggling
- Enable/disable functionality
- Validation and error handling
- Conflict detection

## Styling

Uses Tailwind CSS for responsive design:

- Mobile-friendly layout
- Clear visual hierarchy
- Accessible form controls
- Consistent with app design system

## Dependencies

- `hotkeyConfigService` - Configuration persistence
- `hotkeyService` - Validation and conflict detection
- React hooks (useState, useEffect, useCallback)
- Tailwind CSS for styling
