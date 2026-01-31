/**
 * Export Service Types
 * Defines types for exporting recordings in various formats
 */

import type { Recording } from '@/services/storage/types';

/**
 * Export format types
 */
export type ExportFormat = 'txt' | 'md' | 'json' | 'csv';

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  includeTranscription?: boolean;
  includeEnrichment?: boolean;
  includeTimestamp?: boolean;
  includeTags?: boolean;
  includeNotes?: boolean;
  customTemplate?: string;
}

/**
 * Export result
 */
export interface ExportResult {
  success: boolean;
  content?: string;
  filename?: string;
  error?: string;
}

/**
 * Batch export options
 */
export interface BatchExportOptions extends ExportOptions {
  recordings: Recording[];
  separateFiles?: boolean;
  zipFiles?: boolean;
}

/**
 * Batch export result
 */
export interface BatchExportResult {
  success: boolean;
  files?: Array<{
    filename: string;
    content: string;
  }>;
  error?: string;
}

/**
 * Clipboard export options
 */
export interface ClipboardExportOptions {
  format?: 'plain' | 'html';
  includeFormatting?: boolean;
}

/**
 * Export template variables
 */
export interface ExportTemplateVariables {
  title?: string;
  date?: string;
  time?: string;
  duration?: string;
  transcription?: string;
  enrichment?: string;
  tags?: string;
  notes?: string;
  [key: string]: string | undefined;
}

/**
 * Export service interface
 */
export interface IExportService {
  /**
   * Export a single recording
   */
  exportRecording(recording: Recording, options: ExportOptions): Promise<ExportResult>;
  
  /**
   * Export multiple recordings
   */
  exportBatch(options: BatchExportOptions): Promise<BatchExportResult>;
  
  /**
   * Export to clipboard
   */
  exportToClipboard(recording: Recording, options?: ClipboardExportOptions): Promise<boolean>;
  
  /**
   * Download exported file
   */
  downloadFile(content: string, filename: string, mimeType?: string): void;
  
  /**
   * Generate filename for export
   */
  generateFilename(recording: Recording, format: ExportFormat): string;
}
