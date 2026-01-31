/**
 * LLM Service Exports
 */

export { LLMService } from './LLMService';
export { OpenAIProvider } from './providers/OpenAIProvider';
export { getPromptTemplate, buildPrompt, getAvailableEnrichmentTypes, getEnrichmentTypeInfo } from './prompts';
export {
  ENRICHMENT_PRESETS,
  getPresetById,
  presetToOptions,
  getPresetsByType,
  getPresetCategories,
  type EnrichmentPreset,
} from './presets';
export type {
  ILLMService,
  EnrichmentResult,
  EnrichmentOptions,
  LLMStatus,
  LLMError,
  EnrichmentType,
  PromptTemplate,
  LLMProvider,
  OpenAIConfig,
  OllamaConfig,
} from './types';
