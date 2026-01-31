# Export Settings Feature

## Overview

The Export Settings feature allows users to configure default export format and options for recordings. These settings are persisted in the application state and used as defaults when exporting recordings.

## Features

### Default Export Format
Users can choose from four export formats:
- **Plain Text (.txt)** - Simple text format
- **Markdown (.md)** - Formatted markdown
- **JSON (.json)** - Structured data
- **CSV (.csv)** - Spreadsheet format

### Export Options
Users can configure which content to include by default:
- **Include Metadata** - Date, duration, and other recording details
- **Include Transcription** - Original transcribed text from audio
- **Include Enriched Output** - AI-processed and formatted text
- **Include Tags** - Recording tags and categories
- **Include Notes** - User-added notes and comments

## Implementation

### State Management
Export settings are stored in the application context (`AppContext`) under `settings.exportSettings`:

```typescript
exportSettings: {
  defaultFormat: 'txt' | 'md' | 'json' | 'csv';
  includeMetadata: boolean;
  includeTranscription: boolean;
  includeEnrichment: boolean;
  includeTags: boolean;
  includeNotes: boolean;
}
```

### Components

#### ExportSettings Component
Location: `src/components/ExportSettings.tsx`

A settings UI component that allows users to:
- Select default export format
- Toggle export options
- See descriptions for each option

#### ExportDialog Component (Updated)
Location: `src/components/ExportDialog.tsx`

Updated to:
- Load default settings from context when opened
- Allow users to override defaults for individual exports
- Maintain user customizations during the export session

### Hooks

#### useSettings Hook (Updated)
Location: `src/hooks/useSettings.ts`

New methods added:
- `updateExportSettings(updates)` - Update export settings
- `setDefaultExportFormat(format)` - Set default format
- `exportSettings` - Access current export settings

## Usage

### For Users

1. Navigate to Settings page
2. Scroll to "Export Settings" section
3. Select preferred default format
4. Toggle desired export options
5. Settings are automatically saved

When exporting a recording:
1. Click Export button
2. Dialog opens with saved defaults
3. Customize if needed for this export
4. Export or copy to clipboard

### For Developers

```typescript
import { useSettings } from '@/hooks/useSettings';

function MyComponent() {
  const { exportSettings, updateExportSettings } = useSettings();
  
  // Read current settings
  console.log(exportSettings.defaultFormat); // 'txt'
  
  // Update settings
  updateExportSettings({
    defaultFormat: 'md',
    includeMetadata: false
  });
}
```

## Testing

### Unit Tests
Location: `src/components/ExportSettings.test.tsx`

Tests cover:
- Rendering of UI elements
- Format selection
- Checkbox toggling
- Settings updates
- State reflection

### Manual Testing

1. **Default Settings**
   - Open Settings page
   - Verify default format is "Plain Text"
   - Verify all options are checked by default

2. **Format Selection**
   - Click different format buttons
   - Verify selected format is highlighted
   - Verify settings are saved

3. **Option Toggling**
   - Toggle each checkbox
   - Verify state updates
   - Verify settings persist

4. **Export Dialog Integration**
   - Change export settings
   - Open export dialog
   - Verify dialog uses saved settings as defaults

## Future Enhancements

- Custom export templates
- Format-specific options (e.g., CSV delimiter)
- Export presets (quick settings profiles)
- Import/export settings configuration
- Per-recording format preferences

## Related Files

- `src/contexts/AppContext.tsx` - State management
- `src/hooks/useSettings.ts` - Settings hook
- `src/components/ExportSettings.tsx` - Settings UI
- `src/components/ExportDialog.tsx` - Export dialog
- `src/services/export/ExportService.ts` - Export logic
- `src/services/export/types.ts` - Type definitions
