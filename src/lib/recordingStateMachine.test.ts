import {
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
  validateTransition,
  StateDataValidationError,
  validateStateData,
  validateStateConsistency,
  validateStateTransitionWithData,
  isValidState,
  type RecordingData,
} from './recordingStateMachine';
import type { RecordingState } from '@/contexts/AppContext';

describe('recordingStateMachine', () => {
  describe('State Definitions', () => {
    it('defines all recording states', () => {
      const states: RecordingState[] = [
        'idle',
        'recording',
        'processing',
        'transcribing',
        'transcribed',
        'enriching',
        'complete',
        'error',
      ];

      states.forEach((state) => {
        expect(VALID_TRANSITIONS[state]).toBeDefined();
        expect(STATE_DESCRIPTIONS[state]).toBeDefined();
      });
    });

    it('defines valid transitions for each state', () => {
      expect(VALID_TRANSITIONS.idle).toEqual(['recording', 'error']);
      expect(VALID_TRANSITIONS.recording).toEqual(['processing', 'error', 'idle']);
      expect(VALID_TRANSITIONS.processing).toEqual(['transcribing', 'error', 'idle']);
      expect(VALID_TRANSITIONS.transcribing).toEqual(['transcribed', 'error', 'idle']);
      expect(VALID_TRANSITIONS.transcribed).toEqual(['enriching', 'complete', 'error', 'idle']);
      expect(VALID_TRANSITIONS.enriching).toEqual(['complete', 'error', 'idle']);
      expect(VALID_TRANSITIONS.complete).toEqual(['idle', 'error']);
      expect(VALID_TRANSITIONS.error).toEqual(['idle']);
    });

    it('defines state descriptions', () => {
      expect(STATE_DESCRIPTIONS.idle).toBe('Ready to record');
      expect(STATE_DESCRIPTIONS.recording).toBe('Recording audio');
      expect(STATE_DESCRIPTIONS.error).toBe('An error occurred');
    });

    it('defines in-progress states', () => {
      expect(IN_PROGRESS_STATES).toEqual([
        'recording',
        'processing',
        'transcribing',
        'enriching',
      ]);
    });

    it('defines terminal states', () => {
      expect(TERMINAL_STATES).toEqual(['idle', 'complete', 'error']);
    });

    it('defines interactive states', () => {
      expect(INTERACTIVE_STATES).toEqual([
        'idle',
        'recording',
        'transcribed',
        'complete',
        'error',
      ]);
    });
  });

  describe('isValidTransition', () => {
    it('allows valid transitions', () => {
      expect(isValidTransition('idle', 'recording')).toBe(true);
      expect(isValidTransition('recording', 'processing')).toBe(true);
      expect(isValidTransition('processing', 'transcribing')).toBe(true);
      expect(isValidTransition('transcribing', 'transcribed')).toBe(true);
      expect(isValidTransition('transcribed', 'enriching')).toBe(true);
      expect(isValidTransition('enriching', 'complete')).toBe(true);
      expect(isValidTransition('complete', 'idle')).toBe(true);
    });

    it('allows error transitions from any state', () => {
      const states: RecordingState[] = [
        'idle',
        'recording',
        'processing',
        'transcribing',
        'transcribed',
        'enriching',
        'complete',
      ];

      states.forEach((state) => {
        expect(isValidTransition(state, 'error')).toBe(true);
      });
    });

    it('allows reset to idle from most states', () => {
      const states: RecordingState[] = [
        'recording',
        'processing',
        'transcribing',
        'transcribed',
        'enriching',
        'complete',
        'error',
      ];

      states.forEach((state) => {
        expect(isValidTransition(state, 'idle')).toBe(true);
      });
    });

    it('rejects invalid transitions', () => {
      expect(isValidTransition('idle', 'processing')).toBe(false);
      expect(isValidTransition('idle', 'transcribing')).toBe(false);
      expect(isValidTransition('recording', 'transcribing')).toBe(false);
      expect(isValidTransition('processing', 'enriching')).toBe(false);
      expect(isValidTransition('transcribed', 'processing')).toBe(false);
    });

    it('allows skipping enrichment', () => {
      expect(isValidTransition('transcribed', 'complete')).toBe(true);
    });
  });

  describe('getValidNextStates', () => {
    it('returns valid next states for idle', () => {
      const nextStates = getValidNextStates('idle');
      expect(nextStates).toEqual(['recording', 'error']);
    });

    it('returns valid next states for recording', () => {
      const nextStates = getValidNextStates('recording');
      expect(nextStates).toEqual(['processing', 'error', 'idle']);
    });

    it('returns valid next states for transcribed', () => {
      const nextStates = getValidNextStates('transcribed');
      expect(nextStates).toEqual(['enriching', 'complete', 'error', 'idle']);
    });

    it('returns valid next states for error', () => {
      const nextStates = getValidNextStates('error');
      expect(nextStates).toEqual(['idle']);
    });
  });

  describe('isInProgress', () => {
    it('returns true for in-progress states', () => {
      expect(isInProgress('recording')).toBe(true);
      expect(isInProgress('processing')).toBe(true);
      expect(isInProgress('transcribing')).toBe(true);
      expect(isInProgress('enriching')).toBe(true);
    });

    it('returns false for non-progress states', () => {
      expect(isInProgress('idle')).toBe(false);
      expect(isInProgress('transcribed')).toBe(false);
      expect(isInProgress('complete')).toBe(false);
      expect(isInProgress('error')).toBe(false);
    });
  });

  describe('isTerminal', () => {
    it('returns true for terminal states', () => {
      expect(isTerminal('idle')).toBe(true);
      expect(isTerminal('complete')).toBe(true);
      expect(isTerminal('error')).toBe(true);
    });

    it('returns false for non-terminal states', () => {
      expect(isTerminal('recording')).toBe(false);
      expect(isTerminal('processing')).toBe(false);
      expect(isTerminal('transcribing')).toBe(false);
      expect(isTerminal('transcribed')).toBe(false);
      expect(isTerminal('enriching')).toBe(false);
    });
  });

  describe('isInteractive', () => {
    it('returns true for interactive states', () => {
      expect(isInteractive('idle')).toBe(true);
      expect(isInteractive('recording')).toBe(true);
      expect(isInteractive('transcribed')).toBe(true);
      expect(isInteractive('complete')).toBe(true);
      expect(isInteractive('error')).toBe(true);
    });

    it('returns false for non-interactive states', () => {
      expect(isInteractive('processing')).toBe(false);
      expect(isInteractive('transcribing')).toBe(false);
      expect(isInteractive('enriching')).toBe(false);
    });
  });

  describe('getStateDescription', () => {
    it('returns description for each state', () => {
      expect(getStateDescription('idle')).toBe('Ready to record');
      expect(getStateDescription('recording')).toBe('Recording audio');
      expect(getStateDescription('processing')).toBe('Processing audio');
      expect(getStateDescription('transcribing')).toBe('Transcribing audio to text');
      expect(getStateDescription('transcribed')).toBe('Transcription complete');
      expect(getStateDescription('enriching')).toBe('Enriching text with AI');
      expect(getStateDescription('complete')).toBe('Recording complete');
      expect(getStateDescription('error')).toBe('An error occurred');
    });
  });

  describe('StateTransitionError', () => {
    it('creates error with correct message', () => {
      const error = new StateTransitionError('idle', 'processing');
      
      expect(error.name).toBe('StateTransitionError');
      expect(error.from).toBe('idle');
      expect(error.to).toBe('processing');
      expect(error.message).toContain('Invalid state transition');
      expect(error.message).toContain('idle');
      expect(error.message).toContain('processing');
      expect(error.message).toContain('recording, error');
    });
  });

  describe('validateTransition', () => {
    it('does not throw for valid transitions', () => {
      expect(() => validateTransition('idle', 'recording')).not.toThrow();
      expect(() => validateTransition('recording', 'processing')).not.toThrow();
      expect(() => validateTransition('transcribed', 'enriching')).not.toThrow();
    });

    it('throws StateTransitionError for invalid transitions', () => {
      expect(() => validateTransition('idle', 'processing')).toThrow(StateTransitionError);
      expect(() => validateTransition('recording', 'transcribing')).toThrow(StateTransitionError);
      expect(() => validateTransition('processing', 'enriching')).toThrow(StateTransitionError);
    });

    it('throws error with correct details', () => {
      try {
        validateTransition('idle', 'transcribing');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(StateTransitionError);
        const stateError = error as StateTransitionError;
        expect(stateError.from).toBe('idle');
        expect(stateError.to).toBe('transcribing');
      }
    });
  });

  describe('State Machine Flow', () => {
    it('supports complete recording flow', () => {
      const flow: RecordingState[] = [
        'idle',
        'recording',
        'processing',
        'transcribing',
        'transcribed',
        'enriching',
        'complete',
        'idle',
      ];

      for (let i = 0; i < flow.length - 1; i++) {
        expect(isValidTransition(flow[i], flow[i + 1])).toBe(true);
      }
    });

    it('supports flow without enrichment', () => {
      const flow: RecordingState[] = [
        'idle',
        'recording',
        'processing',
        'transcribing',
        'transcribed',
        'complete',
        'idle',
      ];

      for (let i = 0; i < flow.length - 1; i++) {
        expect(isValidTransition(flow[i], flow[i + 1])).toBe(true);
      }
    });

    it('supports error recovery from any state', () => {
      const states: RecordingState[] = [
        'recording',
        'processing',
        'transcribing',
        'enriching',
      ];

      states.forEach((state) => {
        expect(isValidTransition(state, 'error')).toBe(true);
        expect(isValidTransition('error', 'idle')).toBe(true);
      });
    });

    it('supports cancellation from any state', () => {
      const states: RecordingState[] = [
        'recording',
        'processing',
        'transcribing',
        'transcribed',
        'enriching',
      ];

      states.forEach((state) => {
        expect(isValidTransition(state, 'idle')).toBe(true);
      });
    });
  });
});

describe('State Data Validation', () => {
  const createMockData = (overrides?: Partial<RecordingData>): RecordingData => ({
    audioBlob: null,
    audioDuration: null,
    transcription: null,
    enrichment: null,
    ...overrides,
  });

  describe('StateDataValidationError', () => {
    it('creates error with correct message', () => {
      const error = new StateDataValidationError('processing', ['audioBlob', 'audioDuration']);
      
      expect(error.name).toBe('StateDataValidationError');
      expect(error.state).toBe('processing');
      expect(error.missingData).toEqual(['audioBlob', 'audioDuration']);
      expect(error.message).toContain('processing');
      expect(error.message).toContain('audioBlob, audioDuration');
    });
  });

  describe('validateStateData', () => {
    it('validates idle state (no requirements)', () => {
      const data = createMockData();
      expect(() => validateStateData('idle', data)).not.toThrow();
    });

    it('validates recording state (no requirements)', () => {
      const data = createMockData();
      expect(() => validateStateData('recording', data)).not.toThrow();
    });

    it('validates error state (no requirements)', () => {
      const data = createMockData();
      expect(() => validateStateData('error', data)).not.toThrow();
    });

    it('validates processing state requires audio', () => {
      const invalidData = createMockData();
      expect(() => validateStateData('processing', invalidData)).toThrow(StateDataValidationError);

      const validData = createMockData({
        audioBlob: new Blob(['test'], { type: 'audio/webm' }),
        audioDuration: 5000,
      });
      expect(() => validateStateData('processing', validData)).not.toThrow();
    });

    it('validates transcribing state requires audio', () => {
      const invalidData = createMockData();
      expect(() => validateStateData('transcribing', invalidData)).toThrow(StateDataValidationError);

      const validData = createMockData({
        audioBlob: new Blob(['test'], { type: 'audio/webm' }),
        audioDuration: 5000,
      });
      expect(() => validateStateData('transcribing', validData)).not.toThrow();
    });

    it('validates transcribed state requires audio and transcription', () => {
      const invalidData = createMockData();
      expect(() => validateStateData('transcribed', invalidData)).toThrow(StateDataValidationError);

      const partialData = createMockData({
        audioBlob: new Blob(['test'], { type: 'audio/webm' }),
      });
      expect(() => validateStateData('transcribed', partialData)).toThrow(StateDataValidationError);

      const validData = createMockData({
        audioBlob: new Blob(['test'], { type: 'audio/webm' }),
        transcription: { text: 'test transcription' },
      });
      expect(() => validateStateData('transcribed', validData)).not.toThrow();
    });

    it('validates enriching state requires transcription', () => {
      const invalidData = createMockData();
      expect(() => validateStateData('enriching', invalidData)).toThrow(StateDataValidationError);

      const validData = createMockData({
        transcription: { text: 'test transcription' },
      });
      expect(() => validateStateData('enriching', validData)).not.toThrow();
    });

    it('validates complete state requires audio and transcription', () => {
      const invalidData = createMockData();
      expect(() => validateStateData('complete', invalidData)).toThrow(StateDataValidationError);

      const validData = createMockData({
        audioBlob: new Blob(['test'], { type: 'audio/webm' }),
        transcription: { text: 'test transcription' },
      });
      expect(() => validateStateData('complete', validData)).not.toThrow();

      // Enrichment is optional
      const validDataWithEnrichment = createMockData({
        audioBlob: new Blob(['test'], { type: 'audio/webm' }),
        transcription: { text: 'test transcription' },
        enrichment: { enrichedText: 'enriched text' },
      });
      expect(() => validateStateData('complete', validDataWithEnrichment)).not.toThrow();
    });

    it('throws error with correct missing data list', () => {
      const data = createMockData();
      
      try {
        validateStateData('processing', data);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(StateDataValidationError);
        const validationError = error as StateDataValidationError;
        expect(validationError.missingData).toContain('audioBlob');
        expect(validationError.missingData).toContain('audioDuration');
      }
    });
  });

  describe('validateStateConsistency', () => {
    it('validates idle state should have no data', () => {
      const cleanData = createMockData();
      const result = validateStateConsistency('idle', cleanData);
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);

      const dirtyData = createMockData({
        audioBlob: new Blob(['test'], { type: 'audio/webm' }),
        transcription: { text: 'test' },
      });
      const dirtyResult = validateStateConsistency('idle', dirtyData);
      expect(dirtyResult.valid).toBe(false);
      expect(dirtyResult.warnings.length).toBeGreaterThan(0);
    });

    it('validates recording state should not have audio blob', () => {
      const validData = createMockData();
      const result = validateStateConsistency('recording', validData);
      expect(result.valid).toBe(true);

      const invalidData = createMockData({
        audioBlob: new Blob(['test'], { type: 'audio/webm' }),
      });
      const invalidResult = validateStateConsistency('recording', invalidData);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.warnings).toContain('audioBlob exists while still recording');
    });

    it('detects enrichment without transcription', () => {
      const data = createMockData({
        enrichment: { enrichedText: 'enriched' },
      });
      const result = validateStateConsistency('complete', data);
      expect(result.valid).toBe(false);
      expect(result.warnings).toContain('enrichment exists without transcription');
    });

    it('detects transcription without audio', () => {
      const data = createMockData({
        transcription: { text: 'transcribed' },
      });
      const result = validateStateConsistency('transcribed', data);
      expect(result.valid).toBe(false);
      expect(result.warnings).toContain('transcription exists without audio');
    });

    it('detects enrichment without enrichedText field', () => {
      const data = createMockData({
        enrichment: {} as any,
      });
      const result = validateStateConsistency('complete', data);
      expect(result.valid).toBe(false);
      expect(result.warnings).toContain('enrichment exists but enrichedText is missing');
    });

    it('detects transcription without text field', () => {
      const data = createMockData({
        transcription: {} as any,
      });
      const result = validateStateConsistency('transcribed', data);
      expect(result.valid).toBe(false);
      expect(result.warnings).toContain('transcription exists but text is missing');
    });

    it('validates consistent complete state', () => {
      const data = createMockData({
        audioBlob: new Blob(['test'], { type: 'audio/webm' }),
        transcription: { text: 'transcribed' },
        enrichment: { enrichedText: 'enriched' },
      });
      const result = validateStateConsistency('complete', data);
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('validateStateTransitionWithData', () => {
    it('validates valid transition with valid data', () => {
      const data = createMockData({
        audioBlob: new Blob(['test'], { type: 'audio/webm' }),
        audioDuration: 5000,
      });
      
      expect(() => 
        validateStateTransitionWithData('recording', 'processing', data)
      ).not.toThrow();
    });

    it('throws on invalid transition', () => {
      const data = createMockData({
        audioBlob: new Blob(['test'], { type: 'audio/webm' }),
        audioDuration: 5000,
      });
      
      expect(() => 
        validateStateTransitionWithData('idle', 'processing', data)
      ).toThrow(StateTransitionError);
    });

    it('throws on valid transition with invalid data', () => {
      const data = createMockData(); // No audio
      
      expect(() => 
        validateStateTransitionWithData('recording', 'processing', data)
      ).toThrow(StateDataValidationError);
    });

    it('validates complete workflow with data', () => {
      // idle -> recording (no data needed)
      expect(() => 
        validateStateTransitionWithData('idle', 'recording', createMockData())
      ).not.toThrow();

      // recording -> processing (needs audio)
      const withAudio = createMockData({
        audioBlob: new Blob(['test'], { type: 'audio/webm' }),
        audioDuration: 5000,
      });
      expect(() => 
        validateStateTransitionWithData('recording', 'processing', withAudio)
      ).not.toThrow();

      // processing -> transcribing (needs audio)
      expect(() => 
        validateStateTransitionWithData('processing', 'transcribing', withAudio)
      ).not.toThrow();

      // transcribing -> transcribed (needs audio + transcription)
      const withTranscription = createMockData({
        audioBlob: new Blob(['test'], { type: 'audio/webm' }),
        audioDuration: 5000,
        transcription: { text: 'test' },
      });
      expect(() => 
        validateStateTransitionWithData('transcribing', 'transcribed', withTranscription)
      ).not.toThrow();

      // transcribed -> complete (needs audio + transcription)
      expect(() => 
        validateStateTransitionWithData('transcribed', 'complete', withTranscription)
      ).not.toThrow();
    });
  });

  describe('isValidState', () => {
    it('returns true for valid states', () => {
      expect(isValidState('idle')).toBe(true);
      expect(isValidState('recording')).toBe(true);
      expect(isValidState('processing')).toBe(true);
      expect(isValidState('transcribing')).toBe(true);
      expect(isValidState('transcribed')).toBe(true);
      expect(isValidState('enriching')).toBe(true);
      expect(isValidState('complete')).toBe(true);
      expect(isValidState('error')).toBe(true);
    });

    it('returns false for invalid states', () => {
      expect(isValidState('invalid')).toBe(false);
      expect(isValidState('unknown')).toBe(false);
      expect(isValidState('')).toBe(false);
      expect(isValidState('IDLE')).toBe(false); // case sensitive
    });
  });
});
