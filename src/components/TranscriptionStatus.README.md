# TranscriptionStatus Component

## Overview

The `TranscriptionStatus` component provides visual feedback during audio transcription operations. It displays the current stage of transcription with progress indicators and allows users to cancel ongoing operations.

**Requirements Satisfied:**
- Requirement 9.5: Display transcription status with stages
- Requirement 5.3: Allow users to cancel transcription operations

## Components

### TranscriptionStatus

The main status display component with full progress visualization.

**Props:**
- `stage: TranscriptionStage` - Current transcription stage
- `progress?: number` - Progress value from 0.0 to 1.0 (optional)
- `onCancel?: () => void` - Callback for cancel button (optional)
- `className?: string` - Additional CSS classes (optional)

**Stages:**
- `idle` - No transcription in progress (component hidden)
- `loading_model` - Loading Whisper model into memory
- `processing_audio` - Transcribing audio data
- `finalizing` - Completing transcription
- `complete` - Transcription finished

### TranscriptionStatusIndicator

A compact inline version for minimal space usage.

**Props:**
- `stage: TranscriptionStage` - Current transcription stage
- `className?: string` - Additional CSS classes (optional)

## Usage

### Basic Usage

```tsx
import { TranscriptionStatus } from '@/components';

function MyComponent() {
  const [stage, setStage] = useState<TranscriptionStage>('idle');
  const [progress, setProgress] = useState(0);

  return (
    <TranscriptionStatus
      stage={stage}
      progress={progress}
      onCancel={() => {
        // Handle cancellation
        setStage('idle');
      }}
    />
  );
}
```

### With useTranscriptionStatus Hook

```tsx
import { TranscriptionStatus } from '@/components';
import { useTranscriptionStatus } from '@/hooks';

function MyComponent() {
  const {
    stage,
    progress,
    startTranscription,
    handleProgress,
    cancelTranscription,
  } = useTranscriptionStatus();

  const handleTranscribe = async () => {
    startTranscription();
    
    // Your transcription logic here
    // Call handleProgress with updates from the service
  };

  return (
    <TranscriptionStatus
      stage={stage}
      progress={progress}
      onCancel={cancelTranscription}
    />
  );
}
```

### Integration with LocalWhisperProvider

```tsx
import { TranscriptionStatus } from '@/components';
import { useTranscriptionStatus } from '@/hooks';
import { LocalWhisperProvider } from '@/services/whisper';

function TranscriptionComponent() {
  const {
    stage,
    progress,
    startTranscription,
    handleProgress,
    completeTranscription,
    cancelTranscription,
  } = useTranscriptionStatus();

  const handleTranscribe = async (audio: AudioBuffer) => {
    try {
      startTranscription();

      const provider = new LocalWhisperProvider(modelManager, 'small');
      
      // Pass handleProgress as callback to receive progress updates
      const result = await provider.transcribe(audio, (progressData) => {
        handleProgress(progressData);
      });

      completeTranscription();
      return result;
    } catch (error) {
      cancelTranscription();
      throw error;
    }
  };

  return (
    <div>
      <button onClick={() => handleTranscribe(audioBuffer)}>
        Transcribe
      </button>
      
      <TranscriptionStatus
        stage={stage}
        progress={progress}
        onCancel={cancelTranscription}
      />
    </div>
  );
}
```

### Compact Indicator

```tsx
import { TranscriptionStatusIndicator } from '@/components';

function StatusBar() {
  const [stage, setStage] = useState<TranscriptionStage>('processing_audio');

  return (
    <div className="flex items-center gap-2">
      <span>Status:</span>
      <TranscriptionStatusIndicator stage={stage} />
    </div>
  );
}
```

## Features

### Visual Feedback

- **Stage-specific icons**: Each stage has a unique emoji icon
- **Color coding**: Different colors for each stage (blue, purple, green)
- **Progress bar**: Animated progress bar showing completion percentage
- **Smooth animations**: Fade-in, pulse, and transition effects

### Accessibility

- **ARIA attributes**: Proper `role`, `aria-live`, and `aria-label` attributes
- **Progress bar semantics**: `progressbar` role with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- **Keyboard accessible**: Cancel button is keyboard accessible

### User Experience

- **Cancel button**: Appears during processing stages when `onCancel` is provided
- **Auto-hide**: Component is hidden when stage is `idle`
- **Smooth progress**: Progress bar animates smoothly between values
- **Responsive**: Works on mobile and desktop

## Stage Flow

The typical transcription flow follows these stages:

1. **idle** → User initiates transcription
2. **loading_model** (0%) → Whisper model loads into memory
3. **processing_audio** (33%) → Audio is being transcribed
4. **finalizing** (66%) → Transcription is being finalized
5. **complete** (100%) → Transcription finished
6. **idle** → Component auto-resets after 2 seconds

## Styling

The component uses Tailwind CSS classes and supports dark mode. You can customize appearance by:

1. Passing `className` prop for additional styles
2. Modifying the component's internal color schemes
3. Overriding Tailwind classes in your global CSS

## Testing

The component includes comprehensive tests covering:

- Rendering different stages
- Progress display
- Cancel button functionality
- ARIA attributes
- Compact indicator variant

Run tests:
```bash
npm test -- TranscriptionStatus
```

## Examples

See `TranscriptionStatus.example.tsx` for complete working examples including:

- Basic usage with manual control
- Hook-based integration
- Compact indicator usage
- Real transcription service integration
- All stages showcase

## Related Components

- `LoadingSpinner` - Generic loading indicator
- `RecordingButton` - Recording control with status display
- `Toast` - Notification system for errors

## Related Hooks

- `useTranscriptionStatus` - Hook for managing transcription status state
- `useWhisperTranscription` - Hook for Whisper transcription integration

## Backend Integration

The component works with the Rust backend's progress events:

```rust
// Rust backend emits these events during transcription
app.emit("transcription-progress", TranscriptionProgress {
    stage: "loading_model",
    progress: 0.0,
});

app.emit("transcription-progress", TranscriptionProgress {
    stage: "processing_audio",
    progress: 0.33,
});

app.emit("transcription-progress", TranscriptionProgress {
    stage: "finalizing",
    progress: 0.66,
});

app.emit("transcription-progress", TranscriptionProgress {
    stage: "complete",
    progress: 1.0,
});
```

The `LocalWhisperProvider` listens for these events and forwards them to the component via the progress callback.
