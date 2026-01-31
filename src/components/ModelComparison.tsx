'use client';

import React from 'react';
import { useState, useMemo } from 'react';
import type { ModelMetadata, ModelVariant } from '@/services/whisper/types';

interface ModelComparisonProps {
  models: ModelMetadata[];
  downloadedModels: Set<ModelVariant>;
  onSelectModel?: (variant: ModelVariant) => void;
}

type SortKey = 'variant' | 'size' | 'accuracy' | 'speed';
type SortOrder = 'asc' | 'desc';

export function ModelComparison({
  models,
  downloadedModels,
  onSelectModel,
}: ModelComparisonProps) {
  const [sortKey, setSortKey] = useState<SortKey>('size');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const formatSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
  };

  const getAccuracyScore = (accuracy: string): number => {
    const scores = { good: 1, better: 2, best: 3 };
    return scores[accuracy as keyof typeof scores] || 0;
  };

  const getSpeedScore = (speed: string): number => {
    const scores = { fast: 3, medium: 2, slow: 1 };
    return scores[speed as keyof typeof scores] || 0;
  };

  const sortedModels = useMemo(() => {
    return [...models].sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case 'variant':
          comparison = a.variant.localeCompare(b.variant);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'accuracy':
          comparison = getAccuracyScore(a.accuracy) - getAccuracyScore(b.accuracy);
          break;
        case 'speed':
          comparison = getSpeedScore(a.estimatedSpeed) - getSpeedScore(b.estimatedSpeed);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [models, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th
              className="p-3 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={() => handleSort('variant')}
            >
              <div className="flex items-center gap-2">
                Model Variant
                <span className="text-xs">{getSortIcon('variant')}</span>
              </div>
            </th>
            <th
              className="p-3 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={() => handleSort('size')}
            >
              <div className="flex items-center gap-2">
                Size
                <span className="text-xs">{getSortIcon('size')}</span>
              </div>
            </th>
            <th
              className="p-3 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={() => handleSort('accuracy')}
            >
              <div className="flex items-center gap-2">
                Accuracy
                <span className="text-xs">{getSortIcon('accuracy')}</span>
              </div>
            </th>
            <th
              className="p-3 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={() => handleSort('speed')}
            >
              <div className="flex items-center gap-2">
                Speed
                <span className="text-xs">{getSortIcon('speed')}</span>
              </div>
            </th>
            <th className="p-3 text-left">Status</th>
            {onSelectModel && <th className="p-3 text-left">Action</th>}
          </tr>
        </thead>
        <tbody>
          {sortedModels.map((model) => {
            const isDownloaded = downloadedModels.has(model.variant);
            
            return (
              <tr
                key={model.variant}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="p-3 font-medium capitalize">{model.variant}</td>
                <td className="p-3">{formatSize(model.size)}</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1">
                    {model.accuracy === 'good' && '⭐'}
                    {model.accuracy === 'better' && '⭐⭐'}
                    {model.accuracy === 'best' && '⭐⭐⭐'}
                    <span className="capitalize">{model.accuracy}</span>
                  </span>
                </td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1">
                    {model.estimatedSpeed === 'fast' && '🚀'}
                    {model.estimatedSpeed === 'medium' && '⚡'}
                    {model.estimatedSpeed === 'slow' && '🐢'}
                    <span className="capitalize">{model.estimatedSpeed}</span>
                  </span>
                </td>
                <td className="p-3">
                  {isDownloaded ? (
                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                      ✓ Downloaded
                    </span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      Not downloaded
                    </span>
                  )}
                </td>
                {onSelectModel && (
                  <td className="p-3">
                    <button
                      onClick={() => onSelectModel(model.variant)}
                      disabled={!isDownloaded}
                      className={`
                        px-3 py-1 rounded text-sm font-medium transition-colors
                        ${
                          isDownloaded
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                        }
                      `}
                    >
                      Select
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-semibold mb-2">Comparison Guide</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>Size:</strong>
            <p className="text-gray-600 dark:text-gray-400">
              Smaller models download faster and use less disk space
            </p>
          </div>
          <div>
            <strong>Accuracy:</strong>
            <p className="text-gray-600 dark:text-gray-400">
              Larger models generally provide better transcription accuracy
            </p>
          </div>
          <div>
            <strong>Speed:</strong>
            <p className="text-gray-600 dark:text-gray-400">
              Smaller models transcribe faster, especially on limited hardware
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
