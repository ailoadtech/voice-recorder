/**
 * Monitoring Service
 * Handles analytics, crash reporting, performance monitoring, and API usage tracking
 * All monitoring respects user consent and privacy
 */

import {
  AnalyticsEvent,
  PerformanceMetric,
  CrashReport,
  APIUsageMetric,
  MonitoringConfig,
  MonitoringStats,
} from './types';

class MonitoringService {
  private config: MonitoringConfig = {
    analyticsEnabled: false,
    crashReportingEnabled: false,
    performanceMonitoringEnabled: false,
    apiUsageTrackingEnabled: false,
    userConsent: false,
  };

  private events: AnalyticsEvent[] = [];
  private metrics: PerformanceMetric[] = [];
  private crashes: CrashReport[] = [];
  private apiUsage: APIUsageMetric[] = [];

  private readonly MAX_STORED_EVENTS = 1000;
  private readonly STORAGE_KEY = 'monitoring_data';

  constructor() {
    this.loadConfig();
    this.loadStoredData();
  }

  /**
   * Initialize monitoring with user consent
   */
  async initialize(userConsent: boolean): Promise<void> {
    this.config.userConsent = userConsent;
    
    if (userConsent) {
      this.config.analyticsEnabled = true;
      this.config.crashReportingEnabled = true;
      this.config.performanceMonitoringEnabled = true;
      this.config.apiUsageTrackingEnabled = true;
    }

    await this.saveConfig();
  }

  /**
   * Track an analytics event
   */
  trackEvent(name: string, properties?: Record<string, any>): void {
    if (!this.config.analyticsEnabled || !this.config.userConsent) {
      return;
    }

    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(event);
    this.trimStoredData();
    this.persistData();

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', name, properties);
    }
  }

  /**
   * Track a performance metric
   */
  trackPerformance(
    name: string,
    value: number,
    unit: PerformanceMetric['unit'],
    metadata?: Record<string, any>
  ): void {
    if (!this.config.performanceMonitoringEnabled || !this.config.userConsent) {
      return;
    }

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);
    this.trimStoredData();
    this.persistData();

    if (process.env.NODE_ENV === 'development') {
      console.log('[Performance]', name, `${value}${unit}`, metadata);
    }
  }

  /**
   * Report a crash or error
   */
  reportCrash(error: Error, errorInfo?: any, context?: Record<string, any>): void {
    if (!this.config.crashReportingEnabled || !this.config.userConsent) {
      console.error('[Crash]', error, errorInfo, context);
      return;
    }

    const crash: CrashReport = {
      error,
      errorInfo,
      context,
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0',
    };

    this.crashes.push(crash);
    this.trimStoredData();
    this.persistData();

    console.error('[Crash Report]', crash);
  }

  /**
   * Track API usage and costs
   */
  trackAPIUsage(usage: Omit<APIUsageMetric, 'timestamp'>): void {
    if (!this.config.apiUsageTrackingEnabled || !this.config.userConsent) {
      return;
    }

    const metric: APIUsageMetric = {
      ...usage,
      timestamp: Date.now(),
    };

    this.apiUsage.push(metric);
    this.trimStoredData();
    this.persistData();

    if (process.env.NODE_ENV === 'development') {
      console.log('[API Usage]', usage.service, {
        tokens: usage.tokensUsed,
        cost: usage.cost,
        duration: usage.duration,
      });
    }
  }

  /**
   * Get monitoring statistics
   */
  getStats(): MonitoringStats {
    const recordings = this.events.filter(e => e.name === 'recording_completed');
    const transcriptions = this.events.filter(e => e.name === 'transcription_completed');
    const enrichments = this.events.filter(e => e.name === 'enrichment_completed');

    const transcriptionMetrics = this.metrics.filter(m => m.name === 'transcription_duration');
    const enrichmentMetrics = this.metrics.filter(m => m.name === 'enrichment_duration');

    const transcriptionCosts = this.apiUsage
      .filter(u => u.service === 'transcription' && u.cost)
      .reduce((sum, u) => sum + (u.cost || 0), 0);

    const llmCosts = this.apiUsage
      .filter(u => u.service === 'llm' && u.cost)
      .reduce((sum, u) => sum + (u.cost || 0), 0);

    return {
      totalRecordings: recordings.length,
      totalTranscriptions: transcriptions.length,
      totalEnrichments: enrichments.length,
      averageRecordingDuration:
        recordings.reduce((sum, e) => sum + (e.properties?.duration || 0), 0) /
        (recordings.length || 1),
      apiCosts: {
        transcription: transcriptionCosts,
        llm: llmCosts,
        total: transcriptionCosts + llmCosts,
      },
      performance: {
        averageTranscriptionTime:
          transcriptionMetrics.reduce((sum, m) => sum + m.value, 0) /
          (transcriptionMetrics.length || 1),
        averageEnrichmentTime:
          enrichmentMetrics.reduce((sum, m) => sum + m.value, 0) /
          (enrichmentMetrics.length || 1),
      },
    };
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit: number = 50): AnalyticsEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Get recent crashes
   */
  getRecentCrashes(limit: number = 10): CrashReport[] {
    return this.crashes.slice(-limit);
  }

  /**
   * Get API usage for a time period
   */
  getAPIUsage(startTime?: number, endTime?: number): APIUsageMetric[] {
    let usage = this.apiUsage;

    if (startTime) {
      usage = usage.filter(u => u.timestamp >= startTime);
    }

    if (endTime) {
      usage = usage.filter(u => u.timestamp <= endTime);
    }

    return usage;
  }

  /**
   * Clear all monitoring data
   */
  async clearData(): Promise<void> {
    this.events = [];
    this.metrics = [];
    this.crashes = [];
    this.apiUsage = [];
    await this.persistData();
  }

  /**
   * Update monitoring configuration
   */
  async updateConfig(config: Partial<MonitoringConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    await this.saveConfig();
  }

  /**
   * Get current configuration
   */
  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  // Private methods

  private loadConfig(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('monitoring_config');
      if (stored) {
        this.config = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load monitoring config:', error);
    }
  }

  private async saveConfig(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('monitoring_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save monitoring config:', error);
    }
  }

  private loadStoredData(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.events = data.events || [];
        this.metrics = data.metrics || [];
        this.crashes = data.crashes || [];
        this.apiUsage = data.apiUsage || [];
      }
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    }
  }

  private persistData(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = {
        events: this.events,
        metrics: this.metrics,
        crashes: this.crashes,
        apiUsage: this.apiUsage,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist monitoring data:', error);
    }
  }

  private trimStoredData(): void {
    if (this.events.length > this.MAX_STORED_EVENTS) {
      this.events = this.events.slice(-this.MAX_STORED_EVENTS);
    }
    if (this.metrics.length > this.MAX_STORED_EVENTS) {
      this.metrics = this.metrics.slice(-this.MAX_STORED_EVENTS);
    }
    if (this.crashes.length > 100) {
      this.crashes = this.crashes.slice(-100);
    }
    if (this.apiUsage.length > this.MAX_STORED_EVENTS) {
      this.apiUsage = this.apiUsage.slice(-this.MAX_STORED_EVENTS);
    }
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();
export default monitoringService;
