/**
 * ExportSettings Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportSettings } from './ExportSettings';
import { useSettings } from '@/hooks/useSettings';

// Mock the useSettings hook
jest.mock('@/hooks/useSettings');

const mockUseSettings = useSettings as jest.MockedFunction<typeof useSettings>;

describe('ExportSettings', () => {
  const mockUpdateExportSettings = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSettings.mockReturnValue({
      settings: {
        autoSave: true,
        defaultEnrichmentType: 'format',
        exportSettings: {
          defaultFormat: 'txt',
          includeMetadata: true,
          includeTranscription: true,
          includeEnrichment: true,
          includeTags: true,
          includeNotes: true,
        },
      },
      exportSettings: {
        defaultFormat: 'txt',
        includeMetadata: true,
        includeTranscription: true,
        includeEnrichment: true,
        includeTags: true,
        includeNotes: true,
      },
      updateSettings: jest.fn(),
      setAutoSave: jest.fn(),
      setDefaultEnrichmentType: jest.fn(),
      updateExportSettings: mockUpdateExportSettings,
      setDefaultExportFormat: jest.fn(),
    });
  });

  it('renders export settings UI', () => {
    render(<ExportSettings />);
    
    expect(screen.getByText('Export Settings')).toBeInTheDocument();
    expect(screen.getByText('Default Export Format')).toBeInTheDocument();
    expect(screen.getByText('Default Export Options')).toBeInTheDocument();
  });

  it('displays all format options', () => {
    render(<ExportSettings />);
    
    expect(screen.getByText('Plain Text (.txt)')).toBeInTheDocument();
    expect(screen.getByText('Markdown (.md)')).toBeInTheDocument();
    expect(screen.getByText('JSON (.json)')).toBeInTheDocument();
    expect(screen.getByText('CSV (.csv)')).toBeInTheDocument();
  });

  it('highlights the selected format', () => {
    render(<ExportSettings />);
    
    const txtButton = screen.getByText('Plain Text (.txt)').closest('button');
    expect(txtButton).toHaveClass('border-blue-600');
  });

  it('updates format when clicked', () => {
    render(<ExportSettings />);
    
    const mdButton = screen.getByText('Markdown (.md)').closest('button');
    fireEvent.click(mdButton!);
    
    expect(mockUpdateExportSettings).toHaveBeenCalledWith({ defaultFormat: 'md' });
  });

  it('displays all export option checkboxes', () => {
    render(<ExportSettings />);
    
    expect(screen.getByText('Include Metadata')).toBeInTheDocument();
    expect(screen.getByText('Include Transcription')).toBeInTheDocument();
    expect(screen.getByText('Include Enriched Output')).toBeInTheDocument();
    expect(screen.getByText('Include Tags')).toBeInTheDocument();
    expect(screen.getByText('Include Notes')).toBeInTheDocument();
  });

  it('checkboxes reflect current settings', () => {
    render(<ExportSettings />);
    
    const metadataCheckbox = screen.getByRole('checkbox', { name: /Include Metadata/i });
    expect(metadataCheckbox).toBeChecked();
  });

  it('updates settings when checkbox is toggled', () => {
    render(<ExportSettings />);
    
    const metadataCheckbox = screen.getByRole('checkbox', { name: /Include Metadata/i });
    fireEvent.click(metadataCheckbox);
    
    expect(mockUpdateExportSettings).toHaveBeenCalledWith({ includeMetadata: false });
  });

  it('displays info message about default settings', () => {
    render(<ExportSettings />);
    
    expect(screen.getByText(/These are default settings/i)).toBeInTheDocument();
  });

  it('handles unchecked state correctly', () => {
    mockUseSettings.mockReturnValue({
      settings: {
        autoSave: true,
        defaultEnrichmentType: 'format',
        exportSettings: {
          defaultFormat: 'json',
          includeMetadata: false,
          includeTranscription: false,
          includeEnrichment: false,
          includeTags: false,
          includeNotes: false,
        },
      },
      exportSettings: {
        defaultFormat: 'json',
        includeMetadata: false,
        includeTranscription: false,
        includeEnrichment: false,
        includeTags: false,
        includeNotes: false,
      },
      updateSettings: jest.fn(),
      setAutoSave: jest.fn(),
      setDefaultEnrichmentType: jest.fn(),
      updateExportSettings: mockUpdateExportSettings,
      setDefaultExportFormat: jest.fn(),
    });

    render(<ExportSettings />);
    
    const metadataCheckbox = screen.getByRole('checkbox', { name: /Include Metadata/i });
    expect(metadataCheckbox).not.toBeChecked();
  });
});
