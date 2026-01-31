/**
 * Storage Migration Strategy
 * Handles database schema migrations and data transformations
 */

import type { SerializedRecording } from './types';
import { DB_VERSION } from './types';

/**
 * Migration function type
 */
type MigrationFunction = (db: IDBDatabase, transaction: IDBTransaction) => void;

/**
 * Migration registry
 * Maps version numbers to migration functions
 */
const migrations: Record<number, MigrationFunction> = {
  1: migrateToV1,
  // Future migrations can be added here
  // 2: migrateToV2,
  // 3: migrateToV3,
};

/**
 * Initial migration (v1)
 * Creates the initial database schema
 */
function migrateToV1(db: IDBDatabase, transaction: IDBTransaction): void {
  // This is handled in the main StorageService initDB
  // Kept here for documentation purposes
  console.log('Database initialized with version 1');
}

/**
 * Apply migrations during database upgrade
 */
export function applyMigrations(
  db: IDBDatabase,
  transaction: IDBTransaction,
  oldVersion: number,
  newVersion: number
): void {
  console.log(`Migrating database from version ${oldVersion} to ${newVersion}`);

  // Apply each migration in sequence
  for (let version = oldVersion + 1; version <= newVersion; version++) {
    const migration = migrations[version];
    if (migration) {
      console.log(`Applying migration for version ${version}`);
      migration(db, transaction);
    }
  }
}

/**
 * Example future migration (v2)
 * Adds a new field to recordings
 */
// function migrateToV2(db: IDBDatabase, transaction: IDBTransaction): void {
//   const store = transaction.objectStore('recordings');
//   
//   // Add new index
//   if (!store.indexNames.contains('category')) {
//     store.createIndex('category', 'category', { unique: false });
//   }
//   
//   // Update existing records
//   const request = store.openCursor();
//   request.onsuccess = (event) => {
//     const cursor = (event.target as IDBRequest).result;
//     if (cursor) {
//       const recording = cursor.value as SerializedRecording;
//       // Add default category if missing
//       if (!recording.category) {
//         recording.category = 'general';
//         cursor.update(recording);
//       }
//       cursor.continue();
//     }
//   };
// }

/**
 * Data transformation utilities
 */
export class DataMigrationUtils {
  /**
   * Migrate recording data format
   */
  static migrateRecordingFormat(
    recording: any,
    fromVersion: number,
    toVersion: number
  ): SerializedRecording {
    let migrated = { ...recording };

    // Apply transformations based on version differences
    if (fromVersion < 1 && toVersion >= 1) {
      // Ensure required fields exist
      migrated.id = migrated.id || this.generateId();
      migrated.createdAt = migrated.createdAt || new Date().toISOString();
      migrated.updatedAt = migrated.updatedAt || new Date().toISOString();
    }

    // Future version migrations can be added here
    // if (fromVersion < 2 && toVersion >= 2) {
    //   migrated.category = migrated.category || 'general';
    // }

    return migrated as SerializedRecording;
  }

  /**
   * Validate recording data structure
   */
  static validateRecording(recording: any): boolean {
    // Check required fields
    if (!recording.id || typeof recording.id !== 'string') {
      return false;
    }

    if (!recording.createdAt || !recording.updatedAt) {
      return false;
    }

    // Validate date formats
    try {
      new Date(recording.createdAt);
      new Date(recording.updatedAt);
    } catch {
      return false;
    }

    return true;
  }

  /**
   * Sanitize recording data
   */
  static sanitizeRecording(recording: any): SerializedRecording {
    const sanitized: any = {
      id: recording.id,
      createdAt: recording.createdAt,
      updatedAt: recording.updatedAt,
    };

    // Copy optional fields if they exist and are valid
    const optionalFields = [
      'audioDataUrl',
      'audioDuration',
      'audioFormat',
      'audioSize',
      'transcription',
      'transcriptionText',
      'enrichment',
      'enrichmentType',
      'enrichedText',
      'title',
      'tags',
      'notes',
    ];

    optionalFields.forEach(field => {
      if (recording[field] !== undefined && recording[field] !== null) {
        sanitized[field] = recording[field];
      }
    });

    return sanitized as SerializedRecording;
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Export/Import utilities for data backup
 */
export class DataBackupUtils {
  /**
   * Export all recordings to JSON
   */
  static async exportToJSON(recordings: SerializedRecording[]): Promise<string> {
    const exportData = {
      version: DB_VERSION,
      exportDate: new Date().toISOString(),
      recordingsCount: recordings.length,
      recordings,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import recordings from JSON
   */
  static async importFromJSON(jsonString: string): Promise<{
    recordings: SerializedRecording[];
    version: number;
  }> {
    const data = JSON.parse(jsonString);

    // Validate import data
    if (!data.version || !data.recordings || !Array.isArray(data.recordings)) {
      throw new Error('Invalid import data format');
    }

    // Migrate recordings if needed
    const recordings = data.recordings.map((recording: any) =>
      DataMigrationUtils.migrateRecordingFormat(recording, data.version, DB_VERSION)
    );

    // Validate all recordings
    const validRecordings = recordings.filter((recording: any) =>
      DataMigrationUtils.validateRecording(recording)
    );

    if (validRecordings.length !== recordings.length) {
      console.warn(
        `${recordings.length - validRecordings.length} invalid recordings were skipped during import`
      );
    }

    return {
      recordings: validRecordings,
      version: data.version,
    };
  }

  /**
   * Create downloadable backup file
   */
  static createBackupFile(jsonData: string, filename?: string): void {
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename || `voice-recordings-backup-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
