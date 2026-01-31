'use client';

import React from 'react';
import { MonitoringDashboard, MonitoringSettings } from '@/components';
import { usePageTracking } from '@/hooks';

export default function MonitoringPage() {
  usePageTracking('settings_monitoring');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Monitoring & Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View usage statistics and manage monitoring preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <MonitoringSettings />
          </div>
        </div>

        {/* Dashboard */}
        <div className="lg:col-span-2">
          <MonitoringDashboard />
        </div>
      </div>
    </div>
  );
}
