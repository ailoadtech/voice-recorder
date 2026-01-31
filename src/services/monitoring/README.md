# Monitoring Service

Privacy-focused monitoring service for tracking usage, performance, API costs, and crashes.

## Features

- **Usage Analytics**: Track app usage patterns and feature adoption
- **Performance Monitoring**: Measure processing times and performance metrics
- **API Usage Tracking**: Monitor API calls, token usage, and costs
- **Crash Reporting**: Capture and report errors for debugging
- **Privacy-First**: All data stored locally, requires user consent

## Quick Start

```typescript
import { monitoringService } from '@/services/monitoring';
import { useMonitoring } from '@/hooks/useMonitoring';

// Initialize with user consent
await monitoringService.initialize(true);

// Track events
monitoringService.trackEvent('recording_completed', { duration: 5000 });

// Track performance
monitoringService.trackPerformance('transcription_duration', 1500, 'ms');

// Track API usage
monitoringService.trackAPIUsage({
  service: 'transcription',
  duration: 1500,
  success: true,
  tokensUsed: 100,
  cost: 0.01,
});

// Report crashes
monitoringService.reportCrash(error, errorInfo, context);
```

## Using the Hook

```typescript
function MyComponent() {
  const { trackEvent, trackPerformance, measureAsync } = useMonitoring();

  const handleRecording = async () => {
    trackEvent('recording_started');
    
    const result = await measureAsync(
      'recording_duration',
      async () => {
        // Your async operation
        return await recordAudio();
      }
    );
    
    trackEvent('recording_completed', { duration: result.duration });
  };
}
```

## Components

### MonitoringConsent

Shows a consent dialog on first app launch:

```typescript
import { MonitoringConsent } from '@/components/MonitoringConsent';

function App() {
  return (
    <>
      <MonitoringConsent />
      {/* Your app */}
    </>
  );
}
```

### MonitoringDashboard

Displays monitoring statistics:

```typescript
import { MonitoringDashboard } from '@/components/MonitoringDashboard';

function SettingsPage() {
  return <MonitoringDashboard />;
}
```

### MonitoringSettings

User controls for monitoring preferences:

```typescript
import { MonitoringSettings } from '@/components/MonitoringConsent';

function SettingsPage() {
  return <MonitoringSettings />;
}
```

## API Reference

### MonitoringService

#### `initialize(userConsent: boolean): Promise<void>`
Initialize monitoring with user consent.

#### `trackEvent(name: string, properties?: Record<string, any>): void`
Track an analytics event.

#### `trackPerformance(name: string, value: number, unit: 'ms' | 'bytes' | 'count' | 'percentage', metadata?: Record<string, any>): void`
Track a performance metric.

#### `reportCrash(error: Error, errorInfo?: any, context?: Record<string, any>): void`
Report a crash or error.

#### `trackAPIUsage(usage: APIUsageMetric): void`
Track API usage and costs.

#### `getStats(): MonitoringStats`
Get aggregated statistics.

#### `clearData(): Promise<void>`
Clear all monitoring data.

## Privacy

- All data is stored locally in browser localStorage
- No data is sent to external servers
- User consent is required before any tracking
- Users can disable monitoring at any time
- Users can clear all collected data

## What We Track

### Events
- Recording started/completed
- Transcription started/completed
- Enrichment started/completed
- Page views
- Component interactions

### Performance
- Recording duration
- Transcription processing time
- Enrichment processing time
- API response times

### API Usage
- Service name (transcription/llm)
- Tokens used
- Estimated costs
- Success/failure status

### Crashes
- Error messages and stack traces
- Component error boundaries
- Context information
- User agent and app version

## What We DON'T Track

- Audio recordings or content
- Transcription text or content
- Personal information
- Identifiable data
- User credentials or API keys

## Integration Examples

### Track Recording Flow

```typescript
const { trackEvent, trackPerformance, trackAPIUsage } = useMonitoring();

// Start recording
trackEvent('recording_started');

// Complete recording
trackEvent('recording_completed', { 
  duration: recordingDuration,
  format: 'webm' 
});

// Track transcription
const startTime = performance.now();
const transcription = await transcribe(audio);
const duration = performance.now() - startTime;

trackPerformance('transcription_duration', duration, 'ms');
trackAPIUsage({
  service: 'transcription',
  duration,
  success: true,
  tokensUsed: transcription.tokens,
  cost: calculateCost(transcription.tokens),
});
```

### Error Boundary Integration

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    monitoringService.reportCrash(error, errorInfo, {
      component: this.props.componentName,
    });
  }
}
```

## Configuration

Monitoring can be configured through the UI or programmatically:

```typescript
await monitoringService.updateConfig({
  analyticsEnabled: true,
  crashReportingEnabled: true,
  performanceMonitoringEnabled: true,
  apiUsageTrackingEnabled: true,
});
```

## Testing

Run tests:

```bash
npm test src/services/monitoring
```

## Best Practices

1. **Always respect user consent** - Check consent before tracking
2. **Track meaningful events** - Focus on user actions and outcomes
3. **Include context** - Add relevant metadata to events
4. **Measure performance** - Track critical operations
5. **Report errors** - Help identify and fix bugs
6. **Monitor costs** - Track API usage to manage expenses
