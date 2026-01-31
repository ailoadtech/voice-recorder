import type { ModelVariant, ModelMetadata } from '../services/whisper/types';
import { getSystemMemory, checkMemoryStatus, type SystemMemory, type MemoryStatus } from './resourceMonitoring';

/**
 * Recommendation result for model selection
 */
export interface ModelRecommendation {
  recommendedVariant: ModelVariant | 'api';
  reason: string;
  alternativeVariants: ModelVariant[];
  canUseLocal: boolean;
  memoryStatus: MemoryStatus;
  diskSpaceAvailable: number;
}

/**
 * Memory requirements for each model variant (estimated)
 * These are approximate values based on model size + overhead
 */
const MODEL_MEMORY_REQUIREMENTS: Record<ModelVariant, number> = {
  tiny: 500 * 1024 * 1024,      // ~500 MB
  base: 800 * 1024 * 1024,      // ~800 MB
  small: 1.5 * 1024 * 1024 * 1024,  // ~1.5 GB
  medium: 3 * 1024 * 1024 * 1024,   // ~3 GB
  large: 5 * 1024 * 1024 * 1024,    // ~5 GB
};

/**
 * Model variants ordered by size (smallest to largest)
 */
const MODEL_VARIANTS_BY_SIZE: ModelVariant[] = ['tiny', 'base', 'small', 'medium', 'large'];

/**
 * Recommend a model variant based on available system resources
 * @param availableDiskSpace - Available disk space in bytes
 * @param modelMetadata - Array of model metadata
 * @returns Model recommendation with reasoning
 */
export async function recommendModelVariant(
  availableDiskSpace: number,
  modelMetadata: ModelMetadata[]
): Promise<ModelRecommendation> {
  // Get system memory
  let systemMemory: SystemMemory;
  try {
    systemMemory = await getSystemMemory();
  } catch (error) {
    // If we can't get system memory, assume sufficient and base recommendation on disk space only
    return recommendBasedOnDiskSpace(availableDiskSpace, modelMetadata);
  }

  const memoryStatus = checkMemoryStatus(systemMemory.available);
  const availableMemory = systemMemory.available;

  // Critical memory - recommend API
  if (memoryStatus === 'critical') {
    return {
      recommendedVariant: 'api',
      reason: `Critical memory situation (${formatGB(availableMemory)} available). API transcription is recommended to avoid system instability.`,
      alternativeVariants: [],
      canUseLocal: false,
      memoryStatus,
      diskSpaceAvailable: availableDiskSpace,
    };
  }

  // Find models that fit in both memory and disk space
  const suitableVariants = findSuitableVariants(
    availableMemory,
    availableDiskSpace,
    modelMetadata
  );

  // No suitable variants - recommend API
  if (suitableVariants.length === 0) {
    const reason = memoryStatus === 'low'
      ? `Low memory (${formatGB(availableMemory)} available) and insufficient disk space. API transcription is recommended.`
      : `Insufficient disk space (${formatGB(availableDiskSpace)} available). API transcription is recommended.`;

    return {
      recommendedVariant: 'api',
      reason,
      alternativeVariants: [],
      canUseLocal: false,
      memoryStatus,
      diskSpaceAvailable: availableDiskSpace,
    };
  }

  // Low memory - recommend smallest suitable variant
  if (memoryStatus === 'low') {
    const recommended = suitableVariants[0]; // Smallest variant
    const alternatives = suitableVariants.slice(1);

    return {
      recommendedVariant: recommended,
      reason: `Low memory (${formatGB(availableMemory)} available). The "${recommended}" model is recommended for best performance with limited resources.`,
      alternativeVariants: alternatives,
      canUseLocal: true,
      memoryStatus,
      diskSpaceAvailable: availableDiskSpace,
    };
  }

  // Sufficient memory - recommend best balance of accuracy and performance
  const recommended = recommendBalancedVariant(suitableVariants, modelMetadata);
  const alternatives = suitableVariants.filter(v => v !== recommended);

  return {
    recommendedVariant: recommended,
    reason: `System resources are sufficient. The "${recommended}" model offers a good balance of accuracy and performance.`,
    alternativeVariants: alternatives,
    canUseLocal: true,
    memoryStatus,
    diskSpaceAvailable: availableDiskSpace,
  };
}

/**
 * Find model variants that fit within memory and disk constraints
 */
function findSuitableVariants(
  availableMemory: number,
  availableDiskSpace: number,
  modelMetadata: ModelMetadata[]
): ModelVariant[] {
  const suitable: ModelVariant[] = [];

  for (const variant of MODEL_VARIANTS_BY_SIZE) {
    const memoryRequired = MODEL_MEMORY_REQUIREMENTS[variant];
    const metadata = modelMetadata.find(m => m.variant === variant);

    if (!metadata) continue;

    const diskRequired = metadata.size;

    // Check if variant fits in both memory and disk
    if (availableMemory >= memoryRequired && availableDiskSpace >= diskRequired) {
      suitable.push(variant);
    }
  }

  return suitable;
}

/**
 * Recommend a balanced variant from suitable options
 * Prefers "small" or "base" for best balance of accuracy and speed
 */
function recommendBalancedVariant(
  suitableVariants: ModelVariant[],
  modelMetadata: ModelMetadata[]
): ModelVariant {
  // Preference order: small > base > medium > tiny > large
  const preferenceOrder: ModelVariant[] = ['small', 'base', 'medium', 'tiny', 'large'];

  for (const preferred of preferenceOrder) {
    if (suitableVariants.includes(preferred)) {
      return preferred;
    }
  }

  // Fallback to first suitable variant
  return suitableVariants[0];
}

/**
 * Recommend based on disk space only (when memory info unavailable)
 */
function recommendBasedOnDiskSpace(
  availableDiskSpace: number,
  modelMetadata: ModelMetadata[]
): ModelRecommendation {
  const suitableVariants = modelMetadata
    .filter(m => m.size <= availableDiskSpace)
    .map(m => m.variant)
    .sort((a, b) => {
      const aIndex = MODEL_VARIANTS_BY_SIZE.indexOf(a);
      const bIndex = MODEL_VARIANTS_BY_SIZE.indexOf(b);
      return aIndex - bIndex;
    });

  if (suitableVariants.length === 0) {
    return {
      recommendedVariant: 'api',
      reason: `Insufficient disk space (${formatGB(availableDiskSpace)} available). API transcription is recommended.`,
      alternativeVariants: [],
      canUseLocal: false,
      memoryStatus: 'sufficient', // Unknown, assume sufficient
      diskSpaceAvailable: availableDiskSpace,
    };
  }

  const recommended = recommendBalancedVariant(suitableVariants, modelMetadata);
  const alternatives = suitableVariants.filter(v => v !== recommended);

  return {
    recommendedVariant: recommended,
    reason: `The "${recommended}" model is recommended based on available disk space.`,
    alternativeVariants: alternatives,
    canUseLocal: true,
    memoryStatus: 'sufficient', // Unknown, assume sufficient
    diskSpaceAvailable: availableDiskSpace,
  };
}

/**
 * Format bytes to GB with 1 decimal place
 */
function formatGB(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)} GB`;
}

/**
 * Check if a specific model variant is recommended for current system
 * @param variant - Model variant to check
 * @param availableDiskSpace - Available disk space in bytes
 * @param modelMetadata - Array of model metadata
 * @returns true if the variant is suitable for current system resources
 */
export async function isVariantRecommended(
  variant: ModelVariant,
  availableDiskSpace: number,
  modelMetadata: ModelMetadata[]
): Promise<boolean> {
  const recommendation = await recommendModelVariant(availableDiskSpace, modelMetadata);
  
  if (recommendation.recommendedVariant === 'api') {
    return false;
  }

  return (
    recommendation.recommendedVariant === variant ||
    recommendation.alternativeVariants.includes(variant)
  );
}

/**
 * Get memory requirement for a specific model variant
 * @param variant - Model variant
 * @returns Estimated memory requirement in bytes
 */
export function getModelMemoryRequirement(variant: ModelVariant): number {
  return MODEL_MEMORY_REQUIREMENTS[variant];
}
