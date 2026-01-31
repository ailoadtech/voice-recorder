/**
 * Hotkey Configuration Service - Example Usage
 * 
 * This file demonstrates how to use the HotkeyConfigService
 * to manage and customize hotkey configurations.
 */

import React, { useEffect, useState } from 'react';
import { hotkeyConfigService } from './HotkeyConfigService';
import { hotkeyService } from './HotkeyService';
import { DEFAULT_HOTKEY_IDS } from './types';
import type { HotkeyConfig, HotkeyPreset } from './types';

/**
 * Example 1: Initialize and load configuration
 */
export function InitializeHotkeyConfig() {
  useEffect(() => {
    const init = async () => {
      // Initialize the configuration service
      await hotkeyConfigService.initialize();
      
      // Get current configuration
      const config = hotkeyConfigService.getConfig();
      console.log('Current config:', config);
      
      // Get all hotkeys (preset + custom)
      const allHotkeys = hotkeyConfigService.getAllHotkeys();
      console.log('All hotkeys:', allHotkeys);
    };
    
    init();
  }, []);
  
  return <div>Hotkey configuration initialized</div>;
}

/**
 * Example 2: Customize a hotkey
 */
export function CustomizeHotkey() {
  const [customized, setCustomized] = useState(false);
  
  const handleCustomize = async () => {
    try {
      // Set a custom hotkey for recording toggle
      await hotkeyConfigService.setHotkey(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING, {
        key: 'r',
        modifiers: ['ctrl', 'alt'],
        description: 'My custom recording toggle',
        enabled: true,
        global: true,
      });
      
      setCustomized(true);
      console.log('Hotkey customized successfully');
    } catch (error) {
      console.error('Failed to customize hotkey:', error);
    }
  };
  
  const handleReset = async () => {
    await hotkeyConfigService.removeCustomHotkey(DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING);
    setCustomized(false);
  };
  
  return (
    <div>
      <button onClick={handleCustomize}>Customize Recording Hotkey</button>
      <button onClick={handleReset}>Reset to Default</button>
      {customized && <p>Hotkey customized!</p>}
    </div>
  );
}

/**
 * Example 3: Switch between presets
 */
export function PresetSelector() {
  const [presets, setPresets] = useState<HotkeyPreset[]>([]);
  const [activePreset, setActivePreset] = useState<string>('');
  
  useEffect(() => {
    // Get available presets
    const availablePresets = hotkeyConfigService.getAvailablePresets();
    setPresets(availablePresets);
    
    // Get active preset
    const active = hotkeyConfigService.getActivePreset();
    setActivePreset(active?.name || '');
  }, []);
  
  const handlePresetChange = async (presetName: string) => {
    try {
      await hotkeyConfigService.setActivePreset(presetName);
      setActivePreset(presetName);
      console.log(`Switched to preset: ${presetName}`);
    } catch (error) {
      console.error('Failed to switch preset:', error);
    }
  };
  
  return (
    <div>
      <h3>Select Hotkey Preset</h3>
      <select 
        value={activePreset} 
        onChange={(e) => handlePresetChange(e.target.value)}
      >
        {presets.map((preset) => (
          <option key={preset.name} value={preset.name}>
            {preset.name} - {preset.description}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Example 4: Display all hotkeys with customization status
 */
export function HotkeyList() {
  const [hotkeys, setHotkeys] = useState<Record<string, HotkeyConfig>>({});
  
  useEffect(() => {
    const allHotkeys = hotkeyConfigService.getAllHotkeys();
    setHotkeys(allHotkeys);
  }, []);
  
  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    await hotkeyConfigService.setHotkeyEnabled(id, enabled);
    
    // Refresh hotkeys
    const allHotkeys = hotkeyConfigService.getAllHotkeys();
    setHotkeys(allHotkeys);
  };
  
  return (
    <div>
      <h3>Configured Hotkeys</h3>
      <ul>
        {Object.entries(hotkeys).map(([id, config]) => {
          const isCustom = hotkeyConfigService.isCustomized(id);
          const formatted = hotkeyService.formatHotkey(config);
          
          return (
            <li key={id}>
              <strong>{config.description}</strong>: {formatted}
              {isCustom && <span> (Custom)</span>}
              <label>
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => handleToggleEnabled(id, e.target.checked)}
                />
                Enabled
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Example 5: Export and import configuration
 */
export function ConfigImportExport() {
  const [exportedConfig, setExportedConfig] = useState<string>('');
  
  const handleExport = () => {
    const config = hotkeyConfigService.exportConfig();
    setExportedConfig(config);
    console.log('Exported config:', config);
  };
  
  const handleImport = async () => {
    try {
      await hotkeyConfigService.importConfig(exportedConfig);
      alert('Configuration imported successfully!');
    } catch (error) {
      alert('Failed to import configuration: ' + (error as Error).message);
    }
  };
  
  return (
    <div>
      <h3>Import/Export Configuration</h3>
      <button onClick={handleExport}>Export Config</button>
      <textarea
        value={exportedConfig}
        onChange={(e) => setExportedConfig(e.target.value)}
        rows={10}
        cols={50}
        placeholder="Exported configuration will appear here"
      />
      <button onClick={handleImport}>Import Config</button>
    </div>
  );
}

/**
 * Example 6: Configuration statistics
 */
export function ConfigStats() {
  const [stats, setStats] = useState({
    totalHotkeys: 0,
    customizedHotkeys: 0,
    activePreset: '',
    lastUpdated: '',
  });
  
  useEffect(() => {
    const currentStats = hotkeyConfigService.getStats();
    setStats(currentStats);
  }, []);
  
  return (
    <div>
      <h3>Configuration Statistics</h3>
      <ul>
        <li>Total Hotkeys: {stats.totalHotkeys}</li>
        <li>Customized: {stats.customizedHotkeys}</li>
        <li>Active Preset: {stats.activePreset}</li>
        <li>Last Updated: {new Date(stats.lastUpdated).toLocaleString()}</li>
      </ul>
    </div>
  );
}

/**
 * Example 7: Complete settings page
 */
export function HotkeySettingsPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Hotkey Settings</h1>
      
      <section>
        <PresetSelector />
      </section>
      
      <section>
        <HotkeyList />
      </section>
      
      <section>
        <CustomizeHotkey />
      </section>
      
      <section>
        <ConfigStats />
      </section>
      
      <section>
        <ConfigImportExport />
      </section>
      
      <section>
        <button onClick={() => hotkeyConfigService.resetToDefaults()}>
          Reset All to Defaults
        </button>
      </section>
    </div>
  );
}

/**
 * Example 8: Register hotkeys from configuration on app startup
 */
export function RegisterHotkeysFromConfig() {
  useEffect(() => {
    const registerHotkeys = async () => {
      // Initialize config service
      await hotkeyConfigService.initialize();
      
      // Get all configured hotkeys
      const hotkeys = hotkeyConfigService.getAllHotkeys();
      
      // Register each hotkey with the hotkey service
      for (const [id, config] of Object.entries(hotkeys)) {
        if (config.enabled) {
          await hotkeyService.register(config, (event) => {
            console.log(`Hotkey triggered: ${id}`);
            // Handle hotkey action based on ID
            switch (id) {
              case DEFAULT_HOTKEY_IDS.TOGGLE_RECORDING:
                // Toggle recording logic
                break;
              case DEFAULT_HOTKEY_IDS.STOP_RECORDING:
                // Stop recording logic
                break;
              case DEFAULT_HOTKEY_IDS.SHOW_HISTORY:
                // Show history logic
                break;
            }
          });
        }
      }
      
      console.log('All hotkeys registered from configuration');
    };
    
    registerHotkeys();
    
    // Cleanup on unmount
    return () => {
      const hotkeys = hotkeyConfigService.getAllHotkeys();
      for (const id of Object.keys(hotkeys)) {
        hotkeyService.unregister(id);
      }
    };
  }, []);
  
  return null;
}
