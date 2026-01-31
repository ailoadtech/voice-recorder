# Storage Service

The Storage Service provides persistent storage for voice recordings using IndexedDB, including audio data, transcriptions, and enrichments.

## Features

- **IndexedDB Storage**: Browser-based persistent storage
- **Audio Blob Storage**: Stores audio recordings as data URLs
- **Filtering & Sorting**: Advanced query capabilities
- **Data Migration**: Version management and schema migrations
- **Backup/Restore**: Export and import functionality
- **Statistics**: Storage usage tracking

## Usage

### Basic Operations

```typescript
import { StorageService } from '@/services/storage';

const storage = new StorageService();

// Save a recording
const recording: Recording = {
  id: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  audioBlob: audioBlob,
  transcriptionText: 'Hello world',
  enrichedText: 'Hello, world!',
};

const id = await storage.saveRecording(recording);

// Retrieve a recording
const retrieved = await storage.getRecording(id);

// Get all recordings
const all = await storage.getAllRecordings();

// Delete a recording
await storage.deleteRecording(id);
```

### Filtering

```typescript
// Filter by date range
const recent = await storage.getAllRecordings({
  startDate: new Date('2024-01-01'),
  endDate: new Date(),
});

// Filter by tags
const tagged = await storage.getAllRecordings({
  tags: ['meeting', 'important'],
});

// Search text
const searched = await storage.getAllRecordings({
  searchText: 'project update',
});

// Filter by content
const withTranscription = await storage.getAllRecordings({
  hasTranscription: true,
});
```

### Sorting

```typescript
// Sort by creation date (newest first)
const sorted = await storage.getAllRecordings(undefined, {
  field: 'createdAt',
  order: 'desc',
});

// Sort by duration
const byDuration = await storage.getAllRecordings(undefined, {
  field: 'duration',
  order: 'asc',
});
```

### Statistics

```typescript
const stats = await storage.getStats();
console.log(`Total recordings: ${stats.totalRecordings}`);
console.log(`Total size: ${stats.totalSize} bytes`);
console.log(`Oldest: ${stats.oldestRecording}`);
console.log(`Newest: ${stats.newestRecording}`);
```

### Backup & Restore

```typescript
import { DataBackupUtils } from '@/services/storage';

// Export all recordings
const recordings = await storage.getAllRecordings();
const serialized = recordings.map(r => /* serialize */);
const json = await DataBackupUtils.exportToJSON(serialized);

// Download backup file
DataBackupUtils.createBackupFile(json);

// Import from backup
const imported = await DataBackupUtils.importFromJSON(json);
for (const recording of imported.recordings) {
  await storage.saveRecording(recording);
}
```

## Data Model

### Recording

```typescript
interface Recording {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Audio
  audioBlob?: Blob;
  audioDuration?: number;
  audioFormat?: string;
  audioSize?: number;
  
  // Transcription
  transcription?: TranscriptionResult;
  transcriptionText?: string;
  
  // Enrichment
  enrichment?: EnrichmentResult;
  enrichmentType?: EnrichmentType;
  enrichedText?: string;
  
  // Metadata
  title?: string;
  tags?: string[];
  notes?: string;
}
```

## Storage Limits

- **IndexedDB**: Typically 50% of available disk space
- **Audio Blobs**: Stored as base64 data URLs (increases size by ~33%)
- **Quota Management**: Automatic error handling for quota exceeded

## Migration Strategy

The service includes a migration system for schema changes:

1. **Version Tracking**: Database version is tracked
2. **Automatic Migration**: Migrations run on version upgrade
3. **Data Validation**: All data is validated during migration
4. **Backward Compatibility**: Old data formats are automatically upgraded

## Error Handling

```typescript
try {
  await storage.saveRecording(recording);
} catch (error) {
  if (error.code === 'QUOTA_EXCEEDED') {
    // Handle storage quota exceeded
  } else if (error.code === 'STORAGE_UNAVAILABLE') {
    // Handle IndexedDB not available
  }
}
```

## Performance Considerations

- **Lazy Loading**: Audio blobs are loaded on demand
- **Indexed Queries**: Date and tag queries use indexes
- **Batch Operations**: Use `deleteRecordings()` for bulk deletes
- **Memory Management**: Large audio files are stored as data URLs

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 10+)
- Opera: Full support

## Testing

```bash
npm test src/services/storage/StorageService.test.ts
```
