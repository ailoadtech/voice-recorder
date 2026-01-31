'use client';

import React, { useState, useEffect } from 'react';
import { monitoringService } from '@/services/monitoring';
import type { MonitoringStats, MonitoringConfig } from '@/services/monitoring/types';

export function MonitoringDashboard() {
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [config, setConfig] = useState<MonitoringConfig | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setStats(monitoringService.getStats());
    setConfig(monitoringService.getConfig());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (!stats || !config) {
    return <div className="p-4">Loading monitoring data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Monitoring Dashboard</h2>
        <div className="text-sm text-gray-500">
          {config.userConsent ? '✓ Monitoring Enabled' : '✗ Monitoring Disabled'}
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Recordings"
          value={stats.totalRecordings}
          subtitle={`Avg: ${formatDuration(stats.averageRecordingDuration)}`}
        />
        <StatCard
          title="Transcriptions"
          value={stats.totalTranscriptions}
          subtitle={`Avg: ${formatDuration(stats.performance.averageTranscriptionTime)}`}
        />
        <StatCard
          title="Enrichments"
          value={stats.totalEnrichments}
          subtitle={`Avg: ${formatDuration(stats.performance.averageEnrichmentTime)}`}
        />
      </div>

      {/* API Costs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">API Costs</h3>
        <div className="space-y-3">
          <CostRow
            label="Transcription"
            amount={stats.apiCosts.transcription}
          />
          <CostRow
            label="LLM Enrichment"
            amount={stats.apiCosts.llm}
          />
          <div className="border-t pt-3">
            <CostRow
              label="Total"
              amount={stats.apiCosts.total}
              bold
            />
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Performance</h3>
        <div className="space-y-3">
          <MetricRow
            label="Avg Transcription Time"
            value={formatDuration(stats.performance.averageTranscriptionTime)}
          />
          <MetricRow
            label="Avg Enrichment Time"
            value={formatDuration(stats.performance.averageEnrichmentTime)}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number;
  subtitle?: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
      {subtitle && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</div>
      )}
    </div>
  );
}

function CostRow({
  label,
  amount,
  bold = false,
}: {
  label: string;
  amount: number;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={bold ? 'font-semibold' : ''}>{label}</span>
      <span className={bold ? 'font-semibold text-lg' : ''}>
        {new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount)}
      </span>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
