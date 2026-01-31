'use client';

import React, { useState } from 'react';
import type { Recording } from '@/services/storage/types';
import { AudioPlayer } from './AudioPlayer';

interface RecordingDetailViewProps {
  recording: Recording;
  onClose?: () => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Recording>) => void;
  className?: string;
}

export function RecordingDetailView({
  recording,
  onClose,
  onDelete,
  onUpdate,
  className = '',
}: RecordingDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(recording.title || '');
  const [notes, setNotes] = useState(recording.notes || '');
  const [tags, setTags] = useState(recording.tags?.join(', ') || '');

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(recording.id, {
        title: title || undefined,
        notes: notes || undefined,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(recording.title || '');
    setNotes(recording.notes || '');
    setTags(recording.tags?.join(', ') || '');
    setIsEditing(false);
  };

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
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

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Recording title"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-lg font-semibold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <h2 className="text-2xl font-bold text-gray-900">
              {recording.title || 'Untitled Recording'}
            </h2>
          )}
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-600">
            <span>Created: {formatDate(recording.createdAt)}</span>
            {recording.updatedAt.getTime() !== recording.createdAt.getTime() && (
              <span>Updated: {formatDate(recording.updatedAt)}</span>
            )}
            <span>Duration: {formatDuration(recording.audioDuration)}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Edit
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Close
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        {isEditing ? (
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="meeting, important, project-x"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        ) : recording.tags && recording.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {recording.tags.map((tag, index) => (
              <span
                key={index}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No tags</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        {isEditing ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this recording..."
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        ) : recording.notes ? (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{recording.notes}</p>
        ) : (
          <p className="text-sm text-gray-500">No notes</p>
        )}
      </div>

      {/* Audio Player */}
      {recording.audioBlob && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Audio
          </label>
          <AudioPlayer audioBlob={recording.audioBlob} />
        </div>
      )}

      {/* Transcription */}
      {recording.transcriptionText && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Transcription
            </label>
            <button
              onClick={() => handleCopyText(recording.transcriptionText!)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              📋 Copy
            </button>
          </div>
          <div className="rounded-md border border-gray-300 bg-gray-50 p-4">
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {recording.transcriptionText}
            </p>
          </div>
        </div>
      )}

      {/* Enriched Text */}
      {recording.enrichedText && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Enriched Output
              {recording.enrichmentType && (
                <span className="ml-2 text-xs text-gray-500">
                  ({recording.enrichmentType})
                </span>
              )}
            </label>
            <button
              onClick={() => handleCopyText(recording.enrichedText!)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              📋 Copy
            </button>
          </div>
          <div className="rounded-md border border-gray-300 bg-purple-50 p-4">
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {recording.enrichedText}
            </p>
          </div>
        </div>
      )}

      {/* Delete Button */}
      {onDelete && (
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this recording?')) {
                onDelete(recording.id);
              }
            }}
            className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Delete Recording
          </button>
        </div>
      )}
    </div>
  );
}
