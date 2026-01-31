# App Router Structure

This Next.js application uses the App Router pattern for routing and layouts.

## Route Structure

```
src/app/
├── layout.tsx              # Root layout with navigation
├── page.tsx                # Dashboard/Home page (/)
├── loading.tsx             # Global loading state
├── error.tsx               # Global error boundary
├── not-found.tsx           # 404 page
├── record/
│   └── page.tsx            # Recording interface (/record)
├── history/
│   ├── page.tsx            # Recording history list (/history)
│   └── [id]/
│       └── page.tsx        # Individual recording detail (/history/:id)
└── settings/
    └── page.tsx            # Settings page (/settings)
```

## Pages

### Dashboard (`/`)
- Quick access cards for main features (Record, History, Settings)
- Recent activity overview
- Quick stats (total recordings, duration, weekly count)
- Responsive grid layout

### Record (`/record`)
- Main recording interface with microphone permission handling
- Large recording button with visual feedback
- Real-time transcription display
- AI enrichment panel with type selector (Format, Summarize, Expand, Custom)
- Action buttons (Copy, Export, View History)

### History (`/history`)
- Searchable list of all recordings
- Filter options (All, This Week, This Month, Custom Range)
- Sort functionality (Date, Duration, Name)
- Empty state with call-to-action
- Bulk actions (Export Selected, Delete Selected)

### Recording Detail (`/history/[id]`)
- Individual recording view with back navigation
- Audio playback controls
- Full transcription text
- AI-enriched output display
- Action buttons (Copy Transcription, Copy Enriched, Export, Delete)

### Settings (`/settings`)
- **Hotkey Configuration**: Customize recording shortcuts
- **API Configuration**: OpenAI API key, Whisper/GPT model selection
- **Audio Settings**: Microphone selection, format, sample rate
- **Enrichment Presets**: Manage LLM templates
- **Application Settings**: Launch on startup, minimize to tray, auto-save

## API Routes

**Note**: API routes are not supported in static export mode (`output: 'export'`), which is required for Tauri desktop integration. All data fetching and API calls should be handled client-side using:
- Tauri commands (Rust backend)
- Direct API calls from the browser (e.g., OpenAI API)
- Client-side state management

For development/debugging purposes, you can temporarily remove `output: 'export'` from `next.config.ts` to enable API routes.

## Special Files

### `layout.tsx`
- Root layout wrapping all pages
- Includes Navigation component
- Sets global metadata (title, description)
- Applies background color

### `error.tsx`
- Client-side error boundary
- Catches and displays runtime errors
- Provides retry functionality
- Logs errors for debugging

### `loading.tsx`
- Loading state during page transitions
- Animated spinner with consistent styling
- Shown automatically by Next.js

### `not-found.tsx`
- Custom 404 page
- Friendly error message
- Link back to home page

## Navigation

The app includes a persistent navigation bar (`src/components/Navigation.tsx`):
- Dashboard (🏠)
- Record (🎤)
- History (📜)
- Settings (⚙️)
- Displays hotkey hint (Ctrl+Shift+R)
- Active route highlighting

## Design Patterns

### Layout Hierarchy
```
RootLayout (navigation + global styles)
  ├── Dashboard
  ├── Record
  ├── History
  │   └── [id] (dynamic route)
  └── Settings
```

### Styling
- Tailwind CSS for utility-first styling
- Consistent spacing and color scheme
- White cards on gray-50 background
- Blue primary color (#2563eb)
- Responsive design with mobile support

### State Management
- Client components marked with `'use client'`
- React hooks for local state
- Context API for global state (to be implemented)
- Service layer integration (audio, transcription, LLM)

## Configuration

The `next.config.ts` is configured for static export mode, required for Tauri desktop integration:

- `output: 'export'` - Generates static HTML/CSS/JS files
- `images.unoptimized: true` - Disables Next.js image optimization
- **Limitations**:
  - No API routes (use Tauri commands or client-side API calls instead)
  - No server-side rendering (SSR)
  - No incremental static regeneration (ISR)
  - All pages are pre-rendered at build time

**For Desktop App**: All backend functionality should be implemented using:
1. **Tauri Commands**: Rust functions callable from JavaScript
2. **Client-side API Calls**: Direct calls to external APIs (OpenAI, etc.)
3. **Local Storage**: IndexedDB, localStorage for data persistence

## Development Workflow

1. **Start development server**: `npm run dev`
2. **Access pages**:
   - Dashboard: http://localhost:3000
   - Record: http://localhost:3000/record
   - History: http://localhost:3000/history
   - Settings: http://localhost:3000/settings
3. **Test API**: http://localhost:3000/api/health

## Next Steps

### Phase 2: Component Implementation
- [ ] Create RecordingButton component with states
- [ ] Add TranscriptionDisplay component
- [ ] Build EnrichmentPanel with type selector
- [ ] Implement HistoryList with search/filter

### Phase 3: Service Integration
- [ ] Connect AudioRecordingService
- [ ] Integrate TranscriptionService (Whisper API)
- [ ] Connect LLMService (GPT API)
- [ ] Implement StorageService

### Phase 4: State Management
- [ ] Create AppContext for global state
- [ ] Implement recording state machine
- [ ] Add settings persistence
- [ ] Connect history data

### Phase 5: Tauri Integration
- [ ] Register global hotkeys
- [ ] Add system tray functionality
- [ ] Implement native notifications
- [ ] Configure desktop window settings

## File Naming Conventions

- `page.tsx` - Route pages
- `layout.tsx` - Layout wrappers
- `loading.tsx` - Loading states
- `error.tsx` - Error boundaries
- `not-found.tsx` - 404 pages
- `route.ts` - API routes
- `[param]` - Dynamic route segments

## Best Practices

1. **Client Components**: Use `'use client'` directive for interactive components
2. **Server Components**: Default for static content (when not using export mode)
3. **Loading States**: Provide feedback during async operations
4. **Error Handling**: Graceful error messages with recovery options
5. **Accessibility**: ARIA labels, keyboard navigation, focus management
6. **Performance**: Code splitting, lazy loading, optimized images

