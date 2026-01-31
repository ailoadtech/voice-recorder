# Audio Transcription Implementation (Task 1.4)

## Overview

This document describes the implementation of the `transcribe_audio` Tauri command, which enables local audio transcription using Whisper models.

## Implementation Details

### Tauri Command: `transcribe_audio`

**Location:** `src-tauri/src/whisper.rs`

**Signature:**
```rust
pub async fn transcribe_audio(
    audio_data: Vec<f32>,
    _variant: ModelVariant,
    app_handle: AppHandle,
) -> Result<String, String>
```

**Parameters:**
- `audio_data`: PCM audio samples as Float32Array (converted to Vec<f32> by Tauri)
- `_variant`: Model variant (for reference, actual model must be pre-loaded)
- `app_handle`: Tauri app handle for emitting progress events

**Returns:**
- `Ok(String)`: Transcribed text
- `Err(String)`: Error message if transcription fails

### Audio Format Requirements

The transcription expects audio in the following format:
- **Sample Rate:** 16kHz (required by Whisper)
- **Channels:** Mono (1 channel)
- **Format:** PCM Float32 samples
- **Length:** Up to 30 seconds (as per Requirement 4.4)

### Progress Callbacks

The implementation emits progress events via Tauri's event system:

| Stage | Progress | Description |
|-------|----------|-------------|
| `loading_model` | 0.0 | Model is being prepared for inference |
| `processing_audio` | 0.33 | Audio is being processed through the model |
| `finalizing` | 0.66 | Extracting and formatting transcription results |
| `complete` | 1.0 | Transcription is complete |

**Event Name:** `transcription-progress`

**Event Payload:**
```typescript
{
  stage: string,
  progress: number // 0.0 to 1.0
}
```

### Transcription Process

1. **Emit Loading Progress** - Notify frontend that model is being prepared
2. **Configure Parameters** - Set up Whisper inference parameters:
   - Thread count: Uses all available CPU cores
   - Language: English
   - Translation: Disabled
   - Timestamps: Disabled for cleaner output
3. **Emit Processing Progress** - Notify frontend that audio is being processed
4. **Create State** - Initialize Whisper inference state
5. **Run Inference** - Execute the transcription
6. **Emit Finalizing Progress** - Notify frontend that results are being extracted
7. **Extract Segments** - Retrieve all transcribed text segments
8. **Emit Complete Progress** - Notify frontend that transcription is done
9. **Return Result** - Return the complete transcribed text

### Error Handling

The implementation handles the following error cases:
- **No Model Loaded:** Returns error if `transcribe_audio` is called without a loaded model
- **State Creation Failed:** Returns error if Whisper state cannot be created
- **Inference Failed:** Returns error if the transcription process fails
- **Segment Extraction Failed:** Returns error if text segments cannot be retrieved

### Integration with Model Management

The transcription command works with the model lifecycle:
1. Model must be loaded first using `load_whisper_model`
2. Model is stored in global state (`WHISPER_MODEL`)
3. Model is reused for subsequent transcriptions (Requirement 4.6)
4. Model is automatically unloaded after 5 minutes of inactivity (Requirement 10.1)

### Performance Optimizations

- **Multi-threading:** Uses all available CPU cores via `num_cpus::get()`
- **Model Reuse:** Loaded model is cached in memory for subsequent transcriptions
- **Async Execution:** Command is async to prevent blocking the UI thread

## Usage Example

See `src/services/whisper/transcription-example.ts` for TypeScript usage examples.

## Requirements Satisfied

- ✅ **Requirement 4.3:** Returns transcribed text in string format
- ✅ **Requirement 4.4:** Processes audio files up to 30 seconds in length
- ✅ **Task 1.4:** All sub-requirements implemented:
  - Created `transcribe_audio` Tauri command
  - Converts Float32Array audio data to whisper.cpp format
  - Executes inference with progress callbacks
  - Returns transcribed text to TypeScript layer
