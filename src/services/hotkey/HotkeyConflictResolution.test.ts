/**
 * Hotkey Conflict Resolution Tests
 * Tests for hotkey conflict detection and resolution
 */

import { HotkeyService } from './HotkeyService';
import type { HotkeyConfig } from './types';

describe('HotkeyService - Conflict Resolution', () => {
  let service: HotkeyService;

  beforeEach(() => {
    service = new HotkeyService();
  });

  afterEach(async () => {
    await service.destroy();
  });

  describe('Conflict Detection', () => {
    it('should detect conflicts between registered hotkeys', async () => {
      const config1: HotkeyConfig = {
        id: 'test-1',
        key: 'r',
        modifiers: ['ctrl', 'shift'],
        description: 'Test 1',
        enabled: true,
      };

      const config2: HotkeyConfig = {
        id: 'test-2',
        key: 'r',
        modifiers: ['ctrl', 'shift'],
        description: 'Test 2',
        enabled: true,
      };

      await service.register(config1, () => {});
      const conflicts = service.checkConflicts(config2);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].conflictsWith).toContain('test-1');
      expect(conflicts[0].severity).toBe('error');
    });

    it('should not detect conflicts for different key combinations', async () => {
      const config1: HotkeyConfig = {
        id: 'test-1',
        key: 'r',
        modifiers: ['ctrl', 'shift'],
        description: 'Test 1',
        enabled: true,
      };

      const config2: HotkeyConfig = {
        id: 'test-2',
        key: 's',
        modifiers: ['ctrl', 'shift'],
        description: 'Test 2',
        enabled: true,
      };

      await service.register(config1, () => {});
      const conflicts = service.checkConflicts(config2);

      expect(conflicts).toHaveLength(0);
    });

    it('should detect system-reserved hotkey conflicts', () => {
      const config: HotkeyConfig = {
        id: 'test-system',
        key: 'c',
        modifiers: ['ctrl'],
        description: 'Test System',
        enabled: true,
      };

      const conflicts = service.checkConflicts(config);

      expect(conflicts.length).toBeGreaterThan(0);
      const systemConflict = conflicts.find(c => c.systemLevel);
      expect(systemConflict).toBeDefined();
      expect(systemConflict?.conflictsWith).toContain('system');
    });

    it('should detect conflicts with different modifier order', async () => {
      const config1: HotkeyConfig = {
        id: 'test-1',
        key: 'r',
        modifiers: ['shift', 'ctrl'],
        description: 'Test 1',
        enabled: true,
      };

      const config2: HotkeyConfig = {
        id: 'test-2',
        key: 'r',
        modifiers: ['ctrl', 'shift'],
        description: 'Test 2',
        enabled: true,
      };

      await service.register(config1, () => {});
      const conflicts = service.checkConflicts(config2);

      expect(conflicts).toHaveLength(1);
    });
  });

  describe('Conflict Resolution', () => {
    it('should resolve conflicts by disabling existing hotkeys', async () => {
      const config1: HotkeyConfig = {
        id: 'test-1',
        key: 'r',
        modifiers: ['ctrl', 'shift'],
        description: 'Test 1',
        enabled: true,
      };

      const config2: HotkeyConfig = {
        id: 'test-2',
        key: 'r',
        modifiers: ['ctrl', 'shift'],
        description: 'Test 2',
        enabled: true,
      };

      await service.register(config1, () => {});
      
      const resolution = await service.resolveConflicts(config2, 'disable-existing');

      expect(resolution.resolved).toBe(true);
      expect(resolution.disabledHotkeys).toContain('test-1');
      
      const registrations = service.getRegistrations();
      const disabled = registrations.find(r => r.config.id === 'test-1');
      expect(disabled?.config.enabled).toBe(false);
    });

    it('should not disable system hotkeys', async () => {
      const config: HotkeyConfig = {
        id: 'test-system',
        key: 'c',
        modifiers: ['ctrl'],
        description: 'Test System',
        enabled: true,
      };

      const resolution = await service.resolveConflicts(config, 'disable-existing');

      expect(resolution.resolved).toBe(false);
      expect(resolution.message).toContain('system');
    });

    it('should handle disable-new strategy', async () => {
      const config1: HotkeyConfig = {
        id: 'test-1',
        key: 'r',
        modifiers: ['ctrl', 'shift'],
        description: 'Test 1',
        enabled: true,
      };

      const config2: HotkeyConfig = {
        id: 'test-2',
        key: 'r',
        modifiers: ['ctrl', 'shift'],
        description: 'Test 2',
        enabled: true,
      };

      await service.register(config1, () => {});
      
      const resolution = await service.resolveConflicts(config2, 'disable-new');

      expect(resolution.resolved).toBe(true);
      expect(resolution.disabledHotkeys).toHaveLength(0);
      expect(resolution.message).toContain('not registered');
    });

    it('should handle allow-both strategy', async () => {
      const config1: HotkeyConfig = {
        id: 'test-1',
        key: 'r',
        modifiers: ['ctrl', 'shift'],
        description: 'Test 1',
        enabled: true,
      };

      const config2: HotkeyConfig = {
        id: 'test-2',
        key: 'r',
        modifiers: ['ctrl', 'shift'],
        description: 'Test 2',
        enabled: true,
      };

      await service.register(config1, () => {});
      
      const resolution = await service.resolveConflicts(config2, 'allow-both');

      expect(resolution.resolved).toBe(true);
      expect(resolution.message).toContain('both');
    });
  });

  describe('Conflict History', () => {
    it('should track conflict history', async () => {
      const config1: HotkeyConfig = {
        id: 'test-1',
        key: 'r',
        modifiers: ['ctrl', 'shift'],
        description: 'Test 1',
        enabled: true,
      };

      const config2: HotkeyConfig = {
        id: 'test-2',
        key: 'r',
        modifiers: ['ctrl', 'shift'],
        description: 'Test 2',
        enabled: true,
      };

      await service.register(config1, () => {});
      service.checkConflicts(config2);

      const history = service.getConflictHistory('test-2');
      expect(history).toHaveLength(1);
      expect(history[0].conflictsWith).toContain('test-1');
    });

    it('should clear conflict history', async () => {
      const config1: HotkeyConfig = {
        id: 'test-1',
        key: 'r',
        modifiers: ['ctrl', 'shift'],
        description: 'Test 1',
        enabled: true,
      };

      const config2: HotkeyConfig = {
        id: 'test-2',
        key: 'r',
        modifiers: ['ctrl', 'shift'],
        description: 'Test 2',
        enabled: true,
      };

      await service.register(config1, () => {});
      service.checkConflicts(config2);
      service.clearConflictHistory('test-2');

      const history = service.getConflictHistory('test-2');
      expect(history).toHaveLength(0);
    });
  });

  describe('System Reserved Hotkeys', () => {
    it('should identify system reserved hotkeys', () => {
      const config: HotkeyConfig = {
        id: 'test',
        key: 'c',
        modifiers: ['ctrl'],
        description: 'Test',
        enabled: true,
      };

      expect(service.isSystemReserved(config)).toBe(true);
    });

    it('should not flag non-reserved hotkeys', () => {
      const config: HotkeyConfig = {
        id: 'test',
        key: 'r',
        modifiers: ['ctrl', 'shift'],
        description: 'Test',
        enabled: true,
      };

      expect(service.isSystemReserved(config)).toBe(false);
    });

    it('should return list of system reserved hotkeys', () => {
      const reserved = service.getSystemReservedHotkeys();
      
      expect(reserved).toContain('ctrl+c');
      expect(reserved).toContain('ctrl+v');
      expect(reserved).toContain('alt+f4');
    });
  });

  describe('Auto-registration with Conflict Resolution', () => {
    it('should auto-resolve conflicts during registration', async () => {
      const config1: HotkeyConfig = {
        id: 'test-1',
        key: 'r',
        modifiers: ['ctrl', 'shift'],
        description: 'Test 1',
        enabled: true,
      };

      const config2: HotkeyConfig = {
        id: 'test-2',
        key: 'r',
        modifiers: ['ctrl', 'shift'],
        description: 'Test 2',
        enabled: true,
      };

      await service.register(config1, () => {});
      await service.register(config2, () => {});

      const registrations = service.getRegistrations();
      const first = registrations.find(r => r.config.id === 'test-1');
      const second = registrations.find(r => r.config.id === 'test-2');

      expect(first?.config.enabled).toBe(false);
      expect(second?.config.enabled).toBe(true);
    });
  });
});
