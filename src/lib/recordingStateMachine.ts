/**
 * Recording State Machine
 * 
 * Defines the valid states and transitions for the recording workflow.
 * This ensures the application follows a predictable state flow and
 * prevents invalid state transitions.
 */

import type { RecordingState } from '@/contexts/AppContext';

/**
 * Valid state transitions map
 * Each state maps to an array of states it can transition to
 */
export const VALID_TRANSITIONS: Record<RecordingState, RecordingState[]> = {
  idle: ['recording', 'error'],
  recording: ['processing', 'error', 'idle'],
  processing: ['transcribing', 'error', 'idle'],
  transcribing: ['transcribed', 'error', 'idle'],
  transcribed: ['enriching', 'complete', 'error', 'idle'],
  enriching: ['complete', 'error', 'idle'],
  complete: ['idle', 'error'],
  error: ['idle'],
};

/**
 * State descriptions for debugging and UI
 */
export const STATE_DESCRIPTIONS: Record<RecordingState, string> = {
  idle: 'Ready to record',
  recording: 'Recording audio',
  processing: 'Processing audio',
  transcribing: 'Transcribing audio to text',
  transcribed: 'Transcription complete',
  enriching: 'Enriching text with AI',
  complete: 'Recording complete',
  error: 'An error occurred',
};

/**
 * States that indicate the workflow is in progress
 */
export const IN_PROGRESS_STATES: RecordingState[] = [
  'recording',
  'processing',
  'transcribing',
  'enriching',
];

/**
 * States that indicate the workflow is complete or idle
 */
export const TERMINAL_STATES: RecordingState[] = ['idle', 'complete', 'error'];

/**
 * States that allow user interaction
 */
export const INTERACTIVE_STATES: RecordingState[] = [
  'idle',
  'recording',
  'transcribed',
  'complete',
  'error',
];

/**
 * Validates if a state transition is allowed
 * 
 * @param from - Current state
 * @param to - Target state
 * @returns true if transition is valid, false otherwise
 */
export function isValidTransition(
  from: RecordingState,
  to: RecordingState
): boolean {
  const validNextStates = VALID_TRANSITIONS[from];
  return validNextStates.includes(to);
}

/**
 * Gets the next valid states from the current state
 * 
 * @param currentState - Current recording state
 * @returns Array of valid next states
 */
export function getValidNextStates(
  currentState: RecordingState
): RecordingState[] {
  return VALID_TRANSITIONS[currentState];
}

/**
 * Checks if the current state is in progress
 * 
 * @param state - Current recording state
 * @returns true if state indicates work in progress
 */
export function isInProgress(state: RecordingState): boolean {
  return IN_PROGRESS_STATES.includes(state);
}

/**
 * Checks if the current state is terminal (complete or error)
 * 
 * @param state - Current recording state
 * @returns true if state is terminal
 */
export function isTerminal(state: RecordingState): boolean {
  return TERMINAL_STATES.includes(state);
}

/**
 * Checks if user interaction is allowed in the current state
 * 
 * @param state - Current recording state
 * @returns true if user can interact
 */
export function isInteractive(state: RecordingState): boolean {
  return INTERACTIVE_STATES.includes(state);
}

/**
 * Gets a human-readable description of the state
 * 
 * @param state - Current recording state
 * @returns Description string
 */
export function getStateDescription(state: RecordingState): string {
  return STATE_DESCRIPTIONS[state];
}

/**
 * State transition error
 */
export class StateTransitionError extends Error {
  constructor(
    public from: RecordingState,
    public to: RecordingState
  ) {
    super(
      `Invalid state transition from "${from}" to "${to}". ` +
        `Valid transitions from "${from}": ${VALID_TRANSITIONS[from].join(', ')}`
    );
    this.name = 'StateTransitionError';
  }
}

/**
 * Validates and throws if transition is invalid
 * 
 * @param from - Current state
 * @param to - Target state
 * @throws StateTransitionError if transition is invalid
 */
export function validateTransition(
  from: RecordingState,
  to: RecordingState
): void {
  if (!isValidTransition(from, to)) {
    throw new StateTransitionError(from, to);
  }
}

/**
 * State data validation error
 */
export class StateDataValidationError extends Error {
  constructor(
    public state: RecordingState,
    public missingData: string[]
  ) {
    super(
      `State "${state}" requires data that is missing: ${missingData.join(', ')}`
    );
    this.name = 'StateDataValidationError';
  }
}

/**
 * Recording data structure for validation
 */
export interface RecordingData {
  audioBlob: Blob | null;
  audioDuration: number | null;
  transcription: { text: string; [key: string]: any } | null;
  enrichment: { enrichedText: string; [key: string]: any } | null;
}

/**
 * Validates that required data exists for a given state
 * 
 * @param state - Current recording state
 * @param data - Recording data to validate
 * @throws StateDataValidationError if required data is missing
 */
export function validateStateData(
  state: RecordingState,
  data: RecordingData
): void {
  const missingData: string[] = [];

  switch (state) {
    case 'processing':
    case 'transcribing':
      if (!data.audioBlob) {
        missingData.push('audioBlob');
      }
      if (data.audioDuration === null || data.audioDuration === undefined) {
        missingData.push('audioDuration');
      }
      break;

    case 'transcribed':
      if (!data.audioBlob) {
        missingData.push('audioBlob');
      }
      if (!data.transcription) {
        missingData.push('transcription');
      }
      break;

    case 'enriching':
      if (!data.transcription) {
        missingData.push('transcription');
      }
      break;

    case 'complete':
      if (!data.audioBlob) {
        missingData.push('audioBlob');
      }
      if (!data.transcription) {
        missingData.push('transcription');
      }
      // Enrichment is optional, so we don't validate it
      break;

    case 'idle':
    case 'recording':
    case 'error':
      // These states don't require specific data
      break;
  }

  if (missingData.length > 0) {
    throw new StateDataValidationError(state, missingData);
  }
}

/**
 * Validates state consistency
 * Checks if the state and data are consistent with each other
 * 
 * @param state - Current recording state
 * @param data - Recording data to validate
 * @returns Validation result with any warnings
 */
export function validateStateConsistency(
  state: RecordingState,
  data: RecordingData
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Check for data that shouldn't exist in certain states
  if (state === 'idle') {
    if (data.audioBlob) {
      warnings.push('audioBlob exists in idle state');
    }
    if (data.transcription) {
      warnings.push('transcription exists in idle state');
    }
    if (data.enrichment) {
      warnings.push('enrichment exists in idle state');
    }
  }

  if (state === 'recording') {
    if (data.audioBlob) {
      warnings.push('audioBlob exists while still recording');
    }
  }

  // Check for inconsistent data
  if (data.enrichment && !data.transcription) {
    warnings.push('enrichment exists without transcription');
  }

  if (data.transcription && !data.audioBlob) {
    warnings.push('transcription exists without audio');
  }

  // Check for enrichment without enrichedText
  if (data.enrichment && !data.enrichment.enrichedText) {
    warnings.push('enrichment exists but enrichedText is missing');
  }

  // Check for transcription without text
  if (data.transcription && !data.transcription.text) {
    warnings.push('transcription exists but text is missing');
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * Validates a complete state transition with data
 * Combines transition validation and data validation
 * 
 * @param from - Current state
 * @param to - Target state
 * @param data - Recording data after transition
 * @throws StateTransitionError if transition is invalid
 * @throws StateDataValidationError if required data is missing
 */
export function validateStateTransitionWithData(
  from: RecordingState,
  to: RecordingState,
  data: RecordingData
): void {
  // First validate the transition is allowed
  validateTransition(from, to);
  
  // Then validate the data for the target state
  validateStateData(to, data);
}

/**
 * Checks if a state is valid (exists in the state machine)
 * 
 * @param state - State to check
 * @returns true if state is valid
 */
export function isValidState(state: string): state is RecordingState {
  return state in VALID_TRANSITIONS;
}
