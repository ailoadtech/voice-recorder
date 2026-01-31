import { ExportService } from './ExportService';
import type { Recording } from '@/services/storage/types';
import type { ExportOptions, BatchExportOptions } from './types';

describe('ExportService', () => {
  let exportService: ExportService;
  let mockRecording: Recording;

  beforeEach(() => {
    exportService = new ExportService();
    mockRecording = {
      id: 'test-123',
      createdAt: new Date('2024-01-15T10:30:00Z'),
      updatedAt: new Date('2024-01-15T10:35:00Z'),
      title: 'Test Recording',
      audioDuration: 125000, // 2m 5s
      audioFormat: 'webm',
      transcriptionText: 'This is a test transcription.',
      enrichedText: 'This is the enriched version of the transcription.',
      enrichmentType: 'format',
      tags: ['test', 'demo'],
      notes: 'Some test notes',
    };
  });

  describe('exportRecording', () => {
    it('exports to text format', async () => {
      const options: ExportOptions = {
        format: 'txt',
        includeMetadata: true,
        includeTranscription: true,
        includeEnrichment: true,
      };

      const result = await exportService.exportRecording(mockRecording, options);

      expect(result.success).toBe(true);
      expect(result.content).toContain('TEST RECORDING');
      expect(result.content).toContain('This is a test transcription');
      expect(result.content).toContain('This is the enriched version');
      expect(result.filename).toContain('.txt');
    });

    it('exports to markdown format', async () => {
      const options: ExportOptions = {
        format: 'md',
        includeMetadata: true,
        includeTranscription: true,
        includeEnrichment: true,
      };

      const result = await exportService.exportRecording(mockRecording, options);

      expect(result.success).toBe(true);
      expect(result.content).toContain('# Test Recording');
      expect(result.content).toContain('## Metadata');
      expect(result.content).toContain('## Transcription');
      expect(result.content).toContain('## Enriched Output');
      expect(result.filename).toContain('.md');
    });

    it('exports to JSON format', async () => {
      const options: ExportOptions = {
        format: 'json',
        includeMetadata: true,
        includeTranscription: true,
        includeEnrichment: true,
      };

      const result = await exportService.exportRecording(mockRecording, options);

      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();

      const parsed = JSON.parse(result.content!);
      expect(parsed.id).toBe('test-123');
      expect(parsed.metadata.title).toBe('Test Recording');
      expect(parsed.transcription.text).toBe('This is a test transcription.');
      expect(parsed.enrichment.text).toContain('enriched version');
      expect(result.filename).toContain('.json');
    });

    it('exports to CSV format', async () => {
      const options: ExportOptions = {
        format: 'csv',
        includeMetadata: true,
        includeTranscription: true,
      };

      const result = await exportService.exportRecording(mockRecording, options);

      expect(result.success).toBe(true);
      expect(result.content).toContain('ID,Title,Date,Duration');
      expect(result.content).toContain('test-123');
      expect(result.content).toContain('Test Recording');
      expect(result.filename).toContain('.csv');
    });

    it('respects includeMetadata option', async () => {
      const options: ExportOptions = {
        format: 'txt',
        includeMetadata: false,
        includeTranscription: true,
      };

      const result = await exportService.exportRecording(mockRecording, options);

      expect(result.success).toBe(true);
      expect(result.content).not.toContain('Date:');
      expect(result.content).not.toContain('Duration:');
    });

    it('respects includeTranscription option', async () => {
      const options: ExportOptions = {
        format: 'txt',
        includeTranscription: false,
        includeEnrichment: true,
      };

      const result = await exportService.exportRecording(mockRecording, options);

      expect(result.success).toBe(true);
      expect(result.content).not.toContain('TRANSCRIPTION');
      expect(result.content).toContain('ENRICHED OUTPUT');
    });

    it('respects includeEnrichment option', async () => {
      const options: ExportOptions = {
        format: 'txt',
        includeTranscription: true,
        includeEnrichment: false,
      };

      const result = await exportService.exportRecording(mockRecording, options);

      expect(result.success).toBe(true);
      expect(result.content).toContain('TRANSCRIPTION');
      expect(result.content).not.toContain('ENRICHED OUTPUT');
    });

    it('includes tags when requested', async () => {
      const options: ExportOptions = {
        format: 'txt',
        includeTags: true,
      };

      const result = await exportService.exportRecording(mockRecording, options);

      expect(result.success).toBe(true);
      expect(result.content).toContain('Tags: test, demo');
    });

    it('includes notes when requested', async () => {
      const options: ExportOptions = {
        format: 'txt',
        includeNotes: true,
      };

      const result = await exportService.exportRecording(mockRecording, options);

      expect(result.success).toBe(true);
      expect(result.content).toContain('NOTES');
      expect(result.content).toContain('Some test notes');
    });

    it('handles unsupported format', async () => {
      const options: ExportOptions = {
        format: 'invalid' as any,
      };

      const result = await exportService.exportRecording(mockRecording, options);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported export format');
    });
  });

  describe('exportBatch', () => {
    let recordings: Recording[];

    beforeEach(() => {
      recordings = [
        mockRecording,
        {
          ...mockRecording,
          id: 'test-456',
          title: 'Second Recording',
          transcriptionText: 'Second transcription',
        },
      ];
    });

    it('exports multiple recordings to single file', async () => {
      const options: BatchExportOptions = {
        recordings,
        format: 'txt',
        separateFiles: false,
      };

      const result = await exportService.exportBatch(options);

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(1);
      expect(result.files![0].content).toContain('Test Recording');
      expect(result.files![0].content).toContain('Second Recording');
    });

    it('exports multiple recordings to separate files', async () => {
      const options: BatchExportOptions = {
        recordings,
        format: 'txt',
        separateFiles: true,
      };

      const result = await exportService.exportBatch(options);

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(2);
      expect(result.files![0].content).toContain('Test Recording');
      expect(result.files![1].content).toContain('Second Recording');
    });

    it('exports batch to JSON', async () => {
      const options: BatchExportOptions = {
        recordings,
        format: 'json',
        separateFiles: false,
      };

      const result = await exportService.exportBatch(options);

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(1);

      const parsed = JSON.parse(result.files![0].content);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
    });

    it('exports batch to CSV', async () => {
      const options: BatchExportOptions = {
        recordings,
        format: 'csv',
        separateFiles: false,
      };

      const result = await exportService.exportBatch(options);

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(1);
      expect(result.files![0].content).toContain('ID,Title,Date,Duration');
      expect(result.files![0].content).toContain('test-123');
      expect(result.files![0].content).toContain('test-456');
    });

    it('handles empty recordings array', async () => {
      const options: BatchExportOptions = {
        recordings: [],
        format: 'txt',
      };

      const result = await exportService.exportBatch(options);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No recordings to export');
    });
  });

  describe('generateFilename', () => {
    it('generates filename with title and timestamp', () => {
      const filename = exportService.generateFilename(mockRecording, 'txt');

      expect(filename).toContain('test_recording');
      expect(filename).toContain('.txt');
      expect(filename).toMatch(/\d+/); // Contains timestamp
    });

    it('handles recording without title', () => {
      const recording = { ...mockRecording, title: undefined };
      const filename = exportService.generateFilename(recording, 'md');

      expect(filename).toContain('recording');
      expect(filename).toContain('.md');
    });

    it('sanitizes special characters in title', () => {
      const recording = { ...mockRecording, title: 'Test @ Recording #1!' };
      const filename = exportService.generateFilename(recording, 'json');

      expect(filename).toContain('test___recording__1_');
      expect(filename).not.toContain('@');
      expect(filename).not.toContain('#');
      expect(filename).not.toContain('!');
    });
  });

  describe('exportToClipboard', () => {
    beforeEach(() => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });
    });

    it('exports to clipboard as plain text', async () => {
      const result = await exportService.exportToClipboard(mockRecording, {
        format: 'plain',
      });

      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    it('handles clipboard API failure', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValue(
        new Error('Clipboard error')
      );

      const result = await exportService.exportToClipboard(mockRecording);

      expect(result).toBe(false);
    });
  });

  describe('downloadFile', () => {
    it('creates download link', () => {
      const createElementSpy = jest.spyOn(document, 'createElement');
      const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation();
      const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation();

      exportService.downloadFile('test content', 'test.txt');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });
});
