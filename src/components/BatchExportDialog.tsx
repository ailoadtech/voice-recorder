/**
 * BatchExportDialog Component
 * Modal dialog for exporting multiple recordings at once
 */

'use client';

import React from 'react';
import { useState } from 'react';
import { exportService } from '@/services/export/ExportService';
import type { Recording } from '@/services/storage/types';
import type { ExportFormat, BatchExportOptions } from '@/services/export/types';

interface BatchExportDialogProps {
  recordings: Recording[];
  isOpen: boolean;
  onClose: () => void;
}

export function BatchExportDialog({ recordings, isOpen, onClose }: BatchExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('txt');
  const [separateFiles, setSeparateFiles] = useState(false);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeTranscription, setIncludeTranscription] = useState(true);
  const [includeEnrichment, setIncludeEnrichment] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const options: BatchExportOptions = {
        recordings,
        format,
        separateFiles,
        includeMetadata,
        includeTranscription,
        includeEnrichment,
        includeTimestamp: true,
        includeTags: true,
        includeNotes: true,
      };

      const result = await exportService.exportBatch(options);

      if (result.success && result.files) {
        // Download each file
        result.files.forEach((file) => {
          exportService.downloadFile(file.content, file.filename);
        });
        
        alert(`Successfully exported ${result.files.length} file(s)`);
        onClose();
      } else {
        alert(`Export failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Batch export error:', error);
      alert('Batch export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Batch Export</h2>
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
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-800">
              Exporting <strong>{recordings.length}</strong> recording{recordings.length !== 1 ? 's' : ''}
            </p>
          </div>

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

          {/* File Organization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Organization
            </label>
            <div className="space-y-2">
              <label className="flex items-start">
                <input
                  type="radio"
                  checked={!separateFiles}
                  onChange={() => setSeparateFiles(false)}
                  className="mr-2 mt-1 h-4 w-4 text-blue-600"
                />
                <div>
                  <div className="text-sm font-medium text-gray-700">Single File</div>
                  <div className="text-xs text-gray-500">
                    Combine all recordings into one file
                  </div>
                </div>
              </label>

              <label className="flex items-start">
                <input
                  type="radio"
                  checked={separateFiles}
                  onChange={() => setSeparateFiles(true)}
                  className="mr-2 mt-1 h-4 w-4 text-blue-600"
                />
                <div>
                  <div className="text-sm font-medium text-gray-700">Separate Files</div>
                  <div className="text-xs text-gray-500">
                    Create individual files for each recording
                  </div>
                </div>
              </label>
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
                <span className="text-sm text-gray-700">Metadata</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeTranscription}
                  onChange={(e) => setIncludeTranscription(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Transcription</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeEnrichment}
                  onChange={(e) => setIncludeEnrichment(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Enriched Output</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isExporting ? 'Exporting...' : '💾 Export'}
          </button>
        </div>
      </div>
    </div>
  );
}
