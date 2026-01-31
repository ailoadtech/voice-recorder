/**
 * Tests for State Debugger
 */

import {
  StateHistoryTracker,
  ActionLogger,
  calculateStateDiff,
  visualizeState,
  StateDebugger,
  stateDebugger,
} from './stateDebugger';
import type { RecordingState, AppState, AppAction } from '@/contexts/AppContext';

describe('StateHistoryTracker', () => {
  let tracker: StateHistoryTracker;

  beforeEach(() => {
    tracker = new StateHistoryTracker(10);
  });

  it('should record state transitions', () => {
    const action: AppAction = { type: 'START_RECORDING' };
    tracker.recordTransition('idle', 'recording', action);

    const history = tracker.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].from).toBe('idle');
    expect(history[0].to).toBe('recording');
    expect(history[0].action).toEqual(action);
  });

  it('should limit history size', () => {
    const action: AppAction = { type: 'START_RECORDING' };
    
    // Record more transitions than max size
    for (let i = 0; i < 15; i++) {
      tracker.recordTransition('idle', 'recording', action);
    }

    const history = tracker.getHistory();
    expect(history).toHaveLength(10);
  });

  it('should get recent transitions', () => {
    const action: AppAction = { type: 'START_RECORDING' };
    
    for (let i = 0; i < 5; i++) {
      tracker.recordTransition('idle', 'recording', action);
    }

    const recent = tracker.getRecentTransitions(3);
    expect(recent).toHaveLength(3);
  });

  it('should filter transitions by state', () => {
    tracker.recordTransition('idle', 'recording', { type: 'START_RECORDING' });
    tracker.recordTransition('recording', 'processing', { 
      type: 'STOP_RECORDING', 
      payload: { audioBlob: new Blob(), duration: 5 } 
    });
    tracker.recordTransition('processing', 'transcribing', { type: 'START_TRANSCRIPTION' });

    const recordingTransitions = tracker.getTransitionsForState('recording');
    expect(recordingTransitions).toHaveLength(2);
  });

  it('should calculate average duration', () => {
    tracker.recordTransition('idle', 'recording', { type: 'START_RECORDING' });
    // Simulate time passing
    tracker.recordTransition('recording', 'processing', { 
      type: 'STOP_RECORDING', 
      payload: { audioBlob: new Blob(), duration: 5 } 
    });

    const avgDuration = tracker.getAverageDuration('idle');
    expect(avgDuration).toBeGreaterThan(0);
  });

  it('should clear history', () => {
    tracker.recordTransition('idle', 'recording', { type: 'START_RECORDING' });
    tracker.clear();

    const history = tracker.getHistory();
    expect(history).toHaveLength(0);
  });

  it('should export history as JSON', () => {
    tracker.recordTransition('idle', 'recording', { type: 'START_RECORDING' });
    
    const json = tracker.exportHistory();
    expect(json).toBeTruthy();
    expect(() => JSON.parse(json)).not.toThrow();
  });
});

describe('ActionLogger', () => {
  let logger: ActionLogger;

  beforeEach(() => {
    logger = new ActionLogger(10);
  });

  it('should log actions', () => {
    const action: AppAction = { type: 'START_RECORDING' };
    logger.log(action, 'idle');

    const logs = logger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toEqual(action);
    expect(logs[0].state).toBe('idle');
  });

  it('should limit log size', () => {
    const action: AppAction = { type: 'START_RECORDING' };
    
    for (let i = 0; i < 15; i++) {
      logger.log(action, 'idle');
    }

    const logs = logger.getLogs();
    expect(logs).toHaveLength(10);
  });

  it('should filter logs by action type', () => {
    logger.log({ type: 'START_RECORDING' }, 'idle');
    logger.log({ type: 'START_RECORDING' }, 'idle');
    logger.log({ type: 'CLEAR_ERROR' }, 'error');

    const startRecordingLogs = logger.getLogsByActionType('START_RECORDING');
    expect(startRecordingLogs).toHaveLength(2);
  });

  it('should clear logs', () => {
    logger.log({ type: 'START_RECORDING' }, 'idle');
    logger.clear();

    const logs = logger.getLogs();
    expect(logs).toHaveLength(0);
  });

  it('should export logs as JSON', () => {
    logger.log({ type: 'START_RECORDING' }, 'idle');
    
    const json = logger.exportLogs();
    expect(json).toBeTruthy();
    expect(() => JSON.parse(json)).not.toThrow();
  });
});

describe('calculateStateDiff', () => {
  it('should detect changed properties', () => {
    const oldState: AppState = {
      recordingState: 'idle',
      currentRecording: {
        audioBlob: null,
        audioDuration: null,
        transcription: null,
        enrichment: null,
      },
      selectedRecordingId: null,
      isHistoryOpen: false,
      error: null,
      settings: {
        autoSave: true,
        defaultEnrichmentType: 'format',
      },
    };

    const newState: AppState = {
      ...oldState,
      recordingState: 'recording',
    };

    const diff = calculateStateDiff(oldState, newState);
    expect(diff.changed).toContain('recordingState');
    expect(diff.details.recordingState.old).toBe('idle');
    expect(diff.details.recordingState.new).toBe('recording');
  });

  it('should detect no changes', () => {
    const state: AppState = {
      recordingState: 'idle',
      currentRecording: {
        audioBlob: null,
        audioDuration: null,
        transcription: null,
        enrichment: null,
      },
      selectedRecordingId: null,
      isHistoryOpen: false,
      error: null,
      settings: {
        autoSave: true,
        defaultEnrichmentType: 'format',
      },
    };

    const diff = calculateStateDiff(state, state);
    expect(diff.changed).toHaveLength(0);
  });
});

describe('visualizeState', () => {
  it('should generate text representation of state', () => {
    const state: AppState = {
      recordingState: 'idle',
      currentRecording: {
        audioBlob: null,
        audioDuration: null,
        transcription: null,
        enrichment: null,
      },
      selectedRecordingId: null,
      isHistoryOpen: false,
      error: null,
      settings: {
        autoSave: true,
        defaultEnrichmentType: 'format',
      },
    };

    const visualization = visualizeState(state);
    expect(visualization).toContain('Recording State: idle');
    expect(visualization).toContain('Audio: None');
    expect(visualization).toContain('Auto Save: true');
  });

  it('should include error information when present', () => {
    const state: AppState = {
      recordingState: 'error',
      currentRecording: {
        audioBlob: null,
        audioDuration: null,
        transcription: null,
        enrichment: null,
      },
      selectedRecordingId: null,
      isHistoryOpen: false,
      error: {
        message: 'Test error',
        code: 'TEST_ERROR',
      },
      settings: {
        autoSave: true,
        defaultEnrichmentType: 'format',
      },
    };

    const visualization = visualizeState(state);
    expect(visualization).toContain('Error:');
    expect(visualization).toContain('Test error');
    expect(visualization).toContain('TEST_ERROR');
  });
});

describe('StateDebugger', () => {
  let debuggerInstance: StateDebugger;

  beforeEach(() => {
    debuggerInstance = new StateDebugger();
    debuggerInstance.setEnabled(true);
  });

  afterEach(() => {
    debuggerInstance.clearAll();
  });

  it('should be enabled in development mode', () => {
    expect(debuggerInstance.isEnabled()).toBe(true);
  });

  it('should record transitions when enabled', () => {
    const action: AppAction = { type: 'START_RECORDING' };
    debuggerInstance.recordTransition('idle', 'recording', action);

    const history = debuggerInstance.getHistoryTracker().getHistory();
    expect(history).toHaveLength(1);
  });

  it('should not record transitions when disabled', () => {
    debuggerInstance.setEnabled(false);
    
    const action: AppAction = { type: 'START_RECORDING' };
    debuggerInstance.recordTransition('idle', 'recording', action);

    const history = debuggerInstance.getHistoryTracker().getHistory();
    expect(history).toHaveLength(0);
  });

  it('should log actions when enabled', () => {
    const action: AppAction = { type: 'START_RECORDING' };
    debuggerInstance.logAction(action, 'idle');

    const logs = debuggerInstance.getActionLogger().getLogs();
    expect(logs).toHaveLength(1);
  });

  it('should clear all data', () => {
    debuggerInstance.recordTransition('idle', 'recording', { type: 'START_RECORDING' });
    debuggerInstance.logAction({ type: 'START_RECORDING' }, 'idle');
    
    debuggerInstance.clearAll();

    expect(debuggerInstance.getHistoryTracker().getHistory()).toHaveLength(0);
    expect(debuggerInstance.getActionLogger().getLogs()).toHaveLength(0);
  });

  it('should export all data', () => {
    debuggerInstance.recordTransition('idle', 'recording', { type: 'START_RECORDING' });
    debuggerInstance.logAction({ type: 'START_RECORDING' }, 'idle');
    
    const exported = debuggerInstance.exportAll();
    expect(exported).toBeTruthy();
    
    const data = JSON.parse(exported);
    expect(data.history).toBeDefined();
    expect(data.logs).toBeDefined();
    expect(data.timestamp).toBeDefined();
  });
});

describe('stateDebugger singleton', () => {
  it('should be available as singleton', () => {
    expect(stateDebugger).toBeDefined();
    expect(stateDebugger.isEnabled).toBeDefined();
  });
});
