'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { TranscriptionResult } from '@/services/transcription/types';
import type { EnrichmentResult } from '@/services/llm/types';
import { 
  getStateDescription, 
  validateTransition,
  validateStateData,
  StateTransitionError,
  StateDataValidationError,
  type RecordingData,
} from '@/lib/recordingStateMachine';
import { stateDebugger } from '@/lib/stateDebugger';
import { tauriService } from '@/services/tauri';
import { getModelManager } from '@/services/whisper/ModelManager';

/**
 * Recording workflow states
 */
export type RecordingState = 
  | 'idle'
  | 'recording'
  | 'processing'
  | 'transcribing'
  | 'transcribed'
  | 'enriching'
  | 'complete'
  | 'error';

/**
 * Application state structure
 */
export interface AppState {
  // Recording workflow
  recordingState: RecordingState;
  currentRecording: {
    audioBlob: Blob | null;
    audioDuration: number | null;
    transcription: TranscriptionResult | null;
    enrichment: EnrichmentResult | null;
  };
  
  // UI state
  selectedRecordingId: string | null;
  isHistoryOpen: boolean;
  
  // Theme state
  theme: 'light' | 'dark' | 'system';
  
  // Error state
  error: {
    message: string;
    code?: string;
  } | null;
  
  // Settings
  settings: {
    autoSave: boolean;
    defaultEnrichmentType: string;
    exportSettings: {
      defaultFormat: 'txt' | 'md' | 'json' | 'csv';
      includeMetadata: boolean;
      includeTranscription: boolean;
      includeEnrichment: boolean;
      includeTags: boolean;
      includeNotes: boolean;
    };
  };
}

/**
 * Action types
 */
export type AppAction =
  // Recording actions
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING'; payload: { audioBlob: Blob; duration: number } }
  | { type: 'START_TRANSCRIPTION' }
  | { type: 'TRANSCRIPTION_COMPLETE'; payload: TranscriptionResult }
  | { type: 'START_ENRICHMENT' }
  | { type: 'ENRICHMENT_COMPLETE'; payload: EnrichmentResult }
  | { type: 'RECORDING_COMPLETE' }
  | { type: 'RESET_RECORDING' }
  
  // UI actions
  | { type: 'SELECT_RECORDING'; payload: string | null }
  | { type: 'TOGGLE_HISTORY' }
  | { type: 'SET_HISTORY_OPEN'; payload: boolean }
  
  // Theme actions
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  
  // Error actions
  | { type: 'SET_ERROR'; payload: { message: string; code?: string } }
  | { type: 'CLEAR_ERROR' }
  
  // Settings actions
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppState['settings']> };

/**
 * Initial state
 */
const initialState: AppState = {
  recordingState: 'idle',
  currentRecording: {
    audioBlob: null,
    audioDuration: null,
    transcription: null,
    enrichment: null,
  },
  selectedRecordingId: null,
  isHistoryOpen: false,
  theme: 'system',
  error: null,
  settings: {
    autoSave: true,
    defaultEnrichmentType: 'format',
    exportSettings: {
      defaultFormat: 'txt',
      includeMetadata: true,
      includeTranscription: true,
      includeEnrichment: true,
      includeTags: true,
      includeNotes: true,
    },
  },
};

/**
 * State reducer with validation
 */
function appReducer(state: AppState, action: AppAction): AppState {
  let nextState: RecordingState | null = null;
  
  // Log action for debugging
  stateDebugger.logAction(action, state.recordingState);

  try {
    switch (action.type) {
      case 'START_RECORDING':
        nextState = 'recording';
        validateTransition(state.recordingState, nextState);
        stateDebugger.recordTransition(state.recordingState, nextState, action);
        return {
          ...state,
          recordingState: nextState,
          error: null,
        };

      case 'STOP_RECORDING': {
        nextState = 'processing';
        const newRecording = {
          ...state.currentRecording,
          audioBlob: action.payload.audioBlob,
          audioDuration: action.payload.duration,
        };
        
        validateTransition(state.recordingState, nextState);
        validateStateData(nextState, newRecording as RecordingData);
        stateDebugger.recordTransition(state.recordingState, nextState, action);
        
        return {
          ...state,
          recordingState: nextState,
          currentRecording: newRecording,
        };
      }

      case 'START_TRANSCRIPTION':
        nextState = 'transcribing';
        validateTransition(state.recordingState, nextState);
        validateStateData(nextState, state.currentRecording as RecordingData);
        stateDebugger.recordTransition(state.recordingState, nextState, action);
        return {
          ...state,
          recordingState: nextState,
        };

      case 'TRANSCRIPTION_COMPLETE': {
        nextState = 'transcribed';
        const newRecording = {
          ...state.currentRecording,
          transcription: action.payload,
        };
        
        validateTransition(state.recordingState, nextState);
        validateStateData(nextState, newRecording as RecordingData);
        stateDebugger.recordTransition(state.recordingState, nextState, action);
        
        return {
          ...state,
          recordingState: nextState,
          currentRecording: newRecording,
        };
      }

      case 'START_ENRICHMENT':
        nextState = 'enriching';
        validateTransition(state.recordingState, nextState);
        validateStateData(nextState, state.currentRecording as RecordingData);
        stateDebugger.recordTransition(state.recordingState, nextState, action);
        return {
          ...state,
          recordingState: nextState,
        };

      case 'ENRICHMENT_COMPLETE': {
        nextState = 'complete';
        const newRecording = {
          ...state.currentRecording,
          enrichment: action.payload,
        };
        
        validateTransition(state.recordingState, nextState);
        validateStateData(nextState, newRecording as RecordingData);
        stateDebugger.recordTransition(state.recordingState, nextState, action);
        
        return {
          ...state,
          recordingState: nextState,
          currentRecording: newRecording,
        };
      }

      case 'RECORDING_COMPLETE':
        nextState = 'complete';
        validateTransition(state.recordingState, nextState);
        validateStateData(nextState, state.currentRecording as RecordingData);
        stateDebugger.recordTransition(state.recordingState, nextState, action);
        return {
          ...state,
          recordingState: nextState,
        };

      case 'RESET_RECORDING':
        nextState = 'idle';
        validateTransition(state.recordingState, nextState);
        stateDebugger.recordTransition(state.recordingState, nextState, action);
        return {
          ...state,
          recordingState: nextState,
          currentRecording: {
            audioBlob: null,
            audioDuration: null,
            transcription: null,
            enrichment: null,
          },
          error: null,
        };

      case 'SELECT_RECORDING':
        return {
          ...state,
          selectedRecordingId: action.payload,
        };

      case 'TOGGLE_HISTORY':
        return {
          ...state,
          isHistoryOpen: !state.isHistoryOpen,
        };

      case 'SET_HISTORY_OPEN':
        return {
          ...state,
          isHistoryOpen: action.payload,
        };

      case 'SET_THEME':
        return {
          ...state,
          theme: action.payload,
        };

      case 'SET_ERROR':
        nextState = 'error';
        // Error can happen from any state, so we validate but expect it to pass
        validateTransition(state.recordingState, nextState);
        stateDebugger.recordTransition(state.recordingState, nextState, action);
        return {
          ...state,
          recordingState: nextState,
          error: action.payload,
        };

      case 'CLEAR_ERROR':
        return {
          ...state,
          error: null,
        };

      case 'UPDATE_SETTINGS':
        return {
          ...state,
          settings: {
            ...state.settings,
            ...action.payload,
          },
        };

      default:
        return state;
    }
  } catch (error) {
    // Handle state transition errors
    if (error instanceof StateTransitionError) {
      console.error(
        `State transition error: ${error.message}`,
        `\nAction: ${action.type}`,
        `\nCurrent state: ${state.recordingState}`
      );
      
      // Return state with error set
      return {
        ...state,
        recordingState: 'error',
        error: {
          message: `Invalid state transition: ${error.message}`,
          code: 'STATE_TRANSITION_ERROR',
        },
      };
    }
    
    // Handle state data validation errors
    if (error instanceof StateDataValidationError) {
      console.error(
        `State data validation error: ${error.message}`,
        `\nAction: ${action.type}`,
        `\nCurrent state: ${state.recordingState}`,
        `\nMissing data: ${error.missingData.join(', ')}`
      );
      
      // Return state with error set
      return {
        ...state,
        recordingState: 'error',
        error: {
          message: `Invalid state data: ${error.message}`,
          code: 'STATE_DATA_VALIDATION_ERROR',
        },
      };
    }
    
    // Re-throw unexpected errors
    throw error;
  }
}

/**
 * Context type
 */
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

/**
 * Create context
 */
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Context provider props
 */
interface AppProviderProps {
  children: ReactNode;
  initialState?: Partial<AppState>;
}

/**
 * Context provider component
 */
export function AppProvider({ children, initialState: customInitialState }: AppProviderProps) {
  const [state, dispatch] = useReducer(
    appReducer,
    customInitialState ? { ...initialState, ...customInitialState } : initialState
  );

  // Initialize Tauri service and listen for global shortcuts
  useEffect(() => {
    const isDesktop = tauriService.isRunningInDesktop();
    
    if (isDesktop) {
      // Initialize Tauri
      tauriService.initialize().catch(console.error);
      
      // Validate all downloaded models on startup
      // Requirement 1.6: Check all downloaded models on app start
      const modelManager = getModelManager();
      modelManager.validateAllModelsOnStartup()
        .then((results) => {
          const corruptedModels = results.filter(r => r.exists && !r.valid && r.removed);
          if (corruptedModels.length > 0) {
            console.warn(
              `Removed ${corruptedModels.length} corrupted model(s) on startup:`,
              corruptedModels.map(r => r.variant).join(', ')
            );
          }
          
          const validModels = results.filter(r => r.exists && r.valid);
          if (validModels.length > 0) {
            console.log(
              `Validated ${validModels.length} model(s) on startup:`,
              validModels.map(r => r.variant).join(', ')
            );
          }
        })
        .catch((error) => {
          console.error('Error validating models on startup:', error);
        });
      
      // Listen for global shortcut events
      const unsubscribe = tauriService.onGlobalShortcut(() => {
        // Toggle recording when global shortcut is pressed
        if (state.recordingState === 'idle') {
          dispatch({ type: 'START_RECORDING' });
        } else if (state.recordingState === 'recording') {
          // This will be handled by the recording component
          // Just emit an event that components can listen to
          window.dispatchEvent(new CustomEvent('stop-recording-requested'));
        }
      });
      
      return () => {
        unsubscribe();
        tauriService.cleanup();
      };
    }
  }, [state.recordingState]);

  // Load settings and theme from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }

    const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(state.settings));
  }, [state.settings]);

  // Save theme to localStorage and apply theme class
  useEffect(() => {
    localStorage.setItem('app-theme', state.theme);

    const root = document.documentElement;
    const applyTheme = (theme: 'light' | 'dark') => {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    };

    if (state.theme === 'system') {
      // Remove explicit theme classes to let system preference take over
      root.classList.remove('light', 'dark');
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      
      // Apply initial system theme
      applyTheme(mediaQuery.matches ? 'dark' : 'light');
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(state.theme);
    }
  }, [state.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook to use app context
 */
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

/**
 * Hook to use app state
 */
export function useAppState() {
  const { state } = useAppContext();
  return state;
}

/**
 * Hook to use app dispatch
 */
export function useAppDispatch() {
  const { dispatch } = useAppContext();
  return dispatch;
}

/**
 * Hook to get current recording state description
 */
export function useRecordingStateDescription() {
  const { recordingState } = useAppState();
  return getStateDescription(recordingState);
}
