/**
 * StorageService - IndexedDB Storage Implementation
 * Handles persistent storage of recordings with audio, transcription, and enrichment data
 */

import type {
  IStorageService,
  Recording,
  SerializedRecording,
  RecordingFilter,
  RecordingSortOptions,
  StorageStats,
  StorageError,
} from './types';
import { DB_NAME, DB_VERSION, STORE_NAME } from './types';

export class StorageService implements IStorageService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.initDB();
  }

  /**
   * Initialize IndexedDB
   */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(this.createError('IndexedDB not available', 'STORAGE_UNAVAILABLE'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(this.createError('Failed to open database', 'STORAGE_UNAVAILABLE'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          
          // Create indexes
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
          objectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          objectStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }
      };
    });
  }

  /**
   * Ensure database is initialized
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (this.initPromise) {
      await this.initPromise;
    }
    
    if (!this.db) {
      throw this.createError('Database not initialized', 'STORAGE_UNAVAILABLE');
    }
    
    return this.db;
  }

  /**
   * Save a recording
   */
  async saveRecording(recording: Recording): Promise<string> {
    const db = await this.ensureDB();
    
    // Generate ID if not provided
    if (!recording.id) {
      recording.id = this.generateId();
    }
    
    // Set timestamps
    const now = new Date();
    recording.createdAt = recording.createdAt || now;
    recording.updatedAt = now;
    
    // Serialize recording
    const serialized = await this.serializeRecording(recording);
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(serialized);

      request.onsuccess = () => {
        resolve(recording.id);
      };

      request.onerror = () => {
        if (request.error?.name === 'QuotaExceededError') {
          reject(this.createError('Storage quota exceeded', 'QUOTA_EXCEEDED'));
        } else {
          reject(this.createError('Failed to save recording', 'UNKNOWN_ERROR'));
        }
      };
    });
  }

  /**
   * Get a recording by ID
   */
  async getRecording(id: string): Promise<Recording | null> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = async () => {
        if (request.result) {
          const recording = await this.deserializeRecording(request.result);
          resolve(recording);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(this.createError('Failed to retrieve recording', 'UNKNOWN_ERROR'));
      };
    });
  }

  /**
   * Get all recordings
   */
  async getAllRecordings(
    filter?: RecordingFilter,
    sort?: RecordingSortOptions
  ): Promise<Recording[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = async () => {
        let recordings = await Promise.all(
          request.result.map((r: SerializedRecording) => this.deserializeRecording(r))
        );

        // Apply filters
        if (filter) {
          recordings = this.filterRecordings(recordings, filter);
        }

        // Apply sorting
        if (sort) {
          recordings = this.sortRecordings(recordings, sort);
        }

        resolve(recordings);
      };

      request.onerror = () => {
        reject(this.createError('Failed to retrieve recordings', 'UNKNOWN_ERROR'));
      };
    });
  }

  /**
   * Update a recording
   */
  async updateRecording(id: string, updates: Partial<Recording>): Promise<void> {
    const existing = await this.getRecording(id);
    
    if (!existing) {
      throw this.createError('Recording not found', 'NOT_FOUND');
    }

    const updated: Recording = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
    };

    await this.saveRecording(updated);
  }

  /**
   * Delete a recording
   */
  async deleteRecording(id: string): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(this.createError('Failed to delete recording', 'UNKNOWN_ERROR'));
      };
    });
  }

  /**
   * Delete multiple recordings
   */
  async deleteRecordings(ids: string[]): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      let completed = 0;
      let hasError = false;

      ids.forEach(id => {
        const request = store.delete(id);
        
        request.onsuccess = () => {
          completed++;
          if (completed === ids.length && !hasError) {
            resolve();
          }
        };

        request.onerror = () => {
          hasError = true;
          reject(this.createError('Failed to delete recordings', 'UNKNOWN_ERROR'));
        };
      });
    });
  }

  /**
   * Clear all recordings
   */
  async clearAll(): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(this.createError('Failed to clear recordings', 'UNKNOWN_ERROR'));
      };
    });
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<StorageStats> {
    const recordings = await this.getAllRecordings();
    
    const stats: StorageStats = {
      totalRecordings: recordings.length,
      totalSize: 0,
    };

    if (recordings.length > 0) {
      // Calculate total size
      recordings.forEach(r => {
        if (r.audioSize) {
          stats.totalSize += r.audioSize;
        }
      });

      // Find oldest and newest
      const sorted = [...recordings].sort((a, b) => 
        a.createdAt.getTime() - b.createdAt.getTime()
      );
      stats.oldestRecording = sorted[0].createdAt;
      stats.newestRecording = sorted[sorted.length - 1].createdAt;
    }

    return stats;
  }

  /**
   * Check if storage is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.ensureDB();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Serialize recording for storage
   */
  private async serializeRecording(recording: Recording): Promise<SerializedRecording> {
    const serialized: SerializedRecording = {
      ...recording,
      createdAt: recording.createdAt.toISOString(),
      updatedAt: recording.updatedAt.toISOString(),
    };

    // Convert Blob to data URL
    if (recording.audioBlob) {
      serialized.audioDataUrl = await this.blobToDataUrl(recording.audioBlob);
      delete (serialized as any).audioBlob;
    }

    return serialized;
  }

  /**
   * Deserialize recording from storage
   */
  private async deserializeRecording(serialized: SerializedRecording): Promise<Recording> {
    const recording: Recording = {
      ...serialized,
      createdAt: new Date(serialized.createdAt),
      updatedAt: new Date(serialized.updatedAt),
    };

    // Convert data URL back to Blob
    if (serialized.audioDataUrl) {
      recording.audioBlob = await this.dataUrlToBlob(serialized.audioDataUrl);
    }

    return recording;
  }

  /**
   * Convert Blob to data URL
   */
  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Convert data URL to Blob
   */
  private async dataUrlToBlob(dataUrl: string): Promise<Blob> {
    const response = await fetch(dataUrl);
    return response.blob();
  }

  /**
   * Filter recordings
   */
  private filterRecordings(recordings: Recording[], filter: RecordingFilter): Recording[] {
    return recordings.filter(recording => {
      // Date range filter
      if (filter.startDate && recording.createdAt < filter.startDate) {
        return false;
      }
      if (filter.endDate && recording.createdAt > filter.endDate) {
        return false;
      }

      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        if (!recording.tags || !filter.tags.some(tag => recording.tags!.includes(tag))) {
          return false;
        }
      }

      // Transcription filter
      if (filter.hasTranscription !== undefined) {
        if (filter.hasTranscription && !recording.transcriptionText) {
          return false;
        }
        if (!filter.hasTranscription && recording.transcriptionText) {
          return false;
        }
      }

      // Enrichment filter
      if (filter.hasEnrichment !== undefined) {
        if (filter.hasEnrichment && !recording.enrichedText) {
          return false;
        }
        if (!filter.hasEnrichment && recording.enrichedText) {
          return false;
        }
      }

      // Search text filter
      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        const matchesTitle = recording.title?.toLowerCase().includes(searchLower);
        const matchesTranscription = recording.transcriptionText?.toLowerCase().includes(searchLower);
        const matchesEnrichment = recording.enrichedText?.toLowerCase().includes(searchLower);
        const matchesNotes = recording.notes?.toLowerCase().includes(searchLower);
        
        if (!matchesTitle && !matchesTranscription && !matchesEnrichment && !matchesNotes) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Sort recordings
   */
  private sortRecordings(recordings: Recording[], sort: RecordingSortOptions): Recording[] {
    return [...recordings].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sort.field) {
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'updatedAt':
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
          break;
        case 'duration':
          aValue = a.audioDuration || 0;
          bValue = b.audioDuration || 0;
          break;
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        default:
          return 0;
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sort.order === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a storage error
   */
  private createError(message: string, code: StorageError['code']): StorageError {
    const error = new Error(message) as StorageError;
    error.name = 'StorageError';
    error.code = code;
    return error;
  }
}
