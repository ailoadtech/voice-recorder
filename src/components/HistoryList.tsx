'use client';

import React, { useState, useEffect } from 'react';
import { StorageService } from '@/services/storage';
import { BatchExportDialog } from './BatchExportDialog';
import type {
  Recording,
  RecordingFilter,
  RecordingSortOptions,
  RecordingSortField,
  RecordingSortOrder,
} from '@/services/storage/types';

interface HistoryListProps {
  onRecordingSelect?: (recording: Recording) => void;
  onRecordingDelete?: (id: string) => void;
  className?: string;
}

const ITEMS_PER_PAGE = 10;

export function HistoryList({
  onRecordingSelect,
  onRecordingDelete,
  className = '',
}: HistoryListProps) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [filteredRecordings, setFilteredRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [searchText, setSearchText] = useState('');
  const [filterHasTranscription, setFilterHasTranscription] = useState<boolean | undefined>();
  const [filterHasEnrichment, setFilterHasEnrichment] = useState<boolean | undefined>();
  
  // Sort state
  const [sortField, setSortField] = useState<RecordingSortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<RecordingSortOrder>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Batch export state
  const [showBatchExportDialog, setShowBatchExportDialog] = useState(false);

  const storage = new StorageService();

  // Load recordings
  useEffect(() => {
    loadRecordings();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    applyFiltersAndSort();
  }, [recordings, searchText, filterHasTranscription, filterHasEnrichment, sortField, sortOrder]);

  const loadRecordings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allRecordings = await storage.getAllRecordings();
      setRecordings(allRecordings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recordings');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = async () => {
    try {
      const filter: RecordingFilter = {
        searchText: searchText || undefined,
        hasTranscription: filterHasTranscription,
        hasEnrichment: filterHasEnrichment,
      };

      const sort: RecordingSortOptions = {
        field: sortField,
        order: sortOrder,
      };

      const filtered = await storage.getAllRecordings(filter, sort);
      setFilteredRecordings(filtered);
      setCurrentPage(1); // Reset to first page when filters change
    } catch (err) {
      console.error('Filter error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recording?')) {
      return;
    }

    try {
      await storage.deleteRecording(id);
      setRecordings(prev => prev.filter(r => r.id !== id));
      if (onRecordingDelete) {
        onRecordingDelete(id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recording');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} recording(s)?`)) {
      return;
    }

    try {
      await storage.deleteRecordings(Array.from(selectedIds));
      setRecordings(prev => prev.filter(r => !selectedIds.has(r.id)));
      setSelectedIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recordings');
    }
  };

  const handleBatchExport = () => {
    if (selectedIds.size === 0) return;
    setShowBatchExportDialog(true);
  };

  const getSelectedRecordings = (): Recording[] => {
    return filteredRecordings.filter(r => selectedIds.has(r.id));
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedRecordings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedRecordings.map(r => r.id)));
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Pagination
  const totalPages = Math.ceil(filteredRecordings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRecordings = filteredRecordings.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Loading recordings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-md bg-red-50 p-4 ${className}`}>
        <p className="text-sm text-red-800">{error}</p>
        <button
          onClick={loadRecordings}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Search and Filters */}
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <input
          type="text"
          placeholder="Search recordings..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        
        <div className="flex flex-wrap gap-2">
          <select
            value={filterHasTranscription === undefined ? 'all' : filterHasTranscription ? 'yes' : 'no'}
            onChange={(e) => setFilterHasTranscription(
              e.target.value === 'all' ? undefined : e.target.value === 'yes'
            )}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
          >
            <option value="all">All Transcriptions</option>
            <option value="yes">With Transcription</option>
            <option value="no">Without Transcription</option>
          </select>

          <select
            value={filterHasEnrichment === undefined ? 'all' : filterHasEnrichment ? 'yes' : 'no'}
            onChange={(e) => setFilterHasEnrichment(
              e.target.value === 'all' ? undefined : e.target.value === 'yes'
            )}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
          >
            <option value="all">All Enrichments</option>
            <option value="yes">With Enrichment</option>
            <option value="no">Without Enrichment</option>
          </select>

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as RecordingSortField)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
          >
            <option value="createdAt">Date Created</option>
            <option value="updatedAt">Date Updated</option>
            <option value="duration">Duration</option>
            <option value="title">Title</option>
          </select>

          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3">
          <span className="text-sm text-blue-900">
            {selectedIds.size} recording(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBatchExport}
              className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              Export Selected
            </button>
            <button
              onClick={handleBulkDelete}
              className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Recordings List */}
      {filteredRecordings.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-600">No recordings found</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {/* Select All */}
            <div className="flex items-center gap-2 px-2">
              <input
                type="checkbox"
                checked={selectedIds.size === paginatedRecordings.length && paginatedRecordings.length > 0}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">Select all on page</span>
            </div>

            {/* Recording Items */}
            {paginatedRecordings.map((recording) => (
              <div
                key={recording.id}
                className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(recording.id)}
                  onChange={() => toggleSelection(recording.id)}
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {recording.title || 'Untitled Recording'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatDate(recording.createdAt)} • {formatDuration(recording.audioDuration)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {recording.transcriptionText && (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                          📝
                        </span>
                      )}
                      {recording.enrichedText && (
                        <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800">
                          ✨
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {recording.transcriptionText && (
                    <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                      {recording.transcriptionText}
                    </p>
                  )}
                  
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => onRecordingSelect?.(recording)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDelete(recording.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({filteredRecordings.length} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Batch Export Dialog */}
      <BatchExportDialog
        recordings={getSelectedRecordings()}
        isOpen={showBatchExportDialog}
        onClose={() => {
          setShowBatchExportDialog(false);
          setSelectedIds(new Set()); // Clear selection after export
        }}
      />
    </div>
  );
}
