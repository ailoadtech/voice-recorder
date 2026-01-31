/**
 * Design System
 * 
 * Centralized design tokens for colors, typography, spacing, and more.
 * This ensures consistency across the application.
 */

/**
 * Color Palette
 */
export const colors = {
  // Primary colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },

  // Secondary colors
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Neutral colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Recording state colors
  recording: {
    idle: '#737373',
    active: '#ef4444',
    processing: '#f59e0b',
    complete: '#22c55e',
    error: '#dc2626',
  },
} as const;

/**
 * Typography Scale
 */
export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
  },

  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
} as const;

/**
 * Spacing Scale (based on 4px grid)
 */
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

/**
 * Border Radius
 */
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
} as const;

/**
 * Shadows
 */
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
} as const;

/**
 * Z-Index Scale
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

/**
 * Transitions
 */
export const transitions = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  timing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },

  // Common transition combinations
  default: 'all 200ms ease-in-out',
  fast: 'all 150ms ease-in-out',
  slow: 'all 300ms ease-in-out',
} as const;

/**
 * Breakpoints for responsive design
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Component-specific tokens
 */
export const components = {
  button: {
    height: {
      sm: '2rem',      // 32px
      base: '2.5rem',  // 40px
      lg: '3rem',      // 48px
    },
    padding: {
      sm: '0.5rem 1rem',
      base: '0.75rem 1.5rem',
      lg: '1rem 2rem',
    },
  },

  input: {
    height: {
      sm: '2rem',
      base: '2.5rem',
      lg: '3rem',
    },
    padding: {
      sm: '0.5rem 0.75rem',
      base: '0.75rem 1rem',
      lg: '1rem 1.25rem',
    },
  },

  card: {
    padding: {
      sm: '1rem',
      base: '1.5rem',
      lg: '2rem',
    },
  },
} as const;

/**
 * Animation keyframes
 */
export const animations = {
  pulse: {
    keyframes: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    duration: '2s',
    timing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    iteration: 'infinite',
  },

  spin: {
    keyframes: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
    duration: '1s',
    timing: 'linear',
    iteration: 'infinite',
  },

  fadeIn: {
    keyframes: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    duration: '200ms',
    timing: 'ease-in',
  },

  slideIn: {
    keyframes: {
      from: { transform: 'translateY(-10px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
    duration: '200ms',
    timing: 'ease-out',
  },
} as const;

/**
 * Helper function to get color with opacity
 */
export function withOpacity(color: string, opacity: number): string {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
}

/**
 * Helper function to create CSS custom properties
 */
export function createCssVariables() {
  const cssVars: Record<string, string> = {};

  // Colors
  Object.entries(colors).forEach(([category, shades]) => {
    if (typeof shades === 'object') {
      Object.entries(shades).forEach(([shade, value]) => {
        cssVars[`--color-${category}-${shade}`] = value;
      });
    }
  });

  // Spacing
  Object.entries(spacing).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value;
  });

  // Typography
  Object.entries(typography.fontSize).forEach(([key, value]) => {
    cssVars[`--font-size-${key}`] = value;
  });

  return cssVars;
}

/**
 * Export design system as a single object
 */
export const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  transitions,
  breakpoints,
  components,
  animations,
} as const;

export default designSystem;
