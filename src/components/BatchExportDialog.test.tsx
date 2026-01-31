import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BatchExportDialog } from './BatchExportDialog';
import { exportService } from '@/services/export/ExportService';
import type { Recording } from '@/services/storage/types';

// Mock export service
jest.mock('@/services/export/ExportService', () => ({
  exportService: {
    exportBatch: jest.fn(),
    downloadFile: jest.fn(),
  },
}));

// Mock window.alert
global.alert = jest.fn();

describe('BatchExportDialog', () => {
  const mockOnClose = jest.fn();
  const mockRecordings: Recording[] = [
    {
      id: '1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      title: 'Test Recording 1',
      transcriptionText: 'Transcription 1',
      enrichedText: 'Enriched 1',
      audioDuration: 120,
      audioFormat: 'webm',
      tags: ['test'],
      notes: 'Notes 1',
    },
    {
      id: '2',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      title: 'Test Recording 2',
      transcriptionText: 'Transcription 2',
      enrichedText: 'Enriched 2',
      audioDuration: 60,
      audioFormat: 'webm',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <BatchExportDialog
        recordings={mockRecordings}
        isOpen={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText(/batch export/i)).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(
      <BatchExportDialog
        recordings={mockRecordings}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/batch export/i)).toBeInTheDocument();
    expect(screen.getByText(/exporting 2 recording/i)).toBeInTheDocument();
  });

  it('displays all format options', () => {
    render(
      <BatchExportDialog
        recordings={mockRecordings}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('.TXT')).toBeInTheDocument();
    expect(screen.getByText('.MD')).toBeInTheDocument();
    expect(screen.getByText('.JSON')).toBeInTheDocument();
    expect(screen.getByText('.CSV')).toBeInTheDocument();
  });

  it('allows format selection', () => {
    render(
      <BatchExportDialog
        recordings={mockRecordings}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const mdButton = screen.getByText('.MD');
    fireEvent.click(mdButton);

    expect(mdButton).toHaveClass('bg-blue-600');
  });

  it('displays file organization options', () => {
    render(
      <BatchExportDialog
        recordings={mockRecordings}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/single file/i)).toBeInTheDocument();
    expect(screen.getByText(/separate files/i)).toBeInTheDocument();
  });

  it('allows toggling between single and separate files', () => {
    render(
      <BatchExportDialog
        recordings={mockRecordings}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const separateFilesRadio = screen.getByLabelText(/separate files/i);
    fireEvent.click(separateFilesRadio);

    expect(separateFilesRadio).toBeChecked();
  });

  it('displays include options', () => {
    render(
      <BatchExportDialog
        recordings={mockRecordings}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByLabelText(/metadata/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/transcription/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/enriched output/i)).toBeInTheDocument();
  });

  it('allows toggling include options', () => {
    render(
      <BatchExportDialog
        recordings={mockRecordings}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const metadataCheckbox = screen.getByLabelText(/metadata/i);
    expect(metadataCheckbox).toBeChecked();

    fireEvent.click(metadataCheckbox);
    expect(metadataCheckbox).not.toBeChecked();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <BatchExportDialog
        recordings={mockRecordings}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when close X button is clicked', () => {
    render(
      <BatchExportDialog
        recordings={mockRecordings}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('exports recordings when export button is clicked', async () => {
    const mockExportResult = {
      success: true,
      files: [
        { filename: 'export1.txt', content: 'content1' },
        { filename: 'export2.txt', content: 'content2' },
      ],
    };
    (exportService.exportBatch as jest.Mock).mockResolvedValue(mockExportResult);

    render(
      <BatchExportDialog
        recordings={mockRecordings}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const exportButton = screen.getByText(/💾 export/i);
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(exportService.exportBatch).toHaveBeenCalledWith(
        expect.objectContaining({
          recordings: mockRecordings,
          format: 'txt',
          separateFiles: false,
        })
      );
    });

    await waitFor(() => {
      expect(exportService.downloadFile).toHaveBeenCalledTimes(2);
      expect(global.alert).toHaveBeenCalledWith('Successfully exported 2 file(s)');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles export failure', async () => {
    const mockExportResult = {
      success: false,
      error: 'Export failed',
    };
    (exportService.exportBatch as jest.Mock).mockResolvedValue(mockExportResult);

    render(
      <BatchExportDialog
        recordings={mockRecordings}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const exportButton = screen.getByText(/💾 export/i);
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Export failed: Export failed');
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('disables buttons during export', async () => {
    (exportService.exportBatch as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <BatchExportDialog
        recordings={mockRecordings}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const exportButton = screen.getByText(/💾 export/i);
    const cancelButton = screen.getByText(/cancel/i);

    fireEvent.click(exportButton);

    expect(exportButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(screen.getByText(/exporting\.\.\./i)).toBeInTheDocument();
  });

  it('exports with selected format and options', async () => {
    const mockExportResult = {
      success: true,
      files: [{ filename: 'export.md', content: 'content' }],
    };
    (exportService.exportBatch as jest.Mock).mockResolvedValue(mockExportResult);

    render(
      <BatchExportDialog
        recordings={mockRecordings}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    // Select markdown format
    const mdButton = screen.getByText('.MD');
    fireEvent.click(mdButton);

    // Select separate files
    const separateFilesRadio = screen.getByLabelText(/separate files/i);
    fireEvent.click(separateFilesRadio);

    // Uncheck metadata
    const metadataCheckbox = screen.getByLabelText(/metadata/i);
    fireEvent.click(metadataCheckbox);

    const exportButton = screen.getByText(/💾 export/i);
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(exportService.exportBatch).toHaveBeenCalledWith(
        expect.objectContaining({
          format: 'md',
          separateFiles: true,
          includeMetadata: false,
        })
      );
    });
  });

  it('handles exception during export', async () => {
    (exportService.exportBatch as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    render(
      <BatchExportDialog
        recordings={mockRecordings}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const exportButton = screen.getByText(/💾 export/i);
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        'Batch export failed. Please try again.'
      );
    });
  });
});
