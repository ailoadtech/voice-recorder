/**
 * Audio recording service types and interfaces
 */

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

export interface AudioRecordingConfig {
  mimeType?: string;
  audioBitsPerSecond?: number;
  sampleRate?: number;
}

export interface AudioRecordingService {
  startRecording(): Promise<void>;
  stopRecording(): Promise<Blob>;
  pauseRecording(): void;
  resumeRecording(): void;
  getState(): RecordingState;
  getPermissions(): Promise<boolean>;
  hasPermissions(): boolean;
  checkPermissionStatus(): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'>;
  isRecording(): boolean;
  getDuration(): number;
  createAudioURL(blob: Blob): string;
  revokeAudioURL(url: string): void;
  blobToBase64(blob: Blob): Promise<string>;
  getAudioMetadata(blob: Blob): { size: number; type: string; sizeInMB: number };
  downloadAudio(blob: Blob, filename?: string): void;
  getConfig(): AudioRecordingConfig;
  updateConfig(config: Partial<AudioRecordingConfig>): void;
}

export interface AudioPermissionError extends Error {
  name: 'AudioPermissionError';
  code: 'PERMISSION_DENIED' | 'DEVICE_NOT_FOUND' | 'NOT_SUPPORTED';
}

export interface AudioRecordingError extends Error {
  name: 'AudioRecordingError';
  code: 'RECORDING_FAILED' | 'NO_DATA' | 'INVALID_STATE';
}
