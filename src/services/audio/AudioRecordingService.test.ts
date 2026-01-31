/**
 * Tests for AudioRecordingService
 * Note: These tests use mocks since we can't access real media devices in test environment
 */

import { AudioRecordingService } from './AudioRecordingService';

// Mock MediaRecorder and related APIs
const mockStart = jest.fn();
const mockStop = jest.fn();
const mockPause = jest.fn();
const mockResume = jest.fn();
const mockGetTracks = jest.fn(() => [{ stop: jest.fn() }]);
const mockGetUserMedia = jest.fn();

describe('AudioRecordingService', () => {
  let service: AudioRecordingService;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock navigator.mediaDevices
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: mockGetUserMedia,
      },
    });

    // Mock MediaRecorder
    (global as any).MediaRecorder = jest.fn().mockImplementation(() => ({
      start: mockStart,
      stop: mockStop,
      pause: mockPause,
      resume: mockResume,
      state: 'inactive',
      ondataavailable: null,
      onstop: null,
      onerror: null,
    }));

    (global as any).MediaRecorder.isTypeSupported = jest.fn().mockReturnValue(true);

    // Default mock implementation for getUserMedia
    mockGetUserMedia.mockResolvedValue({
      getTracks: mockGetTracks,
    });

    service = new AudioRecordingService();
  });

  afterEach(() => {
    service.dispose();
  });

  describe('startRecording', () => {
    it('should start recording successfully', async () => {
      await service.startRecording();

      expect(mockGetUserMedia).toHaveBeenCalledWith({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000,
        },
      });
      expect(mockStart).toHaveBeenCalledWith(100);
      expect(service.getState()).toBe('recording');
      expect(service.isRecording()).toBe(true);
    });

    it('should throw error if already recording', async () => {
      await service.startRecording();

      await expect(service.startRecording()).rejects.toThrow('Already recording');
    });
  });

  describe('stopRecording', () => {
    it('should throw error if not recording', async () => {
      await expect(service.stopRecording()).rejects.toThrow('Not currently recording');
    });
  });

  describe('state management', () => {
    it('should track recording state correctly', async () => {
      expect(service.getState()).toBe('idle');
      expect(service.isRecording()).toBe(false);

      await service.startRecording();
      expect(service.getState()).toBe('recording');
      expect(service.isRecording()).toBe(true);
    });
  });

  describe('audio blob handling', () => {
    let mockBlob: Blob;

    beforeEach(() => {
      mockBlob = new Blob(['test audio data'], { type: 'audio/webm' });
      
      // Mock URL.createObjectURL and revokeObjectURL
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
    });

    it('should create audio URL from blob', () => {
      const url = service.createAudioURL(mockBlob);
      expect(url).toBe('blob:mock-url');
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    });

    it('should revoke audio URL', () => {
      const url = 'blob:mock-url';
      service.revokeAudioURL(url);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(url);
    });

    it('should convert blob to base64', async () => {
      const mockBase64 = 'data:audio/webm;base64,dGVzdCBhdWRpbyBkYXRh';
      
      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(function(this: any) {
          this.onloadend();
        }),
        result: mockBase64,
        onloadend: null,
        onerror: null,
      };
      
      global.FileReader = jest.fn(() => mockFileReader) as any;

      const result = await service.blobToBase64(mockBlob);
      expect(result).toBe(mockBase64);
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockBlob);
    });

    it('should get audio metadata', () => {
      const metadata = service.getAudioMetadata(mockBlob);
      expect(metadata).toEqual({
        size: mockBlob.size,
        type: 'audio/webm',
        sizeInMB: expect.any(Number),
      });
    });

    it('should download audio file', () => {
      const mockClick = jest.fn();
      const mockAppendChild = jest.fn();
      const mockRemoveChild = jest.fn();
      
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
      };
      
      document.createElement = jest.fn(() => mockAnchor as any);
      document.body.appendChild = mockAppendChild;
      document.body.removeChild = mockRemoveChild;

      service.downloadAudio(mockBlob, 'test-recording');

      expect(mockAnchor.href).toBe('blob:mock-url');
      expect(mockAnchor.download).toBe('test-recording.webm');
      expect(mockClick).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalledWith(mockAnchor);
      expect(mockRemoveChild).toHaveBeenCalledWith(mockAnchor);
    });
  });

  describe('configuration', () => {
    it('should get current config', () => {
      const config = service.getConfig();
      expect(config).toHaveProperty('mimeType');
      expect(config).toHaveProperty('audioBitsPerSecond');
      expect(config).toHaveProperty('sampleRate');
    });

    it('should update config when idle', () => {
      service.updateConfig({ audioBitsPerSecond: 256000 });
      const config = service.getConfig();
      expect(config.audioBitsPerSecond).toBe(256000);
    });

    it('should throw error when updating config while recording', async () => {
      await service.startRecording();
      expect(() => {
        service.updateConfig({ audioBitsPerSecond: 256000 });
      }).toThrow('Cannot update config while recording');
    });

    it('should get supported MIME types', () => {
      const types = AudioRecordingService.getSupportedMimeTypes();
      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThan(0);
    });
  });
});
