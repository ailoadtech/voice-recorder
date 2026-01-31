/**
 * ExportSettings Component
 * UI for configuring default export format and options
 */

'use client';

import { useSettings } from '@/hooks/useSettings';
import type { ExportFormat } from '@/services/export/types';

export function ExportSettings() {
  const { exportSettings, updateExportSettings } = useSettings();

  const formats: Array<{ value: ExportFormat; label: string; description: string }> = [
    { value: 'txt', label: 'Plain Text (.txt)', description: 'Simple text format' },
    { value: 'md', label: 'Markdown (.md)', description: 'Formatted markdown' },
    { value: 'json', label: 'JSON (.json)', description: 'Structured data' },
    { value: 'csv', label: 'CSV (.csv)', description: 'Spreadsheet format' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Export Settings</h3>
        <p className="text-sm text-gray-600 mb-4">
          Configure default export format and options. These settings will be used as defaults when exporting recordings.
        </p>
      </div>

      {/* Default Format */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Export Format
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {formats.map((format) => (
            <button
              key={format.value}
              onClick={() => updateExportSettings({ defaultFormat: format.value })}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                exportSettings.defaultFormat === format.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="font-medium text-sm">{format.label}</div>
              <div className="text-xs text-gray-500 mt-1">{format.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Default Export Options
        </label>
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={exportSettings.includeMetadata}
              onChange={(e) => updateExportSettings({ includeMetadata: e.target.checked })}
              className="mt-1 mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-700">Include Metadata</div>
              <div className="text-xs text-gray-500">Date, duration, and other recording details</div>
            </div>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              checked={exportSettings.includeTranscription}
              onChange={(e) => updateExportSettings({ includeTranscription: e.target.checked })}
              className="mt-1 mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-700">Include Transcription</div>
              <div className="text-xs text-gray-500">Original transcribed text from audio</div>
            </div>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              checked={exportSettings.includeEnrichment}
              onChange={(e) => updateExportSettings({ includeEnrichment: e.target.checked })}
              className="mt-1 mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-700">Include Enriched Output</div>
              <div className="text-xs text-gray-500">AI-processed and formatted text</div>
            </div>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              checked={exportSettings.includeTags}
              onChange={(e) => updateExportSettings({ includeTags: e.target.checked })}
              className="mt-1 mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-700">Include Tags</div>
              <div className="text-xs text-gray-500">Recording tags and categories</div>
            </div>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              checked={exportSettings.includeNotes}
              onChange={(e) => updateExportSettings({ includeNotes: e.target.checked })}
              className="mt-1 mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-700">Include Notes</div>
              <div className="text-xs text-gray-500">User-added notes and comments</div>
            </div>
          </label>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-blue-600 mr-2">ℹ️</span>
          <div className="text-sm text-blue-800">
            <strong>Note:</strong> These are default settings. You can still customize options for each individual export.
          </div>
        </div>
      </div>
    </div>
  );
}
