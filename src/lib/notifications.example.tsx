/**
 * Example usage of the notification system
 * 
 * This file demonstrates how to use the toast notification system
 * in various scenarios throughout the application.
 */

import { ErrorNotifications, SuccessNotifications, showToast } from './notifications';

// ============================================================================
// EXAMPLE 1: Model Download Success
// ============================================================================
export function handleModelDownloadSuccess(variant: string) {
  SuccessNotifications.modelDownloaded(variant);
}

// ============================================================================
// EXAMPLE 2: Model Download Failure with Retry
// ============================================================================
export function handleModelDownloadFailure(
  variant: string,
  error: Error,
  retryFn: () => void
) {
  ErrorNotifications.downloadFailed(variant, error, retryFn);
}

// ============================================================================
// EXAMPLE 3: Insufficient Disk Space
// ============================================================================
export function checkDiskSpaceBeforeDownload(
  variant: string,
  requiredBytes: number,
  availableBytes: number
): boolean {
  if (availableBytes < requiredBytes) {
    ErrorNotifications.insufficientDiskSpace(variant, requiredBytes, availableBytes);
    return false;
  }
  return true;
}

// ============================================================================
// EXAMPLE 4: Corrupted Model Detection
// ============================================================================
export function handleCorruptedModel(variant: string, redownloadFn: () => void) {
  ErrorNotifications.corruptedModel(variant, redownloadFn);
}

// ============================================================================
// EXAMPLE 5: Transcription with Fallback
// ============================================================================
export async function transcribeWithFallback(
  audioData: ArrayBuffer,
  localTranscribeFn: (data: ArrayBuffer) => Promise<string>,
  apiTranscribeFn: (data: ArrayBuffer) => Promise<string>,
  fallbackEnabled: boolean
): Promise<string> {
  try {
    return await localTranscribeFn(audioData);
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    
    if (fallbackEnabled) {
      ErrorNotifications.fallbackToApi(err.message);
      return await apiTranscribeFn(audioData);
    } else {
      ErrorNotifications.transcriptionFailed(err, false);
      throw error;
    }
  }
}

// ============================================================================
// EXAMPLE 6: Low Memory Warning
// ============================================================================
export function checkSystemMemory(availableMemoryGB: number) {
  if (availableMemoryGB < 4) {
    ErrorNotifications.lowMemoryWarning(availableMemoryGB);
  }
}

// ============================================================================
// EXAMPLE 7: Network Error with Retry
// ============================================================================
export async function downloadWithRetry(
  variant: string,
  downloadFn: () => Promise<void>,
  maxRetries: number = 3
): Promise<void> {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      await downloadFn();
      SuccessNotifications.modelDownloaded(variant);
      return;
    } catch (error) {
      attempts++;
      
      if (attempts >= maxRetries) {
        const err = error instanceof Error ? error : new Error('Download failed');
        ErrorNotifications.networkError(variant, () => downloadWithRetry(variant, downloadFn, maxRetries));
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  }
}

// ============================================================================
// EXAMPLE 8: Checksum Validation
// ============================================================================
export async function validateModelChecksum(
  variant: string,
  filePath: string,
  expectedChecksum: string,
  calculateChecksumFn: (path: string) => Promise<string>,
  redownloadFn: () => void
): Promise<boolean> {
  try {
    const actualChecksum = await calculateChecksumFn(filePath);
    
    if (actualChecksum !== expectedChecksum) {
      ErrorNotifications.checksumMismatch(variant, redownloadFn);
      return false;
    }
    
    return true;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Checksum validation failed');
    ErrorNotifications.checksumMismatch(variant, redownloadFn);
    return false;
  }
}

// ============================================================================
// EXAMPLE 9: Custom Toast for Specific Scenarios
// ============================================================================
export function showCustomWarning(message: string, actionLabel?: string, actionFn?: () => void) {
  showToast('warning', 'Warning', message, {
    action: actionLabel && actionFn ? {
      label: actionLabel,
      onClick: actionFn,
    } : undefined,
    duration: 8000,
  });
}

// ============================================================================
// EXAMPLE 10: Model Deletion Confirmation
// ============================================================================
export async function deleteModelWithConfirmation(
  variant: string,
  deleteFn: () => Promise<void>
): Promise<boolean> {
  const confirmed = confirm(`Are you sure you want to delete the ${variant} model?`);
  
  if (!confirmed) {
    return false;
  }
  
  try {
    await deleteFn();
    SuccessNotifications.modelDeleted(variant);
    return true;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Deletion failed');
    showToast('error', 'Deletion Failed', `Failed to delete ${variant} model: ${err.message}`, {
      duration: 0,
    });
    return false;
  }
}

// ============================================================================
// EXAMPLE 11: Complete Download Flow
// ============================================================================
export async function completeDownloadFlow(
  variant: string,
  metadata: { size: number; checksum: string },
  getAvailableSpace: () => Promise<number>,
  downloadModel: (onProgress: (progress: number) => void) => Promise<string>,
  validateChecksum: (path: string) => Promise<boolean>
): Promise<boolean> {
  // Step 1: Check disk space
  const availableSpace = await getAvailableSpace();
  if (!checkDiskSpaceBeforeDownload(variant, metadata.size, availableSpace)) {
    return false;
  }
  
  // Step 2: Check memory
  const availableMemory = 8; // Get from system
  checkSystemMemory(availableMemory);
  
  // Step 3: Download with progress
  let modelPath: string;
  try {
    modelPath = await downloadModel((progress) => {
      // Update UI with progress
      console.log(`Download progress: ${progress}%`);
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Download failed');
    ErrorNotifications.downloadFailed(variant, err, () => 
      completeDownloadFlow(variant, metadata, getAvailableSpace, downloadModel, validateChecksum)
    );
    return false;
  }
  
  // Step 4: Validate checksum
  const isValid = await validateModelChecksum(
    variant,
    modelPath,
    metadata.checksum,
    async (path) => 'calculated-checksum',
    () => completeDownloadFlow(variant, metadata, getAvailableSpace, downloadModel, validateChecksum)
  );
  
  if (!isValid) {
    return false;
  }
  
  // Step 5: Success
  SuccessNotifications.modelDownloaded(variant);
  return true;
}
