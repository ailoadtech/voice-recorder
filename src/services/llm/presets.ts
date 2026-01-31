/**
 * Enrichment Presets
 * Pre-configured enrichment settings for common use cases
 */

import type { EnrichmentType, EnrichmentOptions } from './types';

export interface EnrichmentPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: EnrichmentType;
  customPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Pre-configured enrichment presets
 */
export const ENRICHMENT_PRESETS: EnrichmentPreset[] = [
  {
    id: 'quick-notes',
    name: 'Quick Notes',
    description: 'Clean up voice notes for quick reference',
    icon: '📝',
    type: 'format',
    temperature: 0.3,
  },
  {
    id: 'meeting-summary',
    name: 'Meeting Summary',
    description: 'Summarize meeting discussions with key points',
    icon: '📊',
    type: 'summarize',
    temperature: 0.4,
  },
  {
    id: 'task-list',
    name: 'Task List',
    description: 'Extract action items and to-dos',
    icon: '✅',
    type: 'action-items',
    temperature: 0.3,
  },
  {
    id: 'detailed-notes',
    name: 'Detailed Notes',
    description: 'Expand brief notes into comprehensive documentation',
    icon: '📄',
    type: 'expand',
    temperature: 0.6,
  },
  {
    id: 'structured-list',
    name: 'Structured List',
    description: 'Organize information into bullet points',
    icon: '📋',
    type: 'bullet-points',
    temperature: 0.4,
  },
  {
    id: 'email-draft',
    name: 'Email Draft',
    description: 'Format as a professional email',
    icon: '✉️',
    type: 'custom',
    customPrompt: 'Convert this into a professional email format with proper greeting, body, and closing.',
    temperature: 0.5,
  },
  {
    id: 'blog-post',
    name: 'Blog Post',
    description: 'Expand into a blog post format',
    icon: '✍️',
    type: 'custom',
    customPrompt: 'Expand this into an engaging blog post with an introduction, main content sections, and a conclusion.',
    temperature: 0.7,
  },
  {
    id: 'social-media',
    name: 'Social Media',
    description: 'Create social media posts',
    icon: '📱',
    type: 'custom',
    customPrompt: 'Create 3 social media posts from this content: one for Twitter (concise), one for LinkedIn (professional), and one for Instagram (engaging with hashtags).',
    temperature: 0.8,
  },
];

/**
 * Get preset by ID
 */
export function getPresetById(id: string): EnrichmentPreset | undefined {
  return ENRICHMENT_PRESETS.find(preset => preset.id === id);
}

/**
 * Convert preset to enrichment options
 */
export function presetToOptions(preset: EnrichmentPreset): EnrichmentOptions {
  return {
    type: preset.type,
    customPrompt: preset.customPrompt,
    temperature: preset.temperature,
    maxTokens: preset.maxTokens,
  };
}

/**
 * Get presets by type
 */
export function getPresetsByType(type: EnrichmentType): EnrichmentPreset[] {
  return ENRICHMENT_PRESETS.filter(preset => preset.type === type);
}

/**
 * Get all preset categories
 */
export function getPresetCategories(): Array<{ type: EnrichmentType; presets: EnrichmentPreset[] }> {
  const categories = new Map<EnrichmentType, EnrichmentPreset[]>();
  
  ENRICHMENT_PRESETS.forEach(preset => {
    const existing = categories.get(preset.type) || [];
    categories.set(preset.type, [...existing, preset]);
  });

  return Array.from(categories.entries()).map(([type, presets]) => ({
    type,
    presets,
  }));
}
