/**
 * ModelCorruptionDialog Component
 * Modal dialog for handling corrupted model files with re-download option
 * Requirement 9.4: Offer to re-download corrupted files
 */

'use client';

import React from 'react';
import type { ModelVariant } from '@/services/whisper/types';

export interface ModelCorruptionDialogProps {
  variant: ModelVariant;
  isOpen: boolean;
  onRedownload: () => void;
  onCancel: () => void;
  isRedownloading?: boolean;
}

export const ModelCorruptionDialog: React.FC<ModelCorruptionDialogProps> = ({
  variant,
  isOpen,
  onRedownload,
  onCancel,
  isRedownloading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Corrupted Model File
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Model: <span className="font-semibold capitalize">{variant}</span>
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            The <span className="font-semibold capitalize">{variant}</span> model file is corrupted or failed validation.
          </p>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Possible causes:</strong>
            </p>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside mt-1 space-y-1">
              <li>Download was interrupted</li>
              <li>File integrity check failed</li>
              <li>Disk write error occurred</li>
            </ul>
          </div>

          <p className="text-gray-700 dark:text-gray-300">
            Would you like to delete the corrupted file and re-download it?
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={isRedownloading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onRedownload}
            disabled={isRedownloading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isRedownloading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Re-downloading...
              </>
            ) : (
              <>
                <span>🔄</span>
                Re-download Model
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
