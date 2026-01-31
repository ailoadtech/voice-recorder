# Animation System Documentation

## Overview

This document describes the animation and transition system implemented for the Voice Intelligence Desktop App. The system provides smooth, performant animations that enhance the user experience without compromising functionality.

## Animation Library

All animations are defined in `src/styles/design-tokens.css` and can be applied via Tailwind utility classes.

### Available Animations

#### 1. Loading Animations

**Spin Animation**
- Class: `animate-spin`
- Duration: 1s linear infinite
- Use: Loading spinners, processing indicators
- Example: `<div className="animate-spin" />`

**Shimmer Animation**
- Class: `animate-shimmer`
- Duration: 2s linear infinite
- Use: Skeleton loaders, content placeholders
- Example: `<div className="animate-shimmer" />`

#### 2. Entrance Animations

**Fade In**
- Class: `animate-fadeIn`
- Duration: 200ms ease-in
- Use: General content appearance
- Example: `<div className="animate-fadeIn">Content</div>`

**Slide In (from top)**
- Class: `animate-slideIn`
- Duration: 200ms ease-out
- Use: Dropdown menus, notifications
- Example: `<div className="animate-slideIn">Menu</div>`

**Slide Up (from bottom)**
- Class: `animate-slideUp`
- Duration: 200ms ease-out
- Use: Bottom sheets, modals
- Example: `<div className="animate-slideUp">Modal</div>`

**Scale In**
- Class: `animate-scaleIn`
- Duration: 200ms ease-out
- Use: Buttons, cards appearing
- Example: `<div className="animate-scaleIn">Card</div>`

#### 3. State Animations

**Pulse**
- Class: `animate-pulse`
- Duration: 2s cubic-bezier infinite
- Use: Attention-grabbing elements
- Example: `<button className="animate-pulse">Important</button>`

**Recording Pulse**
- Class: `animate-recordingPulse`
- Duration: 2s ease-in-out infinite
- Use: Recording indicator rings
- Example: `<div className="animate-recordingPulse" />`

**Success Pulse**
- Class: `animate-successPulse`
- Duration: 600ms ease-in-out (once)
- Use: Success confirmations
- Example: `<div className="animate-successPulse">✓</div>`

**Bounce**
- Class: `animate-bounce`
- Duration: 1s ease-in-out infinite
- Use: Attention indicators
- Example: `<div className="animate-bounce">↓</div>`

**Shake**
- Class: `animate-shake`
- Duration: 300ms ease-in-out (once)
- Use: Error states, invalid input
- Example: `<div className="animate-shake">Error</div>`

### Transition Utilities

**Smooth Transition**
- Class: `transition-smooth`
- Duration: 200ms (--transition-base)
- Use: General state changes
- Example: `<button className="transition-smooth hover:scale-105">`

**Fast Transition**
- Class: `transition-fast`
- Duration: 150ms (--transition-fast)
- Use: Quick interactions
- Example: `<button className="transition-fast hover:bg-blue-600">`

**Slow Transition**
- Class: `transition-slow`
- Duration: 300ms (--transition-slow)
- Use: Deliberate state changes
- Example: `<div className="transition-slow opacity-0 hover:opacity-100">`

## Component-Specific Animations

### RecordingButton

**States and Animations:**
- **Idle**: `animate-fadeIn` on mount
- **Recording**: `animate-pulse` on button, `animate-recordingPulse` on ring
- **Processing**: `animate-scaleIn` on button, `animate-spin` on spinner
- **Complete**: `animate-successPulse` on button, `animate-scaleIn` on checkmark
- **Error**: `animate-shake` on button, `animate-slideIn` on error message

**Timer Display:**
- Appears with `animate-slideUp` when recording starts

**Status Text:**
- All state changes use `animate-fadeIn` for smooth text transitions

### Home Page (Dashboard)

**Staggered Entrance:**
- Header: `animate-fadeIn` (0ms delay)
- Quick Action Cards: `animate-slideIn` (0ms, 100ms, 200ms delays)
- Recent Activity: `animate-slideUp` (300ms delay)
- Stats Cards: `animate-scaleIn` (400ms, 500ms, 600ms delays)

**Hover Effects:**
- Cards: `hover:scale-105 hover:-translate-y-1` with `transition-all duration-300`
- Creates lift effect on hover

### LoadingSpinner Component

**Spinner:**
- Uses `animate-spin` for continuous rotation
- Available in 3 sizes: sm, md, lg

**Text:**
- Optional loading text with `animate-fadeIn`

### LoadingSkeleton Component

**Skeleton Lines:**
- Each line uses `animate-shimmer` with staggered delays
- Creates wave effect across multiple lines

## Performance Considerations

### CSS-Based Animations
All animations use CSS transforms and opacity for optimal performance:
- `transform`: GPU-accelerated
- `opacity`: GPU-accelerated
- Avoids layout thrashing

### Animation Delays
Staggered animations use inline `style={{ animationDelay: 'Xms' }}` for precise timing without JavaScript overhead.

### Reduced Motion
Consider adding support for `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Best Practices

### When to Use Animations

**DO Use:**
- State transitions (loading → complete)
- User feedback (success, error)
- Content appearance (page load, modal open)
- Attention direction (new notifications)

**DON'T Use:**
- Excessive animations that distract
- Long-duration animations (>500ms for most cases)
- Animations on every interaction
- Animations that block user input

### Animation Duration Guidelines

- **Micro-interactions**: 150ms (fast)
- **Standard transitions**: 200ms (base)
- **Deliberate changes**: 300ms (slow)
- **Attention animations**: 600ms-1s (pulse, bounce)
- **Loading states**: Infinite until complete

### Combining Animations

Multiple animations can be combined:
```tsx
<div className="animate-fadeIn hover:scale-105 transition-all duration-300">
  Content
</div>
```

### Dark Mode Considerations

All animations work in both light and dark modes. The animation system is theme-agnostic and relies on color classes that adapt to the theme.

## Testing Animations

### Visual Testing
1. Test all animation states in both light and dark modes
2. Verify animations on different screen sizes
3. Check animation performance on lower-end devices

### Automated Testing
Animations can be tested using Jest and React Testing Library:
```tsx
it('applies animation class', () => {
  const { container } = render(<Component />);
  expect(container.firstChild).toHaveClass('animate-fadeIn');
});
```

## Future Enhancements

### Potential Additions
- Page transition animations
- Gesture-based animations (swipe, drag)
- Parallax effects
- Micro-interactions on form inputs
- Progress indicators with animated fills
- Toast notifications with slide-in/out

### Accessibility
- Add `prefers-reduced-motion` support
- Ensure animations don't interfere with screen readers
- Provide skip animation options for power users

## CSS Variables Reference

Animation timing variables defined in `design-tokens.css`:
- `--transition-fast`: 150ms
- `--transition-base`: 200ms
- `--transition-slow`: 300ms

## Examples

### Basic Usage
```tsx
// Fade in on mount
<div className="animate-fadeIn">
  Content appears smoothly
</div>

// Hover effect with transition
<button className="transition-smooth hover:scale-105 hover:shadow-lg">
  Click me
</button>

// Loading spinner
<div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
```

### Advanced Usage
```tsx
// Staggered list items
{items.map((item, i) => (
  <div 
    key={item.id}
    className="animate-slideIn"
    style={{ animationDelay: `${i * 100}ms` }}
  >
    {item.content}
  </div>
))}

// State-based animations
<button className={`
  ${isLoading && 'animate-pulse'}
  ${isSuccess && 'animate-successPulse'}
  ${isError && 'animate-shake'}
  transition-all duration-300
`}>
  Submit
</button>
```

## Conclusion

The animation system provides a comprehensive set of animations and transitions that enhance the user experience while maintaining performance. All animations are designed to be smooth, purposeful, and accessible.
