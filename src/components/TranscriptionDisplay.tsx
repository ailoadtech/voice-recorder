'use client';

import React from 'react';
import { useState, useRef, useEffect } from 'react';
import type { TranscriptionResult } from '@/services/transcription';

interface TranscriptionDisplayProps {
  result: TranscriptionResult | null;
  isLoading?: boolean;
  error?: string | null;
  onTextChange?: (text: string) => void;
  className?: string;
}

/**
 * TranscriptionDisplay - Display and edit transcribed text
 * Shows loading state, transcription result, and metadata
 */
export function TranscriptionDisplay({
  result,
  isLoading = false,
  error = null,
  onTextChange,
  className = '',
}: TranscriptionDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update edited text when result changes
  useEffect(() => {
    if (result?.text) {
      setEditedText(result.text);
    }
  }, [result?.text]);

  // Handle copy to clipboard
  const handleCopy = async () => {
    const textToCopy = isEditing ? editedText : result?.text || '';
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      onTextChange?.(editedText);
    }
    setIsEditing(!isEditing);
  };

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedText(e.target.value);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && isEditing) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editedText, isEditing]);

  // Format duration
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with metadata */}
      {result && !isLoading && (
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600">
          {result.language && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Language:</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                {result.language.toUpperCase()}
              </span>
            </div>
          )}
          {result.duration && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Duration:</span>
              <span>{formatDuration(result.duration)}</span>
            </div>
          )}
          {result.confidence && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Confidence:</span>
              <span>{Math.round(result.confidence * 100)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Main content area */}
      <div className="relative min-h-[150px] bg-gray-50 rounded-lg border">
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600 mb-4" />
            <p className="text-sm text-gray-600 font-medium">Transcribing audio...</p>
            <p className="text-xs text-gray-500 mt-1">This may take a few moments</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-sm font-semibold text-red-700 mb-1">Transcription Failed</p>
            <p className="text-xs text-red-600 text-center max-w-md">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!result && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <p className="text-sm text-gray-500 text-center">
              Transcribed text will appear here after recording...
            </p>
          </div>
        )}

        {/* Transcription text */}
        {result && !isLoading && !error && (
          <div className="p-4">
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editedText}
                onChange={handleTextChange}
                className="w-full min-h-[150px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Edit transcription..."
              />
            ) : (
              <p className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap leading-relaxed">
                {result.text}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      {result && !isLoading && !error && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleEditToggle}
            className="px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs sm:text-sm font-medium transition-colors"
          >
            {isEditing ? '✓ Save' : '✏️ Edit'}
          </button>
          
          <button
            onClick={handleCopy}
            className={`px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium transition-colors ${
              copySuccess
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {copySuccess ? '✓ Copied!' : '📋 Copy'}
          </button>

          {result.segments && result.segments.length > 0 && (
            <button
              onClick={() => {
                // TODO: Show detailed segments view
                console.log('Segments:', result.segments);
              }}
              className="px-3 sm:px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs sm:text-sm font-medium transition-colors"
            >
              📊 View Segments ({result.segments.length})
            </button>
          )}
        </div>
      )}

      {/* Segments detail (optional, collapsed by default) */}
      {result?.segments && result.segments.length > 0 && (
        <details className="text-xs text-gray-600">
          <summary className="cursor-pointer font-medium hover:text-gray-800 py-2">
            Show detailed segments
          </summary>
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
            {result.segments.map((segment) => (
              <div
                key={segment.id}
                className="p-2 bg-white border rounded text-xs"
              >
                <div className="flex items-center gap-2 mb-1 text-gray-500">
                  <span className="font-mono">
                    {formatDuration(segment.start)} - {formatDuration(segment.end)}
                  </span>
                  {segment.confidence && (
                    <span className="text-xs">
                      ({Math.round(segment.confidence * 100)}%)
                    </span>
                  )}
                </div>
                <p className="text-gray-800">{segment.text}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
