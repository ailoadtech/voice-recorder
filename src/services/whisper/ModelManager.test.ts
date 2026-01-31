import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { ModelManager } from './ModelManager';
import type { ModelVariant } from './types';

// Mock Tauri APIs
jest.mock('@tauri-apps/api/core', () => ({
  invoke: jest.fn(),
}));

jest.mock('@tauri-apps/api/event', () => ({
  listen: jest.fn(() => Promise.resolve(() => {})),
}));

import { invoke } from '@tauri-apps/api/core';

const mockInvoke = invoke as jest.MockedFunction<typeof invoke>;

describe('ModelManager - Startup Validation', () => {
  let modelManager: ModelManager;
  const mockModelsDirectory = '/mock/models/directory';

  beforeEach(() => {
    jest.clearAllMocks();
    modelManager = new ModelManager();
    
    // Mock get_models_directory
    mockInvoke.mockImplementation(<T>(cmd: string): Promise<T> => {
      if (cmd === 'get_models_directory') {
        return Promise.resolve(mockModelsDirectory as T);
      }
      return Promise.reject(new Error(`Unmocked command: ${cmd}`));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('validateAllModelsOnStartup', () => {
    it('should validate all model variants on startup', async () => {
      // Mock file_exists to return true for tiny and base models
      // Mock calculate_file_checksum to return correct checksums
      mockInvoke.mockImplementation(<T>(cmd: string, args?: any): Promise<T> => {
        if (cmd === 'get_models_directory') {
          return Promise.resolve(mockModelsDirectory as T);
        }
        if (cmd === 'file_exists') {
          const path = args?.path || '';
          return Promise.resolve(
            (path.includes('tiny') || path.includes('base')) as T
          );
        }
        if (cmd === 'calculate_file_checksum') {
          const path = args?.path || '';
          if (path.includes('tiny')) {
            return Promise.resolve('bd577a113a864445d4c299885e0cb97d4ba92b5f0a0f1e2d3b4c5d6e7f8a9b0c' as T);
          }
          if (path.includes('base')) {
            return Promise.resolve('cd577a113a864445d4c299885e0cb97d4ba92b5f0a0f1e2d3b4c5d6e7f8a9b0d' as T);
          }
          return Promise.resolve('invalid-checksum' as T);
        }
        return Promise.reject(new Error(`Unmocked command: ${cmd}`));
      });

      const results = await modelManager.validateAllModelsOnStartup();

      expect(results).toHaveLength(5);
      
      // Tiny model should be valid
      const tinyResult = results.find(r => r.variant === 'tiny');
      expect(tinyResult).toEqual({
        variant: 'tiny',
        exists: true,
        valid: true,
        removed: false,
      });

      // Base model should be valid
      const baseResult = results.find(r => r.variant === 'base');
      expect(baseResult).toEqual({
        variant: 'base',
        exists: true,
        valid: true,
        removed: false,
      });

      // Other models should not exist
      const smallResult = results.find(r => r.variant === 'small');
      expect(smallResult).toEqual({
        variant: 'small',
        exists: false,
        valid: false,
        removed: false,
      });
    });

    it('should remove corrupted models automatically', async () => {
      const deletedModels: string[] = [];

      mockInvoke.mockImplementation(<T>(cmd: string, args?: any): Promise<T> => {
        if (cmd === 'get_models_directory') {
          return Promise.resolve(mockModelsDirectory as T);
        }
        if (cmd === 'file_exists') {
          const path = args?.path || '';
          // Tiny model exists but is corrupted
          return Promise.resolve(path.includes('tiny') as T);
        }
        if (cmd === 'calculate_file_checksum') {
          // Return wrong checksum for tiny model
          return Promise.resolve('wrong-checksum' as T);
        }
        if (cmd === 'delete_file') {
          deletedModels.push(args?.path || '');
          return Promise.resolve(undefined as T);
        }
        return Promise.reject(new Error(`Unmocked command: ${cmd}`));
      });

      const results = await modelManager.validateAllModelsOnStartup();

      // Tiny model should be marked as removed
      const tinyResult = results.find(r => r.variant === 'tiny');
      expect(tinyResult).toEqual({
        variant: 'tiny',
        exists: true,
        valid: false,
        removed: true,
      });

      // Verify delete_file was called
      expect(deletedModels).toHaveLength(1);
      expect(deletedModels[0]).toContain('tiny');
    });

    it('should handle validation errors gracefully', async () => {
      mockInvoke.mockImplementation(<T>(cmd: string, args?: any): Promise<T> => {
        if (cmd === 'get_models_directory') {
          return Promise.resolve(mockModelsDirectory as T);
        }
        if (cmd === 'file_exists') {
          const path = args?.path || '';
          if (path.includes('tiny')) {
            // Simulate error for tiny model
            return Promise.reject(new Error('File system error'));
          }
          return Promise.resolve(false as T);
        }
        return Promise.reject(new Error(`Unmocked command: ${cmd}`));
      });

      const results = await modelManager.validateAllModelsOnStartup();

      // Should still return results for all models
      expect(results).toHaveLength(5);

      // Tiny model should be marked as not existing due to error
      const tinyResult = results.find(r => r.variant === 'tiny');
      expect(tinyResult).toEqual({
        variant: 'tiny',
        exists: false,
        valid: false,
        removed: false,
      });
    });

    it('should validate checksums for all existing models', async () => {
      const checksumCalls: string[] = [];

      mockInvoke.mockImplementation(<T>(cmd: string, args?: any): Promise<T> => {
        if (cmd === 'get_models_directory') {
          return Promise.resolve(mockModelsDirectory as T);
        }
        if (cmd === 'file_exists') {
          // All models exist
          return Promise.resolve(true as T);
        }
        if (cmd === 'calculate_file_checksum') {
          const path = args?.path || '';
          checksumCalls.push(path);
          
          // Return correct checksums for all models
          if (path.includes('tiny')) {
            return Promise.resolve('bd577a113a864445d4c299885e0cb97d4ba92b5f0a0f1e2d3b4c5d6e7f8a9b0c' as T);
          }
          if (path.includes('base')) {
            return Promise.resolve('cd577a113a864445d4c299885e0cb97d4ba92b5f0a0f1e2d3b4c5d6e7f8a9b0d' as T);
          }
          if (path.includes('small')) {
            return Promise.resolve('de577a113a864445d4c299885e0cb97d4ba92b5f0a0f1e2d3b4c5d6e7f8a9b0e' as T);
          }
          if (path.includes('medium')) {
            return Promise.resolve('ee577a113a864445d4c299885e0cb97d4ba92b5f0a0f1e2d3b4c5d6e7f8a9b0f' as T);
          }
          if (path.includes('large')) {
            return Promise.resolve('fe577a113a864445d4c299885e0cb97d4ba92b5f0a0f1e2d3b4c5d6e7f8a9b10' as T);
          }
          return Promise.resolve('invalid' as T);
        }
        return Promise.reject(new Error(`Unmocked command: ${cmd}`));
      });

      const results = await modelManager.validateAllModelsOnStartup();

      // All models should be valid
      expect(results.every(r => r.valid)).toBe(true);
      
      // Checksum should be calculated for all 5 models
      expect(checksumCalls).toHaveLength(5);
    });

    it('should not remove valid models', async () => {
      const deleteCalls: string[] = [];

      mockInvoke.mockImplementation(<T>(cmd: string, args?: any): Promise<T> => {
        if (cmd === 'get_models_directory') {
          return Promise.resolve(mockModelsDirectory as T);
        }
        if (cmd === 'file_exists') {
          return Promise.resolve(true as T);
        }
        if (cmd === 'calculate_file_checksum') {
          const path = args?.path || '';
          // Return correct checksums
          if (path.includes('tiny')) {
            return Promise.resolve('bd577a113a864445d4c299885e0cb97d4ba92b5f0a0f1e2d3b4c5d6e7f8a9b0c' as T);
          }
          if (path.includes('base')) {
            return Promise.resolve('cd577a113a864445d4c299885e0cb97d4ba92b5f0a0f1e2d3b4c5d6e7f8a9b0d' as T);
          }
          return Promise.resolve('invalid' as T);
        }
        if (cmd === 'delete_file') {
          deleteCalls.push(args?.path || '');
          return Promise.resolve(undefined as T);
        }
        return Promise.reject(new Error(`Unmocked command: ${cmd}`));
      });

      const results = await modelManager.validateAllModelsOnStartup();

      // Valid models should not be removed
      const tinyResult = results.find(r => r.variant === 'tiny');
      expect(tinyResult?.removed).toBe(false);

      const baseResult = results.find(r => r.variant === 'base');
      expect(baseResult?.removed).toBe(false);

      // Only invalid models should be deleted (small, medium, large)
      expect(deleteCalls).toHaveLength(3);
    });
  });
});
