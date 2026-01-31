/**
 * ExportDialog Component
 * Modal dialog for exporting recordings with format and options selection
 */

'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { exportService } from '@/services/export/ExportService';
import { useSettings } from '@/hooks/useSettings';
import type { Recording } from '@/services/storage/types';
import type { ExportFormat, ExportOptions } from '@/services/export/types';

interface ExportDialogProps {
  recording: Recording;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ recording, isOpen, onClose }: ExportDialogProps) {
  const { exportSettings } = useSettings();
  
  // Initialize state with saved settings
  const [format, setFormat] = useState<ExportFormat>(exportSettings.defaultFormat);
  const [includeMetadata, setIncludeMetadata] = useState(exportSettings.includeMetadata);
  const [includeTranscription, setIncludeTranscription] = useState(exportSettings.includeTranscription);
  const [includeEnrichment, setIncludeEnrichment] = useState(exportSettings.includeEnrichment);
  const [includeTags, setIncludeTags] = useState(exportSettings.includeTags);
  const [includeNotes, setIncludeNotes] = useState(exportSettings.includeNotes);
  const [isExporting, setIsExporting] = useState(false);

  // Update state when settings change or dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormat(exportSettings.defaultFormat);
      setIncludeMetadata(exportSettings.includeMetadata);
      setIncludeTranscription(exportSettings.includeTranscription);
      setIncludeEnrichment(exportSettings.includeEnrichment);
      setIncludeTags(exportSettings.includeTags);
      setIncludeNotes(exportSettings.includeNotes);
    }
  }, [isOpen, exportSettings]);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const options: ExportOptions = {
        format,
        includeMetadata,
        includeTranscription,
        includeEnrichment,
        includeTags,
        includeNotes,
        includeTimestamp: true,
      };

      const result = await exportService.exportRecording(recording, options);

      if (result.success && result.content && result.filename) {
        exportService.downloadFile(result.content, result.filename);
        onClose();
      } else {
        alert(`Export failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    setIsExporting(true);
    try {
      const success = await exportService.exportToClipboard(recording, {
        format: 'plain',
        includeFormatting: false,
      });

      if (success) {
        alert('Copied to clipboard!');
        onClose();
      } else {
        alert('Failed to copy to clipboard');
      }
    } catch (error) {
      console.error('Clipboard error:', error);
      alert('Failed to copy to clipboard');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Export Recording</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['txt', 'md', 'json', 'csv'] as ExportFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${
                    format === fmt
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  .{fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Include in Export
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Metadata (date, duration, etc.)</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeTranscription}
                  onChange={(e) => setIncludeTranscription(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 rounded"
                  disabled={!recording.transcriptionText}
                />
                <span className={`text-sm ${recording.transcriptionText ? 'text-gray-700' : 'text-gray-400'}`}>
                  Transcription
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeEnrichment}
                  onChange={(e) => setIncludeEnrichment(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 rounded"
                  disabled={!recording.enrichedText}
                />
                <span className={`text-sm ${recording.enrichedText ? 'text-gray-700' : 'text-gray-400'}`}>
                  Enriched Output
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeTags}
                  onChange={(e) => setIncludeTags(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 rounded"
                  disabled={!recording.tags || recording.tags.length === 0}
                />
                <span className={`text-sm ${recording.tags?.length ? 'text-gray-700' : 'text-gray-400'}`}>
                  Tags
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeNotes}
                  onChange={(e) => setIncludeNotes(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 rounded"
                  disabled={!recording.notes}
                />
                <span className={`text-sm ${recording.notes ? 'text-gray-700' : 'text-gray-400'}`}>
                  Notes
                </span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded p-3 border">
            <div className="text-xs text-gray-600 mb-1">Preview filename:</div>
            <div className="text-sm font-mono text-gray-800">
              {exportService.generateFilename(recording, format)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t bg-gray-50">
          <button
            onClick={handleCopyToClipboard}
            disabled={isExporting}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            📋 Copy to Clipboard
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isExporting ? 'Exporting...' : '💾 Download File'}
          </button>
        </div>
      </div>
    </div>
  );
}
