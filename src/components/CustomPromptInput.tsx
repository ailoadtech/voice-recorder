'use client';

import React from 'react';

interface CustomPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function CustomPromptInput({
  value,
  onChange,
  disabled = false,
  placeholder = 'Enter your custom instructions...',
  className = '',
}: CustomPromptInputProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor="custom-prompt" className="text-sm font-medium text-gray-700">
        Custom Instructions
      </label>
      <textarea
        id="custom-prompt"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        rows={4}
        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
      />
      <p className="text-xs text-gray-500">
        Provide specific instructions for how you want the text to be processed.
      </p>
    </div>
  );
}
