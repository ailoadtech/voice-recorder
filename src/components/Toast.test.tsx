import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastContainer } from './Toast';
import type { ToastMessage } from './Toast';

describe('ToastContainer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should display toast when event is dispatched', () => {
    render(<ToastContainer />);

    const toast: ToastMessage = {
      id: 'test-1',
      type: 'success',
      title: 'Success',
      message: 'Operation completed',
    };

    act(() => {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: toast }));
    });

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Operation completed')).toBeInTheDocument();
  });

  it('should display error toast with correct styling', () => {
    render(<ToastContainer />);

    const toast: ToastMessage = {
      id: 'test-2',
      type: 'error',
      title: 'Error',
      message: 'Something went wrong',
    };

    act(() => {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: toast }));
    });

    const toastElement = screen.getByRole('alert');
    expect(toastElement).toHaveClass('bg-red-50');
  });

  it('should display warning toast with correct icon', () => {
    render(<ToastContainer />);

    const toast: ToastMessage = {
      id: 'test-3',
      type: 'warning',
      title: 'Warning',
      message: 'Please be careful',
    };

    act(() => {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: toast }));
    });

    expect(screen.getByText('⚠')).toBeInTheDocument();
  });

  it('should auto-dismiss toast after duration', async () => {
    render(<ToastContainer />);

    const toast: ToastMessage = {
      id: 'test-4',
      type: 'info',
      title: 'Info',
      message: 'This will disappear',
      duration: 3000,
    };

    act(() => {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: toast }));
    });

    expect(screen.getByText('Info')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3300); // Duration + exit animation
    });

    await waitFor(() => {
      expect(screen.queryByText('Info')).not.toBeInTheDocument();
    });
  });

  it('should not auto-dismiss when duration is 0', async () => {
    render(<ToastContainer />);

    const toast: ToastMessage = {
      id: 'test-5',
      type: 'error',
      title: 'Persistent Error',
      message: 'This stays',
      duration: 0,
    };

    act(() => {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: toast }));
    });

    expect(screen.getByText('Persistent Error')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(screen.getByText('Persistent Error')).toBeInTheDocument();
  });

  it('should dismiss toast when close button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ToastContainer />);

    const toast: ToastMessage = {
      id: 'test-6',
      type: 'success',
      title: 'Dismissible',
      message: 'Click to close',
      duration: 0,
    };

    act(() => {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: toast }));
    });

    const dismissButton = screen.getByLabelText('Dismiss');
    await user.click(dismissButton);

    act(() => {
      jest.advanceTimersByTime(300); // Exit animation
    });

    await waitFor(() => {
      expect(screen.queryByText('Dismissible')).not.toBeInTheDocument();
    });
  });

  it('should display action button and execute action', async () => {
    const user = userEvent.setup({ delay: null });
    const mockAction = jest.fn();
    render(<ToastContainer />);

    const toast: ToastMessage = {
      id: 'test-7',
      type: 'error',
      title: 'Error with Action',
      message: 'Click to retry',
      action: {
        label: 'Retry',
        onClick: mockAction,
      },
      duration: 0,
    };

    act(() => {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: toast }));
    });

    const actionButton = screen.getByText('Retry');
    await user.click(actionButton);

    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('should display multiple toasts', () => {
    render(<ToastContainer />);

    const toast1: ToastMessage = {
      id: 'test-8',
      type: 'success',
      title: 'First',
      message: 'First message',
    };

    const toast2: ToastMessage = {
      id: 'test-9',
      type: 'error',
      title: 'Second',
      message: 'Second message',
    };

    act(() => {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: toast1 }));
      window.dispatchEvent(new CustomEvent('show-toast', { detail: toast2 }));
    });

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('should handle multiline messages', () => {
    render(<ToastContainer />);

    const toast: ToastMessage = {
      id: 'test-10',
      type: 'info',
      title: 'Multiline',
      message: 'Line 1\nLine 2\nLine 3',
    };

    act(() => {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: toast }));
    });

    const messageElement = screen.getByText(/Line 1/);
    expect(messageElement).toHaveClass('whitespace-pre-wrap');
  });
});
