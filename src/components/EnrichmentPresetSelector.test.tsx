import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnrichmentPresetSelector } from './EnrichmentPresetSelector';
import { ENRICHMENT_PRESETS } from '@/services/llm/presets';

describe('EnrichmentPresetSelector', () => {
  const mockOnPresetSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all presets', () => {
    render(
      <EnrichmentPresetSelector onPresetSelect={mockOnPresetSelect} />
    );

    ENRICHMENT_PRESETS.forEach(preset => {
      expect(screen.getByText(preset.name)).toBeInTheDocument();
    });
  });

  it('calls onPresetSelect when preset is clicked', () => {
    render(
      <EnrichmentPresetSelector onPresetSelect={mockOnPresetSelect} />
    );

    const quickNotesButton = screen.getByText('Quick Notes');
    fireEvent.click(quickNotesButton);

    expect(mockOnPresetSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'quick-notes' })
    );
  });

  it('highlights selected preset', () => {
    render(
      <EnrichmentPresetSelector
        selectedPresetId="meeting-summary"
        onPresetSelect={mockOnPresetSelect}
      />
    );

    const selectedButton = screen.getByText('Meeting Summary').closest('button');
    expect(selectedButton).toHaveClass('border-blue-500', 'bg-blue-50');
  });

  it('displays description for selected preset', () => {
    render(
      <EnrichmentPresetSelector
        selectedPresetId="task-list"
        onPresetSelect={mockOnPresetSelect}
      />
    );

    expect(screen.getByText(/extract action items/i)).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(
      <EnrichmentPresetSelector
        onPresetSelect={mockOnPresetSelect}
        disabled={true}
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <EnrichmentPresetSelector
        onPresetSelect={mockOnPresetSelect}
        className="custom-class"
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });
});
