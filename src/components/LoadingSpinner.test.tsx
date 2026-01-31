import { render, screen } from '@testing-library/react';
import { LoadingSpinner, LoadingSkeleton } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders spinner with default size', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('renders spinner with text', () => {
    render(<LoadingSpinner text="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    let spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-4', 'h-4');

    rerender(<LoadingSpinner size="lg" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-12', 'h-12');
  });
});

describe('LoadingSkeleton', () => {
  it('renders default number of skeleton lines', () => {
    const { container } = render(<LoadingSkeleton />);
    const lines = container.querySelectorAll('.animate-shimmer');
    expect(lines).toHaveLength(3);
  });

  it('renders custom number of skeleton lines', () => {
    const { container } = render(<LoadingSkeleton lines={5} />);
    const lines = container.querySelectorAll('.animate-shimmer');
    expect(lines).toHaveLength(5);
  });

  it('applies shimmer animation class', () => {
    const { container } = render(<LoadingSkeleton />);
    const lines = container.querySelectorAll('.animate-shimmer');
    lines.forEach(line => {
      expect(line).toHaveClass('animate-shimmer');
    });
  });
});
