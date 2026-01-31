# Batch Export Feature

## Overview

The batch export feature allows users to export multiple recordings at once, providing flexible options for format, file organization, and content inclusion.

## Features

### Export Formats
- **TXT**: Plain text format with clear section headers
- **MD**: Markdown format with proper formatting
- **JSON**: Structured JSON data for programmatic use
- **CSV**: Comma-separated values for spreadsheet applications

### File Organization
- **Single File**: Combine all recordings into one file
  - TXT/MD: Separated by visual dividers
  - JSON: Array of recording objects
  - CSV: Multiple rows with headers
- **Separate Files**: Create individual files for each recording
  - Each file named with recording title and timestamp

### Content Options
Users can choose what to include in the export:
- **Metadata**: Date, duration, tags, enrichment type
- **Transcription**: Original voice-to-text transcription
- **Enriched Output**: AI-processed and enhanced text
- **Tags**: User-defined tags
- **Notes**: Additional user notes

## Usage

### From History List

1. **Select Recordings**
   - Use checkboxes to select individual recordings
   - Or use "Select all on page" to select all visible recordings

2. **Open Batch Export**
   - Click "Export Selected" button in the bulk actions bar
   - The batch export dialog will open

3. **Configure Export**
   - Choose export format (TXT, MD, JSON, CSV)
   - Select file organization (single or separate files)
   - Toggle content options (metadata, transcription, enrichment, etc.)

4. **Export**
   - Click "💾 Export" button
   - Files will be downloaded automatically
   - Selection will be cleared after successful export

### Programmatic Usage

```typescript
import { exportService } from '@/services/export/ExportService';
import type { BatchExportOptions } from '@/services/export/types';

// Export multiple recordings
const options: BatchExportOptions = {
  recordings: selectedRecordings,
  format: 'md',
  separateFiles: true,
  includeMetadata: true,
  includeTranscription: true,
  includeEnrichment: true,
};

const result = await exportService.exportBatch(options);

if (result.success && result.files) {
  result.files.forEach((file) => {
    exportService.downloadFile(file.content, file.filename);
  });
}
```

## Implementation Details

### Components

#### BatchExportDialog
- Location: `src/components/BatchExportDialog.tsx`
- Props:
  - `recordings`: Array of recordings to export
  - `isOpen`: Dialog visibility state
  - `onClose`: Callback when dialog closes
- Features:
  - Format selection with visual buttons
  - File organization radio buttons
  - Content inclusion checkboxes
  - Export progress indication
  - Error handling with user feedback

#### HistoryList Integration
- Location: `src/components/HistoryList.tsx`
- Features:
  - Checkbox selection for recordings
  - "Export Selected" button in bulk actions bar
  - Automatic selection clearing after export
  - Integration with BatchExportDialog

### Services

#### ExportService
- Location: `src/services/export/ExportService.ts`
- Methods:
  - `exportBatch(options)`: Export multiple recordings
  - `exportRecording(recording, options)`: Export single recording
  - `downloadFile(content, filename)`: Trigger file download
  - `generateFilename(recording, format)`: Generate export filename

### Types

```typescript
interface BatchExportOptions extends ExportOptions {
  recordings: Recording[];
  separateFiles?: boolean;
  zipFiles?: boolean; // Future feature
}

interface BatchExportResult {
  success: boolean;
  files?: Array<{
    filename: string;
    content: string;
  }>;
  error?: string;
}
```

## Testing

### Unit Tests
- `src/components/BatchExportDialog.test.tsx`: Component behavior tests
- `src/components/HistoryList.test.tsx`: Integration tests
- `src/services/export/ExportService.test.ts`: Service logic tests

### Test Coverage
- Format selection and switching
- File organization options
- Content inclusion toggles
- Export success and failure scenarios
- Dialog open/close behavior
- Selection clearing after export

## Future Enhancements

### Planned Features
1. **ZIP Archive**: Combine multiple files into a single ZIP archive
2. **Custom Templates**: User-defined export templates
3. **Scheduled Exports**: Automatic periodic exports
4. **Cloud Export**: Direct export to cloud storage (Dropbox, Google Drive)
5. **Email Export**: Send exports via email
6. **Export Presets**: Save and reuse export configurations

### Performance Optimizations
- Streaming for large exports
- Background processing for heavy operations
- Progress indicators for long-running exports
- Chunked downloads for large files

## Troubleshooting

### Common Issues

**Export button is disabled**
- Ensure at least one recording is selected
- Check that recordings have content to export

**Export fails with error**
- Verify recordings have valid data
- Check browser console for detailed error messages
- Ensure sufficient browser storage/memory

**Downloaded files are empty**
- Verify content options are enabled
- Check that recordings have the selected content types
- Review export service logs

**Multiple downloads not working**
- Some browsers block multiple simultaneous downloads
- Allow multiple downloads in browser settings
- Consider using single file export option

## Related Documentation

- [Export Settings](./EXPORT_SETTINGS.md)
- [Storage Service](../src/services/storage/README.md)
- [Export Service](../src/services/export/ExportService.ts)
- [User Guide](./USER_GUIDE.md)
