/**
 * Examples demonstrating microphone permission handling
 */

import { AudioRecordingService } from './AudioRecordingService';

/**
 * Example 1: Basic permission check before recording
 */
export async function basicPermissionCheck() {
  const audioService = new AudioRecordingService();

  try {
    // Request permissions
    await audioService.getPermissions();
    console.log('✓ Microphone access granted');

    // Start recording
    await audioService.startRecording();
    console.log('✓ Recording started');

    // ... recording logic ...

    // Stop recording
    const audioBlob = await audioService.stopRecording();
    console.log('✓ Recording stopped', audioBlob);
  } catch (error) {
    if (error instanceof Error && error.name === 'AudioPermissionError') {
      const code = (error as any).code;
      switch (code) {
        case 'PERMISSION_DENIED':
          console.error('User denied microphone access');
          break;
        case 'DEVICE_NOT_FOUND':
          console.error('No microphone device found');
          break;
        case 'NOT_SUPPORTED':
          console.error('Browser does not support audio recording');
          break;
      }
    } else {
      console.error('Recording error:', error);
    }
  }
}

/**
 * Example 2: Check permission status without prompting
 */
export async function checkPermissionStatus() {
  const audioService = new AudioRecordingService();

  // Check current permission state
  const status = await audioService.checkPermissionStatus();

  switch (status) {
    case 'granted':
      console.log('✓ Permission already granted');
      // Safe to start recording
      await audioService.startRecording();
      break;

    case 'denied':
      console.log('✗ Permission denied');
      // Show instructions to enable in browser settings
      break;

    case 'prompt':
      console.log('? Permission not yet requested');
      // Request permission
      await audioService.getPermissions();
      break;

    case 'unsupported':
      console.log('⚠ Permissions API not supported');
      // Fallback to direct permission request
      await audioService.getPermissions();
      break;
  }
}

/**
 * Example 3: Cached permission check
 */
export async function cachedPermissionCheck() {
  const audioService = new AudioRecordingService();

  // Quick check without async call
  if (audioService.hasPermissions()) {
    console.log('✓ Already have permissions');
    await audioService.startRecording();
  } else {
    console.log('Requesting permissions...');
    await audioService.getPermissions();
  }
}

/**
 * Example 4: React component pattern
 */
export function useAudioPermissions() {
  // This would be a React hook in a real implementation
  const audioService = new AudioRecordingService();

  const requestPermissions = async () => {
    try {
      await audioService.getPermissions();
      return { success: true, error: null };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  };

  const checkStatus = async () => {
    return await audioService.checkPermissionStatus();
  };

  return {
    requestPermissions,
    checkStatus,
    hasPermissions: audioService.hasPermissions(),
  };
}

/**
 * Example 5: Handling permission changes
 */
export async function monitorPermissionChanges() {
  const audioService = new AudioRecordingService();

  // Initial check
  const initialStatus = await audioService.checkPermissionStatus();
  console.log('Initial permission status:', initialStatus);

  // The checkPermissionStatus method automatically sets up a listener
  // for permission changes, which updates the internal state

  // Later, you can check the cached state
  setInterval(() => {
    console.log('Has permissions:', audioService.hasPermissions());
  }, 5000);
}

/**
 * Example 6: Error recovery pattern
 */
export async function errorRecoveryPattern() {
  const audioService = new AudioRecordingService();

  const startRecordingWithRetry = async (maxRetries = 2) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await audioService.startRecording();
        console.log('✓ Recording started');
        return true;
      } catch (error) {
        if (error instanceof Error && error.name === 'AudioPermissionError') {
          console.log(`Attempt ${attempt + 1}: Permission error, requesting...`);
          try {
            await audioService.getPermissions();
          } catch (permError) {
            console.error('Permission request failed:', permError);
            return false;
          }
        } else {
          console.error('Recording failed:', error);
          return false;
        }
      }
    }
    return false;
  };

  await startRecordingWithRetry();
}
