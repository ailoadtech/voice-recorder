/**
 * Example usage of the transcribe_audio Tauri command with progress callbacks
 */

import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type { ModelVariant, TranscriptionProgress } from './types';

/**
 * Example: Transcribe audio with progress tracking
 */
export async function transcribeWithProgress(
  audioData: Float32Array,
  variant: ModelVariant
): Promise<string> {
  // Set up progress listener
  const unlisten = await listen<TranscriptionProgress>(
    'transcription-progress',
    (event) => {
      const { stage, progress } = event.payload;
      console.log(`Transcription ${stage}: ${(progress * 100).toFixed(0)}%`);
      
      // Update UI based on stage
      switch (stage) {
        case 'loading_model':
          console.log('Loading Whisper model...');
          break;
        case 'processing_audio':
          console.log('Processing audio...');
          break;
        case 'finalizing':
          console.log('Finalizing transcription...');
          break;
        case 'complete':
          console.log('Transcription complete!');
          break;
      }
    }
  );

  try {
    // Convert Float32Array to regular array for Tauri
    const audioArray = Array.from(audioData);

    // Invoke transcription command
    const text = await invoke<string>('transcribe_audio', {
      audioData: audioArray,
      variant,
    });

    return text;
  } finally {
    // Clean up listener
    unlisten();
  }
}

/**
 * Example: Complete transcription workflow
 */
export async function completeTranscriptionWorkflow(
  modelPath: string,
  variant: ModelVariant,
  audioData: Float32Array
): Promise<string> {
  try {
    // Step 1: Load the model
    console.log('Loading model...');
    await invoke('load_whisper_model', {
      path: modelPath,
      variant,
    });

    // Step 2: Transcribe with progress tracking
    console.log('Starting transcription...');
    const text = await transcribeWithProgress(audioData, variant);

    // Step 3: Model will be automatically unloaded after 5 minutes of inactivity
    // Or you can manually unload it:
    // await invoke('unload_whisper_model');

    return text;
  } catch (error) {
    console.error('Transcription failed:', error);
    throw error;
  }
}

/**
 * Example: Check if a model is currently loaded
 */
export async function checkModelStatus(): Promise<ModelVariant | null> {
  const status = await invoke<ModelVariant | null>('get_whisper_model_status');
  
  if (status) {
    console.log(`Model ${status} is currently loaded`);
  } else {
    console.log('No model is currently loaded');
  }
  
  return status;
}
