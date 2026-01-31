# Recording State Machine

## Overview

The recording state machine defines the valid states and transitions for the voice recording workflow. It ensures the application follows a predictable state flow and prevents invalid state transitions.

## States

### 1. `idle`
- **Description:** Ready to record
- **User Actions:** Can start recording
- **Next States:** `recording`, `error`

### 2. `recording`
- **Description:** Recording audio
- **User Actions:** Can stop recording, can cancel
- **Next States:** `processing`, `error`, `idle`

### 3. `processing`
- **Description:** Processing audio
- **User Actions:** None (automatic)
- **Next States:** `transcribing`, `error`, `idle`

### 4. `transcribing`
- **Description:** Transcribing audio to text
- **User Actions:** Can cancel
- **Next States:** `transcribed`, `error`, `idle`

### 5. `transcribed`
- **Description:** Transcription complete
- **User Actions:** Can enrich, can save without enrichment, can cancel
- **Next States:** `enriching`, `complete`, `error`, `idle`

### 6. `enriching`
- **Description:** Enriching text with AI
- **User Actions:** Can cancel
- **Next States:** `complete`, `error`, `idle`

### 7. `complete`
- **Description:** Recording complete
- **User Actions:** Can start new recording, can view/export
- **Next States:** `idle`, `error`

### 8. `error`
- **Description:** An error occurred
- **User Actions:** Can retry (returns to idle)
- **Next States:** `idle`

## State Categories

### In-Progress States
States where work is actively being done:
- `recording`
- `processing`
- `transcribing`
- `enriching`

### Terminal States
States where the workflow is complete or idle:
- `idle`
- `complete`
- `error`

### Interactive States
States where user interaction is allowed:
- `idle`
- `recording`
- `transcribed`
- `complete`
- `error`

## State Transitions

### Complete Flow (with enrichment)
```
idle → recording → processing → transcribing → transcribed → enriching → complete → idle
```

### Flow without Enrichment
```
idle → recording → processing → transcribing → transcribed → complete → idle
```

### Error Recovery
From any state:
```
[any state] → error → idle
```

### Cancellation
From most states:
```
[recording|processing|transcribing|transcribed|enriching] → idle
```

## Validation

The state machine provides comprehensive validation functions to ensure transitions are valid and data is consistent:

### State Transition Validation

#### `isValidTransition(from, to)`
Checks if a transition from one state to another is allowed.

```typescript
isValidTransition('idle', 'recording') // true
isValidTransition('idle', 'transcribing') // false
```

#### `validateTransition(from, to)`
Throws a `StateTransitionError` if the transition is invalid.

```typescript
validateTransition('idle', 'recording') // OK
validateTransition('idle', 'transcribing') // throws StateTransitionError
```

### State Data Validation

#### `validateStateData(state, data)`
Validates that required data exists for a given state. Throws `StateDataValidationError` if required data is missing.

```typescript
// Processing state requires audio
validateStateData('processing', {
  audioBlob: new Blob(),
  audioDuration: 5000,
  transcription: null,
  enrichment: null,
}); // OK

validateStateData('processing', {
  audioBlob: null,
  audioDuration: null,
  transcription: null,
  enrichment: null,
}); // throws StateDataValidationError
```

**Data Requirements by State:**
- `idle`, `recording`, `error`: No requirements
- `processing`, `transcribing`: Requires `audioBlob` and `audioDuration`
- `transcribed`: Requires `audioBlob` and `transcription`
- `enriching`: Requires `transcription`
- `complete`: Requires `audioBlob` and `transcription` (enrichment is optional)

#### `validateStateConsistency(state, data)`
Checks if the state and data are consistent with each other. Returns validation result with warnings.

```typescript
const result = validateStateConsistency('idle', {
  audioBlob: new Blob(), // Shouldn't exist in idle
  audioDuration: null,
  transcription: null,
  enrichment: null,
});

// result = { valid: false, warnings: ['audioBlob exists in idle state'] }
```

#### `validateStateTransitionWithData(from, to, data)`
Combines transition validation and data validation. Validates both the transition and the data for the target state.

```typescript
validateStateTransitionWithData('recording', 'processing', {
  audioBlob: new Blob(),
  audioDuration: 5000,
  transcription: null,
  enrichment: null,
}); // OK - valid transition and valid data
```

### State Validation

#### `isValidState(state)`
Checks if a state is valid (exists in the state machine).

```typescript
isValidState('idle') // true
isValidState('invalid') // false
```

## Usage

### In Components

```typescript
import { useAppState } from '@/contexts/AppContext';
import { getStateDescription, isInProgress } from '@/lib/recordingStateMachine';

function MyComponent() {
  const { recordingState } = useAppState();
  
  const description = getStateDescription(recordingState);
  const isWorking = isInProgress(recordingState);
  
  return (
    <div>
      <p>Status: {description}</p>
      {isWorking && <Spinner />}
    </div>
  );
}
```

### In Reducers

The AppContext reducer automatically validates state transitions and data, catching errors and setting the error state:

```typescript
case 'START_RECORDING':
  nextState = 'recording';
  validateTransition(state.recordingState, nextState);
  return { ...state, recordingState: nextState };
```

If validation fails, the reducer catches the error and transitions to the error state:

```typescript
catch (error) {
  if (error instanceof StateTransitionError) {
    console.error(`State transition error: ${error.message}`);
    return {
      ...state,
      recordingState: 'error',
      error: {
        message: `Invalid state transition: ${error.message}`,
        code: 'STATE_TRANSITION_ERROR',
      },
    };
  }
  
  if (error instanceof StateDataValidationError) {
    console.error(`State data validation error: ${error.message}`);
    return {
      ...state,
      recordingState: 'error',
      error: {
        message: `Invalid state data: ${error.message}`,
        code: 'STATE_DATA_VALIDATION_ERROR',
      },
    };
  }
}
```

### Validating Data Before State Changes

```typescript
import { validateStateData } from '@/lib/recordingStateMachine';

function handleTranscriptionComplete(transcription) {
  const newData = {
    ...currentRecording,
    transcription,
  };
  
  try {
    validateStateData('transcribed', newData);
    dispatch({ type: 'TRANSCRIPTION_COMPLETE', payload: transcription });
  } catch (error) {
    console.error('Invalid data for transcribed state:', error);
    // Handle error
  }
}
```

## Design Decisions

### Why Validate Transitions?

1. **Predictability:** Ensures the app behaves consistently
2. **Debugging:** Invalid transitions are logged, making bugs easier to find
3. **Safety:** Prevents UI from getting into invalid states
4. **Documentation:** The transition map serves as documentation

### Why Allow Multiple Paths?

The state machine allows flexibility:
- Users can skip enrichment (`transcribed → complete`)
- Users can cancel at any point (→ `idle`)
- Errors can occur from any state (→ `error`)

This flexibility matches real-world usage patterns while maintaining safety.

### Why Separate `processing` and `transcribing`?

These are distinct operations:
- `processing`: Preparing audio (format conversion, validation)
- `transcribing`: Sending to transcription service

Separating them allows for better progress indication and error handling.

## Testing

The state machine includes comprehensive tests covering:
- All state definitions
- Valid transitions
- Invalid transitions
- Complete workflows
- Error recovery
- Cancellation flows

Run tests with:
```bash
npm test -- recordingStateMachine
```

## Future Enhancements

Potential additions:
- State history tracking
- Transition timing metrics
- State persistence
- Undo/redo support
- State machine visualization
