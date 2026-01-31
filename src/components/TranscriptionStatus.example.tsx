'use client';

import React from 'react';
import { useState } from 'react';
import { TranscriptionStatus, TranscriptionStatusIndicator } from './TranscriptionStatus';
import { useTranscriptionStatus } from '@/hooks/useTranscriptionStatus';
import type { TranscriptionStage } from './TranscriptionStatus';

/**
 * Example 1: Basic usage with manual stage control
 */
export function BasicTranscriptionStatusExample() {
  const [stage, setStage] = useState<TranscriptionStage>('idle');
  const [progress, setProgress] = useState(0);

  const simulateTranscription = () => {
    // Loading model
    setStage('loading_model');
    setProgress(0);

    setTimeout(() => {
      // Processing audio
      setStage('processing_audio');
      setProgress(0.33);
    }, 1000);

    setTimeout(() => {
      // Finalizing
      setStage('finalizing');
      setProgress(0.66);
    }, 2000);

    setTimeout(() => {
      // Complete
      setStage('complete');
      setProgress(1.0);
    }, 3000);

    setTimeout(() => {
      // Reset
      setStage('idle');
      setProgress(0);
    }, 5000);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Basic Transcription Status</h2>
      
      <button
        onClick={simulateTranscription}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Simulate Transcription
      </button>

      <TranscriptionStatus
        stage={stage}
        progress={progress}
        onCancel={() => {
          setStage('idle');
          setProgress(0);
          console.log('Transcription cancelled');
        }}
      />
    </div>
  );
}

/**
 * Example 2: Using the useTranscriptionStatus hook
 */
export function HookBasedTranscriptionStatusExample() {
  const {
    stage,
    progress,
    isTranscribing,
    startTranscription,
    handleProgress,
    completeTranscription,
    cancelTranscription,
  } = useTranscriptionStatus();

  const simulateTranscriptionWithHook = () => {
    startTranscription();

    // Simulate progress updates
    setTimeout(() => {
      handleProgress({ stage: 'loading_model', progress: 0 });
    }, 100);

    setTimeout(() => {
      handleProgress({ stage: 'processing_audio', progress: 0.33 });
    }, 1000);

    setTimeout(() => {
      handleProgress({ stage: 'finalizing', progress: 0.66 });
    }, 2000);

    setTimeout(() => {
      handleProgress({ stage: 'complete', progress: 1.0 });
      completeTranscription();
    }, 3000);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Hook-Based Transcription Status</h2>
      
      <button
        onClick={simulateTranscriptionWithHook}
        disabled={isTranscribing}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isTranscribing ? 'Transcribing...' : 'Start Transcription'}
      </button>

      <TranscriptionStatus
        stage={stage}
        progress={progress}
        onCancel={cancelTranscription}
      />
    </div>
  );
}

/**
 * Example 3: Compact indicator version
 */
export function CompactTranscriptionStatusExample() {
  const [stage, setStage] = useState<TranscriptionStage>('idle');

  const cycleStages = () => {
    const stages: TranscriptionStage[] = [
      'loading_model',
      'processing_audio',
      'finalizing',
      'complete',
      'idle',
    ];

    let index = 0;
    const interval = setInterval(() => {
      setStage(stages[index]);
      index++;
      if (index >= stages.length) {
        clearInterval(interval);
      }
    }, 1500);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Compact Status Indicator</h2>
      
      <button
        onClick={cycleStages}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Cycle Stages
      </button>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Status:</span>
        <TranscriptionStatusIndicator stage={stage} />
      </div>
    </div>
  );
}

/**
 * Example 4: Integration with actual transcription service
 */
export function IntegratedTranscriptionExample() {
  const {
    stage,
    progress,
    isTranscribing,
    startTranscription,
    handleProgress,
    completeTranscription,
    cancelTranscription,
  } = useTranscriptionStatus();

  const [transcriptionResult, setTranscriptionResult] = useState<string>('');

  const handleTranscribe = async () => {
    try {
      startTranscription();

      // In a real implementation, you would:
      // 1. Get audio from recording
      // 2. Pass handleProgress as callback to transcription service
      // 3. Display the result

      // Simulated transcription
      const result = await simulateRealTranscription(handleProgress);
      setTranscriptionResult(result);
      completeTranscription();
    } catch (error) {
      console.error('Transcription failed:', error);
      cancelTranscription();
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Integrated Transcription Example</h2>
      
      <button
        onClick={handleTranscribe}
        disabled={isTranscribing}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isTranscribing ? 'Transcribing...' : 'Transcribe Audio'}
      </button>

      <TranscriptionStatus
        stage={stage}
        progress={progress}
        onCancel={cancelTranscription}
      />

      {transcriptionResult && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded border">
          <h3 className="font-semibold mb-2">Transcription Result:</h3>
          <p className="text-sm">{transcriptionResult}</p>
        </div>
      )}
    </div>
  );
}

// Helper function to simulate real transcription with progress
async function simulateRealTranscription(
  onProgress: (progress: { stage: string; progress: number }) => void
): Promise<string> {
  return new Promise((resolve) => {
    onProgress({ stage: 'loading_model', progress: 0 });

    setTimeout(() => {
      onProgress({ stage: 'processing_audio', progress: 0.33 });
    }, 500);

    setTimeout(() => {
      onProgress({ stage: 'finalizing', progress: 0.66 });
    }, 1500);

    setTimeout(() => {
      onProgress({ stage: 'complete', progress: 1.0 });
      resolve('This is a simulated transcription result.');
    }, 2500);
  });
}

/**
 * Example 5: All stages showcase
 */
export function AllStagesShowcase() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">All Transcription Stages</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">Loading Model</h3>
          <TranscriptionStatus stage="loading_model" progress={0.1} />
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">Processing Audio</h3>
          <TranscriptionStatus stage="processing_audio" progress={0.5} />
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">Finalizing</h3>
          <TranscriptionStatus stage="finalizing" progress={0.8} />
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">Complete</h3>
          <TranscriptionStatus stage="complete" progress={1.0} />
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">With Cancel Button</h3>
          <TranscriptionStatus
            stage="processing_audio"
            progress={0.5}
            onCancel={() => console.log('Cancelled')}
          />
        </div>
      </div>
    </div>
  );
}
