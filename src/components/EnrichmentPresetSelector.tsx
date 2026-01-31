'use client';

import React from 'react';
import { ENRICHMENT_PRESETS, type EnrichmentPreset } from '@/services/llm/presets';

interface EnrichmentPresetSelectorProps {
  selectedPresetId?: string;
  onPresetSelect: (preset: EnrichmentPreset) => void;
  disabled?: boolean;
  className?: string;
}

export function EnrichmentPresetSelector({
  selectedPresetId,
  onPresetSelect,
  disabled = false,
  className = '',
}: EnrichmentPresetSelectorProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">
        Quick Presets
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {ENRICHMENT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onPresetSelect(preset)}
            disabled={disabled}
            className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-all hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${
              selectedPresetId === preset.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-white'
            }`}
            title={preset.description}
          >
            <span className="text-2xl">{preset.icon}</span>
            <span className="text-xs font-medium text-gray-700">
              {preset.name}
            </span>
          </button>
        ))}
      </div>
      {selectedPresetId && (
        <p className="text-xs text-gray-500">
          {ENRICHMENT_PRESETS.find(p => p.id === selectedPresetId)?.description}
        </p>
      )}
    </div>
  );
}
