# Recording State Machine - Visual Diagram

## State Transition Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Recording State Machine                          │
└─────────────────────────────────────────────────────────────────────┘

                              ┌──────────┐
                              │   idle   │ ◄─────────────┐
                              └────┬─────┘               │
                                   │                     │
                          START_RECORDING               │
                                   │                     │
                                   ▼                     │
                              ┌──────────┐              │
                         ┌────┤recording │              │
                         │    └────┬─────┘              │
                         │         │                     │
                    CANCEL│  STOP_RECORDING             │
                         │         │                     │
                         │         ▼                     │
                         │    ┌──────────┐              │
                         ├────┤processing│              │
                         │    └────┬─────┘              │
                         │         │                     │
                    CANCEL│  START_TRANSCRIPTION        │
                         │         │                     │
                         │         ▼                     │
                         │    ┌────────────┐            │
                         ├────┤transcribing│            │
                         │    └──────┬─────┘            │
                         │           │                   │
                    CANCEL│  TRANSCRIPTION_COMPLETE     │
                         │           │                   │
                         │           ▼                   │
                         │    ┌────────────┐            │
                         ├────┤transcribed │            │
                         │    └──────┬─────┘            │
                         │           │                   │
                         │      ┌────┴────┐             │
                         │      │         │             │
                    CANCEL│  START_   RECORDING_        │
                         │  ENRICHMENT COMPLETE         │
                         │      │         │             │
                         │      ▼         ▼             │
                         │  ┌──────────┐ │             │
                         ├──┤enriching │ │             │
                         │  └────┬─────┘ │             │
                         │       │       │             │
                    CANCEL│  ENRICHMENT_│             │
                         │   COMPLETE   │             │
                         │       │       │             │
                         │       ▼       ▼             │
                         │    ┌──────────┐            │
                         └────┤ complete ├────────────┘
                              └────┬─────┘
                                   │
                            RESET_RECORDING
                                   │
                                   └──────────────────────┐
                                                          │
                                                          ▼
                                                     ┌────────┐
                    ┌────────────────────────────────┤ error  │
                    │                                └────────┘
                    │                                     ▲
                    │                                     │
                    └─────────────────────────────────────┘
                              SET_ERROR (from any state)
```

## State Flow Examples

### Example 1: Complete Flow with Enrichment

```
User Action          State Transition
───────────────────  ─────────────────────────────────
Press hotkey      →  idle → recording
Stop recording    →  recording → processing
[Automatic]       →  processing → transcribing
[Automatic]       →  transcribing → transcribed
Click "Enrich"    →  transcribed → enriching
[Automatic]       →  enriching → complete
Click "New"       →  complete → idle
```

### Example 2: Flow without Enrichment

```
User Action          State Transition
───────────────────  ─────────────────────────────────
Press hotkey      →  idle → recording
Stop recording    →  recording → processing
[Automatic]       →  processing → transcribing
[Automatic]       →  transcribing → transcribed
Click "Save"      →  transcribed → complete
Click "New"       →  complete → idle
```

### Example 3: Error During Transcription

```
User Action          State Transition
───────────────────  ─────────────────────────────────
Press hotkey      →  idle → recording
Stop recording    →  recording → processing
[Automatic]       →  processing → transcribing
[Network Error]   →  transcribing → error
Click "Retry"     →  error → idle
```

### Example 4: User Cancellation

```
User Action          State Transition
───────────────────  ─────────────────────────────────
Press hotkey      →  idle → recording
Stop recording    →  recording → processing
[Automatic]       →  processing → transcribing
Click "Cancel"    →  transcribing → idle
```

## State Properties Matrix

| State        | In Progress | Terminal | Interactive | Can Cancel | Can Error |
|--------------|-------------|----------|-------------|------------|-----------|
| idle         | ❌          | ✅       | ✅          | N/A        | ✅        |
| recording    | ✅          | ❌       | ✅          | ✅         | ✅        |
| processing   | ✅          | ❌       | ❌          | ✅         | ✅        |
| transcribing | ✅          | ❌       | ❌          | ✅         | ✅        |
| transcribed  | ❌          | ❌       | ✅          | ✅         | ✅        |
| enriching    | ✅          | ❌       | ❌          | ✅         | ✅        |
| complete     | ❌          | ✅       | ✅          | N/A        | ✅        |
| error        | ❌          | ✅       | ✅          | N/A        | N/A       |

## Transition Rules

### Always Allowed
- Any state → `error` (via SET_ERROR action)
- `error` → `idle` (via RESET_RECORDING action)

### Conditional Transitions
- `transcribed` → `complete` (skip enrichment)
- `transcribed` → `enriching` (with enrichment)

### Cancellation Paths
Most states can transition directly to `idle`:
- `recording` → `idle`
- `processing` → `idle`
- `transcribing` → `idle`
- `transcribed` → `idle`
- `enriching` → `idle`
- `complete` → `idle`

### Invalid Transitions (Examples)
- `idle` → `transcribing` ❌
- `recording` → `enriching` ❌
- `processing` → `complete` ❌
- `error` → `recording` ❌

## UI State Indicators

### Visual Feedback by State

```
idle         →  🎤 Ready to Record
recording    →  🔴 Recording... (with timer)
processing   →  ⏳ Processing audio...
transcribing →  ⏳ Transcribing...
transcribed  →  ✅ Transcription complete
enriching    →  ⏳ Enriching with AI...
complete     →  ✅ Complete! (with actions)
error        →  ❌ Error occurred (with retry)
```

### Button States by Recording State

| State        | Record Button | Stop Button | Enrich Button | Save Button |
|--------------|---------------|-------------|---------------|-------------|
| idle         | Enabled       | Disabled    | Disabled      | Disabled    |
| recording    | Disabled      | Enabled     | Disabled      | Disabled    |
| processing   | Disabled      | Disabled    | Disabled      | Disabled    |
| transcribing | Disabled      | Disabled    | Disabled      | Disabled    |
| transcribed  | Disabled      | Disabled    | Enabled       | Enabled     |
| enriching    | Disabled      | Disabled    | Disabled      | Disabled    |
| complete     | Enabled       | Disabled    | Disabled      | Enabled     |
| error        | Enabled       | Disabled    | Disabled      | Disabled    |
