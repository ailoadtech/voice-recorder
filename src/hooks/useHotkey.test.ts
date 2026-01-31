/**
 * Tests for useHotkey hook
 */

import { renderHook, act } from '@testing-library/react';
import { useHotkey } from './useHotkey';
import { hotkeyService } from '@/services/hotkey/HotkeyService';

// Mock the hotkey service
jest.mock('@/services/hotkey/HotkeyService', () => ({
  hotkeyService: {
    register: jest.fn().mockResolvedValue(undefined),
    unregister: jest.fn().mockResolvedValue(undefined),
    getPlatformInfo: jest.fn().mockReturnValue({
      platform: 'browser',
      supportsGlobalHotkeys: false,
      reservedKeys: [],
      modifierKeyNames: {
        ctrl: 'Ctrl',
        shift: 'Shift',
        alt: 'Alt',
        meta: 'Win',
      },
    }),
  },
}));

describe('useHotkey', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register hotkey on mount', async () => {
    const callback = jest.fn();
    const config = {
      id: 'test-hotkey',
      key: 'r',
      modifiers: ['ctrl', 'shift'] as const,
      description: 'Test hotkey',
      enabled: true,
    };

    await act(async () => {
      renderHook(() => useHotkey(config, callback));
    });

    expect(hotkeyService.register).toHaveBeenCalledWith(config, expect.any(Function));
  });

  it('should unregister hotkey on unmount', async () => {
    const callback = jest.fn();
    const config = {
      id: 'test-hotkey',
      key: 'r',
      modifiers: ['ctrl', 'shift'] as const,
      description: 'Test hotkey',
      enabled: true,
    };

    const { unmount } = renderHook(() => useHotkey(config, callback));

    await act(async () => {
      unmount();
    });

    expect(hotkeyService.unregister).toHaveBeenCalledWith('test-hotkey');
  });

  it('should not register when enabled is false', async () => {
    const callback = jest.fn();
    const config = {
      id: 'test-hotkey',
      key: 'r',
      modifiers: ['ctrl', 'shift'] as const,
      description: 'Test hotkey',
      enabled: false,
    };

    await act(async () => {
      renderHook(() => useHotkey(config, callback));
    });

    expect(hotkeyService.register).not.toHaveBeenCalled();
  });
});
