import { ErrorNotifications, SuccessNotifications, showToast } from './notifications';

describe('notifications', () => {
  let mockDispatchEvent: jest.SpyInstance;

  beforeEach(() => {
    mockDispatchEvent = jest.spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    mockDispatchEvent.mockRestore();
  });

  describe('showToast', () => {
    it('should dispatch custom event with toast data', () => {
      showToast('success', 'Test Title', 'Test Message');

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'show-toast',
          detail: expect.objectContaining({
            type: 'success',
            title: 'Test Title',
            message: 'Test Message',
          }),
        })
      );
    });

    it('should include action in toast data', () => {
      const mockAction = jest.fn();
      showToast('error', 'Error', 'Message', {
        action: {
          label: 'Retry',
          onClick: mockAction,
        },
      });

      const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
      expect(event.detail.action).toEqual({
        label: 'Retry',
        onClick: mockAction,
      });
    });

    it('should include custom duration', () => {
      showToast('info', 'Info', 'Message', { duration: 10000 });

      const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
      expect(event.detail.duration).toBe(10000);
    });
  });

  describe('ErrorNotifications', () => {
    describe('downloadFailed', () => {
      it('should show error toast with retry action', () => {
        const mockRetry = jest.fn();
        const error = new Error('Network error');

        ErrorNotifications.downloadFailed('tiny', error, mockRetry);

        const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
        expect(event.detail.type).toBe('error');
        expect(event.detail.title).toContain('tiny');
        expect(event.detail.action.label).toBe('Retry Download');
        expect(event.detail.duration).toBe(0);
      });

      it('should format network errors', () => {
        const error = new Error('fetch failed');
        ErrorNotifications.downloadFailed('base', error);

        const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
        expect(event.detail.message).toContain('network connection');
      });

      it('should format timeout errors', () => {
        const error = new Error('Request timeout');
        ErrorNotifications.downloadFailed('small', error);

        const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
        expect(event.detail.message).toContain('timed out');
      });
    });

    describe('insufficientDiskSpace', () => {
      it('should show error with space requirements', () => {
        const required = 2 * 1024 * 1024 * 1024; // 2 GB
        const available = 1 * 1024 * 1024 * 1024; // 1 GB

        ErrorNotifications.insufficientDiskSpace('medium', required, available);

        const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
        expect(event.detail.type).toBe('error');
        expect(event.detail.title).toBe('Insufficient Disk Space');
        expect(event.detail.message).toContain('2.00 GB');
        expect(event.detail.message).toContain('1.00 GB');
        expect(event.detail.message).toContain('1.00 GB'); // Need to free
      });
    });

    describe('corruptedModel', () => {
      it('should show error with re-download action', () => {
        const mockRedownload = jest.fn();

        ErrorNotifications.corruptedModel('large', mockRedownload);

        const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
        expect(event.detail.type).toBe('error');
        expect(event.detail.title).toBe('Corrupted Model File');
        expect(event.detail.message).toContain('large');
        expect(event.detail.action.label).toBe('Re-download Model');
      });
    });

    describe('transcriptionFailed', () => {
      it('should show error with fallback message when available', () => {
        const error = new Error('Model load failed');

        ErrorNotifications.transcriptionFailed(error, true);

        const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
        expect(event.detail.type).toBe('error');
        expect(event.detail.message).toContain('API fallback');
        expect(event.detail.duration).toBe(5000);
      });

      it('should show error without fallback message when unavailable', () => {
        const error = new Error('Model load failed');

        ErrorNotifications.transcriptionFailed(error, false);

        const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
        expect(event.detail.message).toContain('check your settings');
        expect(event.detail.duration).toBe(0);
      });

      it('should format memory errors', () => {
        const error = new Error('Out of memory');

        ErrorNotifications.transcriptionFailed(error, false);

        const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
        expect(event.detail.message).toContain('Insufficient memory');
      });
    });

    describe('modelLoadFailed', () => {
      it('should show error with model name', () => {
        const error = new Error('File not found');

        ErrorNotifications.modelLoadFailed('tiny', error);

        const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
        expect(event.detail.type).toBe('error');
        expect(event.detail.title).toContain('tiny');
        expect(event.detail.message).toContain('corrupted or incompatible');
      });
    });

    describe('networkError', () => {
      it('should show network error with retry action', () => {
        const mockRetry = jest.fn();

        ErrorNotifications.networkError('base', mockRetry);

        const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
        expect(event.detail.type).toBe('error');
        expect(event.detail.title).toBe('Network Error');
        expect(event.detail.message).toContain('network issues');
        expect(event.detail.action.label).toBe('Retry Download');
      });
    });

    describe('checksumMismatch', () => {
      it('should show checksum error with re-download action', () => {
        const mockRedownload = jest.fn();

        ErrorNotifications.checksumMismatch('small', mockRedownload);

        const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
        expect(event.detail.type).toBe('error');
        expect(event.detail.title).toBe('Download Verification Failed');
        expect(event.detail.message).toContain('integrity check');
        expect(event.detail.action.label).toBe('Re-download Model');
      });
    });

    describe('lowMemoryWarning', () => {
      it('should show warning with memory amount', () => {
        ErrorNotifications.lowMemoryWarning(3.5);

        const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
        expect(event.detail.type).toBe('warning');
        expect(event.detail.title).toBe('Low System Memory');
        expect(event.detail.message).toContain('3.5 GB');
        expect(event.detail.message).toContain('smaller model');
      });
    });

    describe('fallbackToApi', () => {
      it('should show info toast with reason', () => {
        ErrorNotifications.fallbackToApi('Model not loaded');

        const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
        expect(event.detail.type).toBe('info');
        expect(event.detail.title).toBe('Using API Fallback');
        expect(event.detail.message).toContain('Model not loaded');
        expect(event.detail.duration).toBe(5000);
      });
    });
  });

  describe('SuccessNotifications', () => {
    describe('modelDownloaded', () => {
      it('should show success toast', () => {
        SuccessNotifications.modelDownloaded('medium');

        const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
        expect(event.detail.type).toBe('success');
        expect(event.detail.title).toBe('Download Complete');
        expect(event.detail.message).toContain('medium');
      });
    });

    describe('modelDeleted', () => {
      it('should show success toast', () => {
        SuccessNotifications.modelDeleted('large');

        const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
        expect(event.detail.type).toBe('success');
        expect(event.detail.title).toBe('Model Deleted');
        expect(event.detail.message).toContain('large');
      });
    });

    describe('transcriptionComplete', () => {
      it('should show success toast', () => {
        SuccessNotifications.transcriptionComplete();

        const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
        expect(event.detail.type).toBe('success');
        expect(event.detail.title).toBe('Transcription Complete');
      });
    });
  });
});
