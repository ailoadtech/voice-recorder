'use client';

import { useState, useRef, useEffect } from 'react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { RecordingButton } from '@/components/RecordingButton';
import { AudioPlayer } from '@/components/AudioPlayer';
import { TranscriptionDisplay } from '@/components/TranscriptionDisplay';
import { EnrichmentPanel } from '@/components/EnrichmentPanel';
import { AudioRecordingService } from '@/services/audio';
import { useHotkey } from '@/hooks/useHotkey';
import { DEFAULT_HOTKEY_IDS } from '@/services/hotkey/types';
import { useWhisperTranscription } from '@/hooks/useWhisperTranscription';
import type { TranscriptionResult } from '@/services/whisper';
import type { RecordingButtonHandle } from '@/components/RecordingButton';

export default function RecordPage() {
  const [audioService] = useState(() => new AudioRecordingService());
  const { transcribe, isTranscribing: isTranscribingFromHook, error: transcriptionErrorFromHook } = useWhisperTranscription();
  const recordingButtonRef = useRef<RecordingButtonHandle>(null);
  
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

  // Sync transcription state from hook
  useEffect(() => {
    setIsTranscribing(isTranscribingFromHook);
  }, [isTranscribingFromHook]);

  useEffect(() => {
    setTranscriptionError(transcriptionErrorFromHook);
  }, [transcriptionErrorFromHook]);

  // Register global hotkey for recording toggle
  useHotkey(
    {
      id: DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING,
      key: ' ', // Space key
      modifiers: ['ctrl', 'shift'],
      description: 'Toggle voice recording',
      enabled: true,
      global: true, // Works globally in Tauri desktop app
    },
    () => {
      // Trigger recording toggle via the RecordingButton component
      recordingButtonRef.current?.toggleRecording();
    }
  );

  const handleRecordingComplete = async (blob: Blob) => {
    console.log('Recording complete:', audioService.getAudioMetadata(blob));
    setAudioBlob(blob);
    
    // Automatically start transcription
    setIsTranscribing(true);
    setTranscriptionError(null);
    
    try {
      // Convert Blob to AudioBuffer for transcription
      const audioBuffer = await blobToAudioBuffer(blob);
      const result = await transcribe(audioBuffer);
      setTranscriptionResult(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transcription failed';
      setTranscriptionError(errorMessage);
      console.error('Transcription error:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Helper function to convert Blob to AudioBuffer
  const blobToAudioBuffer = async (blob: Blob): Promise<AudioBuffer> => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new AudioContext();
    return await audioContext.decodeAudioData(arrayBuffer);
  };

  const handleRecordingError = (err: Error) => {
    console.error('Recording error:', err);
  };

  const handleTranscriptionTextChange = (text: string) => {
    if (transcriptionResult) {
      setTranscriptionResult({ ...transcriptionResult, text });
    }
  };

  return (
    <main className="flex min-h-screen flex-col p-4 sm:p-8">
      <div className="max-w-4xl w-full mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">Voice Recording</h1>
          <div className="text-xs sm:text-sm text-gray-500">
            Hotkey: <kbd className="px-2 py-1 bg-gray-100 border rounded">Ctrl+Shift+Space</kbd>
          </div>
        </div>
        
        <PermissionGuard
          onPermissionGranted={() => console.log('Microphone access granted')}
          onPermissionDenied={(error) => console.error('Permission denied:', error)}
        >
          <div className="space-y-4 sm:space-y-6">
            {/* Recording Control */}
            <div className="bg-white border rounded-lg p-6 sm:p-8">
              <RecordingButton
                ref={recordingButtonRef}
                audioService={audioService}
                onRecordingComplete={handleRecordingComplete}
                onError={handleRecordingError}
              />
            </div>

            {/* Audio Playback */}
            {audioBlob && (
              <div className="bg-white border rounded-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">Audio Playback</h2>
                <AudioPlayer audioBlob={audioBlob} />
              </div>
            )}

            {/* Transcription Section */}
            <div className="bg-white border rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Transcription</h2>
              <TranscriptionDisplay
                result={transcriptionResult}
                isLoading={isTranscribing}
                error={transcriptionError}
                onTextChange={handleTranscriptionTextChange}
              />
            </div>

            {/* Enrichment Section */}
            <div className="bg-white border rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">AI Enrichment</h2>
              <EnrichmentPanel
                transcribedText={transcriptionResult?.text || ''}
                onEnrichmentComplete={(result) => {
                  console.log('Enrichment complete:', result);
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium text-sm sm:text-base">
                📋 Copy to Clipboard
              </button>
              <button className="flex-1 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 font-medium text-sm sm:text-base">
                💾 Export
              </button>
              <button className="flex-1 px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium text-sm sm:text-base">
                📜 View History
              </button>
            </div>
          </div>
        </PermissionGuard>
      </div>
    </main>
  );
}
