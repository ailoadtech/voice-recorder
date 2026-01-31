import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnrichmentPanel } from './EnrichmentPanel';
import { LLMService } from '@/services/llm';

// Mock LLMService
jest.mock('@/services/llm', () => ({
  LLMService: jest.fn(),
}));

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('EnrichmentPanel', () => {
  const mockEnrich = jest.fn();
  const mockOnEnrichmentComplete = jest.fn();
  const testText = 'This is test transcribed text.';

  beforeEach(() => {
    jest.clearAllMocks();
    (LLMService as unknown as jest.Mock).mockImplementation(() => ({
      enrich: mockEnrich,
    }));
  });

  it('renders all components', () => {
    render(
      <EnrichmentPanel
        transcribedText={testText}
        onEnrichmentComplete={mockOnEnrichmentComplete}
      />
    );

    expect(screen.getByText(/quick presets/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /enrichment type/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /process text/i })).toBeInTheDocument();
  });

  it('shows custom prompt input when custom type is selected', () => {
    render(
      <EnrichmentPanel
        transcribedText={testText}
        onEnrichmentComplete={mockOnEnrichmentComplete}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'custom' } });

    expect(screen.getByRole('textbox', { name: /custom instructions/i })).toBeInTheDocument();
  });

  it('disables process button when no text', () => {
    render(
      <EnrichmentPanel
        transcribedText=""
        onEnrichmentComplete={mockOnEnrichmentComplete}
      />
    );

    const processButton = screen.getByRole('button', { name: /process text/i });
    expect(processButton).toBeDisabled();
  });

  it('processes text successfully', async () => {
    const mockResult = {
      enrichedText: 'This is enriched text.',
      originalText: testText,
      enrichmentType: 'format' as const,
      model: 'gpt-4',
      processingTime: 1500,
    };

    mockEnrich.mockResolvedValueOnce(mockResult);

    render(
      <EnrichmentPanel
        transcribedText={testText}
        onEnrichmentComplete={mockOnEnrichmentComplete}
      />
    );

    const processButton = screen.getByRole('button', { name: /process text/i });
    fireEvent.click(processButton);

    // Should show loading state
    expect(await screen.findByText(/processing your text/i)).toBeInTheDocument();

    // Should display enriched output
    await waitFor(() => {
      expect(screen.getByText('This is enriched text.')).toBeInTheDocument();
    });

    expect(mockOnEnrichmentComplete).toHaveBeenCalledWith(mockResult);
  });

  it('displays error when enrichment fails', async () => {
    mockEnrich.mockRejectedValueOnce(new Error('API error'));

    render(
      <EnrichmentPanel
        transcribedText={testText}
        onEnrichmentComplete={mockOnEnrichmentComplete}
      />
    );

    const processButton = screen.getByRole('button', { name: /process text/i });
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(screen.getByText(/api error/i)).toBeInTheDocument();
    });

    expect(mockOnEnrichmentComplete).not.toHaveBeenCalled();
  });

  it('copies enriched text to clipboard', async () => {
    const mockResult = {
      enrichedText: 'Enriched text to copy',
      originalText: testText,
      enrichmentType: 'format' as const,
      model: 'gpt-4',
    };

    mockEnrich.mockResolvedValueOnce(mockResult);

    render(
      <EnrichmentPanel
        transcribedText={testText}
        onEnrichmentComplete={mockOnEnrichmentComplete}
      />
    );

    const processButton = screen.getByRole('button', { name: /process text/i });
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(screen.getByText('Enriched text to copy')).toBeInTheDocument();
    });

    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Enriched text to copy');
  });

  it('updates type when preset is selected', () => {
    render(
      <EnrichmentPanel
        transcribedText={testText}
        onEnrichmentComplete={mockOnEnrichmentComplete}
      />
    );

    const quickNotesButton = screen.getByText('Quick Notes');
    fireEvent.click(quickNotesButton);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('format');
  });

  it('disables controls while processing', async () => {
    mockEnrich.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    render(
      <EnrichmentPanel
        transcribedText={testText}
        onEnrichmentComplete={mockOnEnrichmentComplete}
      />
    );

    const processButton = screen.getByRole('button', { name: /process text/i });
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeDisabled();
    });
  });

  it('displays processing metadata', async () => {
    const mockResult = {
      enrichedText: 'Result',
      originalText: testText,
      enrichmentType: 'format' as const,
      model: 'gpt-4',
      processingTime: 2500,
    };

    mockEnrich.mockResolvedValueOnce(mockResult);

    render(
      <EnrichmentPanel
        transcribedText={testText}
        onEnrichmentComplete={mockOnEnrichmentComplete}
      />
    );

    const processButton = screen.getByRole('button', { name: /process text/i });
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(screen.getByText(/model: gpt-4/i)).toBeInTheDocument();
      expect(screen.getByText(/time: 2\.50s/i)).toBeInTheDocument();
    });
  });

  it('allows re-processing with different settings', async () => {
    const firstResult = {
      enrichedText: 'First enrichment',
      originalText: testText,
      enrichmentType: 'format' as const,
      model: 'gpt-4',
    };

    const secondResult = {
      enrichedText: 'Second enrichment',
      originalText: testText,
      enrichmentType: 'summarize' as const,
      model: 'gpt-4',
    };

    mockEnrich
      .mockResolvedValueOnce(firstResult)
      .mockResolvedValueOnce(secondResult);

    render(
      <EnrichmentPanel
        transcribedText={testText}
        onEnrichmentComplete={mockOnEnrichmentComplete}
      />
    );

    // First processing
    const processButton = screen.getByRole('button', { name: /process text/i });
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(screen.getByText('First enrichment')).toBeInTheDocument();
    });

    // Button should now say "Re-process Text"
    expect(screen.getByRole('button', { name: /re-process text/i })).toBeInTheDocument();

    // Change enrichment type
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'summarize' } });

    // Re-process
    const reprocessButton = screen.getByRole('button', { name: /re-process text/i });
    fireEvent.click(reprocessButton);

    await waitFor(() => {
      expect(screen.getByText('Second enrichment')).toBeInTheDocument();
    });

    expect(mockEnrich).toHaveBeenCalledTimes(2);
    expect(mockOnEnrichmentComplete).toHaveBeenCalledTimes(2);
  });
});
