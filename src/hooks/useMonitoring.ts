/**
 * useMonitoring Hook
 * Provides easy access to monitoring functionality throughout the app
 */

import { useCallback, useEffect } from 'react';
import { monitoringService } from '@/services/monitoring';
import type { PerformanceMetric } from '@/services/monitoring/types';

export function useMonitoring() {
  /**
   * Track an analytics event
   */
  const trackEvent = useCallback((name: string, properties?: Record<string, any>) => {
    monitoringService.trackEvent(name, properties);
  }, []);

  /**
   * Track a performance metric
   */
  const trackPerformance = useCallback(
    (
      name: string,
      value: number,
      unit: PerformanceMetric['unit'],
      metadata?: Record<string, any>
    ) => {
      monitoringService.trackPerformance(name, value, unit, metadata);
    },
    []
  );

  /**
   * Report an error
   */
  const reportError = useCallback(
    (error: Error, errorInfo?: any, context?: Record<string, any>) => {
      monitoringService.reportCrash(error, errorInfo, context);
    },
    []
  );

  /**
   * Track API usage
   */
  const trackAPIUsage = useCallback(
    (
      service: 'transcription' | 'llm',
      duration: number,
      success: boolean,
      options?: {
        endpoint?: string;
        tokensUsed?: number;
        cost?: number;
      }
    ) => {
      monitoringService.trackAPIUsage({
        service,
        duration,
        success,
        ...options,
      });
    },
    []
  );

  /**
   * Measure and track the duration of an async operation
   */
  const measureAsync = useCallback(
    async <T,>(
      name: string,
      operation: () => Promise<T>,
      metadata?: Record<string, any>
    ): Promise<T> => {
      const startTime = performance.now();
      try {
        const result = await operation();
        const duration = performance.now() - startTime;
        trackPerformance(name, duration, 'ms', metadata);
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        trackPerformance(name, duration, 'ms', { ...metadata, error: true });
        throw error;
      }
    },
    [trackPerformance]
  );

  /**
   * Measure and track the duration of a sync operation
   */
  const measureSync = useCallback(
    <T,>(
      name: string,
      operation: () => T,
      metadata?: Record<string, any>
    ): T => {
      const startTime = performance.now();
      try {
        const result = operation();
        const duration = performance.now() - startTime;
        trackPerformance(name, duration, 'ms', metadata);
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        trackPerformance(name, duration, 'ms', { ...metadata, error: true });
        throw error;
      }
    },
    [trackPerformance]
  );

  return {
    trackEvent,
    trackPerformance,
    reportError,
    trackAPIUsage,
    measureAsync,
    measureSync,
  };
}

/**
 * Hook to track page views
 */
export function usePageTracking(pageName: string) {
  const { trackEvent } = useMonitoring();

  useEffect(() => {
    trackEvent('page_view', { page: pageName });
  }, [pageName, trackEvent]);
}

/**
 * Hook to track component mount/unmount
 */
export function useComponentTracking(componentName: string) {
  const { trackEvent } = useMonitoring();

  useEffect(() => {
    trackEvent('component_mounted', { component: componentName });

    return () => {
      trackEvent('component_unmounted', { component: componentName });
    };
  }, [componentName, trackEvent]);
}
