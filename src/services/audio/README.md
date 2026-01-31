# Audio Recording Service

Browser-based audio recording service using the MediaRecorder API.

## Features

- ✅ Comprehensive microphone permission handling
- ✅ Permission status checking
- ✅ Start/stop/pause/resume recording
- ✅ Automatic MIME type detection
- ✅ Configurable audio quality
- ✅ Recording duration tracking
- ✅ Audio blob handling utilities
- ✅ Base64 conversion for API uploads
- ✅ File download functionality
- ✅ Audio metadata extraction
- ✅ Comprehensive error handling
- ✅ Resource cleanup

## Usage

```typescript
import { AudioRecordingService } from '@/services/audio';

// Create service instance
const audioService = new AudioRecordingService({
  audioBitsPerSecond: 128000,
  sampleRate: 48000,
});

// Check permissions
try {
  await audioService.getPermissions();
  console.log('Microphone access granted');
} catch (error) {
  console.error('Permission denied:', error);
}

// Check permission status without prompting user
const status = await audioService.checkPermissionStatus();
console.log('Permission status:', status); // 'granted', 'denied', 'prompt', or 'unsupported'

// Check if permissions are already granted
if (audioService.hasPermissions()) {
  console.log('Already have microphone access');
}

// Start recording
await audioService.startRecording();

// Check state
console.log('Recording:', audioService.isRecording()); // true
console.log('Duration:', audioService.getDuration()); // milliseconds

// Stop and get audio blob
const audioBlob = await audioService.stopRecording();

// Use the audio blob
const audioUrl = URL.createObjectURL(audioBlob);
```

## Audio Blob Handling

The service provides utilities for working with recorded audio:

```typescript
// Get audio metadata
const metadata = audioService.getAudioMetadata(audioBlob);
console.log(`Size: ${metadata.sizeInMB} MB`);
console.log(`Type: ${metadata.type}`);

// Create playback URL
const audioUrl = audioService.createAudioURL(audioBlob);
// Use audioUrl in <audio> element
// Clean up when done
audioService.revokeAudioURL(audioUrl);

// Convert to base64 for API upload
const base64Audio = await audioService.blobToBase64(audioBlob);

// Download audio file
audioService.downloadAudio(audioBlob, 'my-recording');
// Downloads as 'my-recording.webm' (extension based on MIME type)
```

## Configuration Management

```typescript
// Get current configuration
const config = audioService.getConfig();
console.log(config);

// Update configuration (only when idle)
audioService.updateConfig({
  audioBitsPerSecond: 256000,
  sampleRate: 44100,
});

// Get list of supported MIME types
const supportedTypes = AudioRecordingService.getSupportedMimeTypes();
console.log('Supported formats:', supportedTypes);
```

## Configuration

```typescript
interface AudioRecordingConfig {
  mimeType?: string;           // Auto-detected if not provided
  audioBitsPerSecond?: number; // Default: 128000
  sampleRate?: number;         // Default: 48000
}
```

## Supported Audio Formats

The service automatically detects the best supported format:
1. `audio/webm;codecs=opus` (preferred)
2. `audio/webm`
3. `audio/ogg;codecs=opus`
4. `audio/mp4`

## Error Handling

### Permission Errors

The service provides comprehensive permission handling with three methods:

1. **getPermissions()** - Requests microphone access (prompts user if needed)
2. **checkPermissionStatus()** - Checks current permission state without prompting
3. **hasPermissions()** - Returns cached permission state

```typescript
// Request permissions (will prompt user)
try {
  await audioService.getPermissions();
  console.log('Permission granted');
} catch (error) {
  if (error.name === 'AudioPermissionError') {
    switch (error.code) {
      case 'PERMISSION_DENIED':
        // User denied microphone access
        console.error('Please enable microphone access in browser settings');
        break;
      case 'DEVICE_NOT_FOUND':
        // No microphone found
        console.error('No microphone device detected');
        break;
      case 'NOT_SUPPORTED':
        // Browser doesn't support MediaDevices API
        console.error('Your browser does not support audio recording');
        break;
    }
  }
}

// Check permission status without prompting
const status = await audioService.checkPermissionStatus();
switch (status) {
  case 'granted':
    // Permission already granted
    break;
  case 'denied':
    // Permission denied, show instructions to enable
    break;
  case 'prompt':
    // Permission not yet requested
    break;
  case 'unsupported':
    // Permissions API not available (fallback to getPermissions)
    break;
}

// Quick check of cached permission state
if (audioService.hasPermissions()) {
  // Safe to start recording
  await audioService.startRecording();
}
```

### Recording Errors
```typescript
try {
  await audioService.startRecording();
} catch (error) {
  if (error.name === 'AudioRecordingError') {
    switch (error.code) {
      case 'INVALID_STATE':
        // Already recording or not in correct state
        break;
      case 'RECORDING_FAILED':
        // Failed to start recording
        break;
      case 'NO_DATA':
        // No audio data was recorded
        break;
    }
  }
}
```

## State Management

Recording states:
- `idle` - Not recording
- `recording` - Currently recording
- `paused` - Recording paused
- `stopped` - Recording stopped

```typescript
const state = audioService.getState();
```

## Cleanup

Always dispose of the service when done:

```typescript
audioService.dispose();
```

## Browser Compatibility

Requires:
- MediaDevices API
- MediaRecorder API
- getUserMedia support

Supported in all modern browsers (Chrome, Firefox, Safari, Edge).
