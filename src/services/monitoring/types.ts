/**
 * Monitoring Service Types
 * Defines types for analytics, crash reporting, and performance monitoring
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface CrashReport {
  error: Error;
  errorInfo?: any;
  context?: Record<string, any>;
  timestamp: number;
  userAgent: string;
  appVersion: string;
}

export interface APIUsageMetric {
  service: 'transcription' | 'llm';
  endpoint?: string;
  tokensUsed?: number;
  cost?: number;
  duration: number;
  success: boolean;
  timestamp: number;
}

export interface MonitoringConfig {
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  performanceMonitoringEnabled: boolean;
  apiUsageTrackingEnabled: boolean;
  userConsent: boolean;
}

export interface MonitoringStats {
  totalRecordings: number;
  totalTranscriptions: number;
  totalEnrichments: number;
  averageRecordingDuration: number;
  apiCosts: {
    transcription: number;
    llm: number;
    total: number;
  };
  performance: {
    averageTranscriptionTime: number;
    averageEnrichmentTime: number;
  };
}
