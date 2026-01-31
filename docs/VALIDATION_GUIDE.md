# Input Validation Guide

## Quick Reference

### Audio Validation

```typescript
import { validateAudioBlob, validateAudioDuration, validateMediaStream } from '@/lib/validation';

// Validate audio blob before processing
const blobResult = validateAudioBlob(audioBlob);
if (!blobResult.valid) {
  console.error('Invalid audio:', blobResult.errors);
  return;
}

// Validate duration
const durationResult = validateAudioDuration(duration);
if (durationResult.warnings.length > 0) {
  console.warn('Audio warnings:', durationResult.warnings);
}

// Validate MediaStream before recording
const streamResult = validateMediaStream(stream);
if (!streamResult.valid) {
  throw new Error('Invalid media stream');
}
```

### API Response Validation

```typescript
import { 
  validateTranscriptionResponse, 
  validateEnrichmentResponse,
  handleValidationFailure 
} from '@/lib/validation';

// Validate transcription response
const transcriptionResult = validateTranscriptionResponse(apiResponse);
const transcription = handleValidationFailure(
  transcriptionResult,
  'transcription API',
  { fallbackValue: null, logError: true }
);

// Validate enrichment response
const enrichmentResult = validateEnrichmentResponse(apiResponse);
if (!enrichmentResult.valid) {
  throw new Error(`Invalid enrichment: ${enrichmentResult.errors.join(', ')}`);
}
```

### Configuration Validation

```typescript
import { validateApiKey, validateEnvironmentConfig } from '@/lib/validation';

// Validate API key
const keyResult = validateApiKey(process.env.OPENAI_API_KEY, 'OpenAI');
if (!keyResult.valid) {
  console.error('API key invalid:', keyResult.errors);
}

// Validate entire config
const configResult = validateEnvironmentConfig({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  WHISPER_MODEL: process.env.WHISPER_MODEL,
  GPT_MODEL: process.env.GPT_MODEL,
});

if (!configResult.valid) {
  throw new Error('Configuration invalid');
}
```

### Text Input Validation

```typescript
import { validateTextInput } from '@/lib/validation';

// Validate text before sending to LLM
const textResult = validateTextInput(userInput);
if (!textResult.valid) {
  return { error: textResult.errors[0] };
}
```

## Integration Examples

### In AudioRecordingService

```typescript
import { validateAudioBlob, validateMediaStream } from '@/lib/validation';

class AudioRecordingService {
  async startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Validate stream
    const streamResult = validateMediaStream(stream);
    if (!streamResult.valid) {
      throw new Error(`Cannot start recording: ${streamResult.errors.join(', ')}`);
    }
    
    // Continue with recording...
  }
  
  async stopRecording(): Promise<Blob> {
    const blob = await this.getRecordingBlob();
    
    // Validate blob
    const blobResult = validateAudioBlob(blob);
    if (!blobResult.valid) {
      throw new Error(`Invalid recording: ${blobResult.errors.join(', ')}`);
    }
    
    return blob;
  }
}
```

### In TranscriptionService

```typescript
import { validateTranscriptionResponse, handleValidationFailure } from '@/lib/validation';

class TranscriptionService {
  async transcribe(audio: Blob): Promise<TranscriptionResult> {
    const response = await this.callWhisperAPI(audio);
    
    // Validate and handle gracefully
    const result = handleValidationFailure(
      validateTranscriptionResponse(response),
      'Whisper API',
      { 
        throwError: true, // Throw on validation failure
        logError: true 
      }
    );
    
    return result;
  }
}
```

### In LLMService

```typescript
import { validateTextInput, validateEnrichmentResponse } from '@/lib/validation';

class LLMService {
  async enrich(text: string, type: EnrichmentType): Promise<EnrichmentResult> {
    // Validate input
    const inputResult = validateTextInput(text);
    if (!inputResult.valid) {
      throw new Error(`Invalid input: ${inputResult.errors[0]}`);
    }
    
    const response = await this.callOpenAI(text, type);
    
    // Validate response
    const responseResult = validateEnrichmentResponse(response);
    if (!responseResult.valid) {
      throw new Error(`Invalid API response: ${responseResult.errors.join(', ')}`);
    }
    
    return responseResult.data;
  }
}
```

### On App Startup

```typescript
import { validateEnvironmentConfig } from '@/lib/validation';

// In app initialization
function initializeApp() {
  const config = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    WHISPER_MODEL: process.env.WHISPER_MODEL,
    GPT_MODEL: process.env.GPT_MODEL,
  };
  
  const result = validateEnvironmentConfig(config);
  
  if (!result.valid) {
    console.error('Configuration errors:', result.errors);
    // Show error UI or prevent app from starting
    return false;
  }
  
  if (result.warnings.length > 0) {
    console.warn('Configuration warnings:', result.warnings);
  }
  
  return true;
}
```

## Validation Result Types

### AudioValidationResult
```typescript
{
  valid: boolean;      // Overall validation status
  errors: string[];    // Blocking errors
  warnings: string[];  // Non-blocking warnings
}
```

### ApiValidationResult
```typescript
{
  valid: boolean;      // Overall validation status
  data?: T;           // Validated data (if valid)
  errors: string[];   // Validation errors
}
```

### ConfigValidationResult
```typescript
{
  valid: boolean;      // Overall validation status
  errors: string[];    // Blocking errors
  warnings: string[];  // Non-blocking warnings
}
```

## Best Practices

1. **Validate Early**: Validate inputs as soon as they enter your system
2. **Use Graceful Degradation**: Use `handleValidationFailure()` for non-critical validations
3. **Log Warnings**: Always log warnings even if validation passes
4. **Provide Context**: Include context in error messages for debugging
5. **Fail Fast**: For critical validations, throw errors immediately
6. **Test Edge Cases**: Test with null, empty, oversized, and invalid inputs

## Common Validation Patterns

### Pattern 1: Validate and Throw
```typescript
const result = validateAudioBlob(blob);
if (!result.valid) {
  throw new Error(`Invalid audio: ${result.errors.join(', ')}`);
}
```

### Pattern 2: Validate with Fallback
```typescript
const data = handleValidationFailure(
  validateTranscriptionResponse(response),
  'API call',
  { fallbackValue: { text: '', language: 'en' } }
);
```

### Pattern 3: Validate and Return Error
```typescript
const result = validateTextInput(text);
if (!result.valid) {
  return { success: false, error: result.errors[0] };
}
```

### Pattern 4: Validate with Warnings
```typescript
const result = validateAudioDuration(duration);
if (!result.valid) {
  throw new Error(result.errors[0]);
}
if (result.warnings.length > 0) {
  console.warn('Duration warnings:', result.warnings);
}
```
