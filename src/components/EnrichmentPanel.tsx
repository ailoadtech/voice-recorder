'use client';

import React, { useState } from 'react';
import { LLMService } from '@/services/llm';
import type { EnrichmentType, EnrichmentResult } from '@/services/llm/types';
import { EnrichmentTypeSelector } from './EnrichmentTypeSelector';
import { CustomPromptInput } from './CustomPromptInput';
import { EnrichmentPresetSelector } from './EnrichmentPresetSelector';
import type { EnrichmentPreset } from '@/services/llm/presets';
import { presetToOptions } from '@/services/llm/presets';

interface EnrichmentPanelProps {
  transcribedText: string;
  onEnrichmentComplete?: (result: EnrichmentResult) => void;
  className?: string;
}

export function EnrichmentPanel({
  transcribedText,
  onEnrichmentComplete,
  className = '',
}: EnrichmentPanelProps) {
  const [selectedType, setSelectedType] = useState<EnrichmentType>('format');
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrichedText, setEnrichedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EnrichmentResult | null>(null);

  const llmService = new LLMService();

  const handlePresetSelect = (preset: EnrichmentPreset) => {
    setSelectedPresetId(preset.id);
    setSelectedType(preset.type);
    if (preset.customPrompt) {
      setCustomPrompt(preset.customPrompt);
    }
  };

  const handleTypeChange = (type: EnrichmentType) => {
    setSelectedType(type);
    setSelectedPresetId(undefined);
  };

  const handleProcess = async () => {
    if (!transcribedText.trim()) {
      setError('No text to enrich. Please transcribe audio first.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setEnrichedText('');

    try {
      const options = selectedPresetId
        ? presetToOptions(
            require('@/services/llm/presets').ENRICHMENT_PRESETS.find(
              (p: EnrichmentPreset) => p.id === selectedPresetId
            )!
          )
        : {
            type: selectedType,
            customPrompt: selectedType === 'custom' ? customPrompt : undefined,
          };

      const enrichmentResult = await llmService.enrich(transcribedText, options);
      
      setEnrichedText(enrichmentResult.enrichedText);
      setResult(enrichmentResult);
      
      if (onEnrichmentComplete) {
        onEnrichmentComplete(enrichmentResult);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enrich text';
      setError(errorMessage);
      console.error('Enrichment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (enrichedText) {
      try {
        await navigator.clipboard.writeText(enrichedText);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const canProcess = transcribedText.trim().length > 0 && !isProcessing;

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Preset Selector */}
      <EnrichmentPresetSelector
        selectedPresetId={selectedPresetId}
        onPresetSelect={handlePresetSelect}
        disabled={isProcessing}
      />

      {/* Type Selector */}
      <EnrichmentTypeSelector
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
        disabled={isProcessing}
      />

      {/* Custom Prompt Input (only for custom type) */}
      {selectedType === 'custom' && (
        <CustomPromptInput
          value={customPrompt}
          onChange={setCustomPrompt}
          disabled={isProcessing}
        />
      )}

      {/* Process Button */}
      <div className="flex gap-2">
        <button
          onClick={handleProcess}
          disabled={!canProcess}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : enrichedText ? (
            'Re-process Text'
          ) : (
            'Process Text'
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enriched Output Display */}
      {enrichedText && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Enriched Output
            </label>
            <button
              onClick={handleCopy}
              className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              📋 Copy
            </button>
          </div>
          <div className="rounded-md border border-gray-300 bg-white p-4">
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-900">
              {enrichedText}
            </div>
          </div>
          {result && (
            <div className="flex gap-4 text-xs text-gray-500">
              <span>Model: {result.model}</span>
              {result.processingTime && (
                <span>Time: {(result.processingTime / 1000).toFixed(2)}s</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isProcessing && (
        <div className="flex flex-col items-center justify-center gap-2 py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-sm text-gray-600">Processing your text...</p>
        </div>
      )}
    </div>
  );
}
