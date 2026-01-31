/**
 * Tests for ModelCorruptionDialog component
 * Validates corruption recovery UI functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModelCorruptionDialog } from './ModelCorruptionDialog';
import type { ModelVariant } from '@/services/whisper/types';

describe('ModelCorruptionDialog', () => {
  const mockOnRedownload = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <ModelCorruptionDialog
        variant="tiny"
        isOpen={false}
        onRedownload={mockOnRedownload}
        onCancel={mockOnCancel}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <ModelCorruptionDialog
        variant="tiny"
        isOpen={true}
        onRedownload={mockOnRedownload}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Corrupted Model File')).toBeInTheDocument();
    expect(screen.getByText(/tiny/i)).toBeInTheDocument();
  });

  it('should display corruption information', () => {
    render(
      <ModelCorruptionDialog
        variant="base"
        isOpen={true}
        onRedownload={mockOnRedownload}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/corrupted or failed validation/i)).toBeInTheDocument();
    expect(screen.getByText(/Possible causes:/i)).toBeInTheDocument();
    expect(screen.getByText(/Download was interrupted/i)).toBeInTheDocument();
    expect(screen.getByText(/File integrity check failed/i)).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <ModelCorruptionDialog
        variant="small"
        isOpen={true}
        onRedownload={mockOnRedownload}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnRedownload).not.toHaveBeenCalled();
  });

  it('should call onRedownload when re-download button is clicked', () => {
    render(
      <ModelCorruptionDialog
        variant="medium"
        isOpen={true}
        onRedownload={mockOnRedownload}
        onCancel={mockOnCancel}
      />
    );

    const redownloadButton = screen.getByText(/Re-download Model/i);
    fireEvent.click(redownloadButton);

    expect(mockOnRedownload).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('should disable buttons when isRedownloading is true', () => {
    render(
      <ModelCorruptionDialog
        variant="large"
        isOpen={true}
        onRedownload={mockOnRedownload}
        onCancel={mockOnCancel}
        isRedownloading={true}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    const redownloadButton = screen.getByText(/Re-downloading.../i);

    expect(cancelButton).toBeDisabled();
    expect(redownloadButton).toBeDisabled();
  });

  it('should show loading state when redownloading', () => {
    render(
      <ModelCorruptionDialog
        variant="tiny"
        isOpen={true}
        onRedownload={mockOnRedownload}
        onCancel={mockOnCancel}
        isRedownloading={true}
      />
    );

    expect(screen.getByText(/Re-downloading.../i)).toBeInTheDocument();
  });

  it('should display the correct variant name', () => {
    const variants: ModelVariant[] = ['tiny', 'base', 'small', 'medium', 'large'];

    variants.forEach((variant) => {
      const { unmount } = render(
        <ModelCorruptionDialog
          variant={variant}
          isOpen={true}
          onRedownload={mockOnRedownload}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getAllByText(variant, { exact: false }).length).toBeGreaterThan(0);
      unmount();
    });
  });
});
