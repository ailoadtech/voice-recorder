# AudioPlayer Component

## Overview

The `AudioPlayer` component provides a full-featured audio playback interface for recorded audio. It includes play/pause controls, a progress bar, and volume control with a clean, responsive design.

## Features

### ✅ Audio Playback Component

A complete audio player built with the HTML5 Audio API that accepts audio blobs and provides intuitive playback controls.

### ✅ Play/Pause Controls

- Large, accessible play/pause button
- Visual feedback with SVG icons
- Smooth transitions between states
- Keyboard accessible
- Touch-friendly on mobile devices

### ✅ Progress Bar

- Visual representation of playback progress
- Click-to-seek functionality
- Hover effect with handle indicator
- Real-time updates (100ms interval)
- Smooth animations
- ARIA attributes for accessibility

### ✅ Volume Control

- Slider for precise volume adjustment (0-100%)
- Mute/unmute button with appropriate icons
- Visual percentage display
- Three volume icon states (muted, low, high)
- Remembers volume level when unmuting
- Responsive design

## Usage

```tsx
import { AudioPlayer } from '@/components/AudioPlayer';

function MyComponent() {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  return (
    <div>
      {audioBlob && <AudioPlayer audioBlob={audioBlob} />}
    </div>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `audioBlob` | `Blob` | Yes | Audio blob to play (from recording or file) |
| `className` | `string` | No | Additional CSS classes for the container |

## Features in Detail

### Time Display

- Shows current time and total duration
- Format: MM:SS (e.g., "01:23")
- Monospace font for better readability
- Updates in real-time during playback

### Progress Bar Interaction

- Click anywhere on the bar to seek
- Visual feedback with hover effect
- Draggable handle appears on hover
- Smooth progress animation
- Percentage-based positioning

### Volume Control

- Range slider (0-100%)
- Mute button with three icon states:
  - 🔊 High volume (>50%)
  - 🔉 Low volume (1-50%)
  - 🔇 Muted (0%)
- Percentage display
- Smooth transitions

### Responsive Design

- Mobile-first approach
- Button sizes adapt: 10x10 (mobile) → 12x12 (desktop)
- Text sizes scale appropriately
- Touch-friendly controls
- Flexible layouts

## Integration

### Current Integration

The component is integrated into the `/record` page:

```tsx
// src/app/record/page.tsx
{audioBlob && (
  <div className="bg-white border rounded-lg p-4 sm:p-6">
    <h2 className="text-lg sm:text-xl font-semibold mb-4">Audio Playback</h2>
    <AudioPlayer audioBlob={audioBlob} />
  </div>
)}
```

### Workflow

1. User records audio with RecordingButton
2. Recording completes and returns audio blob
3. AudioPlayer component appears with the blob
4. User can play back, seek, and adjust volume

## Technical Details

### Audio URL Management

- Creates object URL from blob on mount
- Automatically revokes URL on unmount
- Prevents memory leaks

### State Management

- `isPlaying`: Play/pause state
- `currentTime`: Current playback position
- `duration`: Total audio duration
- `volume`: Volume level (0-1)
- `audioUrl`: Object URL for audio element

### Performance

- Updates throttled to 100ms intervals
- Cleanup of intervals on unmount
- Efficient re-renders with proper dependencies
- No memory leaks

### Browser Compatibility

- Uses HTML5 Audio API
- Works in all modern browsers
- Chrome/Edge 88+
- Firefox 85+
- Safari 14.1+

## Styling

The component uses Tailwind CSS with custom slider styling:

- Blue primary color (#2563eb)
- Gray backgrounds and text
- Smooth transitions
- Shadow effects for depth
- Custom range input styling

## Accessibility

- Proper ARIA labels for all controls
- Role="progressbar" for progress bar
- Keyboard accessible
- Screen reader friendly
- High contrast colors

## Testing

Unit tests are provided in `AudioPlayer.test.tsx`:

- ✅ Renders all controls
- ✅ Creates and revokes audio URL
- ✅ Displays time correctly
- ✅ Toggles play/pause
- ✅ Updates volume
- ✅ Mutes/unmutes
- ✅ Handles progress bar clicks
- ✅ Shows correct volume icons

Run tests with:
```bash
npm test AudioPlayer.test.tsx
```

## Example Scenarios

### Basic Playback
```tsx
<AudioPlayer audioBlob={recordedBlob} />
```

### With Custom Styling
```tsx
<AudioPlayer 
  audioBlob={recordedBlob} 
  className="my-custom-class"
/>
```

### Conditional Rendering
```tsx
{hasRecording && audioBlob && (
  <AudioPlayer audioBlob={audioBlob} />
)}
```

## Future Enhancements

1. **Playback Speed Control**: Add 0.5x, 1x, 1.5x, 2x speed options
2. **Waveform Visualization**: Display audio waveform
3. **Keyboard Shortcuts**: Space for play/pause, arrow keys for seek
4. **Loop Control**: Add repeat/loop functionality
5. **Download Button**: Allow downloading the audio file
6. **Timestamp Markers**: Add markers for important moments
7. **A-B Repeat**: Loop between two points

## Completed Sub-tasks

- ✅ Create audio playback component
- ✅ Add play/pause controls
- ✅ Implement progress bar
- ✅ Add volume control

## Status

**Task 2.3 Audio Playback: COMPLETE** ✅

All sub-tasks have been implemented and tested. The component is production-ready and integrated into the record page.

## Dependencies

- React 18.3+
- Tailwind CSS
- TypeScript
- HTML5 Audio API

## File Structure

```
src/components/
├── AudioPlayer.tsx          # Main component
├── AudioPlayer.test.tsx     # Unit tests
├── AudioPlayer.README.md    # This file
└── index.ts                 # Export barrel
```

## Notes

- Audio blob must be a valid audio format (webm, mp3, ogg, etc.)
- Component automatically handles cleanup
- Progress updates every 100ms for smooth animation
- Volume persists when toggling mute
- Responsive design works on all screen sizes
