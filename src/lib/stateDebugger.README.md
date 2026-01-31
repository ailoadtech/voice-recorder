# State Debugging Tools

This module provides comprehensive debugging utilities for tracking and visualizing application state transitions in development mode.

## Features

### 1. State History Tracking
Track all state transitions with timestamps and durations:

```typescript
import { stateDebugger } from '@/lib/stateDebugger';

// Automatically tracked in AppContext reducer
// View history
const history = stateDebugger.getHistoryTracker().getHistory();
const recent = stateDebugger.getHistoryTracker().getRecentTransitions(10);

// Get average duration for a state
const avgDuration = stateDebugger.getHistoryTracker().getAverageDuration('recording');
```

### 2. Action Logging
Log all dispatched actions with state context:

```typescript
// Automatically logged in AppContext reducer
// View logs
const logs = stateDebugger.getActionLogger().getLogs();
const startRecordingLogs = stateDebugger.getActionLogger().getLogsByActionType('START_RECORDING');
```

### 3. State Visualization
Generate human-readable state representations:

```typescript
import { visualizeState } from '@/lib/stateDebugger';

const stateText = visualizeState(appState);
console.log(stateText);
// Output:
// === Application State ===
// Recording State: idle
// Description: Ready to record
// Valid Next States: recording, error
// ...
```

### 4. State Diff Calculator
Compare states to see what changed:

```typescript
import { calculateStateDiff } from '@/lib/stateDebugger';

const diff = calculateStateDiff(oldState, newState);
console.log('Changed:', diff.changed);
console.log('Details:', diff.details);
```

### 5. Debug Panel Component
Visual debugging panel for development (only renders in dev mode):

```tsx
import { StateDebugPanel } from '@/components/StateDebugPanel';

function App() {
  return (
    <>
      {/* Your app content */}
      <StateDebugPanel />
    </>
  );
}
```

The debug panel provides:
- Current state visualization
- Valid state transitions
- State transition history
- Action log
- Export functionality
- Auto-refresh option

## Usage

### Automatic Integration

The state debugger is automatically integrated into `AppContext`. All state transitions and actions are tracked automatically when in development mode.

### Manual Usage

```typescript
import { stateDebugger } from '@/lib/stateDebugger';

// Enable/disable debugging
stateDebugger.setEnabled(true);

// Check if enabled
if (stateDebugger.isEnabled()) {
  // Print current state
  stateDebugger.printState(appState);
  
  // Print state diff
  stateDebugger.printDiff(oldState, newState);
}

// Export all debugging data
const data = stateDebugger.exportAll();
// Save to file or send to logging service
```

### Clear Debugging Data

```typescript
// Clear all history and logs
stateDebugger.clearAll();

// Or clear individually
stateDebugger.getHistoryTracker().clear();
stateDebugger.getActionLogger().clear();
```

## Classes

### StateHistoryTracker
Tracks state transitions with timestamps and durations.

**Methods:**
- `recordTransition(from, to, action)` - Record a transition
- `getHistory()` - Get full history
- `getRecentTransitions(count)` - Get recent transitions
- `getTransitionsForState(state)` - Filter by state
- `getAverageDuration(state)` - Calculate average duration
- `clear()` - Clear history
- `exportHistory()` - Export as JSON

### ActionLogger
Logs all dispatched actions with state context.

**Methods:**
- `log(action, state)` - Log an action
- `getLogs()` - Get all logs
- `getLogsByActionType(type)` - Filter by action type
- `clear()` - Clear logs
- `exportLogs()` - Export as JSON

### StateDebugger (Singleton)
Main debugger interface that coordinates all debugging features.

**Methods:**
- `setEnabled(enabled)` - Enable/disable debugging
- `isEnabled()` - Check if enabled
- `recordTransition(from, to, action)` - Record transition
- `logAction(action, state)` - Log action
- `getHistoryTracker()` - Get history tracker instance
- `getActionLogger()` - Get action logger instance
- `clearAll()` - Clear all data
- `exportAll()` - Export all data as JSON
- `printState(state)` - Print state to console
- `printDiff(oldState, newState)` - Print diff to console

## Development Only

All debugging features are automatically disabled in production builds. The `StateDebugPanel` component will not render in production.

## Performance

The debugger has minimal performance impact:
- History is limited to 100 entries by default
- Logs are limited to 200 entries by default
- All operations are O(1) or O(n) where n is small
- Disabled completely in production

## Testing

Comprehensive tests are provided in `stateDebugger.test.ts` covering:
- State history tracking
- Action logging
- State diff calculation
- State visualization
- Debugger enable/disable
- Data export

Run tests with:
```bash
npm test src/lib/stateDebugger.test.ts
```
