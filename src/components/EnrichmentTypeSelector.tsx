'use client';

import React from 'react';
import type { EnrichmentType } from '@/services/llm/types';
import { PROMPT_TEMPLATES } from '@/services/llm/prompts';

interface EnrichmentTypeSelectorProps {
  selectedType: EnrichmentType;
  onTypeChange: (type: EnrichmentType) => void;
  disabled?: boolean;
  className?: string;
}

export function EnrichmentTypeSelector({
  selectedType,
  onTypeChange,
  disabled = false,
  className = '',
}: EnrichmentTypeSelectorProps) {
  const enrichmentTypes = Object.values(PROMPT_TEMPLATES);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor="enrichment-type" className="text-sm font-medium text-gray-700">
        Enrichment Type
      </label>
      <select
        id="enrichment-type"
        value={selectedType}
        onChange={(e) => onTypeChange(e.target.value as EnrichmentType)}
        disabled={disabled}
        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
      >
        {enrichmentTypes.map((template) => (
          <option key={template.type} value={template.type}>
            {template.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500">
        {PROMPT_TEMPLATES[selectedType].description}
      </p>
    </div>
  );
}
