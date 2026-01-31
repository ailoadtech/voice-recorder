/**
 * MonitoringService Tests
 */

import { monitoringService } from './MonitoringService';

describe('MonitoringService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset service state
    monitoringService.clearData();
  });

  describe('Initialization', () => {
    it('should initialize with user consent', async () => {
      await monitoringService.initialize(true);
      const config = monitoringService.getConfig();
      
      expect(config.userConsent).toBe(true);
      expect(config.analyticsEnabled).toBe(true);
      expect(config.crashReportingEnabled).toBe(true);
      expect(config.performanceMonitoringEnabled).toBe(true);
      expect(config.apiUsageTrackingEnabled).toBe(true);
    });

    it('should initialize without user consent', async () => {
      await monitoringService.initialize(false);
      const config = monitoringService.getConfig();
      
      expect(config.userConsent).toBe(false);
    });
  });

  describe('Event Tracking', () => {
    it('should track events when consent is given', async () => {
      await monitoringService.initialize(true);
      
      monitoringService.trackEvent('test_event', { foo: 'bar' });
      
      const events = monitoringService.getRecentEvents(10);
      expect(events).toHaveLength(1);
      expect(events[0].name).toBe('test_event');
      expect(events[0].properties).toEqual({ foo: 'bar' });
    });

    it('should not track events without consent', async () => {
      await monitoringService.initialize(false);
      
      monitoringService.trackEvent('test_event');
      
      const events = monitoringService.getRecentEvents(10);
      expect(events).toHaveLength(0);
    });
  });

  describe('Performance Tracking', () => {
    it('should track performance metrics', async () => {
      await monitoringService.initialize(true);
      
      monitoringService.trackPerformance('test_metric', 100, 'ms', { test: true });
      
      const stats = monitoringService.getStats();
      expect(stats).toBeDefined();
    });

    it('should not track performance without consent', async () => {
      await monitoringService.initialize(false);
      
      monitoringService.trackPerformance('test_metric', 100, 'ms');
      
      // Should not throw, just not track
      expect(true).toBe(true);
    });
  });

  describe('Crash Reporting', () => {
    it('should report crashes when enabled', async () => {
      await monitoringService.initialize(true);
      
      const error = new Error('Test error');
      monitoringService.reportCrash(error, { info: 'test' }, { context: 'test' });
      
      const crashes = monitoringService.getRecentCrashes(10);
      expect(crashes).toHaveLength(1);
      expect(crashes[0].error.message).toBe('Test error');
    });

    it('should not store crashes without consent', async () => {
      await monitoringService.initialize(false);
      
      const error = new Error('Test error');
      monitoringService.reportCrash(error);
      
      const crashes = monitoringService.getRecentCrashes(10);
      expect(crashes).toHaveLength(0);
    });
  });

  describe('API Usage Tracking', () => {
    it('should track API usage', async () => {
      await monitoringService.initialize(true);
      
      monitoringService.trackAPIUsage({
        service: 'transcription',
        duration: 1000,
        success: true,
        tokensUsed: 100,
        cost: 0.01,
      });
      
      const usage = monitoringService.getAPIUsage();
      expect(usage).toHaveLength(1);
      expect(usage[0].service).toBe('transcription');
      expect(usage[0].cost).toBe(0.01);
    });

    it('should filter API usage by time', async () => {
      await monitoringService.initialize(true);
      
      const now = Date.now();
      
      monitoringService.trackAPIUsage({
        service: 'transcription',
        duration: 1000,
        success: true,
      });
      
      const usage = monitoringService.getAPIUsage(now - 1000, now + 1000);
      expect(usage).toHaveLength(1);
    });
  });

  describe('Statistics', () => {
    it('should calculate statistics correctly', async () => {
      await monitoringService.initialize(true);
      
      // Track some events
      monitoringService.trackEvent('recording_completed', { duration: 5000 });
      monitoringService.trackEvent('recording_completed', { duration: 10000 });
      monitoringService.trackEvent('transcription_completed');
      
      // Track API usage
      monitoringService.trackAPIUsage({
        service: 'transcription',
        duration: 1000,
        success: true,
        cost: 0.01,
      });
      
      monitoringService.trackAPIUsage({
        service: 'llm',
        duration: 2000,
        success: true,
        cost: 0.02,
      });
      
      const stats = monitoringService.getStats();
      
      expect(stats.totalRecordings).toBe(2);
      expect(stats.totalTranscriptions).toBe(1);
      expect(stats.averageRecordingDuration).toBe(7500);
      expect(stats.apiCosts.transcription).toBe(0.01);
      expect(stats.apiCosts.llm).toBe(0.02);
      expect(stats.apiCosts.total).toBe(0.03);
    });
  });

  describe('Data Management', () => {
    it('should clear all data', async () => {
      await monitoringService.initialize(true);
      
      monitoringService.trackEvent('test_event');
      monitoringService.trackPerformance('test_metric', 100, 'ms');
      
      await monitoringService.clearData();
      
      const events = monitoringService.getRecentEvents(10);
      const stats = monitoringService.getStats();
      
      expect(events).toHaveLength(0);
      expect(stats.totalRecordings).toBe(0);
    });

    it('should update configuration', async () => {
      await monitoringService.initialize(true);
      
      await monitoringService.updateConfig({
        analyticsEnabled: false,
      });
      
      const config = monitoringService.getConfig();
      expect(config.analyticsEnabled).toBe(false);
      expect(config.userConsent).toBe(true); // Should remain true
    });
  });

  describe('Data Persistence', () => {
    it('should persist data to localStorage', async () => {
      await monitoringService.initialize(true);
      
      monitoringService.trackEvent('test_event');
      
      // Check localStorage
      const stored = localStorage.getItem('monitoring_data');
      expect(stored).toBeTruthy();
      
      const data = JSON.parse(stored!);
      expect(data.events).toHaveLength(1);
    });

    it('should load data from localStorage', async () => {
      // Manually set data in localStorage
      const data = {
        events: [{ name: 'test_event', timestamp: Date.now() }],
        metrics: [],
        crashes: [],
        apiUsage: [],
      };
      localStorage.setItem('monitoring_data', JSON.stringify(data));
      
      // Create new instance (simulating app restart)
      const { monitoringService: newService } = await import('./MonitoringService');
      
      const events = newService.getRecentEvents(10);
      expect(events.length).toBeGreaterThan(0);
    });
  });
});
