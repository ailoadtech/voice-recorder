import { StorageService } from './StorageService';
import type { Recording, RecordingFilter, RecordingSortOptions } from './types';

// Mock IndexedDB
class MockIDBDatabase {
  objectStoreNames = { contains: jest.fn(() => false) };
  createObjectStore = jest.fn(() => ({
    createIndex: jest.fn(),
  }));
  transaction = jest.fn();
}

class MockIDBRequest {
  result: any = null;
  error: any = null;
  onsuccess: any = null;
  onerror: any = null;

  triggerSuccess(result?: any) {
    this.result = result;
    if (this.onsuccess) this.onsuccess();
  }

  triggerError(error?: any) {
    this.error = error;
    if (this.onerror) this.onerror();
  }
}

describe('StorageService', () => {
  let service: StorageService;
  let mockDB: MockIDBDatabase;

  beforeEach(() => {
    mockDB = new MockIDBDatabase();
    
    // Mock indexedDB
    global.indexedDB = {
      open: jest.fn(() => {
        const request = new MockIDBRequest();
        setTimeout(() => {
          request.result = mockDB;
          request.triggerSuccess();
        }, 0);
        return request as any;
      }),
    } as any;

    service = new StorageService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveRecording', () => {
    it('generates ID if not provided', async () => {
      const mockStore = {
        put: jest.fn(() => {
          const request = new MockIDBRequest();
          setTimeout(() => request.triggerSuccess(), 0);
          return request;
        }),
      };

      mockDB.transaction = jest.fn(() => ({
        objectStore: jest.fn(() => mockStore),
      })) as any;

      const recording: Recording = {
        id: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        transcriptionText: 'Test',
      };

      const id = await service.saveRecording(recording);
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
    });

    it('sets timestamps', async () => {
      const mockStore = {
        put: jest.fn((data) => {
          expect(data.createdAt).toBeTruthy();
          expect(data.updatedAt).toBeTruthy();
          const request = new MockIDBRequest();
          setTimeout(() => request.triggerSuccess(), 0);
          return request;
        }),
      };

      mockDB.transaction = jest.fn(() => ({
        objectStore: jest.fn(() => mockStore),
      })) as any;

      const recording: Recording = {
        id: 'test-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await service.saveRecording(recording);
      expect(mockStore.put).toHaveBeenCalled();
    });
  });

  describe('getRecording', () => {
    it('returns null for non-existent recording', async () => {
      const mockStore = {
        get: jest.fn(() => {
          const request = new MockIDBRequest();
          setTimeout(() => request.triggerSuccess(null), 0);
          return request;
        }),
      };

      mockDB.transaction = jest.fn(() => ({
        objectStore: jest.fn(() => mockStore),
      })) as any;

      const result = await service.getRecording('non-existent');
      expect(result).toBeNull();
    });

    it('returns recording when found', async () => {
      const mockRecording = {
        id: 'test-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        transcriptionText: 'Test',
      };

      const mockStore = {
        get: jest.fn(() => {
          const request = new MockIDBRequest();
          setTimeout(() => request.triggerSuccess(mockRecording), 0);
          return request;
        }),
      };

      mockDB.transaction = jest.fn(() => ({
        objectStore: jest.fn(() => mockStore),
      })) as any;

      const result = await service.getRecording('test-1');
      expect(result).toBeTruthy();
      expect(result?.id).toBe('test-1');
    });
  });

  describe('deleteRecording', () => {
    it('deletes recording successfully', async () => {
      const mockStore = {
        delete: jest.fn(() => {
          const request = new MockIDBRequest();
          setTimeout(() => request.triggerSuccess(), 0);
          return request;
        }),
      };

      mockDB.transaction = jest.fn(() => ({
        objectStore: jest.fn(() => mockStore),
      })) as any;

      await service.deleteRecording('test-1');
      expect(mockStore.delete).toHaveBeenCalledWith('test-1');
    });
  });

  describe('clearAll', () => {
    it('clears all recordings', async () => {
      const mockStore = {
        clear: jest.fn(() => {
          const request = new MockIDBRequest();
          setTimeout(() => request.triggerSuccess(), 0);
          return request;
        }),
      };

      mockDB.transaction = jest.fn(() => ({
        objectStore: jest.fn(() => mockStore),
      })) as any;

      await service.clearAll();
      expect(mockStore.clear).toHaveBeenCalled();
    });
  });

  describe('isAvailable', () => {
    it('returns true when IndexedDB is available', async () => {
      const available = await service.isAvailable();
      expect(available).toBe(true);
    });

    it('returns false when IndexedDB is not available', async () => {
      global.indexedDB = undefined as any;
      const newService = new StorageService();
      
      const available = await newService.isAvailable();
      expect(available).toBe(false);
    });
  });
});
