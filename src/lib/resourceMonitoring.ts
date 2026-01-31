import { invoke } from '@tauri-apps/api/core';

/**
 * System memory information in bytes
 */
export interface SystemMemory {
  total: number;      // Total system memory in bytes
  available: number;  // Available memory in bytes
  used: number;       // Used memory in bytes
  free: number;       // Free memory in bytes
}

/**
 * Memory warning thresholds
 */
export const MEMORY_THRESHOLDS = {
  LOW_MEMORY_GB: 4,           // Warn when available memory is below 4GB
  CRITICAL_MEMORY_GB: 2,      // Critical warning when below 2GB
  LOW_MEMORY_BYTES: 4 * 1024 * 1024 * 1024,      // 4GB in bytes
  CRITICAL_MEMORY_BYTES: 2 * 1024 * 1024 * 1024, // 2GB in bytes
};

/**
 * Memory status levels
 */
export type MemoryStatus = 'sufficient' | 'low' | 'critical';

/**
 * Get current system memory information
 * @returns System memory statistics
 */
export async function getSystemMemory(): Promise<SystemMemory> {
  try {
    return await invoke<SystemMemory>('get_system_memory');
  } catch (error) {
    console.error('Failed to get system memory:', error);
    throw new Error(`Failed to get system memory: ${error}`);
  }
}

/**
 * Check if system has sufficient memory for local transcription
 * @param availableMemory - Available memory in bytes
 * @returns Memory status level
 */
export function checkMemoryStatus(availableMemory: number): MemoryStatus {
  if (availableMemory < MEMORY_THRESHOLDS.CRITICAL_MEMORY_BYTES) {
    return 'critical';
  } else if (availableMemory < MEMORY_THRESHOLDS.LOW_MEMORY_BYTES) {
    return 'low';
  }
  return 'sufficient';
}

/**
 * Format bytes to human-readable format
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "4.5 GB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Get memory warning message based on status
 * @param status - Memory status level
 * @param availableMemory - Available memory in bytes
 * @returns Warning message or null if no warning needed
 */
export function getMemoryWarningMessage(
  status: MemoryStatus,
  availableMemory: number
): string | null {
  switch (status) {
    case 'critical':
      return `Critical: Only ${formatBytes(availableMemory)} of memory available. Local transcription may fail. Consider using API transcription or closing other applications.`;
    case 'low':
      return `Warning: Only ${formatBytes(availableMemory)} of memory available. Local transcription may be slow. Consider using a smaller model variant or API transcription.`;
    case 'sufficient':
      return null;
  }
}

/**
 * Monitor memory periodically and invoke callback when status changes
 * @param intervalMs - Monitoring interval in milliseconds (default: 30000 = 30 seconds)
 * @param onStatusChange - Callback invoked when memory status changes
 * @returns Function to stop monitoring
 */
export function monitorMemory(
  intervalMs: number = 30000,
  onStatusChange: (status: MemoryStatus, memory: SystemMemory) => void
): () => void {
  let lastStatus: MemoryStatus | null = null;
  let intervalId: NodeJS.Timeout | null = null;

  const checkMemory = async () => {
    try {
      const memory = await getSystemMemory();
      const currentStatus = checkMemoryStatus(memory.available);

      if (currentStatus !== lastStatus) {
        lastStatus = currentStatus;
        onStatusChange(currentStatus, memory);
      }
    } catch (error) {
      console.error('Memory monitoring error:', error);
    }
  };

  // Check immediately
  checkMemory();

  // Then check periodically
  intervalId = setInterval(checkMemory, intervalMs);

  // Return cleanup function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}
