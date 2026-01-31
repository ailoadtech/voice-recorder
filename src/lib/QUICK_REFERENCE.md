# Recording State Machine - Quick Reference

## Import

```typescript
import { 
  isValidTransition,
  getStateDescription,
  isInProgress,
  isTerminal,
  isInteractive,
  validateStateData,
  validateStateConsistency,
  validateStateTransitionWithData,
  isValidState,
  StateTransitionError,
  StateDataValidationError,
} from '@/lib/recordingStateMachine';

// Or from central lib export
import { 
  isValidTransition, 
  getStateDescription,
  validateStateData,
} from '@/lib';
```

## States

| State | Description | User Can Interact? |
|-------|-------------|-------------------|
| `idle` | Ready to record | ✅ Yes |
| `recording` | Recording audio | ✅ Yes (can stop) |
| `processing` | Processing audio | ❌ No |
| `transcribing` | Transcribing to text | ❌ No |
| `transcribed` | Transcription done | ✅ Yes |
| `enriching` | AI enrichment | ❌ No |
| `complete` | All done | ✅ Yes |
| `error` | Error occurred | ✅ Yes (can retry) |

## Common Checks

```typescript
// Check if transition is valid
if (isValidTransition('idle', 'recording')) {
  // OK to start recording
}

// Check if work is in progress
if (isInProgress(state)) {
  // Show spinner
}

// Check if user can interact
if (isInteractive(state)) {
  // Enable buttons
}

// Get description for UI
const description = getStateDescription(state);
// Returns: "Ready to record", "Recording audio", etc.

// Validate state data
try {
  validateStateData('processing', {
    audioBlob: new Blob(),
    audioDuration: 5000,
    transcription: null,
    enrichment: null,
  });
} catch (error) {
  if (error instanceof StateDataValidationError) {
    console.error('Missing data:', error.missingData);
  }
}

// Check state consistency
const { valid, warnings } = validateStateConsistency('idle', data);
if (!valid) {
  console.warn('State inconsistencies:', warnings);
}

// Validate complete transition with data
try {
  validateStateTransitionWithData('recording', 'processing', data);
} catch (error) {
  // Handle validation error
}
```

## React Hooks

```typescript
import { useAppState, useRecordingStateDescription } from '@/contexts/AppContext';

// Get current state
const { recordingState } = useAppState();

// Get state description
const description = useRecordingStateDescription();
```

## Valid Transitions

```typescript
// From idle
idle → recording ✅
idle → error ✅

// From recording
recording → processing ✅
recording → error ✅
recording → idle ✅ (cancel)

// From processing
processing → transcribing ✅
processing → error ✅
processing → idle ✅ (cancel)

// From transcribing
transcribing → transcribed ✅
transcribing → error ✅
transcribing → idle ✅ (cancel)

// From transcribed
transcribed → enriching ✅
transcribed → complete ✅ (skip enrichment)
transcribed → error ✅
transcribed → idle ✅ (cancel)

// From enriching
enriching → complete ✅
enriching → error ✅
enriching → idle ✅ (cancel)

// From complete
complete → idle ✅
complete → error ✅

// From error
error → idle ✅
```

## Example: Button Visibility

```typescript
function RecordingControls() {
  const { recordingState } = useAppState();
  
  return (
    <>
      {/* Record button - only in idle or complete */}
      {(recordingState === 'idle' || recordingState === 'complete') && (
        <button>Start Recording</button>
      )}
      
      {/* Stop button - only while recording */}
      {recordingState === 'recording' && (
        <button>Stop Recording</button>
      )}
      
      {/* Enrich button - only after transcription */}
      {recordingState === 'transcribed' && (
        <button>Enrich with AI</button>
      )}
      
      {/* Loading indicator - during processing */}
      {isInProgress(recordingState) && (
        <Spinner text={getStateDescription(recordingState)} />
      )}
    </>
  );
}
```

## Example: Conditional Actions

```typescript
function handleEnrich() {
  const { recordingState } = useAppState();
  
  // Check if enrichment is allowed
  if (!isValidTransition(recordingState, 'enriching')) {
    console.warn('Cannot enrich in current state:', recordingState);
    return;
  }
  
  // Proceed with enrichment
  dispatch({ type: 'START_ENRICHMENT' });
}
```

## Error Handling

```typescript
// Error can happen from any state
dispatch({ 
  type: 'SET_ERROR', 
  payload: { 
    message: 'Transcription failed',
    code: 'TRANSCRIPTION_ERROR'
  }
});

// Recovery: always goes back to idle
dispatch({ type: 'RESET_RECORDING' });
```

## Data Validation

### Required Data by State

```typescript
// idle, recording, error: No requirements

// processing, transcribing: Requires audio
{
  audioBlob: Blob,
  audioDuration: number,
  transcription: null,
  enrichment: null
}

// transcribed: Requires audio and transcription
{
  audioBlob: Blob,
  audioDuration: number,
  transcription: { text: string },
  enrichment: null
}

// enriching: Requires transcription
{
  audioBlob: Blob | null,
  audioDuration: number | null,
  transcription: { text: string },
  enrichment: null
}

// complete: Requires audio and transcription (enrichment optional)
{
  audioBlob: Blob,
  audioDuration: number,
  transcription: { text: string },
  enrichment: { enrichedText: string } | null  // Optional
}
```

### Validation Example

```typescript
import { validateStateData, StateDataValidationError } from '@/lib';

function handleStopRecording(audioBlob: Blob, duration: number) {
  const data = {
    audioBlob,
    audioDuration: duration,
    transcription: null,
    enrichment: null,
  };
  
  try {
    // Validate data before transitioning to processing
    validateStateData('processing', data);
    dispatch({ 
      type: 'STOP_RECORDING', 
      payload: { audioBlob, duration } 
    });
  } catch (error) {
    if (error instanceof StateDataValidationError) {
      console.error('Missing required data:', error.missingData);
      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: `Cannot process recording: missing ${error.missingData.join(', ')}`,
          code: 'INVALID_RECORDING_DATA',
        },
      });
    }
  }
}
```

## State Categories

```typescript
// In-progress states (show spinner)
const inProgressStates = ['recording', 'processing', 'transcribing', 'enriching'];

// Terminal states (workflow complete)
const terminalStates = ['idle', 'complete', 'error'];

// Interactive states (user can act)
const interactiveStates = ['idle', 'recording', 'transcribed', 'complete', 'error'];
```
