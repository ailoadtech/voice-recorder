# TranscriptionService Integration Guide

## Overview
This guide explains how to integrate the enhanced TranscriptionService with provider routing and fallback support into your application.

## Quick Start

### 1. Basic Setup (API-only)
```typescript
import { TranscriptionService } from '@/services/transcription';

// Create service with default API provider
const transcriptionService = new TranscriptionService();

// Transcribe audio
const audioBlob = new Blob([audioData], { type: 'audio/webm' });
const result = await transcriptionService.transcribe(audioBlob);
console.log(result.text); // Transcribed text
console.log(result.provider); // 'api'
```

### 2. Local Provider Setup
```typescript
import { TranscriptionService } from '@/services/transcription';
import { LocalWhisperProvider } from '@/services/whisper';
import { getModelManager } from '@/services/whisper/ModelManager';

// Create service with local provider
const transcriptionService = new TranscriptionService({
  method: 'local',
  localModelVariant: 'small',
  enableFallback: true
});

// Inject local provider
const modelManager = getModelManager();
const localProvider = new LocalWhisperProvider(modelManager, 'small');
transcriptionService.setLocalProvider(localProvider);

// Transcribe audio
const result = await transcriptionService.transcribe(audioBlob);
console.log(result.provider); // 'local' or 'api' (if fallback occurred)
```

### 3. Switching Between Providers
```typescript
// Start with API
const service = new TranscriptionService({ method: 'api' });

// Switch to local
service.updateSettings({ 
  method: 'local',
  localModelVariant: 'small'
});

// Switch back to API
service.updateSettings({ method: 'api' });
```

## Fallback Mechanism

### Enable/Disable Fallback
```typescript
// Enable fallback (default)
const service = new TranscriptionService({
  method: 'local',
  enableFallback: true
});

// Disable fallback
service.updateSettings({ enableFallback: false });
```

### Listen for Fallback Events
```typescript
// In a React component or anywhere in the app
useEffect(() => {
  const handleFallback = (event: CustomEvent) => {
    const { reason, timestamp, from, to } = event.detail;
    
    // Show notification to user
    toast.warning(
      `Local transcription failed. Using API fallback.\nReason: ${reason}`,
      { duration: 5000 }
    );
    
    // Log for analytics
    console.log('Fallback occurred:', {
      from,
      to,
      reason,
      timestamp
    });
  };

  window.addEventListener('transcription-fallback', handleFallback);
  
  return () => {
    window.removeEventListener('transcription-fallback', handleFallback);
  };
}, []);
```

## React Hook Integration

### Example: useTranscription Hook
```typescript
import { useState, useCallback, useEffect } from 'react';
import { TranscriptionService } from '@/services/transcription';
import { LocalWhisperProvider } from '@/services/whisper';
import { getModelManager } from '@/services/whisper/ModelManager';

export function useTranscription() {
  const [service] = useState(() => {
    const svc = new TranscriptionService({
      method: 'local',
      localModelVariant: 'small',
      enableFallback: true
    });
    
    // Inject local provider
    const modelManager = getModelManager();
    const localProvider = new LocalWhisperProvider(modelManager, 'small');
    svc.setLocalProvider(localProvider);
    
    return svc;
  });

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transcribe = useCallback(async (audio: Blob) => {
    setIsTranscribing(true);
    setError(null);
    
    try {
      const result = await service.transcribe(audio);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transcription failed';
      setError(message);
      throw err;
    } finally {
      setIsTranscribing(false);
    }
  }, [service]);

  const updateSettings = useCallback((settings: any) => {
    service.updateSettings(settings);
  }, [service]);

  return {
    transcribe,
    updateSettings,
    isTranscribing,
    error,
    settings: service.getSettings()
  };
}
```

## Settings Persistence

### Save/Load Settings
```typescript
import { TranscriptionService } from '@/services/transcription';

// Load settings from localStorage
function loadSettings() {
  const saved = localStorage.getItem('transcription-settings');
  return saved ? JSON.parse(saved) : {
    method: 'api',
    enableFallback: true
  };
}

// Save settings to localStorage
function saveSettings(settings: any) {
  localStorage.setItem('transcription-settings', JSON.stringify(settings));
}

// Initialize service with saved settings
const settings = loadSettings();
const service = new TranscriptionService(settings);

// Update and save settings
service.updateSettings({ method: 'local' });
saveSettings(service.getSettings());
```

## Error Handling

### Handle Transcription Errors
```typescript
try {
  const result = await service.transcribe(audioBlob);
  console.log('Success:', result.text);
} catch (error) {
  if (error.name === 'TranscriptionError') {
    // Handle specific transcription errors
    switch (error.code) {
      case 'INVALID_AUDIO':
        console.error('Invalid audio format');
        break;
      case 'AUTHENTICATION_ERROR':
        console.error('API key invalid');
        break;
      case 'RATE_LIMIT':
        console.error('Rate limit exceeded');
        break;
      default:
        console.error('Transcription failed:', error.message);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Best Practices

1. **Initialize Once**: Create a single TranscriptionService instance and reuse it
2. **Settings Persistence**: Save user preferences to localStorage or a settings service
3. **Fallback Notifications**: Always listen for fallback events to inform users
4. **Error Handling**: Implement proper error handling for all transcription calls
5. **Provider Injection**: Inject LocalWhisperProvider after service creation to avoid circular dependencies

## Migration from Old API

### Before (Old API-only service)
```typescript
const service = new TranscriptionService();
const result = await service.transcribe(audioBlob);
```

### After (New multi-provider service)
```typescript
// Same API, backward compatible!
const service = new TranscriptionService();
const result = await service.transcribe(audioBlob);

// Or with local provider
const service = new TranscriptionService({ method: 'local' });
service.setLocalProvider(localProvider);
const result = await service.transcribe(audioBlob);
```

The new implementation is **100% backward compatible** with existing code!

## Troubleshooting

### Issue: Local provider not working
**Solution**: Make sure to inject the local provider:
```typescript
service.setLocalProvider(localWhisperProvider);
```

### Issue: Fallback not triggering
**Solution**: Check that fallback is enabled:
```typescript
service.updateSettings({ enableFallback: true });
```

### Issue: Settings not persisting
**Solution**: Implement settings persistence (see Settings Persistence section)

## Next Steps

1. Implement settings UI for provider selection
2. Add model variant selection for local provider
3. Implement progress indicators for transcription
4. Add analytics for fallback events
5. Create integration tests for end-to-end flow
