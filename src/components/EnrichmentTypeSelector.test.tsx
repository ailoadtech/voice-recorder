import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnrichmentTypeSelector } from './EnrichmentTypeSelector';
import type { EnrichmentType } from '@/services/llm/types';

describe('EnrichmentTypeSelector', () => {
  const mockOnTypeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default selected type', () => {
    render(
      <EnrichmentTypeSelector
        selectedType="format"
        onTypeChange={mockOnTypeChange}
      />
    );

    const select = screen.getByRole('combobox', { name: /enrichment type/i });
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('format');
  });

  it('displays all enrichment types', () => {
    render(
      <EnrichmentTypeSelector
        selectedType="format"
        onTypeChange={mockOnTypeChange}
      />
    );

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(6);
    expect(screen.getByRole('option', { name: /format & clean/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /summarize/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /expand & elaborate/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /bullet points/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /action items/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /custom prompt/i })).toBeInTheDocument();
  });

  it('displays description for selected type', () => {
    render(
      <EnrichmentTypeSelector
        selectedType="summarize"
        onTypeChange={mockOnTypeChange}
      />
    );

    expect(screen.getByText(/create a concise summary/i)).toBeInTheDocument();
  });

  it('calls onTypeChange when selection changes', () => {
    render(
      <EnrichmentTypeSelector
        selectedType="format"
        onTypeChange={mockOnTypeChange}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'summarize' } });

    expect(mockOnTypeChange).toHaveBeenCalledWith('summarize');
  });

  it('can be disabled', () => {
    render(
      <EnrichmentTypeSelector
        selectedType="format"
        onTypeChange={mockOnTypeChange}
        disabled={true}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <EnrichmentTypeSelector
        selectedType="format"
        onTypeChange={mockOnTypeChange}
        className="custom-class"
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });
});
