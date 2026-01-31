/**
 * Library exports
 * Central export point for shared utilities and helpers
 */

// State Machine
export {
  VALID_TRANSITIONS,
  STATE_DESCRIPTIONS,
  IN_PROGRESS_STATES,
  TERMINAL_STATES,
  INTERACTIVE_STATES,
  isValidTransition,
  getValidNextStates,
  isInProgress,
  isTerminal,
  isInteractive,
  getStateDescription,
  StateTransitionError,
  StateDataValidationError,
  validateTransition,
  validateStateData,
  validateStateConsistency,
  validateStateTransitionWithData,
  isValidState,
  type RecordingData,
} from './recordingStateMachine';

// Environment
export { env } from './env';

// Resource Monitoring
export {
  getSystemMemory,
  checkMemoryStatus,
  formatBytes,
  getMemoryWarningMessage,
  monitorMemory,
  MEMORY_THRESHOLDS,
  type SystemMemory,
  type MemoryStatus,
} from './resourceMonitoring';

// Model Recommendation
export {
  recommendModelVariant,
  isVariantRecommended,
  getModelMemoryRequirement,
  type ModelRecommendation,
} from './modelRecommendation';
