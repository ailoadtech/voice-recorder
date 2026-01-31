/**
 * Storage Service Types
 * Defines data models for recording storage and retrieval
 */

import type { EnrichmentType, EnrichmentResult } from '@/services/llm/types';
import type { TranscriptionResult } from '@/services/transcription/types';

/**
 * Recording metadata and content
 */
export interface Recording {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Audio data
  audioBlob?: Blob;
  audioDuration?: number;
  audioFormat?: string;
  audioSize?: number;
  
  // Transcription data
  transcription?: TranscriptionResult;
  transcriptionText?: string;
  
  // Enrichment data
  enrichment?: EnrichmentResult;
  enrichmentType?: EnrichmentType;
  enrichedText?: string;
  
  // Metadata
  title?: string;
  tags?: string[];
  notes?: string;
}

/**
 * Serialized recording for storage (without Blob)
 */
export interface SerializedRecording extends Omit<Recording, 'audioBlob' | 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
  audioDataUrl?: string; // Base64 data URL for audio
}

/**
 * Recording filter options
 */
export interface RecordingFilter {
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
  hasTranscription?: boolean;
  hasEnrichment?: boolean;
  searchText?: string;
}

/**
 * Recording sort options
 */
export type RecordingSortField = 'createdAt' | 'updatedAt' | 'duration' | 'title';
export type RecordingSortOrder = 'asc' | 'desc';

export interface RecordingSortOptions {
  field: RecordingSortField;
  order: RecordingSortOrder;
}

/**
 * Storage statistics
 */
export interface StorageStats {
  totalRecordings: number;
  totalSize: number;
  oldestRecording?: Date;
  newestRecording?: Date;
}

/**
 * Storage error
 */
export interface StorageError extends Error {
  name: 'StorageError';
  code: 'QUOTA_EXCEEDED' | 'NOT_FOUND' | 'INVALID_DATA' | 'STORAGE_UNAVAILABLE' | 'UNKNOWN_ERROR';
}

/**
 * Storage service interface
 */
export interface IStorageService {
  /**
   * Save a recording
   */
  saveRecording(recording: Recording): Promise<string>;
  
  /**
   * Get a recording by ID
   */
  getRecording(id: string): Promise<Recording | null>;
  
  /**
   * Get all recordings
   */
  getAllRecordings(filter?: RecordingFilter, sort?: RecordingSortOptions): Promise<Recording[]>;
  
  /**
   * Update a recording
   */
  updateRecording(id: string, updates: Partial<Recording>): Promise<void>;
  
  /**
   * Delete a recording
   */
  deleteRecording(id: string): Promise<void>;
  
  /**
   * Delete multiple recordings
   */
  deleteRecordings(ids: string[]): Promise<void>;
  
  /**
   * Clear all recordings
   */
  clearAll(): Promise<void>;
  
  /**
   * Get storage statistics
   */
  getStats(): Promise<StorageStats>;
  
  /**
   * Check if storage is available
   */
  isAvailable(): Promise<boolean>;
}

/**
 * Database schema version
 */
export const DB_VERSION = 1;
export const DB_NAME = 'VoiceIntelligenceDB';
export const STORE_NAME = 'recordings';
