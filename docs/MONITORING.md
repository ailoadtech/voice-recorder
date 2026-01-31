# Monitoring & Analytics

Privacy-focused monitoring system for tracking usage, performance, API costs, and crashes.

## Overview

The monitoring service provides insights into app usage and performance while respecting user privacy. All data is stored locally and requires explicit user consent.

## Features

### 1. Usage Analytics
Track user interactions and feature adoption:
- Recording sessions (started, completed, failed)
- Transcription operations
- Enrichment operations
- Page views and navigation
- Component interactions

### 2. Performance Monitoring
Measure processing times and performance:
- Recording duration
- Transcription processing time
- Enrichment processing time
- API response times
- Storage operations

### 3. API Usage Tracking
Monitor API calls and costs:
- Service usage (transcription/LLM)
- Token consumption
- Estimated costs
- Success/failure rates
- Response times

### 4. Crash Reporting
Capture errors for debugging:
- Error messages and stack traces
- Component error boundaries
- Context information
- User agent and app version

## Privacy & Consent

### What We Track
- Anonymous usage statistics
- Performance metrics
- API usage and costs
- Error reports

### What We DON'T Track
- Audio recordings or content
- Transcription text
- Personal information
- User credentials or API keys
- Identifiable data

### User Control
- Explicit consent required
- Can be disabled anytime
- All data stored locally
- No external data transmission
- Clear data on demand

## Implementation

### Service Architecture

```
src/services/monitoring/
├── types.ts                    # Type definitions
├── MonitoringService.ts        # Core service
├── MonitoringService.test.ts   # Tests
├── index.ts                    # Exports
├── integration-example.tsx     # Usage examples
└── README.md                   # Documentation
```

### Components

```
src/components/
├── MonitoringConsent.tsx       # Consent dialog
├── MonitoringDashboard.tsx     # Statistics dashboard
└── MonitoringSettings.tsx      # User preferences
```

### Hooks

```
src/hooks/
└── useMonitoring.ts            # React hook for monitoring
```

## Usage

### Basic Setup

```typescript
import { monitoringService } from '@/services/monitoring';

// Initialize with user consent
await monitoringService.initialize(true);
```

### Track Events

```typescript
import { useMonitoring } from '@/hooks/useMonitoring';

function MyComponent() {
  const { trackEvent } = useMonitoring();

  const handleAction = () => {
    trackEvent('user_action', {
      action: 'button_click',
      component: 'MyComponent',
    });
  };
}
```

### Track Performance

```typescript
const { trackPerformance, measureAsync } = useMonitoring();

// Manual tracking
trackPerformance('operation_duration', 1500, 'ms');

// Automatic measurement
const result = await measureAsync(
  'async_operation',
  async () => {
    return await performOperation();
  }
);
```

### Track API Usage

```typescript
const { trackAPIUsage } = useMonitoring();

trackAPIUsage('transcription', duration, true, {
  tokensUsed: 100,
  cost: 0.01,
});
```

### Report Errors

```typescript
const { reportError } = useMonitoring();

try {
  await riskyOperation();
} catch (error) {
  reportError(error, { context: 'additional info' });
}
```

## Integration Points

### 1. Recording Flow

```typescript
// Start recording
trackEvent('recording_started');

// Complete recording
trackEvent('recording_completed', { 
  duration: recordingDuration 
});

// Track performance
trackPerformance('recording_duration', duration, 'ms');
```

### 2. Transcription Service

```typescript
const startTime = performance.now();
const result = await transcribe(audio);
const duration = performance.now() - startTime;

trackPerformance('transcription_duration', duration, 'ms');
trackAPIUsage('transcription', duration, true, {
  tokensUsed: result.tokens,
  cost: calculateCost(result.tokens),
});
```

### 3. LLM Enrichment

```typescript
const result = await measureAsync(
  'enrichment_duration',
  async () => await enrich(text)
);

trackAPIUsage('llm', result.duration, true, {
  tokensUsed: result.tokens,
  cost: result.cost,
});
```

### 4. Error Boundaries

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    monitoringService.reportCrash(error, errorInfo, {
      component: this.props.componentName,
    });
  }
}
```

## Dashboard

Access monitoring dashboard at `/settings/monitoring`:

### Statistics Displayed
- Total recordings
- Total transcriptions
- Total enrichments
- Average processing times
- API costs breakdown
- Performance metrics

### User Controls
- Enable/disable monitoring
- Toggle specific features
- Clear all data
- View recent events
- Export statistics

## Configuration

### Programmatic Configuration

```typescript
await monitoringService.updateConfig({
  analyticsEnabled: true,
  crashReportingEnabled: true,
  performanceMonitoringEnabled: true,
  apiUsageTrackingEnabled: true,
});
```

### UI Configuration

Users can configure monitoring through:
1. Initial consent dialog
2. Settings page (`/settings/monitoring`)
3. MonitoringSettings component

## Data Storage

### Storage Location
- Browser localStorage
- Key: `monitoring_data`
- Config key: `monitoring_config`

### Data Limits
- Max 1000 events stored
- Max 1000 metrics stored
- Max 100 crash reports
- Automatic trimming of old data

### Data Structure

```typescript
{
  events: AnalyticsEvent[],
  metrics: PerformanceMetric[],
  crashes: CrashReport[],
  apiUsage: APIUsageMetric[]
}
```

## API Reference

### MonitoringService

#### Methods

- `initialize(consent: boolean): Promise<void>`
- `trackEvent(name: string, properties?: object): void`
- `trackPerformance(name: string, value: number, unit: string, metadata?: object): void`
- `reportCrash(error: Error, errorInfo?: any, context?: object): void`
- `trackAPIUsage(usage: APIUsageMetric): void`
- `getStats(): MonitoringStats`
- `getRecentEvents(limit?: number): AnalyticsEvent[]`
- `getRecentCrashes(limit?: number): CrashReport[]`
- `getAPIUsage(startTime?: number, endTime?: number): APIUsageMetric[]`
- `clearData(): Promise<void>`
- `updateConfig(config: Partial<MonitoringConfig>): Promise<void>`
- `getConfig(): MonitoringConfig`

### useMonitoring Hook

```typescript
const {
  trackEvent,
  trackPerformance,
  reportError,
  trackAPIUsage,
  measureAsync,
  measureSync,
} = useMonitoring();
```

## Testing

### Run Tests

```bash
npm test src/services/monitoring
```

### Test Coverage

- Service initialization
- Event tracking with/without consent
- Performance tracking
- Crash reporting
- API usage tracking
- Statistics calculation
- Data persistence
- Configuration management

## Best Practices

### 1. Respect User Consent
Always check consent before tracking:

```typescript
const config = monitoringService.getConfig();
if (config.userConsent) {
  // Track data
}
```

### 2. Track Meaningful Events
Focus on user actions and outcomes:

```typescript
// Good
trackEvent('recording_completed', { duration: 5000 });

// Avoid
trackEvent('button_rendered');
```

### 3. Include Context
Add relevant metadata:

```typescript
trackEvent('error_occurred', {
  component: 'RecordingButton',
  errorType: 'PermissionDenied',
  userAction: 'start_recording',
});
```

### 4. Measure Critical Operations
Track performance of key operations:

```typescript
await measureAsync('transcription', async () => {
  return await transcribe(audio);
});
```

### 5. Monitor Costs
Track API usage to manage expenses:

```typescript
trackAPIUsage('llm', duration, true, {
  tokensUsed: tokens,
  cost: calculateCost(tokens),
});
```

## Cost Estimation

### Transcription (Whisper API)
- $0.006 per minute
- Track: audio duration, tokens used

### LLM (GPT-4)
- Input: $0.03 per 1K tokens
- Output: $0.06 per 1K tokens
- Track: input/output tokens, total cost

## Troubleshooting

### Monitoring Not Working

1. Check user consent:
```typescript
const config = monitoringService.getConfig();
console.log('Consent:', config.userConsent);
```

2. Verify initialization:
```typescript
await monitoringService.initialize(true);
```

3. Check localStorage:
```typescript
const data = localStorage.getItem('monitoring_data');
console.log('Stored data:', data);
```

### Data Not Persisting

- Check localStorage quota
- Verify browser permissions
- Clear and reinitialize

### Statistics Incorrect

- Clear data and start fresh
- Verify event names match
- Check time ranges for API usage

## Future Enhancements

### Planned Features
- Export statistics to CSV/JSON
- Visualizations and charts
- Trend analysis
- Cost predictions
- Performance alerts
- Comparison over time periods

### Potential Integrations
- External analytics (with consent)
- Error tracking services
- Performance monitoring tools
- Cost management platforms

## Security Considerations

### Data Protection
- No sensitive data collected
- Local storage only
- No network transmission
- User-controlled deletion

### Privacy Compliance
- GDPR-friendly (consent-based)
- No PII collection
- Transparent data usage
- User control and access

## Related Documentation

- [API Integration](./API_INTEGRATION.md)
- [Architecture](./ARCHITECTURE.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [User Guide](./USER_GUIDE.md)
