# Design System Documentation

## Overview

This design system provides a consistent set of design tokens, components, and guidelines for the Voice Intelligence Desktop App. It ensures visual consistency, maintainability, and scalability.

## Color Palette

### Primary Colors
Used for primary actions, links, and brand elements.
- `primary-500`: Main brand color (#0ea5e9)
- Available shades: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900

### Secondary Colors
Used for secondary actions and accents.
- `secondary-500`: Secondary brand color (#a855f7)
- Available shades: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900

### Neutral Colors
Used for text, backgrounds, and borders.
- `neutral-500`: Mid-tone gray (#737373)
- Available shades: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900

### Semantic Colors
Used to convey meaning and state.
- **Success**: Green (#22c55e) - Successful operations
- **Error**: Red (#ef4444) - Errors and destructive actions
- **Warning**: Orange (#f59e0b) - Warnings and cautions
- **Info**: Blue (#3b82f6) - Informational messages

### Recording State Colors
Special colors for recording states.
- **Idle**: Gray (#737373)
- **Active**: Red (#ef4444)
- **Processing**: Orange (#f59e0b)
- **Complete**: Green (#22c55e)
- **Error**: Dark Red (#dc2626)

## Typography

### Font Families
- **Sans**: System font stack for UI text
- **Mono**: Monospace font for code and technical content

### Font Sizes
- `xs`: 12px - Small labels
- `sm`: 14px - Secondary text
- `base`: 16px - Body text (default)
- `lg`: 18px - Emphasized text
- `xl`: 20px - Small headings
- `2xl`: 24px - Medium headings
- `3xl`: 30px - Large headings
- `4xl`: 36px - Extra large headings
- `5xl`: 48px - Display text

### Font Weights
- `light`: 300
- `normal`: 400 (default)
- `medium`: 500
- `semibold`: 600
- `bold`: 700

## Spacing

Based on a 4px grid system:
- `1`: 4px
- `2`: 8px
- `3`: 12px
- `4`: 16px
- `5`: 20px
- `6`: 24px
- `8`: 32px
- `10`: 40px
- `12`: 48px
- `16`: 64px
- `20`: 80px
- `24`: 96px

## Border Radius

- `sm`: 2px - Subtle rounding
- `base`: 4px - Default rounding
- `md`: 6px - Medium rounding
- `lg`: 8px - Large rounding
- `xl`: 12px - Extra large rounding
- `2xl`: 16px - Very large rounding
- `full`: 9999px - Fully rounded (pills, circles)

## Shadows

- `sm`: Subtle shadow for slight elevation
- `base`: Default shadow for cards
- `md`: Medium shadow for dropdowns
- `lg`: Large shadow for modals
- `xl`: Extra large shadow for prominent elements
- `2xl`: Maximum shadow for floating elements
- `inner`: Inset shadow for pressed states

## Transitions

### Duration
- `fast`: 150ms - Quick interactions
- `base`: 200ms - Default transitions
- `slow`: 300ms - Deliberate animations
- `slower`: 500ms - Emphasized animations

### Timing Functions
- `linear`: Constant speed
- `ease`: Default easing
- `easeIn`: Accelerating
- `easeOut`: Decelerating
- `easeInOut`: Smooth start and end

## Usage Examples

### Using with Tailwind CSS

```tsx
// Colors
<div className="bg-primary-500 text-white">Primary Button</div>
<div className="bg-success-500">Success Message</div>

// Typography
<h1 className="text-4xl font-bold">Heading</h1>
<p className="text-base font-normal">Body text</p>

// Spacing
<div className="p-4 m-2">Content with padding and margin</div>

// Border Radius
<button className="rounded-lg">Rounded Button</button>

// Shadows
<div className="shadow-md">Card with shadow</div>
```

### Using with CSS Custom Properties

```css
.custom-button {
  background-color: var(--color-primary-500);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.recording-indicator {
  color: var(--color-recording-active);
  animation: pulse 2s infinite;
}
```

### Using with TypeScript

```typescript
import { colors, spacing, typography } from '@/styles/design-system';

const buttonStyle = {
  backgroundColor: colors.primary[500],
  padding: spacing[4],
  fontSize: typography.fontSize.base,
};
```

## Component Guidelines

### Buttons
- **Height**: Use `sm` (32px), `base` (40px), or `lg` (48px)
- **Padding**: Horizontal padding should be 2x vertical padding
- **Border Radius**: Use `lg` for standard buttons
- **Colors**: Primary for main actions, neutral for secondary

### Inputs
- **Height**: Match button heights for consistency
- **Border**: Use `neutral-300` with `neutral-500` on focus
- **Border Radius**: Use `md` for inputs
- **Padding**: Consistent with button padding

### Cards
- **Padding**: Use `base` (24px) for standard cards
- **Border Radius**: Use `xl` for cards
- **Shadow**: Use `base` or `md` for elevation
- **Background**: Use `neutral-50` or white

## Accessibility

### Color Contrast
All color combinations meet WCAG AA standards:
- Text on backgrounds: Minimum 4.5:1 ratio
- Large text: Minimum 3:1 ratio
- UI components: Minimum 3:1 ratio

### Focus Indicators
- Use `ring` utilities for focus states
- Minimum 2px outline
- High contrast color (primary-500 or neutral-900)

### Interactive Elements
- Minimum touch target: 44x44px
- Clear hover and active states
- Keyboard navigation support

## Dark Mode (Optional)

The design system includes dark mode support:
- Automatically detects system preference
- Inverts neutral colors
- Adjusts shadows for dark backgrounds
- Maintains semantic color meanings

## Best Practices

1. **Consistency**: Always use design tokens instead of hardcoded values
2. **Spacing**: Use the 4px grid system for all spacing
3. **Colors**: Use semantic colors for state (success, error, warning)
4. **Typography**: Maintain hierarchy with font sizes and weights
5. **Accessibility**: Test color contrast and keyboard navigation
6. **Performance**: Use CSS custom properties for dynamic theming

## Extending the Design System

To add new tokens:

1. Update `src/styles/design-system.ts`
2. Add corresponding CSS variables in `src/styles/design-tokens.css`
3. Update Tailwind config if needed
4. Document the new tokens in this file

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design Color System](https://material.io/design/color)
