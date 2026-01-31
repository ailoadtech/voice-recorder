# TranscriptionDisplay Component

## Overview

The `TranscriptionDisplay` component provides a comprehensive UI for displaying transcribed text with loading states, error handling, editing capabilities, and metadata display. It integrates seamlessly with the TranscriptionService.

## Features

### ✅ Loading State with Progress Indicator

- Animated spinner during transcription
- Clear status message
- Helpful hint text
- Prevents interaction during processing

### ✅ Display Transcribed Text

- Clean, readable text display
- Whitespace preservation
- Responsive text sizing
- Scrollable for long transcriptions

### ✅ Edit Capability for Corrections

- Toggle between view and edit modes
- Auto-resizing textarea
- Save edited changes
- Callback for text updates
- Visual feedback for edit mode

### ✅ Copy Transcription Button

- One-click copy to clipboard
- Success feedback (2-second confirmation)
- Works with both original and edited text
- Handles copy failures gracefully

### ✅ Transcription Metadata Display

- **Language**: Detected language code (e.g., EN, ES, FR)
- **Duration**: Audio length in MM:SS format
- **Confidence**: Overall transcription confidence (0-100%)
- **Segments**: Detailed timestamp segments (expandable)

## Usage

### Basic Usage

```tsx
import { TranscriptionDisplay } from '@/components/TranscriptionDisplay';
import type { TranscriptionResult } from '@/services/transcription';

function MyComponent() {
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <TranscriptionDisplay
      result={result}
      isLoading={isLoading}
    />
  );
}
```

### With Error Handling

```tsx
<TranscriptionDisplay
  result={result}
  isLoading={isTranscribing}
  error={transcriptionError}
/>
```

### With Edit Callback

```tsx
const handleTextChange = (newText: string) => {
  console.log('Text updated:', newText);
  // Save to state or database
};

<TranscriptionDisplay
  result={result}
  onTextChange={handleTextChange}
/>
```

### Complete Integration

```tsx
function RecordPage() {
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const service = useRef(new TranscriptionService());

  const handleTranscribe = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setError(null);
    
    try {
      const transcription = await service.current.transcribe(audioBlob);
      setResult(transcription);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <TranscriptionDisplay
      result={result}
      isLoading={isTranscribing}
      error={error}
      onTextChange={(text) => setResult(prev => prev ? {...prev, text} : null)}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `result` | `TranscriptionResult \| null` | Yes | Transcription result from service |
| `isLoading` | `boolean` | No | Show loading state (default: false) |
| `error` | `string \| null` | No | Error message to display |
| `onTextChange` | `(text: string) => void` | No | Callback when text is edited |
| `className` | `string` | No | Additional CSS classes |

## TranscriptionResult Interface

```typescript
interface TranscriptionResult {
  text: string;              // Full transcription text
  language?: string;         // Detected language code
  duration?: number;         // Audio duration in seconds
  confidence?: number;       // Overall confidence (0-1)
  segments?: TranscriptionSegment[];  // Detailed segments
}

interface TranscriptionSegment {
  id: number;                // Segment identifier
  start: number;             // Start time in seconds
  end: number;               // End time in seconds
  text: string;              // Segment text
  confidence?: number;       // Segment confidence (0-1)
}
```

## States

### 1. Empty State
Displayed when no transcription result is available.

```
┌─────────────────────────────────────┐
│                                     │
│  Transcribed text will appear       │
│  here after recording...            │
│                                     │
└─────────────────────────────────────┘
```

### 2. Loading State
Displayed during transcription processing.

```
┌─────────────────────────────────────┐
│              ⟳                      │
│                                     │
│      Transcribing audio...          │
│   This may take a few moments       │
│                                     │
└─────────────────────────────────────┘
```

### 3. Error State
Displayed when transcription fails.

```
┌─────────────────────────────────────┐
│              ⚠️                     │
│                                     │
│      Transcription Failed           │
│      [Error message here]           │
│                                     │
└─────────────────────────────────────┘
```

### 4. Result State
Displayed with successful transcription.

```
┌─────────────────────────────────────┐
│ Language: EN  Duration: 1:23  95%   │
├─────────────────────────────────────┤
│                                     │
│  This is the transcribed text       │
│  from the audio recording...        │
│                                     │
├─────────────────────────────────────┤
│ [✏️ Edit] [📋 Copy] [📊 Segments]   │
└─────────────────────────────────────┘
```

### 5. Edit Mode
Displayed when editing transcription.

```
┌─────────────────────────────────────┐
│ Language: EN  Duration: 1:23  95%   │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ [Editable textarea with text]   │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [✓ Save] [📋 Copy] [📊 Segments]    │
└─────────────────────────────────────┘
```

## Features in Detail

### Metadata Display

Metadata is shown in a compact, responsive layout:
- **Language**: Badge with language code
- **Duration**: Formatted as MM:SS
- **Confidence**: Percentage (0-100%)

All metadata fields are optional and only displayed if available.

### Edit Functionality

1. Click "Edit" button to enter edit mode
2. Textarea appears with current text
3. Textarea auto-resizes as you type
4. Click "Save" to confirm changes
5. `onTextChange` callback is triggered with new text

### Copy to Clipboard

- Copies current text (original or edited)
- Shows "Copied!" confirmation for 2 seconds
- Handles clipboard API failures gracefully
- Works on all modern browsers

### Segments View

- Collapsible details section
- Shows count in button: "View Segments (5)"
- Each segment displays:
  - Timestamp range (MM:SS - MM:SS)
  - Confidence percentage
  - Segment text
- Scrollable if many segments
- Useful for reviewing specific parts

## Styling

The component uses Tailwind CSS with:
- Gray-50 background for content area
- Blue accent colors for interactive elements
- Responsive text sizing (sm:text-base)
- Smooth transitions
- Proper spacing and padding

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Keyboard accessible buttons
- Focus indicators
- Screen reader friendly
- ARIA labels where appropriate

## Integration

### Current Integration

The component is integrated into the `/record` page:

```tsx
// src/app/record/page.tsx
<TranscriptionDisplay
  result={transcriptionResult}
  isLoading={isTranscribing}
  error={transcriptionError}
  onTextChange={handleTranscriptionTextChange}
/>
```

### Workflow

1. User records audio with RecordingButton
2. Recording completes and returns audio blob
3. TranscriptionService processes the audio
4. TranscriptionDisplay shows loading state
5. Result appears with metadata and actions
6. User can edit, copy, or view segments

## Testing

Unit tests are provided in `TranscriptionDisplay.test.tsx`:

- ✅ Renders empty state
- ✅ Renders loading state
- ✅ Renders error state
- ✅ Displays transcription result
- ✅ Displays metadata
- ✅ Copies text to clipboard
- ✅ Enables edit mode
- ✅ Saves edited text
- ✅ Displays segments count
- ✅ Shows detailed segments
- ✅ Formats duration correctly
- ✅ Handles missing metadata

Run tests:
```bash
npm test TranscriptionDisplay.test.tsx
```

## Performance

- Minimal re-renders with proper state management
- Auto-resize textarea only when editing
- Lazy rendering of segments (collapsed by default)
- Efficient clipboard operations
- No memory leaks

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14.1+
- Requires Clipboard API support

## Future Enhancements

1. **Export Options**: Download as TXT, MD, or JSON
2. **Search/Highlight**: Find text within transcription
3. **Timestamps**: Click segment to jump to audio position
4. **Speaker Labels**: Show different speakers (if available)
5. **Formatting Tools**: Bold, italic, lists
6. **Undo/Redo**: Edit history
7. **Auto-save**: Save edits automatically
8. **Keyboard Shortcuts**: Ctrl+E to edit, Ctrl+C to copy

## Completed Sub-tasks

- ✅ Create TranscriptionDisplay component
- ✅ Add loading state with progress indicator
- ✅ Display transcribed text
- ✅ Add edit capability for corrections
- ✅ Implement copy transcription button
- ✅ Show transcription metadata (duration, language, etc.)

## Status

**Task 4.2 Transcription UI: COMPLETE** ✅

All sub-tasks have been implemented and tested. The component is production-ready and integrated into the record page.

## Dependencies

- React 18.3+
- TranscriptionService
- Tailwind CSS
- TypeScript
- Clipboard API

## File Structure

```
src/components/
├── TranscriptionDisplay.tsx          # Main component
├── TranscriptionDisplay.test.tsx     # Unit tests
├── TranscriptionDisplay.README.md    # This file
└── index.ts                          # Export barrel
```
