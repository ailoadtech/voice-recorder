'use client';

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { hotkeyConfigService } from '@/services/hotkey/HotkeyConfigService';
import { hotkeyService } from '@/services/hotkey/HotkeyService';
import { HotkeyConflictDialog } from './HotkeyConflictDialog';
import type { HotkeyConfig, HotkeyPreset, ModifierKey, HotkeyConflict, ConflictResolutionStrategy } from '@/services/hotkey/types';

interface HotkeyCustomizerProps {
  onClose?: () => void;
}

export function HotkeyCustomizer({ onClose }: HotkeyCustomizerProps) {
  const [hotkeys, setHotkeys] = useState<Record<string, HotkeyConfig>>({});
  const [presets, setPresets] = useState<HotkeyPreset[]>([]);
  const [activePreset, setActivePreset] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recordingKey, setRecordingKey] = useState(false);
  const [tempKey, setTempKey] = useState<string>('');
  const [tempModifiers, setTempModifiers] = useState<ModifierKey[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [conflicts, setConflicts] = useState<HotkeyConflict[]>([]);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [pendingHotkeyId, setPendingHotkeyId] = useState<string>('');
  const [pendingConfig, setPendingConfig] = useState<Omit<HotkeyConfig, 'id'> | null>(null);

  // Load configuration
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      await hotkeyConfigService.initialize();
      const allHotkeys = hotkeyConfigService.getAllHotkeys();
      const availablePresets = hotkeyConfigService.getAvailablePresets();
      const currentPreset = hotkeyConfigService.getActivePreset();
      
      setHotkeys(allHotkeys);
      setPresets(availablePresets);
      setActivePreset(currentPreset?.name || '');
    } catch (err) {
      setError('Failed to load hotkey configuration');
      console.error(err);
    }
  };

  // Handle preset change
  const handlePresetChange = async (presetName: string) => {
    try {
      setError('');
      await hotkeyConfigService.setActivePreset(presetName);
      setActivePreset(presetName);
      await loadConfig();
      setSuccess(`Switched to ${presetName} preset`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to change preset');
      console.error(err);
    }
  };

  // Start editing a hotkey
  const startEditing = (id: string) => {
    const hotkey = hotkeys[id];
    if (hotkey) {
      setEditingId(id);
      setTempKey(hotkey.key);
      setTempModifiers([...hotkey.modifiers]);
      setError('');
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setTempKey('');
    setTempModifiers([]);
    setRecordingKey(false);
    setError('');
  };

  // Save hotkey changes
  const saveHotkey = async (id: string) => {
    try {
      setError('');
      
      if (!tempKey) {
        setError('Please select a key');
        return;
      }

      const hotkey = hotkeys[id];
      const newConfig: Omit<HotkeyConfig, 'id'> = {
        key: tempKey,
        modifiers: tempModifiers,
        description: hotkey.description,
        enabled: hotkey.enabled,
        global: hotkey.global,
      };

      // Validate
      const validation = hotkeyService.validate({ ...newConfig, id });
      if (!validation.valid) {
        setError(validation.errors.join(', '));
        return;
      }

      // Check conflicts
      const detectedConflicts = hotkeyService.checkConflicts({ ...newConfig, id });
      if (detectedConflicts.length > 0) {
        // Show conflict dialog
        setConflicts(detectedConflicts);
        setPendingHotkeyId(id);
        setPendingConfig(newConfig);
        setShowConflictDialog(true);
        return;
      }

      // No conflicts, save directly
      await hotkeyConfigService.setHotkey(id, newConfig);
      await loadConfig();
      setEditingId(null);
      setSuccess('Hotkey updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to save hotkey');
      console.error(err);
    }
  };

  // Handle conflict resolution
  const handleConflictResolution = async (strategy: ConflictResolutionStrategy) => {
    try {
      setShowConflictDialog(false);
      
      if (!pendingConfig || !pendingHotkeyId) {
        setError('Invalid conflict resolution state');
        return;
      }

      if (strategy === 'disable-new') {
        // User chose to keep existing hotkeys
        setError('Hotkey not saved due to conflicts');
        cancelEditing();
        return;
      }

      // Resolve conflicts
      const fullConfig = { ...pendingConfig, id: pendingHotkeyId };
      const resolution = await hotkeyService.resolveConflicts(fullConfig, strategy);

      if (!resolution.resolved) {
        setError(resolution.message);
        return;
      }

      // Save the hotkey
      await hotkeyConfigService.setHotkey(pendingHotkeyId, pendingConfig);
      await loadConfig();
      setEditingId(null);
      setSuccess(`Hotkey updated. ${resolution.message}`);
      setTimeout(() => setSuccess(''), 3000);

      // Clear pending state
      setPendingHotkeyId('');
      setPendingConfig(null);
      setConflicts([]);
    } catch (err) {
      setError((err as Error).message || 'Failed to resolve conflicts');
      console.error(err);
    }
  };

  // Handle conflict dialog cancel
  const handleConflictCancel = () => {
    setShowConflictDialog(false);
    setPendingHotkeyId('');
    setPendingConfig(null);
    setConflicts([]);
  };

  // Toggle modifier
  const toggleModifier = (modifier: ModifierKey) => {
    setTempModifiers(prev => 
      prev.includes(modifier)
        ? prev.filter(m => m !== modifier)
        : [...prev, modifier]
    );
  };

  // Record key press
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!recordingKey) return;
    
    e.preventDefault();
    e.stopPropagation();

    // Ignore modifier-only presses
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
      return;
    }

    // Capture the key
    let key = e.key.toLowerCase();
    
    // Special keys
    if (key === ' ') key = ' ';
    else if (key === 'escape') key = 'escape';
    else if (key.startsWith('f') && key.length <= 3) key = key; // F1-F12
    else if (key.length > 1) key = key.toLowerCase();

    setTempKey(key);
    setRecordingKey(false);
  }, [recordingKey]);

  useEffect(() => {
    if (recordingKey) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [recordingKey, handleKeyDown]);

  // Toggle hotkey enabled state
  const toggleEnabled = async (id: string) => {
    try {
      const hotkey = hotkeys[id];
      await hotkeyConfigService.setHotkeyEnabled(id, !hotkey.enabled);
      await loadConfig();
    } catch (err) {
      setError('Failed to toggle hotkey');
      console.error(err);
    }
  };

  // Reset to defaults
  const resetToDefaults = async () => {
    if (!confirm('Reset all hotkeys to preset defaults?')) return;
    
    try {
      await hotkeyConfigService.resetToDefaults();
      await loadConfig();
      setSuccess('Reset to defaults');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to reset hotkeys');
      console.error(err);
    }
  };

  // Format hotkey for display
  const formatHotkey = (config: HotkeyConfig): string => {
    const parts: string[] = [];
    
    if (config.modifiers.includes('ctrl')) parts.push('Ctrl');
    if (config.modifiers.includes('shift')) parts.push('Shift');
    if (config.modifiers.includes('alt')) parts.push('Alt');
    if (config.modifiers.includes('meta')) parts.push('Meta');
    
    const keyDisplay = config.key === ' ' ? 'Space' : config.key.toUpperCase();
    parts.push(keyDisplay);
    
    return parts.join(' + ');
  };

  return (
    <div className="space-y-6">
      {/* Conflict Dialog */}
      <HotkeyConflictDialog
        conflicts={conflicts}
        hotkeyName={pendingHotkeyId ? hotkeys[pendingHotkeyId]?.description || pendingHotkeyId : ''}
        hotkeyDisplay={pendingConfig ? formatHotkey({ ...pendingConfig, id: pendingHotkeyId }) : ''}
        onResolve={handleConflictResolution}
        onCancel={handleConflictCancel}
        isOpen={showConflictDialog}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Hotkey Customization</h2>
          <p className="text-sm text-gray-600 mt-1">Configure global keyboard shortcuts</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Close
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Preset Selector */}
      <div className="bg-white border rounded-lg p-4">
        <label className="block text-sm font-medium mb-2">Hotkey Preset</label>
        <select
          value={activePreset}
          onChange={(e) => handlePresetChange(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm"
        >
          {presets.map((preset) => (
            <option key={preset.name} value={preset.name}>
              {preset.name} - {preset.description}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-2">
          Choose a preset or customize individual hotkeys below
        </p>
      </div>

      {/* Hotkey List */}
      <div className="space-y-3">
        {Object.entries(hotkeys).map(([id, config]) => {
          const isEditing = editingId === id;
          const isCustomized = hotkeyConfigService.isCustomized(id);

          return (
            <div
              key={id}
              className={`bg-white border rounded-lg p-4 ${
                isEditing ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{config.description}</h3>
                    {isCustomized && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                        Custom
                      </span>
                    )}
                    {config.global && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                        Global
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">ID: {id}</p>
                </div>

                {/* Enable/Disable Toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={() => toggleEnabled(id)}
                    className="w-4 h-4"
                  />
                  <span className="text-xs text-gray-600">Enabled</span>
                </label>
              </div>

              {!isEditing ? (
                <div className="mt-3 flex items-center justify-between">
                  <div className="px-3 py-2 bg-gray-50 border rounded font-mono text-sm">
                    {formatHotkey(config)}
                  </div>
                  <button
                    onClick={() => startEditing(id)}
                    className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  {/* Modifiers */}
                  <div>
                    <label className="block text-xs font-medium mb-2">Modifiers</label>
                    <div className="flex gap-2">
                      {(['ctrl', 'shift', 'alt', 'meta'] as ModifierKey[]).map((mod) => (
                        <button
                          key={mod}
                          onClick={() => toggleModifier(mod)}
                          className={`px-3 py-1.5 text-sm border rounded ${
                            tempModifiers.includes(mod)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {mod.charAt(0).toUpperCase() + mod.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Key */}
                  <div>
                    <label className="block text-xs font-medium mb-2">Key</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempKey === ' ' ? 'Space' : tempKey.toUpperCase()}
                        readOnly
                        placeholder="Click 'Record' and press a key"
                        className="flex-1 px-3 py-2 border rounded text-sm bg-gray-50"
                      />
                      <button
                        onClick={() => setRecordingKey(!recordingKey)}
                        className={`px-4 py-2 text-sm rounded ${
                          recordingKey
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                        }`}
                      >
                        {recordingKey ? 'Recording...' : 'Record'}
                      </button>
                    </div>
                    {recordingKey && (
                      <p className="text-xs text-blue-600 mt-1">
                        Press any key to capture it
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveHotkey(id)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
