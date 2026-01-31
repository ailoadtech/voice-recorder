/**
 * State Debugging Tools
 * 
 * Provides utilities for debugging state transitions and actions
 * in development mode. These tools help track state history,
 * visualize transitions, and identify issues.
 */

import type { RecordingState } from '@/contexts/AppContext';
import type { AppState, AppAction } from '@/contexts/AppContext';
import { getValidNextStates, getStateDescription } from './recordingStateMachine';

/**
 * State transition history entry
 */
export interface StateTransition {
  timestamp: number;
  from: RecordingState;
  to: RecordingState;
  action: AppAction;
  duration?: number;
}

/**
 * State history tracker
 */
export class StateHistoryTracker {
  private history: StateTransition[] = [];
  private maxHistorySize: number;
  private currentState: RecordingState = 'idle';
  private stateStartTime: number = Date.now();

  constructor(maxHistorySize: number = 100) {
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Record a state transition
   */
  recordTransition(from: RecordingState, to: RecordingState, action: AppAction): void {
    const now = Date.now();
    const duration = now - this.stateStartTime;

    this.history.push({
      timestamp: now,
      from,
      to,
      action,
      duration,
    });

    // Trim history if it exceeds max size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    this.currentState = to;
    this.stateStartTime = now;
  }

  /**
   * Get full history
   */
  getHistory(): StateTransition[] {
    return [...this.history];
  }

  /**
   * Get recent transitions
   */
  getRecentTransitions(count: number = 10): StateTransition[] {
    return this.history.slice(-count);
  }

  /**
   * Get transitions for a specific state
   */
  getTransitionsForState(state: RecordingState): StateTransition[] {
    return this.history.filter(t => t.from === state || t.to === state);
  }

  /**
   * Get average duration for a state
   */
  getAverageDuration(state: RecordingState): number {
    const transitions = this.history.filter(t => t.from === state && t.duration);
    if (transitions.length === 0) return 0;
    
    const total = transitions.reduce((sum, t) => sum + (t.duration || 0), 0);
    return total / transitions.length;
  }

  /**
   * Clear history
   */
  clear(): void {
    this.history = [];
    this.stateStartTime = Date.now();
  }

  /**
   * Export history as JSON
   */
  exportHistory(): string {
    return JSON.stringify(this.history, null, 2);
  }
}

/**
 * Action logger
 */
export class ActionLogger {
  private logs: Array<{
    timestamp: number;
    action: AppAction;
    state: RecordingState;
  }> = [];
  private maxLogSize: number;

  constructor(maxLogSize: number = 200) {
    this.maxLogSize = maxLogSize;
  }

  /**
   * Log an action
   */
  log(action: AppAction, state: RecordingState): void {
    this.logs.push({
      timestamp: Date.now(),
      action,
      state,
    });

    // Trim logs if exceeds max size
    if (this.logs.length > this.maxLogSize) {
      this.logs.shift();
    }
  }

  /**
   * Get all logs
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Get logs for specific action type
   */
  getLogsByActionType(actionType: string) {
    return this.logs.filter(log => log.action.type === actionType);
  }

  /**
   * Clear logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

/**
 * State diff calculator
 */
export interface StateDiff {
  changed: string[];
  added: string[];
  removed: string[];
  details: Record<string, { old: any; new: any }>;
}

export function calculateStateDiff(
  oldState: AppState,
  newState: AppState
): StateDiff {
  const diff: StateDiff = {
    changed: [],
    added: [],
    removed: [],
    details: {},
  };

  // Compare top-level properties
  const allKeys = new Set([
    ...Object.keys(oldState),
    ...Object.keys(newState),
  ]);

  for (const key of allKeys) {
    const oldValue = (oldState as any)[key];
    const newValue = (newState as any)[key];

    if (!(key in oldState)) {
      diff.added.push(key);
      diff.details[key] = { old: undefined, new: newValue };
    } else if (!(key in newState)) {
      diff.removed.push(key);
      diff.details[key] = { old: oldValue, new: undefined };
    } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      diff.changed.push(key);
      diff.details[key] = { old: oldValue, new: newValue };
    }
  }

  return diff;
}

/**
 * State visualizer - generates a text representation of state
 */
export function visualizeState(state: AppState): string {
  const lines: string[] = [];
  
  lines.push('=== Application State ===');
  lines.push('');
  lines.push(`Recording State: ${state.recordingState}`);
  lines.push(`Description: ${getStateDescription(state.recordingState)}`);
  lines.push(`Valid Next States: ${getValidNextStates(state.recordingState).join(', ')}`);
  lines.push('');
  
  lines.push('Current Recording:');
  lines.push(`  Audio: ${state.currentRecording.audioBlob ? 'Present' : 'None'}`);
  lines.push(`  Duration: ${state.currentRecording.audioDuration ?? 'N/A'}s`);
  lines.push(`  Transcription: ${state.currentRecording.transcription ? 'Present' : 'None'}`);
  lines.push(`  Enrichment: ${state.currentRecording.enrichment ? 'Present' : 'None'}`);
  lines.push('');
  
  lines.push('UI State:');
  lines.push(`  Selected Recording: ${state.selectedRecordingId ?? 'None'}`);
  lines.push(`  History Open: ${state.isHistoryOpen}`);
  lines.push('');
  
  if (state.error) {
    lines.push('Error:');
    lines.push(`  Message: ${state.error.message}`);
    lines.push(`  Code: ${state.error.code ?? 'N/A'}`);
    lines.push('');
  }
  
  lines.push('Settings:');
  lines.push(`  Auto Save: ${state.settings.autoSave}`);
  lines.push(`  Default Enrichment: ${state.settings.defaultEnrichmentType}`);
  
  return lines.join('\n');
}

/**
 * Global debugger instance (singleton)
 */
class StateDebugger {
  private historyTracker: StateHistoryTracker;
  private actionLogger: ActionLogger;
  private enabled: boolean;

  constructor() {
    this.historyTracker = new StateHistoryTracker();
    this.actionLogger = new ActionLogger();
    this.enabled = process.env.NODE_ENV === 'development';
  }

  /**
   * Enable or disable debugging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if debugging is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Record a state transition
   */
  recordTransition(from: RecordingState, to: RecordingState, action: AppAction): void {
    if (!this.enabled) return;
    this.historyTracker.recordTransition(from, to, action);
  }

  /**
   * Log an action
   */
  logAction(action: AppAction, state: RecordingState): void {
    if (!this.enabled) return;
    this.actionLogger.log(action, state);
  }

  /**
   * Get history tracker
   */
  getHistoryTracker(): StateHistoryTracker {
    return this.historyTracker;
  }

  /**
   * Get action logger
   */
  getActionLogger(): ActionLogger {
    return this.actionLogger;
  }

  /**
   * Clear all debugging data
   */
  clearAll(): void {
    this.historyTracker.clear();
    this.actionLogger.clear();
  }

  /**
   * Export all debugging data
   */
  exportAll(): string {
    return JSON.stringify({
      history: this.historyTracker.getHistory(),
      logs: this.actionLogger.getLogs(),
      timestamp: Date.now(),
    }, null, 2);
  }

  /**
   * Print current state to console
   */
  printState(state: AppState): void {
    if (!this.enabled) return;
    console.log(visualizeState(state));
  }

  /**
   * Print state diff to console
   */
  printDiff(oldState: AppState, newState: AppState): void {
    if (!this.enabled) return;
    const diff = calculateStateDiff(oldState, newState);
    console.log('=== State Diff ===');
    console.log('Changed:', diff.changed);
    console.log('Details:', diff.details);
  }
}

// Export singleton instance
export const stateDebugger = new StateDebugger();

// Export for testing
export { StateDebugger };
