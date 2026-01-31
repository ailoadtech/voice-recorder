'use client';

import React, { useState, useEffect } from 'react';
import { monitoringService } from '@/services/monitoring';

export function MonitoringConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [config, setConfig] = useState(monitoringService.getConfig());

  useEffect(() => {
    // Show consent dialog if user hasn't made a choice yet
    const config = monitoringService.getConfig();
    if (config.userConsent === false && !localStorage.getItem('monitoring_consent_shown')) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = async () => {
    await monitoringService.initialize(true);
    localStorage.setItem('monitoring_consent_shown', 'true');
    setShowConsent(false);
    setConfig(monitoringService.getConfig());
  };

  const handleDecline = async () => {
    await monitoringService.initialize(false);
    localStorage.setItem('monitoring_consent_shown', 'true');
    setShowConsent(false);
    setConfig(monitoringService.getConfig());
  };

  if (!showConsent) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Help Us Improve</h2>
        
        <div className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-300">
          <p>
            We'd like to collect anonymous usage data to improve the app. This includes:
          </p>
          
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Usage statistics (recordings, transcriptions)</li>
            <li>Performance metrics (processing times)</li>
            <li>API usage and costs</li>
            <li>Crash reports (errors and diagnostics)</li>
          </ul>

          <p className="font-semibold">
            We do NOT collect:
          </p>
          
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Audio recordings or transcription content</li>
            <li>Personal information</li>
            <li>Identifiable data</li>
          </ul>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            All data is stored locally on your device. You can change this setting anytime in Settings.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            No Thanks
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export function MonitoringSettings() {
  const [config, setConfig] = useState(monitoringService.getConfig());

  const handleToggle = async (key: keyof typeof config) => {
    const newConfig = { ...config, [key]: !config[key] };
    await monitoringService.updateConfig(newConfig);
    setConfig(monitoringService.getConfig());
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all monitoring data?')) {
      await monitoringService.clearData();
      alert('Monitoring data cleared');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Monitoring Settings</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Control what data is collected to help improve the app.
        </p>
      </div>

      <div className="space-y-4">
        <ToggleSetting
          label="Enable Monitoring"
          description="Allow collection of anonymous usage data"
          checked={config.userConsent}
          onChange={() => handleToggle('userConsent')}
        />

        {config.userConsent && (
          <>
            <ToggleSetting
              label="Usage Analytics"
              description="Track app usage and feature adoption"
              checked={config.analyticsEnabled}
              onChange={() => handleToggle('analyticsEnabled')}
            />

            <ToggleSetting
              label="Performance Monitoring"
              description="Track processing times and performance metrics"
              checked={config.performanceMonitoringEnabled}
              onChange={() => handleToggle('performanceMonitoringEnabled')}
            />

            <ToggleSetting
              label="API Usage Tracking"
              description="Monitor API calls and costs"
              checked={config.apiUsageTrackingEnabled}
              onChange={() => handleToggle('apiUsageTrackingEnabled')}
            />

            <ToggleSetting
              label="Crash Reporting"
              description="Send error reports to help fix bugs"
              checked={config.crashReportingEnabled}
              onChange={() => handleToggle('crashReportingEnabled')}
            />
          </>
        )}
      </div>

      <div className="pt-4 border-t">
        <button
          onClick={handleClearData}
          className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          Clear All Monitoring Data
        </button>
      </div>
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="font-medium">{label}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{description}</div>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
