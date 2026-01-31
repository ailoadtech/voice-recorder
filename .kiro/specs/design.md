# Voice Intelligence Desktop App - Design Document

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Desktop Shell                         │
│                  (Tauri Runtime)                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │           Next.js Application                   │    │
│  │                                                 │    │
│  │  ┌──────────────┐  ┌──────────────┐           │    │
│  │  │   UI Layer   │  │  State Mgmt  │           │    │
│  │  │  (React)     │  │  (Context)   │           │    │
│  │  └──────────────┘  └──────────────┘           │    │
│  │                                                 │    │
│  │  ┌──────────────────────────────────────────┐ │    │
│  │  │         Service Layer                     │ │    │
│  │  │  ┌────────────┐  ┌──────────────────┐   │ │    │
│  │  │  │ Audio      │  │  Transcription   │   │ │    │
│  │  │  │ Recording  │  │  Service         │   │ │    │
│  │  │  └────────────┘  └──────────────────┘   │ │    │
│  │  │  ┌────────────┐  ┌──────────────────┐   │ │    │
│  │  │  │ LLM        │  │  Storage         │   │ │    │
│  │  │  │ Service    │  │  Service         │   │ │    │
│  │  │  └────────────┘  └──────────────────┘   │ │    │
│  │  └──────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Technology Decisions

### Desktop Runtime: Tauri

**Rationale:**
- Smaller bundle size (~3MB vs ~100MB)
- Better performance with Rust backend
- Lower memory footprint
- Excellent native system integration
- Active development and modern architecture
- Strong security model

### Voice-to-Text: OpenAI Whisper API

**Rationale:**
- High accuracy across languages
- Simple API integration
- Reasonable pricing
- No local model management

**Alternative:** Local Whisper model (for privacy/offline use)

### LLM Integration: OpenAI GPT-4

**Rationale:**
- Excellent text processing capabilities
- Flexible prompt engineering
- Reliable API
- Good documentation

**Alternative:** Anthropic Claude, local LLaMA models

### State Management: React Context + Hooks

**Rationale:**
- Built into React, no extra dependencies
- Sufficient for app complexity
- Easy to understand and maintain

### Storage: Local File System + IndexedDB

**Rationale:**
- Simple persistence
- No external database needed
- Fast access for history

## Component Design

### Core Components

#### 1. RecordingButton
- Visual states: idle, recording, processing
- Hotkey registration
- Audio capture trigger

#### 2. TranscriptionDisplay
- Shows raw transcription
- Loading states
- Error handling

#### 3. EnrichmentPanel
- Enrichment type selector
- Processed output display
- Copy/export actions

#### 4. HistoryList
- Previous recordings
- Search/filter
- Quick access to past outputs

### Service Architecture

#### AudioRecordingService
```typescript
interface AudioRecordingService {
  startRecording(): Promise<void>
  stopRecording(): Promise<Blob>
  getPermissions(): Promise<boolean>
}
```

#### TranscriptionService
```typescript
interface TranscriptionService {
  transcribe(audio: Blob): Promise<string>
  getStatus(): TranscriptionStatus
}
```

#### LLMService
```typescript
interface LLMService {
  enrich(text: string, type: EnrichmentType): Promise<string>
  getAvailableTypes(): EnrichmentType[]
}
```

#### StorageService
```typescript
interface StorageService {
  saveRecording(data: Recording): Promise<string>
  getRecordings(): Promise<Recording[]>
  deleteRecording(id: string): Promise<void>
}
```

## Data Flow

### Recording → Output Flow

1. **User activates hotkey**
   - UI updates to recording state
   - AudioRecordingService starts capture

2. **User stops recording**
   - Audio blob created
   - UI shows processing state
   - Audio sent to TranscriptionService

3. **Transcription completes**
   - Text displayed in UI
   - Automatically sent to LLMService (or user triggers)

4. **Enrichment completes**
   - Enriched output displayed
   - Recording saved to StorageService
   - User can copy/export

## UI/UX Design

### Main Window Layout

```
┌─────────────────────────────────────────┐
│  Voice Intelligence App          [_][□][×]│
├─────────────────────────────────────────┤
│                                          │
│         ┌─────────────────┐             │
│         │   🎤 Record     │             │
│         │   (Ctrl+Shift+R)│             │
│         └─────────────────┘             │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Transcription:                     │ │
│  │ [transcribed text appears here]    │ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Enrichment: [Dropdown ▼]  [Process]    │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Output:                            │ │
│  │ [enriched text appears here]       │ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [📋 Copy]  [💾 Export]  [📜 History]   │
│                                          │
└─────────────────────────────────────────┘
```

### States & Feedback

- **Idle:** Ready to record
- **Recording:** Pulsing red indicator, timer
- **Processing:** Spinner with status text
- **Complete:** Green checkmark, output ready
- **Error:** Red alert with retry option

## Configuration

### Environment Variables
```
OPENAI_API_KEY=sk-...
WHISPER_MODEL=whisper-1
GPT_MODEL=gpt-4
HOTKEY_COMBINATION=CommandOrControl+Shift+R
```

### User Settings
- Hotkey customization
- Default enrichment type
- Auto-save preferences
- API endpoint configuration

## Error Handling

### Error Categories

1. **Audio Errors**
   - No microphone permission
   - Device not found
   - Recording failure

2. **API Errors**
   - Network timeout
   - Invalid API key
   - Rate limiting
   - Service unavailable

3. **Storage Errors**
   - Disk full
   - Permission denied
   - Corruption

### Error Recovery

- Automatic retry with exponential backoff
- Fallback to cached data when possible
- Clear user messaging
- Manual retry options

## Security Considerations

- API keys stored in secure system keychain
- Audio data encrypted at rest
- HTTPS for all API calls
- No telemetry without consent
- Clear data deletion options

## Performance Optimization

- Lazy load history
- Debounce UI updates
- Stream large responses
- Cache API responses when appropriate
- Minimize re-renders with React.memo

## Future Enhancements

- Multi-language support
- Custom enrichment templates
- Voice commands for app control
- Integration with note-taking apps
- Collaborative features
- Mobile companion app
