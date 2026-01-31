/**
 * Monitoring Integration Examples
 * Shows how to integrate monitoring throughout the app
 */

import { useMonitoring } from '@/hooks/useMonitoring';
import { monitoringService } from './MonitoringService';

// Example 1: Track recording flow
export function RecordingFlowExample() {
  const { trackEvent, trackPerformance, trackAPIUsage, measureAsync } = useMonitoring();

  const handleRecording = async () => {
    // Track recording start
    trackEvent('recording_started', {
      source: 'button_click',
    });

    try {
      // Measure recording duration
      const recording = await measureAsync(
        'recording_duration',
        async () => {
          // Your recording logic
          return await recordAudio();
        }
      );

      // Track successful recording
      trackEvent('recording_completed', {
        duration: recording.duration,
        format: recording.format,
        size: recording.size,
      });

      // Transcribe with monitoring
      const transcription = await transcribeWithMonitoring(recording);

      // Enrich with monitoring
      const enriched = await enrichWithMonitoring(transcription);

      return enriched;
    } catch (error) {
      // Track error
      trackEvent('recording_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  };

  return null; // Component implementation
}

// Example 2: Monitor transcription service
async function transcribeWithMonitoring(audio: Blob) {
  const { trackEvent, trackPerformance, trackAPIUsage } = useMonitoring();

  trackEvent('transcription_started', {
    audioSize: audio.size,
    audioType: audio.type,
  });

  const startTime = performance.now();

  try {
    const result = await transcriptionService.transcribe(audio);
    const duration = performance.now() - startTime;

    // Track performance
    trackPerformance('transcription_duration', duration, 'ms', {
      audioSize: audio.size,
      textLength: result.text.length,
    });

    // Track API usage
    trackAPIUsage('transcription', duration, true, {
      tokensUsed: result.tokens,
      cost: calculateTranscriptionCost(result.tokens),
    });

    trackEvent('transcription_completed', {
      duration,
      textLength: result.text.length,
      language: result.language,
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    trackAPIUsage('transcription', duration, false);

    trackEvent('transcription_failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
    });

    throw error;
  }
}

// Example 3: Monitor LLM enrichment
async function enrichWithMonitoring(transcription: string) {
  const { trackEvent, trackPerformance, trackAPIUsage } = useMonitoring();

  trackEvent('enrichment_started', {
    inputLength: transcription.length,
  });

  const startTime = performance.now();

  try {
    const result = await llmService.enrich(transcription);
    const duration = performance.now() - startTime;

    // Track performance
    trackPerformance('enrichment_duration', duration, 'ms', {
      inputLength: transcription.length,
      outputLength: result.text.length,
    });

    // Track API usage
    trackAPIUsage('llm', duration, true, {
      tokensUsed: result.tokensUsed,
      cost: calculateLLMCost(result.tokensUsed),
    });

    trackEvent('enrichment_completed', {
      duration,
      inputLength: transcription.length,
      outputLength: result.text.length,
      enrichmentType: result.type,
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    trackAPIUsage('llm', duration, false);

    trackEvent('enrichment_failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
    });

    throw error;
  }
}

// Example 4: Error boundary with monitoring
export class MonitoredErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Report crash to monitoring
    monitoringService.reportCrash(error, errorInfo, {
      component: 'ErrorBoundary',
      location: window.location.pathname,
    });
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

// Example 5: Monitor storage operations
export async function saveRecordingWithMonitoring(recording: Recording) {
  const { trackEvent, trackPerformance } = useMonitoring();

  const startTime = performance.now();

  try {
    await storageService.save(recording);
    const duration = performance.now() - startTime;

    trackPerformance('storage_save_duration', duration, 'ms', {
      recordingSize: recording.audio.size,
    });

    trackEvent('recording_saved', {
      duration,
      size: recording.audio.size,
    });
  } catch (error) {
    trackEvent('recording_save_failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// Helper functions
function calculateTranscriptionCost(tokens: number): number {
  // Example: $0.006 per minute (Whisper API pricing)
  const minutes = tokens / 150; // Rough estimate
  return minutes * 0.006;
}

function calculateLLMCost(tokens: number): number {
  // Example: GPT-4 pricing
  const inputCost = 0.03 / 1000; // $0.03 per 1K tokens
  const outputCost = 0.06 / 1000; // $0.06 per 1K tokens
  return (tokens * inputCost + tokens * outputCost);
}

// Placeholder services
const transcriptionService = {
  transcribe: async (audio: Blob) => ({
    text: '',
    tokens: 0,
    language: 'en',
  }),
};

const llmService = {
  enrich: async (text: string) => ({
    text: '',
    tokensUsed: 0,
    type: 'summary',
  }),
};

const storageService = {
  save: async (recording: any) => {},
};

const recordAudio = async () => ({
  duration: 0,
  format: 'webm',
  size: 0,
});

type Recording = any;
