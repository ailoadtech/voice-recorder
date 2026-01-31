import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  checkMemoryStatus,
  formatBytes,
  getMemoryWarningMessage,
  monitorMemory,
  MEMORY_THRESHOLDS,
  type SystemMemory,
  type MemoryStatus,
} from './resourceMonitoring';

describe('resourceMonitoring', () => {
  describe('checkMemoryStatus', () => {
    it('should return "critical" when available memory is below 2GB', () => {
      const availableMemory = 1.5 * 1024 * 1024 * 1024; // 1.5 GB
      expect(checkMemoryStatus(availableMemory)).toBe('critical');
    });

    it('should return "low" when available memory is between 2GB and 4GB', () => {
      const availableMemory = 3 * 1024 * 1024 * 1024; // 3 GB
      expect(checkMemoryStatus(availableMemory)).toBe('low');
    });

    it('should return "sufficient" when available memory is 4GB or more', () => {
      const availableMemory = 8 * 1024 * 1024 * 1024; // 8 GB
      expect(checkMemoryStatus(availableMemory)).toBe('sufficient');
    });

    it('should handle edge case at exactly 4GB', () => {
      const availableMemory = MEMORY_THRESHOLDS.LOW_MEMORY_BYTES;
      expect(checkMemoryStatus(availableMemory)).toBe('sufficient');
    });

    it('should handle edge case at exactly 2GB', () => {
      const availableMemory = MEMORY_THRESHOLDS.CRITICAL_MEMORY_BYTES;
      expect(checkMemoryStatus(availableMemory)).toBe('low');
    });
  });

  describe('formatBytes', () => {
    it('should format 0 bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });

    it('should format bytes correctly', () => {
      expect(formatBytes(500)).toBe('500 Bytes');
    });

    it('should format kilobytes correctly', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      expect(formatBytes(1.5 * 1024 * 1024)).toBe('1.5 MB');
    });

    it('should format gigabytes correctly', () => {
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
      expect(formatBytes(4.5 * 1024 * 1024 * 1024)).toBe('4.5 GB');
    });

    it('should respect decimal places parameter', () => {
      expect(formatBytes(1536, 0)).toBe('2 KB');
      expect(formatBytes(1536, 3)).toBe('1.5 KB');
    });
  });

  describe('getMemoryWarningMessage', () => {
    it('should return critical warning for critical status', () => {
      const availableMemory = 1.5 * 1024 * 1024 * 1024; // 1.5 GB
      const message = getMemoryWarningMessage('critical', availableMemory);
      expect(message).toContain('Critical');
      expect(message).toContain('1.5 GB');
    });

    it('should return low warning for low status', () => {
      const availableMemory = 3 * 1024 * 1024 * 1024; // 3 GB
      const message = getMemoryWarningMessage('low', availableMemory);
      expect(message).toContain('Warning');
      expect(message).toContain('3 GB');
    });

    it('should return null for sufficient status', () => {
      const availableMemory = 8 * 1024 * 1024 * 1024; // 8 GB
      const message = getMemoryWarningMessage('sufficient', availableMemory);
      expect(message).toBeNull();
    });
  });

  describe('monitorMemory', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.restoreAllMocks();
      jest.useRealTimers();
    });

    it('should stop monitoring when cleanup function is called', () => {
      const mockCallback = jest.fn();
      
      const stopMonitoring = monitorMemory(1000, mockCallback);

      // Stop monitoring immediately
      stopMonitoring();

      // Advance time - callback should not be called
      jest.advanceTimersByTime(5000);

      // Should not have been called since we stopped immediately
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });
});
