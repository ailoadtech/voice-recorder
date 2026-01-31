'use client';

/**
 * ApiKeyStatus Component
 * 
 * Displays the status of API key configuration and provides
 * helpful links for setup if keys are not configured.
 */

import React, { useState, useEffect } from 'react';

interface ApiStatus {
  configured: boolean;
  valid: boolean | null;
  error: string | null;
  checking: boolean;
}

export function ApiKeyStatus() {
  const [status, setStatus] = useState<ApiStatus>({
    configured: false,
    valid: null,
    error: null,
    checking: true,
  });

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    setStatus(prev => ({ ...prev, checking: true, error: null }));

    try {
      // Call API route to check key status
      const response = await fetch('/api/config/check-api-keys');
      const data = await response.json();

      setStatus({
        configured: data.configured,
        valid: data.valid,
        error: data.error || null,
        checking: false,
      });
    } catch (error) {
      setStatus({
        configured: false,
        valid: false,
        error: error instanceof Error ? error.message : 'Failed to check API key status',
        checking: false,
      });
    }
  };

  if (status.checking) {
    return (
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          <span className="text-sm text-gray-600">Checking API configuration...</span>
        </div>
      </div>
    );
  }

  if (!status.configured) {
    return (
      <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 flex-shrink-0 text-yellow-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              API Key Not Configured
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              You need to configure your OpenAI API key to use transcription and enrichment features.
            </p>
            <div className="mt-3 space-y-2">
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-yellow-800 hover:text-yellow-900"
              >
                Get API Key
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
              <span className="mx-2 text-yellow-600">•</span>
              <a
                href="/docs/API_KEY_SETUP.md"
                className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
              >
                Setup Guide
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status.valid === false) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 flex-shrink-0 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Invalid API Key
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {status.error || 'The configured API key is invalid or has been revoked.'}
            </p>
            <button
              onClick={checkApiKeyStatus}
              className="mt-3 text-sm font-medium text-red-800 hover:text-red-900"
            >
              Retry Check
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status.valid === true) {
    return (
      <div className="rounded-lg border border-green-300 bg-green-50 p-4">
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 flex-shrink-0 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800">
              API Key Configured
            </h3>
            <p className="mt-1 text-sm text-green-700">
              Your OpenAI API key is valid and ready to use.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
