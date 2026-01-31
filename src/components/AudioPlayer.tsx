'use client';

import React from 'react';
import { useState, useEffect, useRef } from 'react';

interface AudioPlayerProps {
  audioBlob: Blob;
  className?: string;
}

// Constants
const UPDATE_INTERVAL = 100;

/**
 * AudioPlayer - Audio playback component with full controls
 * Provides play/pause, progress bar, and volume control
 */
export function AudioPlayer({ audioBlob, className = '' }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [audioUrl, setAudioUrl] = useState<string>('');

  // Create audio URL from blob
  useEffect(() => {
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [audioBlob]);

  // Update current time while playing
  useEffect(() => {
    if (!isPlaying || !audioRef.current) return;

    const interval = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle audio loaded
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle audio ended
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Play/Pause Button and Time Display */}
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlayPause}
          className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-md"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Time Display */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="relative h-2 bg-gray-200 rounded-full cursor-pointer group"
        onClick={handleProgressClick}
        role="progressbar"
        aria-valuenow={currentTime}
        aria-valuemin={0}
        aria-valuemax={duration}
      >
        {/* Progress fill */}
        <div
          className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${progressPercentage}%` }}
        />
        
        {/* Progress handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progressPercentage}% - 8px)` }}
        />
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleVolumeChange({ target: { value: volume === 0 ? '1' : '0' } } as any)}
          className="flex-shrink-0 text-gray-600 hover:text-gray-800 transition-colors"
          aria-label={volume === 0 ? 'Unmute' : 'Mute'}
        >
          {volume === 0 ? (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          ) : volume < 0.5 ? (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 9v6h4l5 5V4l-5 5H7z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 
                     [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md
                     [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full 
                     [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:cursor-pointer 
                     [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
          aria-label="Volume"
        />

        <span className="text-xs sm:text-sm text-gray-600 w-10 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
}
