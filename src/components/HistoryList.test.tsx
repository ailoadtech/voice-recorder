import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HistoryList } from './HistoryList';
import { StorageService } from '@/services/storage';
import type { Recording } from '@/services/storage/types';

// Mock StorageService
jest.mock('@/services/storage', () => ({
  StorageService: jest.fn(),
}));

// Mock BatchExportDialog
jest.mock('./BatchExportDialog', () => ({
  BatchExportDialog: ({ recordings, isOpen, onClose }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="batch-export-dialog">
        <div>Exporting {recordings.length} recordings</div>
        <button onClick={onClose}>Close</button>
      </div>
    );
  },
}));

// Mock window.confirm
global.confirm = jest.fn(() => true);

describe('HistoryList', () => {
  const mockGetAllRecordings = jest.fn();
  const mockDeleteRecording = jest.fn();
  const mockDeleteRecordings = jest.fn();
  const mockOnRecordingSelect = jest.fn();
  const mockOnRecordingDelete = jest.fn();

  const mockRecordings: Recording[] = [
    {
      id: '1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      title: 'Test Recording 1',
      transcriptionText: 'This is a test transcription',
      audioDuration: 120,
    },
    {
      id: '2',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      title: 'Test Recording 2',
      enrichedText: 'This is enriched text',
      audioDuration: 60,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (StorageService as jest.Mock).mockImplementation(() => ({
      getAllRecordings: mockGetAllRecordings,
      deleteRecording: mockDeleteRecording,
      deleteRecordings: mockDeleteRecordings,
    }));
    mockGetAllRecordings.mockResolvedValue(mockRecordings);
  });

  it('renders loading state initially', () => {
    render(<HistoryList />);
    expect(screen.getByText(/loading recordings/i)).toBeInTheDocument();
  });

  it('displays recordings after loading', async () => {
    render(<HistoryList />);

    await waitFor(() => {
      expect(screen.getByText('Test Recording 1')).toBeInTheDocument();
      expect(screen.getByText('Test Recording 2')).toBeInTheDocument();
    });
  });

  it('shows transcription and enrichment badges', async () => {
    render(<HistoryList />);

    await waitFor(() => {
      const badges = screen.getAllByText('📝');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it('filters recordings by search text', async () => {
    render(<HistoryList />);

    await waitFor(() => {
      expect(screen.getByText('Test Recording 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search recordings/i);
    fireEvent.change(searchInput, { target: { value: 'Recording 1' } });

    await waitFor(() => {
      expect(screen.getByText('Test Recording 1')).toBeInTheDocument();
    });
  });

  it('calls onRecordingSelect when view details is clicked', async () => {
    render(<HistoryList onRecordingSelect={mockOnRecordingSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Test Recording 1')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByText(/view details/i);
    fireEvent.click(viewButtons[0]);

    expect(mockOnRecordingSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1' })
    );
  });

  it('deletes recording when delete button is clicked', async () => {
    mockDeleteRecording.mockResolvedValue(undefined);

    render(<HistoryList onRecordingDelete={mockOnRecordingDelete} />);

    await waitFor(() => {
      expect(screen.getByText('Test Recording 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText(/^delete$/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDeleteRecording).toHaveBeenCalledWith('1');
      expect(mockOnRecordingDelete).toHaveBeenCalledWith('1');
    });
  });

  it('handles bulk selection and deletion', async () => {
    mockDeleteRecordings.mockResolvedValue(undefined);

    render(<HistoryList />);

    await waitFor(() => {
      expect(screen.getByText('Test Recording 1')).toBeInTheDocument();
    });

    // Select recordings
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // First recording
    fireEvent.click(checkboxes[2]); // Second recording

    await waitFor(() => {
      expect(screen.getByText(/2 recording\(s\) selected/i)).toBeInTheDocument();
    });

    // Delete selected
    const deleteSelectedButton = screen.getByText(/delete selected/i);
    fireEvent.click(deleteSelectedButton);

    await waitFor(() => {
      expect(mockDeleteRecordings).toHaveBeenCalledWith(['1', '2']);
    });
  });

  it('changes sort order', async () => {
    render(<HistoryList />);

    await waitFor(() => {
      expect(screen.getByText('Test Recording 1')).toBeInTheDocument();
    });

    const sortButton = screen.getByText(/↓ desc/i);
    fireEvent.click(sortButton);

    expect(screen.getByText(/↑ asc/i)).toBeInTheDocument();
  });

  it('displays error message on load failure', async () => {
    mockGetAllRecordings.mockRejectedValue(new Error('Load failed'));

    render(<HistoryList />);

    await waitFor(() => {
      expect(screen.getByText(/load failed/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when no recordings', async () => {
    mockGetAllRecordings.mockResolvedValue([]);

    render(<HistoryList />);

    await waitFor(() => {
      expect(screen.getByText(/no recordings found/i)).toBeInTheDocument();
    });
  });

  it('paginates recordings', async () => {
    const manyRecordings = Array.from({ length: 15 }, (_, i) => ({
      id: `${i + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      title: `Recording ${i + 1}`,
    }));
    mockGetAllRecordings.mockResolvedValue(manyRecordings);

    render(<HistoryList />);

    await waitFor(() => {
      expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument();
    });

    const nextButton = screen.getByText(/next/i);
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument();
    });
  });

  it('opens batch export dialog when export selected is clicked', async () => {
    render(<HistoryList />);

    await waitFor(() => {
      expect(screen.getByText('Test Recording 1')).toBeInTheDocument();
    });

    // Select recordings
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // First recording
    fireEvent.click(checkboxes[2]); // Second recording

    await waitFor(() => {
      expect(screen.getByText(/2 recording\(s\) selected/i)).toBeInTheDocument();
    });

    // Click export selected
    const exportButton = screen.getByText(/export selected/i);
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByTestId('batch-export-dialog')).toBeInTheDocument();
      expect(screen.getByText(/exporting 2 recordings/i)).toBeInTheDocument();
    });
  });

  it('clears selection after closing batch export dialog', async () => {
    render(<HistoryList />);

    await waitFor(() => {
      expect(screen.getByText('Test Recording 1')).toBeInTheDocument();
    });

    // Select recordings
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);

    await waitFor(() => {
      expect(screen.getByText(/1 recording\(s\) selected/i)).toBeInTheDocument();
    });

    // Open and close export dialog
    const exportButton = screen.getByText(/export selected/i);
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByTestId('batch-export-dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByText(/close/i);
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('batch-export-dialog')).not.toBeInTheDocument();
      expect(screen.queryByText(/recording\(s\) selected/i)).not.toBeInTheDocument();
    });
  });

  it('does not show export button when no recordings are selected', async () => {
    render(<HistoryList />);

    await waitFor(() => {
      expect(screen.getByText('Test Recording 1')).toBeInTheDocument();
    });

    expect(screen.queryByText(/export selected/i)).not.toBeInTheDocument();
  });
});
