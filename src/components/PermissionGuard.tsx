'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { AudioRecordingService } from '@/services/audio';

interface PermissionGuardProps {
  children: React.ReactNode;
  onPermissionGranted?: () => void;
  onPermissionDenied?: (error: Error) => void;
}

/**
 * PermissionGuard - Component that handles microphone permission flow
 * Shows appropriate UI based on permission state
 */
export function PermissionGuard({
  children,
  onPermissionGranted,
  onPermissionDenied,
}: PermissionGuardProps) {
  const [permissionState, setPermissionState] = useState<
    'checking' | 'granted' | 'denied' | 'prompt' | 'unsupported' | 'error'
  >('checking');
  const [error, setError] = useState<string | null>(null);
  const [audioService] = useState(() => new AudioRecordingService());

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const status = await audioService.checkPermissionStatus();
      setPermissionState(status);

      if (status === 'granted') {
        onPermissionGranted?.();
      }
    } catch (err) {
      setPermissionState('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const requestPermissions = async () => {
    try {
      setPermissionState('checking');
      await audioService.getPermissions();
      setPermissionState('granted');
      onPermissionGranted?.();
    } catch (err) {
      if (err instanceof Error && err.name === 'AudioPermissionError') {
        const code = (err as any).code;
        setPermissionState('denied');
        setError(err.message);
        onPermissionDenied?.(err);
      } else {
        setPermissionState('error');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }
  };

  if (permissionState === 'checking') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking microphone permissions...</p>
        </div>
      </div>
    );
  }

  if (permissionState === 'granted') {
    return <>{children}</>;
  }

  if (permissionState === 'prompt' || permissionState === 'unsupported') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎤</div>
          <h2 className="text-2xl font-bold mb-2">Microphone Access Required</h2>
          <p className="text-gray-600 mb-6">
            This app needs access to your microphone to record audio. Click the
            button below to grant permission.
          </p>
          <button
            onClick={requestPermissions}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Enable Microphone
          </button>
        </div>
      </div>
    );
  }

  if (permissionState === 'denied') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold mb-2 text-red-600">
            Microphone Access Denied
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="bg-gray-100 p-4 rounded-lg text-left text-sm">
            <p className="font-semibold mb-2">To enable microphone access:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Click the lock icon in your browser&apos;s address bar</li>
              <li>Find the microphone permission setting</li>
              <li>Change it to &quot;Allow&quot;</li>
              <li>Refresh this page</li>
            </ol>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-2 text-yellow-600">
          Browser Not Supported
        </h2>
        <p className="text-gray-600 mb-4">
          {error || 'Your browser does not support audio recording.'}
        </p>
        <p className="text-sm text-gray-500">
          Please use a modern browser like Chrome, Firefox, Safari, or Edge.
        </p>
      </div>
    </div>
  );
}
