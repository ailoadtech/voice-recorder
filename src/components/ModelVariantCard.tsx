'use client';

import React from 'react';
import { useState } from 'react';
import type { ModelMetadata, DownloadProgress } from '@/services/whisper/types';

interface ModelVariantCardProps {
  metadata: ModelMetadata;
  isDownloaded: boolean;
  isSelected: boolean;
  isDownloading: boolean;
  downloadProgress: DownloadProgress | null;
  onSelect: () => void;
  onDownload: () => void;
  onDelete?: () => void;
  availableDiskSpace?: number | null;
}

export function ModelVariantCard({
  metadata,
  isDownloaded,
  isSelected,
  isDownloading,
  downloadProgress,
  onSelect,
  onDownload,
  onDelete,
  availableDiskSpace,
}: ModelVariantCardProps) {
  const formatSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
  };

  const getAccuracyLabel = (accuracy: string): string => {
    const labels = {
      good: '⭐ Good',
      better: '⭐⭐ Better',
      best: '⭐⭐⭐ Best',
    };
    return labels[accuracy as keyof typeof labels] || accuracy;
  };

  const getSpeedLabel = (speed: string): string => {
    const labels = {
      fast: '🚀 Fast',
      medium: '⚡ Medium',
      slow: '🐢 Slow',
    };
    return labels[speed as keyof typeof labels] || speed;
  };

  const hasInsufficientSpace = 
    !isDownloaded && 
    availableDiskSpace !== null && 
    availableDiskSpace !== undefined && 
    availableDiskSpace < metadata.size;

  return (
    <div
      className={`
        border rounded-lg p-4 transition-all
        ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'}
        ${isDownloaded ? 'hover:border-blue-400' : 'opacity-75'}
        ${hasInsufficientSpace ? 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold capitalize flex items-center gap-2">
            {metadata.variant}
            {isSelected && (
              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                Selected
              </span>
            )}
            {hasInsufficientSpace && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded flex items-center gap-1">
                ⚠️ Insufficient Space
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatSize(metadata.size)}
            {hasInsufficientSpace && availableDiskSpace !== null && (
              <span className="text-red-600 dark:text-red-400 ml-2">
                (Available: {formatSize(availableDiskSpace)})
              </span>
            )}
          </p>
        </div>
        
        <div className="flex gap-2">
          {isDownloaded && (
            <>
              <button
                onClick={onSelect}
                disabled={isSelected}
                className={`
                  px-3 py-1 rounded text-sm font-medium transition-colors
                  ${
                    isSelected
                      ? 'bg-blue-500 text-white cursor-default'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 hover:text-white'
                  }
                `}
              >
                {isSelected ? 'Selected' : 'Select'}
              </button>
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="px-3 py-1 rounded text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  Delete
                </button>
              )}
            </>
          )}
          
          {!isDownloaded && !isDownloading && (
            <button
              onClick={onDownload}
              disabled={hasInsufficientSpace}
              className={`
                px-3 py-1 rounded text-sm font-medium transition-colors
                ${
                  hasInsufficientSpace
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }
              `}
              title={hasInsufficientSpace ? 'Insufficient disk space' : 'Download model'}
            >
              Download
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div>
          <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
          <div className="font-medium">{getAccuracyLabel(metadata.accuracy)}</div>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Speed:</span>
          <div className="font-medium">{getSpeedLabel(metadata.estimatedSpeed)}</div>
        </div>
      </div>

      {isDownloading && downloadProgress && (
        <div className="mt-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">
              {downloadProgress.status === 'downloading' ? 'Downloading...' : 'Validating...'}
            </span>
            <span className="font-medium">{downloadProgress.percentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress.percentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatSize(downloadProgress.bytesDownloaded)} / {formatSize(downloadProgress.totalBytes)}
          </div>
        </div>
      )}

      {!isDownloaded && !isDownloading && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Not downloaded
        </div>
      )}
    </div>
  );
}
