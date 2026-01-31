'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { ModelVariantCard } from './ModelVariantCard';
import { ModelCorruptionDialog } from './ModelCorruptionDialog';
import type {
  ModelVariant,
  ModelMetadata,
  DownloadProgress,
  TranscriptionSettings,
} from '@/services/whisper/types';
import { getModelManager } from '@/services/whisper/ModelManager';
import { ErrorNotifications, SuccessNotifications } from '@/lib/notifications';

interface ModelSelectionProps {
  settings: TranscriptionSettings;
  onSettingsChange: (settings: TranscriptionSettings) => void;
}

export function ModelSelection({ settings, onSettingsChange }: ModelSelectionProps) {
  const [modelStatuses, setModelStatuses] = useState<Map<ModelVariant, boolean>>(new Map());
  const [downloading, setDownloading] = useState<ModelVariant | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [availableDiskSpace, setAvailableDiskSpace] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [corruptedModel, setCorruptedModel] = useState<ModelVariant | null>(null);
  const [showCorruptionDialog, setShowCorruptionDialog] = useState(false);
  const [isRedownloading, setIsRedownloading] = useState(false);

  const modelManager = getModelManager();

  useEffect(() => {
    checkModels();
    checkDiskSpace();
  }, []);

  const checkModels = async () => {
    try {
      await modelManager.initialize();
      const statuses = new Map<ModelVariant, boolean>();
      const variants: ModelVariant[] = ['tiny', 'base', 'small', 'medium', 'large'];
      
      for (const variant of variants) {
        const downloaded = await modelManager.isModelDownloaded(variant);
        statuses.set(variant, downloaded);
        
        // Check for corruption if file exists but validation failed
        if (!downloaded) {
          const corrupted = await modelManager.isModelCorrupted(variant);
          if (corrupted) {
            // Show corruption dialog for the first corrupted model found
            setCorruptedModel(variant);
            setShowCorruptionDialog(true);
            break; // Only show one dialog at a time
          }
        }
      }
      
      setModelStatuses(statuses);
    } catch (err) {
      setError('Failed to check model status');
      console.error('Failed to check models:', err);
    }
  };

  const checkDiskSpace = async () => {
    try {
      const space = await modelManager.getAvailableDiskSpace();
      setAvailableDiskSpace(space);
    } catch (err) {
      console.error('Failed to check disk space:', err);
    }
  };

  const handleDownloadModel = async (variant: ModelVariant) => {
    setDownloading(variant);
    setError(null);
    
    try {
      // Check disk space before downloading
      const metadata = modelManager.getModelMetadata(variant);
      if (availableDiskSpace !== null && availableDiskSpace < metadata.size) {
        ErrorNotifications.insufficientDiskSpace(
          variant,
          metadata.size,
          availableDiskSpace
        );
        setDownloading(null);
        return;
      }

      await modelManager.downloadModel(variant, (progress) => {
        setDownloadProgress(progress);
      });
      
      setModelStatuses(prev => new Map(prev).set(variant, true));
      
      // Show success notification
      SuccessNotifications.modelDownloaded(variant);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      
      // Determine error type and show appropriate notification
      if (error.message.toLowerCase().includes('network') || 
          error.message.toLowerCase().includes('fetch')) {
        ErrorNotifications.networkError(variant, () => handleDownloadModel(variant));
      } else if (error.message.toLowerCase().includes('checksum') || 
                 error.message.toLowerCase().includes('integrity')) {
        ErrorNotifications.checksumMismatch(variant, () => handleDownloadModel(variant));
      } else if (error.message.toLowerCase().includes('disk') || 
                 error.message.toLowerCase().includes('space')) {
        const metadata = modelManager.getModelMetadata(variant);
        ErrorNotifications.insufficientDiskSpace(
          variant,
          metadata.size,
          availableDiskSpace || 0
        );
      } else {
        ErrorNotifications.downloadFailed(variant, error, () => handleDownloadModel(variant));
      }
      
      console.error('Download failed:', err);
    } finally {
      setDownloading(null);
      setDownloadProgress(null);
      checkDiskSpace();
    }
  };

  const handleDeleteModel = async (variant: ModelVariant) => {
    if (!confirm(`Are you sure you want to delete the ${variant} model?`)) {
      return;
    }

    try {
      await modelManager.deleteModel(variant);
      setModelStatuses(prev => new Map(prev).set(variant, false));
      checkDiskSpace();
      
      SuccessNotifications.modelDeleted(variant);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(`Failed to delete ${variant} model: ${error.message}`);
      console.error('Delete failed:', err);
    }
  };

  const handleCorruptionRedownload = async () => {
    if (!corruptedModel) return;

    setIsRedownloading(true);
    
    try {
      // Delete the corrupted file first
      await modelManager.deleteModel(corruptedModel);
      
      // Close the dialog
      setShowCorruptionDialog(false);
      
      // Start the download
      await handleDownloadModel(corruptedModel);
      
      setCorruptedModel(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(`Failed to re-download ${corruptedModel} model: ${error.message}`);
      console.error('Re-download failed:', err);
    } finally {
      setIsRedownloading(false);
    }
  };

  const handleCorruptionCancel = () => {
    setShowCorruptionDialog(false);
    setCorruptedModel(null);
  };

  const formatDiskSpace = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const canDownload = (metadata: ModelMetadata): boolean => {
    if (availableDiskSpace === null) return true;
    return availableDiskSpace > metadata.size;
  };

  return (
    <div className="space-y-6">
      {/* Corruption Recovery Dialog */}
      {corruptedModel && (
        <ModelCorruptionDialog
          variant={corruptedModel}
          isOpen={showCorruptionDialog}
          onRedownload={handleCorruptionRedownload}
          onCancel={handleCorruptionCancel}
          isRedownloading={isRedownloading}
        />
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3">Transcription Method</h3>
        
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <input
              type="radio"
              name="transcription-method"
              value="api"
              checked={settings.method === 'api'}
              onChange={(e) =>
                onSettingsChange({ ...settings, method: 'api' })
              }
              className="w-4 h-4"
            />
            <div>
              <div className="font-medium">OpenAI API (Cloud)</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Fast, accurate, requires internet connection
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <input
              type="radio"
              name="transcription-method"
              value="local"
              checked={settings.method === 'local'}
              onChange={(e) =>
                onSettingsChange({ ...settings, method: 'local' })
              }
              className="w-4 h-4"
            />
            <div>
              <div className="font-medium">Local Whisper Model (Offline)</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Private, offline, requires model download
              </div>
            </div>
          </label>
        </div>
      </div>

      {settings.method === 'local' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-semibold">Select Model Variant</h4>
            {availableDiskSpace !== null && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Available: {formatDiskSpace(availableDiskSpace)}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-4">
            {modelManager.getAllModelMetadata().map((metadata) => (
              <ModelVariantCard
                key={metadata.variant}
                metadata={metadata}
                isDownloaded={modelStatuses.get(metadata.variant) ?? false}
                isSelected={settings.localModelVariant === metadata.variant}
                isDownloading={downloading === metadata.variant}
                downloadProgress={
                  downloading === metadata.variant ? downloadProgress : null
                }
                onSelect={() =>
                  onSettingsChange({
                    ...settings,
                    localModelVariant: metadata.variant,
                  })
                }
                onDownload={() => handleDownloadModel(metadata.variant)}
                onDelete={() => handleDeleteModel(metadata.variant)}
                availableDiskSpace={availableDiskSpace}
              />
            ))}
          </div>

          {!modelStatuses.get(settings.localModelVariant) && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-700 dark:text-yellow-400 text-sm">
              ⚠️ Selected model ({settings.localModelVariant}) is not downloaded. Please download it to use local transcription.
            </div>
          )}
        </div>
      )}

      <div>
        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <input
            type="checkbox"
            checked={settings.enableFallback}
            onChange={(e) =>
              onSettingsChange({
                ...settings,
                enableFallback: e.target.checked,
              })
            }
            className="w-4 h-4"
          />
          <div>
            <div className="font-medium">Enable API Fallback</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Automatically use API if local transcription fails
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}
