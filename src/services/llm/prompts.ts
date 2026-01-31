/**
 * Prompt Templates for LLM Enrichment
 * Defines system prompts and templates for different enrichment types
 */

import type { PromptTemplate, EnrichmentType } from './types';

/**
 * Prompt templates for each enrichment type
 */
export const PROMPT_TEMPLATES: Record<EnrichmentType, PromptTemplate> = {
  format: {
    type: 'format',
    name: 'Format & Clean',
    description: 'Clean up grammar, punctuation, and formatting',
    systemPrompt: `You are a professional editor. Your task is to clean up and format transcribed text while preserving the original meaning and tone. Fix grammar, punctuation, capitalization, and formatting issues. Remove filler words (um, uh, like) and false starts. Make the text clear and professional.`,
    userPromptTemplate: `Please format and clean up the following transcribed text:\n\n{text}`,
    temperature: 0.3,
    maxTokens: 2000,
  },

  summarize: {
    type: 'summarize',
    name: 'Summarize',
    description: 'Create a concise summary of the main points',
    systemPrompt: `You are an expert at creating concise, accurate summaries. Extract the key points and main ideas from the text. Focus on the most important information and present it in a clear, organized manner. Use bullet points if appropriate.`,
    userPromptTemplate: `Please summarize the following text:\n\n{text}`,
    temperature: 0.5,
    maxTokens: 1000,
  },

  expand: {
    type: 'expand',
    name: 'Expand & Elaborate',
    description: 'Add detail and context to brief notes',
    systemPrompt: `You are a skilled writer who can expand brief notes into well-developed content. Add relevant details, context, and explanations while maintaining the original intent. Make the text more comprehensive and easier to understand.`,
    userPromptTemplate: `Please expand and elaborate on the following notes:\n\n{text}`,
    temperature: 0.7,
    maxTokens: 3000,
  },

  'bullet-points': {
    type: 'bullet-points',
    name: 'Bullet Points',
    description: 'Convert to organized bullet point list',
    systemPrompt: `You are an expert at organizing information into clear, hierarchical bullet points. Extract the key information and present it as a well-structured list. Use sub-bullets for supporting details. Keep each point concise and actionable.`,
    userPromptTemplate: `Please convert the following text into organized bullet points:\n\n{text}`,
    temperature: 0.4,
    maxTokens: 1500,
  },

  'action-items': {
    type: 'action-items',
    name: 'Action Items',
    description: 'Extract tasks and action items',
    systemPrompt: `You are a productivity expert. Extract all action items, tasks, and to-dos from the text. Present them as a clear, actionable checklist. Include who should do what (if mentioned) and any deadlines or priorities. Format as checkboxes.`,
    userPromptTemplate: `Please extract all action items and tasks from the following text:\n\n{text}`,
    temperature: 0.3,
    maxTokens: 1500,
  },

  custom: {
    type: 'custom',
    name: 'Custom Prompt',
    description: 'Use your own custom instructions',
    systemPrompt: `You are a helpful AI assistant. Follow the user's instructions carefully and provide a thoughtful, accurate response.`,
    userPromptTemplate: `{customPrompt}\n\nText:\n{text}`,
    temperature: 0.7,
    maxTokens: 2000,
  },
};

/**
 * Get prompt template for enrichment type
 */
export function getPromptTemplate(type: EnrichmentType): PromptTemplate {
  return PROMPT_TEMPLATES[type];
}

/**
 * Build prompt from template
 */
export function buildPrompt(
  template: PromptTemplate,
  text: string,
  customPrompt?: string
): { system: string; user: string } {
  const userPrompt = template.userPromptTemplate
    .replace('{text}', text)
    .replace('{customPrompt}', customPrompt || '');

  return {
    system: template.systemPrompt,
    user: userPrompt,
  };
}

/**
 * Get all available enrichment types
 */
export function getAvailableEnrichmentTypes(): EnrichmentType[] {
  return Object.keys(PROMPT_TEMPLATES) as EnrichmentType[];
}

/**
 * Get enrichment type metadata
 */
export function getEnrichmentTypeInfo(type: EnrichmentType): {
  name: string;
  description: string;
} {
  const template = PROMPT_TEMPLATES[type];
  return {
    name: template.name,
    description: template.description,
  };
}
