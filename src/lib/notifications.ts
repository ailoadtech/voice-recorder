import type { ToastMessage, ToastType } from '@/components/Toast';

let toastIdCounter = 0;

function generateToastId(): string {
  return `toast-${Date.now()}-${toastIdCounter++}`;
}

export function showToast(
  type: ToastType,
  title: string,
  message: string,
  options?: {
    action?: {
      label: string;
      onClick: () => void;
    };
    duration?: number;
  }
): void {
  if (typeof window === 'undefined') return;

  const toast: ToastMessage = {
    id: generateToastId(),
    type,
    title,
    message,
    action: options?.action,
    duration: options?.duration,
  };

  window.dispatchEvent(new CustomEvent('show-toast', { detail: toast }));
}

/**
 * Error notification utilities for model download and transcription errors
 */
export const ErrorNotifications = {
  /**
   * Show error when model download fails
   * Requirement 9.1: Display specific error reason and suggested actions
   */
  downloadFailed(variant: string, error: Error, retryAction?: () => void): void {
    const errorMessage = formatDownloadError(error);
    
    showToast('error', `Failed to download ${variant} model`, errorMessage, {
      action: retryAction
        ? {
            label: 'Retry Download',
            onClick: retryAction,
          }
        : undefined,
      duration: 0, // Don't auto-dismiss errors
    });
  },

  /**
   * Show error when insufficient disk space prevents download
   * Requirement 9.3: Notify user with space requirements
   */
  insufficientDiskSpace(
    variant: string,
    required: number,
    available: number
  ): void {
    const requiredGB = (required / (1024 * 1024 * 1024)).toFixed(2);
    const availableGB = (available / (1024 * 1024 * 1024)).toFixed(2);
    const needToFree = ((required - available) / (1024 * 1024 * 1024)).toFixed(2);

    showToast(
      'error',
      'Insufficient Disk Space',
      `Cannot download ${variant} model.\n\nRequired: ${requiredGB} GB\nAvailable: ${availableGB} GB\n\nPlease free up at least ${needToFree} GB of disk space and try again.`,
      {
        duration: 0,
      }
    );
  },

  /**
   * Show error when model file is corrupted
   * Requirement 9.4: Offer to re-download corrupted files
   */
  corruptedModel(variant: string, redownloadAction: () => void): void {
    showToast(
      'error',
      'Corrupted Model File',
      `The ${variant} model file is corrupted or invalid.\n\nWould you like to re-download it?`,
      {
        action: {
          label: 'Re-download Model',
          onClick: redownloadAction,
        },
        duration: 0,
      }
    );
  },

  /**
   * Show error when local transcription fails
   * Requirement 9.2: Provide actionable error messages
   */
  transcriptionFailed(error: Error, fallbackAvailable: boolean): void {
    const errorMessage = formatTranscriptionError(error);
    const message = fallbackAvailable
      ? `${errorMessage}\n\nAttempting to use API fallback...`
      : `${errorMessage}\n\nPlease check your settings and try again.`;

    showToast('error', 'Transcription Failed', message, {
      duration: fallbackAvailable ? 5000 : 0,
    });
  },

  /**
   * Show error when model loading fails
   */
  modelLoadFailed(variant: string, error: Error): void {
    const errorMessage = formatModelLoadError(error);
    
    showToast(
      'error',
      `Failed to load ${variant} model`,
      `${errorMessage}\n\nThe model may be corrupted or incompatible with your system.`,
      {
        duration: 0,
      }
    );
  },

  /**
   * Show error when network request fails during download
   */
  networkError(variant: string, retryAction?: () => void): void {
    showToast(
      'error',
      'Network Error',
      `Failed to download ${variant} model due to network issues.\n\nPlease check your internet connection and try again.`,
      {
        action: retryAction
          ? {
              label: 'Retry Download',
              onClick: retryAction,
            }
          : undefined,
        duration: 0,
      }
    );
  },

  /**
   * Show error when checksum validation fails
   */
  checksumMismatch(variant: string, redownloadAction: () => void): void {
    showToast(
      'error',
      'Download Verification Failed',
      `The downloaded ${variant} model file failed integrity check.\n\nThe file may be corrupted. Would you like to try downloading again?`,
      {
        action: {
          label: 'Re-download Model',
          onClick: redownloadAction,
        },
        duration: 0,
      }
    );
  },

  /**
   * Show warning when system resources are low
   * Requirement 10.4: Warn users about performance issues
   */
  lowMemoryWarning(availableMemoryGB: number): void {
    showToast(
      'warning',
      'Low System Memory',
      `Your system has only ${availableMemoryGB.toFixed(1)} GB of available memory.\n\nLocal transcription may be slow or fail. Consider using a smaller model variant or API transcription.`,
      {
        duration: 10000,
      }
    );
  },

  /**
   * Show info when fallback to API occurs
   * Requirement 6.3: Notify user about fallback and reason
   */
  fallbackToApi(reason: string): void {
    showToast(
      'info',
      'Using API Fallback',
      `Local transcription failed: ${reason}\n\nAutomatically switching to API transcription.`,
      {
        duration: 5000,
      }
    );
  },
};

/**
 * Success notification utilities
 */
export const SuccessNotifications = {
  modelDownloaded(variant: string): void {
    showToast(
      'success',
      'Download Complete',
      `${variant} model has been successfully downloaded and is ready to use.`,
      {
        duration: 5000,
      }
    );
  },

  modelDeleted(variant: string): void {
    showToast(
      'success',
      'Model Deleted',
      `${variant} model has been removed from your system.`,
      {
        duration: 3000,
      }
    );
  },

  transcriptionComplete(): void {
    showToast(
      'success',
      'Transcription Complete',
      'Your audio has been successfully transcribed.',
      {
        duration: 3000,
      }
    );
  },
};

/**
 * Format download error messages with specific details
 */
function formatDownloadError(error: Error): string {
  const message = error.message.toLowerCase();

  if (message.includes('network') || message.includes('fetch')) {
    return 'Network connection failed. Please check your internet connection.';
  }

  if (message.includes('timeout')) {
    return 'Download timed out. Please try again.';
  }

  if (message.includes('disk') || message.includes('space')) {
    return 'Insufficient disk space. Please free up space and try again.';
  }

  if (message.includes('permission')) {
    return 'Permission denied. Please check file system permissions.';
  }

  if (message.includes('checksum') || message.includes('integrity')) {
    return 'File integrity check failed. The download may be corrupted.';
  }

  return error.message || 'An unknown error occurred during download.';
}

/**
 * Format transcription error messages
 */
function formatTranscriptionError(error: Error): string {
  const message = error.message.toLowerCase();

  if (message.includes('memory') || message.includes('oom')) {
    return 'Insufficient memory to process audio. Try using a smaller model variant.';
  }

  if (message.includes('model') && message.includes('load')) {
    return 'Failed to load the transcription model. The model file may be corrupted.';
  }

  if (message.includes('audio') && message.includes('format')) {
    return 'Unsupported audio format. Please ensure the audio is in a compatible format.';
  }

  if (message.includes('timeout')) {
    return 'Transcription timed out. The audio may be too long or complex.';
  }

  return error.message || 'An error occurred during transcription.';
}

/**
 * Format model loading error messages
 */
function formatModelLoadError(error: Error): string {
  const message = error.message.toLowerCase();

  if (message.includes('not found') || message.includes('missing')) {
    return 'Model file not found. Please download the model again.';
  }

  if (message.includes('corrupted') || message.includes('invalid')) {
    return 'Model file is corrupted or invalid.';
  }

  if (message.includes('memory')) {
    return 'Insufficient memory to load the model.';
  }

  if (message.includes('incompatible') || message.includes('version')) {
    return 'Model version is incompatible with this application.';
  }

  return error.message || 'Failed to load the model.';
}
