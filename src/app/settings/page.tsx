'use client';

import { useState } from 'react';
import { ApiKeyStatus, HotkeyCustomizer } from '@/components';
import { ExportSettings } from '@/components/ExportSettings';
import { ModelSelection } from '@/components/ModelSelection';
import { useWhisperTranscription } from '@/hooks/useWhisperTranscription';

export default function SettingsPage() {
  const [showHotkeyCustomizer, setShowHotkeyCustomizer] = useState(false);
  const { settings, updateSettings } = useWhisperTranscription();

  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>

        {/* Hotkey Configuration */}
        {!showHotkeyCustomizer ? (
          <section className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Hotkey Configuration</h2>
            <p className="text-gray-600 text-sm mb-4">Configure global hotkeys for recording</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Recording Hotkey</label>
                <input 
                  type="text" 
                  value="Ctrl+Shift+Space" 
                  readOnly
                  className="px-3 py-2 border rounded bg-gray-50 text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Stop Recording</label>
                <input 
                  type="text" 
                  value="Ctrl+Escape" 
                  readOnly
                  className="px-3 py-2 border rounded bg-gray-50 text-sm"
                />
              </div>
              <button 
                onClick={() => setShowHotkeyCustomizer(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Customize Hotkeys
              </button>
            </div>
          </section>
        ) : (
          <section className="bg-white border rounded-lg p-6">
            <HotkeyCustomizer onClose={() => setShowHotkeyCustomizer(false)} />
          </section>
        )}

        {/* API Configuration */}
        <section className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
          <p className="text-gray-600 text-sm mb-4">Set up transcription and LLM API keys</p>
          
          {/* API Key Status */}
          <div className="mb-6">
            <ApiKeyStatus />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
              <input 
                type="password" 
                placeholder="sk-..." 
                className="w-full px-3 py-2 border rounded text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Used for Whisper transcription and GPT enrichment</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Whisper Model</label>
              <select className="w-full px-3 py-2 border rounded text-sm">
                <option>whisper-1</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">GPT Model</label>
              <select className="w-full px-3 py-2 border rounded text-sm">
                <option>gpt-4</option>
                <option>gpt-4-turbo</option>
                <option>gpt-3.5-turbo</option>
              </select>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              Save API Settings
            </button>
          </div>
        </section>

        {/* Transcription Method Selection */}
        {settings && (
          <section className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Transcription Settings</h2>
            <p className="text-gray-600 text-sm mb-4">Choose between cloud API or local Whisper models</p>
            <ModelSelection settings={settings} onSettingsChange={updateSettings} />
          </section>
        )}

        {/* Audio Settings */}
        <section className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Audio Settings</h2>
          <p className="text-gray-600 text-sm mb-4">Configure microphone and audio format</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Microphone</label>
              <select className="w-full px-3 py-2 border rounded text-sm">
                <option>Default Microphone</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Audio Format</label>
              <select className="w-full px-3 py-2 border rounded text-sm">
                <option>WebM</option>
                <option>MP3</option>
                <option>WAV</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sample Rate</label>
              <select className="w-full px-3 py-2 border rounded text-sm">
                <option>44100 Hz</option>
                <option>48000 Hz</option>
              </select>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              Save Audio Settings
            </button>
          </div>
        </section>

        {/* Enrichment Presets */}
        <section className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Enrichment Presets</h2>
          <p className="text-gray-600 text-sm mb-4">Manage LLM enrichment templates</p>
          <div className="space-y-3">
            <div className="p-3 border rounded flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Format & Clean</div>
                <div className="text-xs text-gray-500">Fix grammar and formatting</div>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
            </div>
            <div className="p-3 border rounded flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Summarize</div>
                <div className="text-xs text-gray-500">Create concise summary</div>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
            </div>
            <div className="p-3 border rounded flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Expand</div>
                <div className="text-xs text-gray-500">Add details and context</div>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
            </div>
            <button className="w-full px-4 py-2 border border-dashed rounded hover:bg-gray-50 text-sm">
              + Add Custom Preset
            </button>
          </div>
        </section>

        {/* Export Settings */}
        <section className="bg-white border rounded-lg p-6">
          <ExportSettings />
        </section>

        {/* Application Settings */}
        <section className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Application Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Launch on Startup</div>
                <div className="text-xs text-gray-500">Start app when system boots</div>
              </div>
              <input type="checkbox" className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Minimize to Tray</div>
                <div className="text-xs text-gray-500">Keep app running in system tray</div>
              </div>
              <input type="checkbox" className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Auto-save Recordings</div>
                <div className="text-xs text-gray-500">Automatically save after enrichment</div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
