---
inclusion: manual
---

# Tailwind CSS Configuration

This project uses Tailwind CSS v3 for styling.

## Configuration Files

- `tailwind.config.ts` - Tailwind configuration with content paths
- `postcss.config.mjs` - PostCSS configuration for Tailwind processing
- `src/app/globals.css` - Global styles with Tailwind directives

## Usage

Tailwind utility classes are available throughout the application. Use them directly in className attributes:

```tsx
<div className="flex items-center justify-center p-4 bg-blue-500 text-white rounded-lg">
  Content
</div>
```

## Custom Theme

The theme can be extended in `tailwind.config.ts` under the `theme.extend` section. Currently configured with:
- Custom color variables (background, foreground)

## Best Practices

1. Use Tailwind utility classes for most styling needs
2. Use `@layer` directives in globals.css for custom base styles
3. Extend the theme in tailwind.config.ts for project-specific design tokens
4. Use responsive modifiers (sm:, md:, lg:, xl:) for responsive design
5. Leverage dark mode with `dark:` modifier when needed

## Installation

Dependencies are listed in package.json:
- tailwindcss
- postcss
- autoprefixer

Run `npm install` to install all dependencies.
