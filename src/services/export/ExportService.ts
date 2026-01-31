/**
 * Export Service
 * Handles exporting recordings to various formats (txt, md, json, csv)
 */

import type { Recording } from '@/services/storage/types';
import type {
  ExportFormat,
  ExportOptions,
  ExportResult,
  BatchExportOptions,
  BatchExportResult,
  ClipboardExportOptions,
  ExportTemplateVariables,
  IExportService,
} from './types';

/**
 * Default export options
 */
const DEFAULT_EXPORT_OPTIONS: Partial<ExportOptions> = {
  includeMetadata: true,
  includeTranscription: true,
  includeEnrichment: true,
  includeTimestamp: true,
  includeTags: true,
  includeNotes: true,
};

/**
 * Export Service Implementation
 */
export class ExportService implements IExportService {
  /**
   * Export a single recording
   */
  async exportRecording(
    recording: Recording,
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };
      let content: string;

      switch (opts.format) {
        case 'txt':
          content = this.exportToText(recording, opts);
          break;
        case 'md':
          content = this.exportToMarkdown(recording, opts);
          break;
        case 'json':
          content = this.exportToJson(recording, opts);
          break;
        case 'csv':
          content = this.exportToCsv([recording], opts);
          break;
        default:
          throw new Error(`Unsupported export format: ${opts.format}`);
      }

      const filename = this.generateFilename(recording, opts.format);

      return {
        success: true,
        content,
        filename,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }

  /**
   * Export multiple recordings
   */
  async exportBatch(options: BatchExportOptions): Promise<BatchExportResult> {
    try {
      const { recordings, separateFiles = false, format } = options;

      if (recordings.length === 0) {
        throw new Error('No recordings to export');
      }

      if (separateFiles) {
        // Export each recording to a separate file
        const files = await Promise.all(
          recordings.map(async (recording) => {
            const result = await this.exportRecording(recording, options);
            if (!result.success || !result.content || !result.filename) {
              throw new Error(`Failed to export recording ${recording.id}`);
            }
            return {
              filename: result.filename,
              content: result.content,
            };
          })
        );

        return {
          success: true,
          files,
        };
      } else {
        // Export all recordings to a single file
        let content: string;

        if (format === 'csv') {
          content = this.exportToCsv(recordings, options);
        } else if (format === 'json') {
          content = this.exportToJsonBatch(recordings, options);
        } else {
          // For txt and md, concatenate with separators
          const separator = format === 'md' ? '\n\n---\n\n' : '\n\n' + '='.repeat(80) + '\n\n';
          const exports = await Promise.all(
            recordings.map((r) => this.exportRecording(r, options))
          );
          content = exports
            .filter((e) => e.success && e.content)
            .map((e) => e.content)
            .join(separator);
        }

        const filename = `recordings_batch_${Date.now()}.${format}`;

        return {
          success: true,
          files: [{ filename, content }],
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Batch export failed',
      };
    }
  }

  /**
   * Export to clipboard
   */
  async exportToClipboard(
    recording: Recording,
    options: ClipboardExportOptions = {}
  ): Promise<boolean> {
    try {
      const { format = 'plain', includeFormatting = true } = options;

      let content: string;

      if (format === 'html' && includeFormatting) {
        content = this.exportToHtml(recording);
      } else {
        // Plain text export
        const exportOptions: ExportOptions = {
          format: 'txt',
          includeMetadata: true,
          includeTranscription: true,
          includeEnrichment: true,
        };
        const result = await this.exportRecording(recording, exportOptions);
        if (!result.success || !result.content) {
          throw new Error('Failed to generate export content');
        }
        content = result.content;
      }

      // Use Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
        return true;
      }

      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = content;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);

      return success;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Download exported file
   */
  downloadFile(content: string, filename: string, mimeType?: string): void {
    const type = mimeType || this.getMimeType(filename);
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate filename for export
   */
  generateFilename(recording: Recording, format: ExportFormat): string {
    const title = recording.title || 'recording';
    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date(recording.createdAt).getTime();
    return `${sanitizedTitle}_${timestamp}.${format}`;
  }

  /**
   * Export to plain text format
   */
  private exportToText(recording: Recording, options: ExportOptions): string {
    const lines: string[] = [];

    // Title
    if (recording.title) {
      lines.push(recording.title.toUpperCase());
      lines.push('='.repeat(recording.title.length));
      lines.push('');
    }

    // Metadata
    if (options.includeMetadata) {
      if (options.includeTimestamp) {
        lines.push(`Date: ${new Date(recording.createdAt).toLocaleString()}`);
      }
      if (recording.audioDuration) {
        lines.push(`Duration: ${this.formatDuration(recording.audioDuration)}`);
      }
      if (options.includeTags && recording.tags && recording.tags.length > 0) {
        lines.push(`Tags: ${recording.tags.join(', ')}`);
      }
      lines.push('');
    }

    // Transcription
    if (options.includeTranscription && recording.transcriptionText) {
      lines.push('TRANSCRIPTION');
      lines.push('-'.repeat(13));
      lines.push(recording.transcriptionText);
      lines.push('');
    }

    // Enrichment
    if (options.includeEnrichment && recording.enrichedText) {
      lines.push('ENRICHED OUTPUT');
      lines.push('-'.repeat(15));
      lines.push(recording.enrichedText);
      lines.push('');
    }

    // Notes
    if (options.includeNotes && recording.notes) {
      lines.push('NOTES');
      lines.push('-'.repeat(5));
      lines.push(recording.notes);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Export to Markdown format
   */
  private exportToMarkdown(recording: Recording, options: ExportOptions): string {
    const lines: string[] = [];

    // Title
    if (recording.title) {
      lines.push(`# ${recording.title}`);
      lines.push('');
    }

    // Metadata
    if (options.includeMetadata) {
      lines.push('## Metadata');
      lines.push('');
      if (options.includeTimestamp) {
        lines.push(`- **Date**: ${new Date(recording.createdAt).toLocaleString()}`);
      }
      if (recording.audioDuration) {
        lines.push(`- **Duration**: ${this.formatDuration(recording.audioDuration)}`);
      }
      if (recording.enrichmentType) {
        lines.push(`- **Enrichment Type**: ${recording.enrichmentType}`);
      }
      if (options.includeTags && recording.tags && recording.tags.length > 0) {
        lines.push(`- **Tags**: ${recording.tags.map((t) => `\`${t}\``).join(', ')}`);
      }
      lines.push('');
    }

    // Transcription
    if (options.includeTranscription && recording.transcriptionText) {
      lines.push('## Transcription');
      lines.push('');
      lines.push(recording.transcriptionText);
      lines.push('');
    }

    // Enrichment
    if (options.includeEnrichment && recording.enrichedText) {
      lines.push('## Enriched Output');
      lines.push('');
      lines.push(recording.enrichedText);
      lines.push('');
    }

    // Notes
    if (options.includeNotes && recording.notes) {
      lines.push('## Notes');
      lines.push('');
      lines.push(recording.notes);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Export to JSON format
   */
  private exportToJson(recording: Recording, options: ExportOptions): string {
    const data: any = {
      id: recording.id,
    };

    if (options.includeMetadata) {
      data.metadata = {
        createdAt: recording.createdAt,
        updatedAt: recording.updatedAt,
        title: recording.title,
        duration: recording.audioDuration,
        format: recording.audioFormat,
      };

      if (options.includeTags) {
        data.metadata.tags = recording.tags;
      }
    }

    if (options.includeTranscription && recording.transcriptionText) {
      data.transcription = {
        text: recording.transcriptionText,
        language: recording.transcription?.language,
      };
    }

    if (options.includeEnrichment && recording.enrichedText) {
      data.enrichment = {
        text: recording.enrichedText,
        type: recording.enrichmentType,
      };
    }

    if (options.includeNotes && recording.notes) {
      data.notes = recording.notes;
    }

    return JSON.stringify(data, null, 2);
  }

  /**
   * Export multiple recordings to JSON
   */
  private exportToJsonBatch(recordings: Recording[], options: ExportOptions): string {
    const data = recordings.map((recording) => {
      return JSON.parse(this.exportToJson(recording, options));
    });

    return JSON.stringify(data, null, 2);
  }

  /**
   * Export to CSV format
   */
  private exportToCsv(recordings: Recording[], options: ExportOptions): string {
    const lines: string[] = [];

    // Header
    const headers = ['ID', 'Title', 'Date', 'Duration'];
    if (options.includeTags) headers.push('Tags');
    if (options.includeTranscription) headers.push('Transcription');
    if (options.includeEnrichment) headers.push('Enrichment');
    if (options.includeNotes) headers.push('Notes');

    lines.push(headers.map((h) => this.escapeCsv(h)).join(','));

    // Rows
    recordings.forEach((recording) => {
      const row = [
        recording.id,
        recording.title || '',
        new Date(recording.createdAt).toISOString(),
        recording.audioDuration ? this.formatDuration(recording.audioDuration) : '',
      ];

      if (options.includeTags) {
        row.push(recording.tags?.join('; ') || '');
      }
      if (options.includeTranscription) {
        row.push(recording.transcriptionText || '');
      }
      if (options.includeEnrichment) {
        row.push(recording.enrichedText || '');
      }
      if (options.includeNotes) {
        row.push(recording.notes || '');
      }

      lines.push(row.map((cell) => this.escapeCsv(cell)).join(','));
    });

    return lines.join('\n');
  }

  /**
   * Export to HTML format (for clipboard)
   */
  private exportToHtml(recording: Recording): string {
    const parts: string[] = ['<div>'];

    if (recording.title) {
      parts.push(`<h1>${this.escapeHtml(recording.title)}</h1>`);
    }

    if (recording.transcriptionText) {
      parts.push('<h2>Transcription</h2>');
      parts.push(`<p>${this.escapeHtml(recording.transcriptionText)}</p>`);
    }

    if (recording.enrichedText) {
      parts.push('<h2>Enriched Output</h2>');
      parts.push(`<p>${this.escapeHtml(recording.enrichedText)}</p>`);
    }

    parts.push('</div>');
    return parts.join('\n');
  }

  /**
   * Format duration in milliseconds to readable string
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Escape CSV cell content
   */
  private escapeCsv(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Escape HTML content
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get MIME type for file extension
   */
  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      txt: 'text/plain',
      md: 'text/markdown',
      json: 'application/json',
      csv: 'text/csv',
      html: 'text/html',
    };
    return mimeTypes[ext || 'txt'] || 'text/plain';
  }
}

/**
 * Export service singleton instance
 */
export const exportService = new ExportService();
