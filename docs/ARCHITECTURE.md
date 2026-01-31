# Architecture Documentation

## System Overview

The Voice Intelligence Desktop App is a Next.js-based application designed to run as a desktop application using Tauri. It follows a layered architecture with clear separation of concerns.

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

## Architecture Layers

### 1. Presentation Layer (UI)

**Location:** `src/app/`, `src/components/`

**Responsibilities:**
- Render user interface
- Handle user interactions
- Display application state
- Route navigation

**Key Components:**
- **Pages:** Next.js App Router pages (`src/app/`)
- **Components:** Reusable React components (`src/components/`)
- **Layouts:** Shared layouts and navigation

**Technologies:**
- React 18+ with Server Components
- Next.js 15 App Router
- Tailwind CSS for styling
- CSS animations for transitions

### 2. State Management Layer

**Location:** `src/contexts/`

**Responsibilities:**
- Manage global application state
- Coordinate state transitions
- Persist state to localStorage
- Validate state changes

**Key Components:**
- **AppContext:** Global application state
- **State Machine:** Recording workflow state machine
- **State Debugger:** Development debugging tools

**State Flow:**
```
idle → recording → processing → transcribing → 
transcribed → enriching → complete
                    ↓
                  error
```

### 3. Service Layer

**Location:** `src/services/`

**Responsibilities:**
- Encapsulate business logic
- Integrate with external APIs
- Handle data persistence
- Manage service lifecycle

#### 3.1 Audio Recording Service

**Location:** `src/services/audio/`

**Responsibilities:**
- Capture audio from microphone
- Handle MediaRecorder API
- Manage recording permissions
- Process audio blobs

**Key Classes:**
- `AudioRecordingService`: Main service class
- `AudioRecordingConfig`: Configuration interface

**API Integration:**
- Browser MediaRecorder API
- Web Audio API (for visualization)

#### 3.2 Transcription Service

**Location:** `src/services/transcription/`

**Responsibilities:**
- Convert audio to text
- Integrate with OpenAI Whisper API
- Handle transcription errors
- Retry failed requests

**Key Classes:**
- `TranscriptionService`: Main service class
- `TranscriptionResult`: Result interface

**API Integration:**
- OpenAI Whisper API
- Endpoint: `https://api.openai.com/v1/audio/transcriptions`

**Error Handling:**
- Network errors → Retry with exponential backoff
- API errors → User-friendly error messages
- Rate limits → Queue and retry

#### 3.3 LLM Service

**Location:** `src/services/llm/`

**Responsibilities:**
- Enrich transcribed text with AI
- Manage prompt templates
- Handle enrichment types
- Process streaming responses

**Key Classes:**
- `LLMService`: Main service class
- `EnrichmentResult`: Result interface
- Prompt templates and presets

**API Integration:**
- OpenAI GPT-4 API
- Endpoint: `https://api.openai.com/v1/chat/completions`

**Enrichment Types:**
- Format: Clean up and format text
- Summarize: Create concise summary
- Expand: Add detail and context
- Bullet Points: Convert to list format
- Action Items: Extract tasks
- Custom: User-defined prompts

#### 3.4 Storage Service

**Location:** `src/services/storage/`

**Responsibilities:**
- Persist recordings to IndexedDB
- Manage recording metadata
- Handle data migrations
- Provide search and filter

**Key Classes:**
- `StorageService`: Main service class
- `Recording`: Data model
- Migration utilities

**Storage Strategy:**
- **IndexedDB:** Recording metadata and audio blobs
- **localStorage:** User preferences and settings
- **File System:** Future export functionality

**Data Model:**
```typescript
interface Recording {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  audioBlob: Blob;
  audioDuration: number;
  transcription: TranscriptionResult | null;
  enrichment: EnrichmentResult | null;
  tags: string[];
  notes: string;
}
```

### 4. Utility Layer

**Location:** `src/lib/`, `src/hooks/`

**Responsibilities:**
- Provide reusable utilities
- Custom React hooks
- Validation functions
- Helper functions

**Key Modules:**
- **State Machine:** Recording workflow logic
- **State Debugger:** Development tools
- **Validation:** Input validation
- **Environment:** Configuration management

## Data Flow

### Recording Workflow

```
1. User Action
   ↓
2. UI Component (RecordingButton)
   ↓
3. State Update (AppContext)
   ↓
4. Service Call (AudioRecordingService)
   ↓
5. Audio Capture (MediaRecorder API)
   ↓
6. State Update (recording → processing)
   ↓
7. Service Call (TranscriptionService)
   ↓
8. API Request (OpenAI Whisper)
   ↓
9. State Update (transcribing → transcribed)
   ↓
10. Service Call (LLMService)
    ↓
11. API Request (OpenAI GPT-4)
    ↓
12. State Update (enriching → complete)
    ↓
13. Service Call (StorageService)
    ↓
14. Data Persistence (IndexedDB)
    ↓
15. UI Update (Display results)
```

### State Management Flow

```
Component → dispatch(action) → Reducer → Validation → 
New State → Context Update → Component Re-render
```

## API Integration

### OpenAI Whisper API

**Purpose:** Audio transcription

**Endpoint:** `POST https://api.openai.com/v1/audio/transcriptions`

**Request:**
```typescript
{
  file: Blob,           // Audio file
  model: "whisper-1",   // Model name
  language?: string,    // Optional language code
  prompt?: string       // Optional context
}
```

**Response:**
```typescript
{
  text: string,         // Transcribed text
  language?: string,    // Detected language
  duration?: number     // Audio duration
}
```

**Rate Limits:**
- 50 requests per minute (free tier)
- 25MB max file size

### OpenAI GPT-4 API

**Purpose:** Text enrichment

**Endpoint:** `POST https://api.openai.com/v1/chat/completions`

**Request:**
```typescript
{
  model: "gpt-4",
  messages: [
    { role: "system", content: string },
    { role: "user", content: string }
  ],
  temperature?: number,
  max_tokens?: number
}
```

**Response:**
```typescript
{
  id: string,
  choices: [{
    message: {
      role: "assistant",
      content: string
    }
  }]
}
```

**Rate Limits:**
- 10,000 requests per minute (paid tier)
- 8,192 tokens max (GPT-4)

## Security Considerations

### API Key Management

**Storage:**
- API keys stored in `.env.local` (not committed)
- Accessed via environment variables
- Validated on service initialization

**Best Practices:**
- Never expose keys in client code
- Use environment-specific keys
- Rotate keys regularly
- Monitor API usage

### Data Privacy

**Audio Data:**
- Processed locally before API calls
- Not stored on external servers (except during API calls)
- User controls data retention

**Transcriptions:**
- Stored locally in IndexedDB
- User can delete at any time
- No telemetry or tracking

### CORS and CSP

**Content Security Policy:**
- Restrict external script sources
- Allow only trusted API endpoints
- Prevent XSS attacks

## Performance Optimization

### Audio Processing

**Strategies:**
- Use Web Workers for heavy processing
- Stream audio data when possible
- Compress audio before API calls
- Cache processed results

### State Management

**Strategies:**
- Minimize re-renders with React.memo
- Use context selectors for granular updates
- Debounce frequent state changes
- Lazy load heavy components

### API Calls

**Strategies:**
- Implement request queuing
- Use exponential backoff for retries
- Cache API responses when appropriate
- Batch requests when possible

### Storage

**Strategies:**
- Index frequently queried fields
- Paginate large result sets
- Compress stored data
- Clean up old recordings

## Error Handling

### Error Categories

1. **User Errors:** Invalid input, missing permissions
2. **Network Errors:** Connection failures, timeouts
3. **API Errors:** Rate limits, authentication failures
4. **Storage Errors:** Quota exceeded, corruption

### Error Recovery

**Strategies:**
- Automatic retry with exponential backoff
- Graceful degradation
- User-friendly error messages
- Error logging for debugging

### Error Boundaries

**React Error Boundaries:**
- Catch component errors
- Display fallback UI
- Log errors for debugging
- Prevent app crashes

## Testing Strategy

### Unit Tests

**Coverage:**
- Service classes
- Utility functions
- State machine logic
- Validation functions

**Tools:**
- Jest for test runner
- React Testing Library for components

### Integration Tests

**Coverage:**
- Service interactions
- API integrations
- State management flows
- Storage operations

### E2E Tests

**Coverage:**
- Complete user workflows
- Cross-browser compatibility
- Desktop integration
- Error scenarios

## Deployment Architecture

### Development

```
Developer Machine (WSL)
  ↓
Next.js Dev Server (localhost:3000)
  ↓
Hot Module Replacement
  ↓
Browser Preview
```

### Production

```
Build Process
  ↓
Next.js Static Export
  ↓
Tauri Desktop Packaging
  ↓
Platform-Specific Installer
  ↓
User Installation
```

## Future Enhancements

### Planned Features

1. **Offline Mode:** Local Whisper model integration
2. **Multi-language:** Full i18n support
3. **Cloud Sync:** Optional cloud backup
4. **Collaboration:** Share recordings
5. **Mobile App:** Companion mobile application

### Architecture Evolution

1. **Microservices:** Split services into separate processes
2. **Plugin System:** Allow third-party integrations
3. **Real-time Sync:** WebSocket-based updates
4. **Advanced Analytics:** Usage insights and metrics

## Conclusion

This architecture provides a solid foundation for the Voice Intelligence Desktop App, with clear separation of concerns, robust error handling, and room for future growth. The layered approach ensures maintainability and testability while delivering a smooth user experience.
