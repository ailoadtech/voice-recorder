/**
 * AudioRecordingService - Handles browser-based audio recording
 * Uses MediaRecorder API for capturing microphone input
 */

import type {
  AudioRecordingConfig,
  AudioRecordingService as IAudioRecordingService,
  RecordingState,
  AudioPermissionError,
  AudioRecordingError,
} from './types';

export class AudioRecordingService implements IAudioRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private state: RecordingState = 'idle';
  private startTime: number = 0;
  private pausedDuration: number = 0;
  private pauseStartTime: number = 0;
  private config: AudioRecordingConfig;
  private permissionGranted: boolean = false;

  constructor(config: AudioRecordingConfig = {}) {
    this.config = {
      mimeType: config.mimeType || this.getSupportedMimeType(),
      audioBitsPerSecond: config.audioBitsPerSecond || 128000,
      sampleRate: config.sampleRate || 48000,
    };
  }

  /**
   * Get supported MIME type for audio recording
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // fallback
  }

  /**
   * Check if microphone permissions are granted
   */
  hasPermissions(): boolean {
    return this.permissionGranted;
  }

  /**
   * Request microphone permissions
   */
  async getPermissions(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const error = new Error(
          'MediaDevices API not supported'
        ) as AudioPermissionError;
        error.name = 'AudioPermissionError';
        error.code = 'NOT_SUPPORTED';
        throw error;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: this.config.sampleRate,
        },
      });

      // Stop the test stream
      stream.getTracks().forEach((track) => track.stop());
      this.permissionGranted = true;
      return true;
    } catch (error) {
      this.permissionGranted = false;
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          const permError = new Error(
            'Microphone permission denied'
          ) as AudioPermissionError;
          permError.name = 'AudioPermissionError';
          permError.code = 'PERMISSION_DENIED';
          throw permError;
        }
        if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          const permError = new Error(
            'No microphone device found'
          ) as AudioPermissionError;
          permError.name = 'AudioPermissionError';
          permError.code = 'DEVICE_NOT_FOUND';
          throw permError;
        }
      }
      throw error;
    }
  }

  /**
   * Check permission status using Permissions API (if available)
   */
  async checkPermissionStatus(): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> {
    try {
      // Check if Permissions API is available
      if (!navigator.permissions || !navigator.permissions.query) {
        return 'unsupported';
      }

      // Query microphone permission status
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      
      // Listen for permission changes
      result.onchange = () => {
        this.permissionGranted = result.state === 'granted';
      };

      return result.state as 'granted' | 'denied' | 'prompt';
    } catch (error) {
      // Permissions API might not support microphone query in all browsers
      return 'unsupported';
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(): Promise<void> {
    if (this.state === 'recording') {
      throw this.createRecordingError('Already recording', 'INVALID_STATE');
    }

    try {
      // Get microphone stream
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: this.config.sampleRate,
        },
      });

      // Mark permission as granted after successful stream acquisition
      this.permissionGranted = true;

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: this.config.mimeType,
        audioBitsPerSecond: this.config.audioBitsPerSecond,
      });

      // Reset audio chunks
      this.audioChunks = [];

      // Set up event handlers
      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onerror = (event: Event) => {
        console.error('MediaRecorder error:', event);
        this.state = 'stopped';
      };

      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.state = 'recording';
      this.startTime = Date.now();
      this.pausedDuration = 0;
    } catch (error) {
      this.cleanup();
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          this.permissionGranted = false;
          const permError = new Error(
            'Microphone permission denied'
          ) as AudioPermissionError;
          permError.name = 'AudioPermissionError';
          permError.code = 'PERMISSION_DENIED';
          throw permError;
        }
        if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          this.permissionGranted = false;
          const permError = new Error(
            'No microphone device found'
          ) as AudioPermissionError;
          permError.name = 'AudioPermissionError';
          permError.code = 'DEVICE_NOT_FOUND';
          throw permError;
        }
      }
      throw this.createRecordingError('Failed to start recording', 'RECORDING_FAILED');
    }
  }

  /**
   * Stop recording and return audio blob
   */
  async stopRecording(): Promise<Blob> {
    if (this.state !== 'recording' && this.state !== 'paused') {
      throw this.createRecordingError('Not currently recording', 'INVALID_STATE');
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(this.createRecordingError('No active recorder', 'INVALID_STATE'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        if (this.audioChunks.length === 0) {
          this.cleanup();
          reject(this.createRecordingError('No audio data recorded', 'NO_DATA'));
          return;
        }

        const audioBlob = new Blob(this.audioChunks, {
          type: this.config.mimeType,
        });

        this.cleanup();
        resolve(audioBlob);
      };

      this.state = 'stopped';
      this.mediaRecorder.stop();
    });
  }

  /**
   * Pause recording
   */
  pauseRecording(): void {
    if (this.state !== 'recording') {
      throw this.createRecordingError('Not currently recording', 'INVALID_STATE');
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.state = 'paused';
      this.pauseStartTime = Date.now();
    }
  }

  /**
   * Resume recording
   */
  resumeRecording(): void {
    if (this.state !== 'paused') {
      throw this.createRecordingError('Recording is not paused', 'INVALID_STATE');
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.state = 'recording';
      this.pausedDuration += Date.now() - this.pauseStartTime;
    }
  }

  /**
   * Get current recording state
   */
  getState(): RecordingState {
    return this.state;
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.state === 'recording';
  }

  /**
   * Get recording duration in milliseconds
   */
  getDuration(): number {
    if (this.state === 'idle' || this.state === 'stopped') {
      return 0;
    }

    const currentTime = Date.now();
    const elapsed = currentTime - this.startTime;

    if (this.state === 'paused') {
      return elapsed - this.pausedDuration - (currentTime - this.pauseStartTime);
    }

    return elapsed - this.pausedDuration;
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.mediaRecorder = null;
    this.audioChunks = [];
    this.state = 'idle';
    this.startTime = 0;
    this.pausedDuration = 0;
    this.pauseStartTime = 0;
  }

  /**
   * Create a recording error
   */
  private createRecordingError(
    message: string,
    code: AudioRecordingError['code']
  ): AudioRecordingError {
    const error = new Error(message) as AudioRecordingError;
    error.name = 'AudioRecordingError';
    error.code = code;
    return error;
  }

  /**
   * Get audio blob URL for playback
   */
  createAudioURL(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  /**
   * Revoke audio blob URL to free memory
   */
  revokeAudioURL(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Convert audio blob to base64 string
   */
  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Get audio blob metadata
   */
  getAudioMetadata(blob: Blob): {
    size: number;
    type: string;
    sizeInMB: number;
  } {
    return {
      size: blob.size,
      type: blob.type,
      sizeInMB: parseFloat((blob.size / (1024 * 1024)).toFixed(2)),
    };
  }

  /**
   * Download audio blob as file
   */
  downloadAudio(blob: Blob, filename: string = 'recording'): void {
    const url = this.createAudioURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Determine file extension from MIME type
    const extension = blob.type.includes('webm') ? 'webm' :
                     blob.type.includes('ogg') ? 'ogg' :
                     blob.type.includes('mp4') ? 'mp4' : 'audio';
    
    a.download = `${filename}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    this.revokeAudioURL(url);
  }

  /**
   * Get current audio configuration
   */
  getConfig(): AudioRecordingConfig {
    return { ...this.config };
  }

  /**
   * Update audio configuration (only when not recording)
   */
  updateConfig(config: Partial<AudioRecordingConfig>): void {
    if (this.state !== 'idle') {
      throw this.createRecordingError(
        'Cannot update config while recording',
        'INVALID_STATE'
      );
    }

    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Get list of supported MIME types
   */
  static getSupportedMimeTypes(): string[] {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4',
      'audio/mpeg',
    ];

    return types.filter((type) => MediaRecorder.isTypeSupported(type));
  }

  /**
   * Dispose of the service
   */
  dispose(): void {
    if (this.state === 'recording' || this.state === 'paused') {
      try {
        this.mediaRecorder?.stop();
      } catch (error) {
        // Ignore errors during disposal
      }
    }
    this.cleanup();
  }
}
