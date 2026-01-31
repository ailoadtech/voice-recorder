# Toast Notification System

## Overview

The Toast notification system provides a user-friendly way to display temporary messages, errors, warnings, and success notifications in the application. It's designed to meet the requirements of Task 8.1 for error handling and user feedback.

## Components

### ToastContainer

The main container component that manages and displays all toast notifications. It should be included once in your application layout.

```tsx
import { ToastContainer } from '@/components/Toast';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
```

### Toast Types

- **success**: Green styling, checkmark icon
- **error**: Red styling, X icon
- **warning**: Yellow styling, warning icon
- **info**: Blue styling, info icon

## Usage

### Basic Usage

```tsx
import { showToast } from '@/lib/notifications';

// Simple success message
showToast('success', 'Success!', 'Operation completed successfully');

// Error message
showToast('error', 'Error', 'Something went wrong');

// Warning
showToast('warning', 'Warning', 'Please be careful');

// Info
showToast('info', 'Info', 'Here is some information');
```

### With Action Button

```tsx
showToast('error', 'Download Failed', 'Failed to download model', {
  action: {
    label: 'Retry',
    onClick: () => {
      // Retry logic here
    },
  },
});
```

### Custom Duration

```tsx
// Auto-dismiss after 10 seconds
showToast('info', 'Info', 'This will disappear in 10 seconds', {
  duration: 10000,
});

// Never auto-dismiss (duration: 0)
showToast('error', 'Critical Error', 'This stays until dismissed', {
  duration: 0,
});
```

## Error Notifications

The `ErrorNotifications` utility provides pre-configured error messages for common scenarios:

### Download Errors

```tsx
import { ErrorNotifications } from '@/lib/notifications';

// Download failed with retry
ErrorNotifications.downloadFailed('tiny', error, () => retryDownload());

// Insufficient disk space
ErrorNotifications.insufficientDiskSpace('medium', requiredBytes, availableBytes);

// Corrupted model
ErrorNotifications.corruptedModel('base', () => redownloadModel());

// Network error
ErrorNotifications.networkError('small', () => retryDownload());

// Checksum mismatch
ErrorNotifications.checksumMismatch('large', () => redownloadModel());
```

### Transcription Errors

```tsx
// Transcription failed
ErrorNotifications.transcriptionFailed(error, fallbackAvailable);

// Model load failed
ErrorNotifications.modelLoadFailed('tiny', error);
```

### System Warnings

```tsx
// Low memory warning
ErrorNotifications.lowMemoryWarning(availableMemoryGB);

// Fallback notification
ErrorNotifications.fallbackToApi('Model not loaded');
```

## Success Notifications

```tsx
import { SuccessNotifications } from '@/lib/notifications';

// Model downloaded
SuccessNotifications.modelDownloaded('tiny');

// Model deleted
SuccessNotifications.modelDeleted('base');

// Transcription complete
SuccessNotifications.transcriptionComplete();
```

## Features

### Auto-Dismiss

Toasts automatically dismiss after their duration (default: 5000ms). Set `duration: 0` to prevent auto-dismiss.

### Manual Dismiss

Users can click the X button to dismiss any toast immediately.

### Action Buttons

Toasts can include an action button that executes a callback and dismisses the toast.

### Multiline Messages

Messages support newlines (`\n`) and will display properly formatted.

### Stacking

Multiple toasts stack vertically in the top-right corner of the screen.

### Animations

Toasts slide in from the right and fade out when dismissed.

### Accessibility

- Uses `role="alert"` for screen readers
- Includes `aria-live="polite"` on the container
- Dismiss buttons have proper `aria-label`

## Requirements Coverage

This implementation satisfies the following requirements:

### Requirement 9.1: Download Error Messages
- Displays specific error reasons
- Provides suggested actions
- Includes retry functionality

### Requirement 9.2: Transcription Error Messages
- Provides actionable error messages
- Formats errors based on type
- Suggests solutions

### Requirement 9.3: Disk Space Notifications
- Shows required vs available space
- Calculates how much space to free
- Prevents downloads when insufficient space

### Requirement 9.4: Corruption Recovery
- Detects corrupted files
- Offers re-download action
- Provides clear messaging

### Requirement 9.5: Status Updates
- Displays progress information
- Shows current operation stage
- Provides user feedback

### Requirement 6.3: Fallback Notification
- Notifies user about fallback
- Explains the reason
- Maintains transparency

### Requirement 10.4: Memory Warnings
- Warns about low memory
- Suggests alternatives
- Helps prevent failures

## Styling

The toast system uses Tailwind CSS classes and supports dark mode automatically. Colors and styles are consistent with the application's design system.

## Testing

The notification system includes comprehensive tests:

- Component rendering tests
- Event handling tests
- Auto-dismiss behavior tests
- Action button tests
- Multiple toast tests
- Error formatting tests

Run tests with:
```bash
npm test Toast.test.tsx
npm test notifications.test.ts
```

## Best Practices

1. **Use appropriate types**: Choose the correct toast type for the message
2. **Keep titles short**: Use concise, descriptive titles
3. **Provide context**: Include enough information for users to understand and act
4. **Use actions wisely**: Only include actions when there's a clear next step
5. **Set duration appropriately**: Errors should persist (duration: 0), info can auto-dismiss
6. **Format messages**: Use newlines for readability in longer messages
7. **Test error paths**: Ensure all error scenarios show appropriate notifications
