'use client';

/**
 * State Debug Panel Component
 * 
 * Development-only component for visualizing application state,
 * state transitions, and action history. Only renders in development mode.
 */

import React, { useState, useEffect } from 'react';
import { useAppState } from '@/contexts/AppContext';
import { 
  stateDebugger, 
  visualizeState,
  type StateTransition 
} from '@/lib/stateDebugger';
import { getValidNextStates, getStateDescription } from '@/lib/recordingStateMachine';

export function StateDebugPanel() {
  const state = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'state' | 'history' | 'actions'>('state');
  const [history, setHistory] = useState<StateTransition[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Refresh history periodically
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setHistory(stateDebugger.getHistoryTracker().getHistory());
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Manual refresh
  const handleRefresh = () => {
    setHistory(stateDebugger.getHistoryTracker().getHistory());
  };

  // Export data
  const handleExport = () => {
    const data = stateDebugger.exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `state-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear data
  const handleClear = () => {
    stateDebugger.clearAll();
    setHistory([]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 z-50"
        title="Open State Debugger"
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[600px] bg-gray-900 text-gray-100 rounded-lg shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h3 className="font-bold text-sm">State Debugger</h3>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
            title="Refresh"
          >
            🔄
          </button>
          <button
            onClick={handleExport}
            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
            title="Export"
          >
            💾
          </button>
          <button
            onClick={handleClear}
            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
            title="Clear"
          >
            🗑️
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('state')}
          className={`flex-1 px-3 py-2 text-xs ${
            activeTab === 'state'
              ? 'bg-gray-800 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          State
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-3 py-2 text-xs ${
            activeTab === 'history'
              ? 'bg-gray-800 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          History ({history.length})
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex-1 px-3 py-2 text-xs ${
            activeTab === 'actions'
              ? 'bg-gray-800 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Actions
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 text-xs">
        {activeTab === 'state' && <StateTab state={state} />}
        {activeTab === 'history' && <HistoryTab history={history} />}
        {activeTab === 'actions' && <ActionsTab />}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-2 border-t border-gray-700 text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="w-3 h-3"
          />
          <span>Auto-refresh</span>
        </label>
        <span className="text-gray-500">
          {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

function StateTab({ state }: { state: any }) {
  const validNextStates = getValidNextStates(state.recordingState);
  
  return (
    <div className="space-y-3">
      <div>
        <div className="font-semibold text-purple-400 mb-1">Current State</div>
        <div className="bg-gray-800 p-2 rounded">
          <div className="font-mono text-green-400">{state.recordingState}</div>
          <div className="text-gray-400 text-xs mt-1">
            {getStateDescription(state.recordingState)}
          </div>
        </div>
      </div>

      <div>
        <div className="font-semibold text-purple-400 mb-1">Valid Transitions</div>
        <div className="flex flex-wrap gap-1">
          {validNextStates.map((s) => (
            <span
              key={s}
              className="bg-gray-800 px-2 py-1 rounded text-xs font-mono"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="font-semibold text-purple-400 mb-1">Recording Data</div>
        <div className="bg-gray-800 p-2 rounded space-y-1">
          <div>Audio: {state.currentRecording.audioBlob ? '✓' : '✗'}</div>
          <div>Duration: {state.currentRecording.audioDuration ?? 'N/A'}s</div>
          <div>Transcription: {state.currentRecording.transcription ? '✓' : '✗'}</div>
          <div>Enrichment: {state.currentRecording.enrichment ? '✓' : '✗'}</div>
        </div>
      </div>

      {state.error && (
        <div>
          <div className="font-semibold text-red-400 mb-1">Error</div>
          <div className="bg-red-900/30 p-2 rounded">
            <div className="text-red-300">{state.error.message}</div>
            {state.error.code && (
              <div className="text-red-400 text-xs mt-1">Code: {state.error.code}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryTab({ history }: { history: StateTransition[] }) {
  if (history.length === 0) {
    return <div className="text-gray-500 text-center py-8">No transitions yet</div>;
  }

  return (
    <div className="space-y-2">
      {history.slice().reverse().map((transition, idx) => (
        <div key={idx} className="bg-gray-800 p-2 rounded">
          <div className="flex items-center justify-between mb-1">
            <div className="font-mono text-xs">
              <span className="text-gray-400">{transition.from}</span>
              <span className="text-purple-400 mx-1">→</span>
              <span className="text-green-400">{transition.to}</span>
            </div>
            <div className="text-gray-500 text-xs">
              {transition.duration ? `${transition.duration}ms` : ''}
            </div>
          </div>
          <div className="text-gray-400 text-xs">
            Action: {transition.action.type}
          </div>
          <div className="text-gray-500 text-xs">
            {new Date(transition.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActionsTab() {
  const [actions, setActions] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActions(stateDebugger.getActionLogger().getLogs());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (actions.length === 0) {
    return <div className="text-gray-500 text-center py-8">No actions yet</div>;
  }

  return (
    <div className="space-y-2">
      {actions.slice().reverse().map((log, idx) => (
        <div key={idx} className="bg-gray-800 p-2 rounded">
          <div className="font-mono text-xs text-purple-400 mb-1">
            {log.action.type}
          </div>
          <div className="text-gray-400 text-xs">
            State: {log.state}
          </div>
          <div className="text-gray-500 text-xs">
            {new Date(log.timestamp).toLocaleTimeString()}
          </div>
          {'payload' in log.action && (
            <details className="mt-1">
              <summary className="text-gray-400 text-xs cursor-pointer">
                Payload
              </summary>
              <pre className="text-xs mt-1 text-gray-300 overflow-x-auto">
                {JSON.stringify(log.action.payload, null, 2)}
              </pre>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}
