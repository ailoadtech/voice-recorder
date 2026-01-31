# Developer Guide

## Table of Contents

1. [Development Workflow](#development-workflow)
2. [Project Structure](#project-structure)
3. [Coding Standards](#coding-standards)
4. [Testing Guidelines](#testing-guidelines)
5. [Git Workflow](#git-workflow)
6. [Build Process](#build-process)
7. [Deployment](#deployment)
8. [Contributing](#contributing)

## Development Workflow

### Setting Up Development Environment

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd voice-recorder
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access Application**
   - Open http://localhost:3000
   - Hot reload is enabled for instant feedback

### WSL-Specific Setup

If developing in WSL:

```bash
# Run automated setup
chmod +x scripts/wsl-setup.sh
./scripts/wsl-setup.sh

# Configure file watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

See [WSL Development Guide](WSL_DEVELOPMENT.md) for detailed WSL setup.

### Development Tools

**Required:**
- Node.js 18+
- npm or yarn
- Git
- Code editor (VS Code recommended)

**Recommended VS Code Extensions:**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features
- Jest Runner

## Project Structure

```
voice-recorder/
├── .kiro/                      # Kiro AI assistant configuration
│   ├── specs/                  # Project specifications
│   └── steering/               # AI guidance documents
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md         # System architecture
│   ├── API_INTEGRATION.md      # API integration guide
│   ├── USER_GUIDE.md           # End-user documentation
│   └── DEVELOPER_GUIDE.md      # This file
├── public/                     # Static assets
├── scripts/                    # Build and utility scripts
│   ├── validate-api-keys.ts    # API key validation
│   ├── validate-env.ts         # Environment validation
│   └── wsl-setup.sh            # WSL setup automation
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   ├── history/            # History pages
│   │   ├── record/             # Recording page
│   │   ├── settings/           # Settings page
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── AudioPlayer.tsx
│   │   ├── RecordingButton.tsx
│   │   ├── TranscriptionDisplay.tsx
│   │   ├── EnrichmentPanel.tsx
│   │   ├── HistoryList.tsx
│   │   ├── Navigation.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── index.ts            # Component exports
│   ├── contexts/               # React Context providers
│   │   └── AppContext.tsx      # Global app state
│   ├── hooks/                  # Custom React hooks
│   │   ├── useRecording.ts
│   │   ├── useHistory.ts
│   │   └── useSettings.ts
│   ├── lib/                    # Utilities and helpers
│   │   ├── env.ts              # Environment config
│   │   ├── validation.ts       # Input validation
│   │   ├── recordingStateMachine.ts
│   │   └── stateDebugger.ts
│   ├── services/               # External service integrations
│   │   ├── audio/              # Audio recording
│   │   │   ├── AudioRecordingService.ts
│   │   │   ├── types.ts
│   │   │   └── README.md
│   │   ├── transcription/      # Speech-to-text
│   │   │   ├── TranscriptionService.ts
│   │   │   ├── types.ts
│   │   │   └── README.md
│   │   ├── llm/                # AI enrichment
│   │   │   ├── LLMService.ts
│   │   │   ├── prompts.ts
│   │   │   ├── presets.ts
│   │   │   ├── types.ts
│   │   │   └── README.md
│   │   └── storage/            # Data persistence
│   │       ├── StorageService.ts
│   │       ├── migrations.ts
│   │       ├── types.ts
│   │       └── README.md
│   └── styles/                 # Styling
│       ├── design-system.ts    # Design tokens
│       ├── design-tokens.css   # CSS variables
│       └── DESIGN_SYSTEM.md    # Design documentation
├── .env.example                # Environment template
├── .env.local                  # Local environment (gitignored)
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── jest.config.js
├── jest.setup.js
├── next.config.ts
├── package.json
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

### Key Directories Explained

**`src/app/`** - Next.js App Router
- Pages and routing using file-based routing
- Server and client components
- API routes for backend functionality

**`src/components/`** - Reusable UI Components
- Presentational components
- Each component has its own test file
- Exported through index.ts barrel file

**`src/services/`** - Business Logic Layer
- Encapsulates external API integrations
- Each service is self-contained
- Includes types, tests, and documentation

**`src/lib/`** - Shared Utilities
- Pure functions and helpers
- State machine logic
- Validation utilities

**`src/hooks/`** - Custom React Hooks
- Reusable stateful logic
- Follows React hooks conventions
- Well-tested and documented

## Coding Standards

### TypeScript

**Use Strict Types:**
```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// Bad
function getUser(id: any): any {
  // ...
}
```

**Avoid `any` Type:**
```typescript
// Good
type UnknownError = Error | string | unknown;

// Bad
let error: any;
```

**Use Type Guards:**
```typescript
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

if (isError(error)) {
  console.error(error.message);
}
```

### React Components

**Use Functional Components:**
```typescript
// Good
export function MyComponent({ prop }: Props) {
  return <div>{prop}</div>;
}

// Avoid class components
```

**Props Interface:**
```typescript
interface MyComponentProps {
  title: string;
  onClose?: () => void;
  children?: React.ReactNode;
}

export function MyComponent({ title, onClose, children }: MyComponentProps) {
  // ...
}
```

**Use Hooks Properly:**
```typescript
// Good - hooks at top level
function MyComponent() {
  const [state, setState] = useState(0);
  const value = useMemo(() => expensiveCalc(state), [state]);
  
  return <div>{value}</div>;
}

// Bad - conditional hooks
function MyComponent({ condition }) {
  if (condition) {
    const [state, setState] = useState(0); // ❌ Never do this
  }
}
```

### File Naming

- **Components:** PascalCase - `RecordingButton.tsx`
- **Hooks:** camelCase with 'use' prefix - `useRecording.ts`
- **Utilities:** camelCase - `validation.ts`
- **Types:** PascalCase - `types.ts`
- **Tests:** Same as source + `.test` - `RecordingButton.test.tsx`

### Code Organization

**Import Order:**
```typescript
// 1. External dependencies
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Internal absolute imports
import { Button } from '@/components';
import { useRecording } from '@/hooks';

// 3. Relative imports
import { helper } from './utils';

// 4. Types
import type { Recording } from './types';

// 5. Styles
import './styles.css';
```

**Export Pattern:**
```typescript
// Named exports (preferred)
export function MyComponent() { }
export const MY_CONSTANT = 'value';

// Default export (for pages only)
export default function Page() { }
```

### Comments and Documentation

**JSDoc for Public APIs:**
```typescript
/**
 * Transcribe audio blob to text using OpenAI Whisper API
 * 
 * @param audioBlob - The audio file to transcribe
 * @param options - Optional transcription settings
 * @returns Promise resolving to transcription result
 * @throws {TranscriptionError} If transcription fails
 * 
 * @example
 * ```typescript
 * const result = await service.transcribe(blob, {
 *   language: 'en'
 * });
 * console.log(result.text);
 * ```
 */
async transcribe(
  audioBlob: Blob,
  options?: TranscriptionOptions
): Promise<TranscriptionResult> {
  // Implementation
}
```

**Inline Comments:**
```typescript
// Good - explain WHY, not WHAT
// Retry with exponential backoff to handle rate limits
const delay = 1000 * Math.pow(2, attempt - 1);

// Bad - obvious comment
// Set delay to 1000 times 2 to the power of attempt minus 1
const delay = 1000 * Math.pow(2, attempt - 1);
```

### Error Handling

**Custom Error Types:**
```typescript
export class TranscriptionError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'TranscriptionError';
  }
}
```

**Error Handling Pattern:**
```typescript
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  if (error instanceof TranscriptionError) {
    // Handle known error
    if (error.retryable) {
      return retry();
    }
  }
  
  // Log unexpected errors
  console.error('Unexpected error:', error);
  throw error;
}
```

## Testing Guidelines

### Unit Tests

**Test File Location:**
- Place test files next to source files
- Use `.test.ts` or `.test.tsx` extension

**Test Structure:**
```typescript
import { render, screen } from '@testing-library/react';
import { RecordingButton } from './RecordingButton';

describe('RecordingButton', () => {
  it('renders idle state by default', () => {
    render(<RecordingButton />);
    expect(screen.getByText('Press to Record')).toBeInTheDocument();
  });

  it('starts recording on click', async () => {
    const onStart = jest.fn();
    render(<RecordingButton onStart={onStart} />);
    
    const button = screen.getByRole('button');
    await userEvent.click(button);
    
    expect(onStart).toHaveBeenCalled();
  });
});
```

**What to Test:**
- Component rendering
- User interactions
- State changes
- Error handling
- Edge cases

**What NOT to Test:**
- Implementation details
- Third-party libraries
- Trivial code

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- RecordingButton.test.tsx

# Run with coverage
npm test -- --coverage
```

### Test Coverage Goals

- **Minimum:** 70% overall coverage
- **Target:** 80%+ for critical paths
- **Services:** 90%+ coverage
- **Components:** 80%+ coverage
- **Utilities:** 95%+ coverage

## Git Workflow

### Branch Strategy

**Main Branches:**
- `main` - Production-ready code
- `develop` - Integration branch

**Feature Branches:**
- `feature/recording-ui` - New features
- `fix/audio-bug` - Bug fixes
- `docs/api-guide` - Documentation
- `refactor/state-management` - Code improvements

### Commit Messages

Follow conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(recording): add audio level visualization

Implement real-time audio level monitoring using Web Audio API.
Displays visual feedback during recording.

Closes #123
```

```
fix(transcription): handle network timeout errors

Add retry logic with exponential backoff for network failures.
Improves reliability when API is slow to respond.
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make Changes**
   - Write code
   - Add tests
   - Update documentation

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

4. **Push to Remote**
   ```bash
   git push origin feature/my-feature
   ```

5. **Create Pull Request**
   - Describe changes
   - Link related issues
   - Request review

6. **Address Review Comments**
   - Make requested changes
   - Push updates

7. **Merge**
   - Squash and merge (preferred)
   - Delete feature branch

## Build Process

### Development Build

```bash
npm run dev
```

- Fast refresh enabled
- Source maps included
- No optimization
- Detailed error messages

### Production Build

```bash
npm run build
```

- Code minification
- Tree shaking
- Image optimization
- Static page generation

**Build Output:**
```
.next/
├── static/           # Static assets
├── server/           # Server-side code
└── cache/            # Build cache
```

### Build Optimization

**Code Splitting:**
```typescript
// Dynamic imports for large components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
});
```

**Image Optimization:**
```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  width={500}
  height={300}
  alt="Description"
/>
```

**Bundle Analysis:**
```bash
npm run build
npm run analyze
```

## Deployment

### Environment Configuration

**Development:**
```bash
NODE_ENV=development
OPENAI_API_KEY=sk-dev-key
```

**Production:**
```bash
NODE_ENV=production
OPENAI_API_KEY=sk-prod-key
```

### Desktop Packaging (Tauri)

**Prerequisites:**
- Rust toolchain
- Platform-specific dependencies

**Build Desktop App:**
```bash
npm run tauri build
```

**Output:**
- Windows: `.exe` installer
- macOS: `.dmg` or `.app`
- Linux: `.deb`, `.AppImage`

### Deployment Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables configured
- [ ] API keys valid
- [ ] Build completes successfully
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] Version number bumped

## Contributing

### Getting Started

1. **Fork Repository**
2. **Clone Your Fork**
3. **Create Feature Branch**
4. **Make Changes**
5. **Submit Pull Request**

### Code Review Guidelines

**As Author:**
- Write clear PR description
- Add tests for new features
- Update documentation
- Respond to feedback promptly

**As Reviewer:**
- Be constructive and respectful
- Focus on code quality
- Check for edge cases
- Verify tests are adequate

### Development Best Practices

1. **Write Tests First** (TDD when appropriate)
2. **Keep PRs Small** (< 400 lines preferred)
3. **Document Complex Logic**
4. **Use TypeScript Strictly**
5. **Follow Existing Patterns**
6. **Ask Questions** when unclear

### Getting Help

- Check existing documentation
- Search closed issues
- Ask in team chat
- Create detailed issue

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format with Prettier
npm run type-check       # TypeScript check

# Testing
npm test                 # Run tests
npm test -- --watch      # Watch mode
npm test -- --coverage   # With coverage

# Validation
npm run validate-env     # Check environment
npm run validate:api-keys # Test API keys

# Utilities
npm run clean            # Clean build artifacts
npm run analyze          # Bundle analysis
```

## Conclusion

This developer guide provides the foundation for contributing to the Voice Intelligence Desktop App. Follow these guidelines to maintain code quality and consistency across the project.

For more information:
- [Architecture Documentation](ARCHITECTURE.md)
- [API Integration Guide](API_INTEGRATION.md)
- [User Guide](USER_GUIDE.md)
