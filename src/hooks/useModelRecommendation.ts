import { useState, useEffect } from 'react';
import type { ModelVariant } from '../services/whisper/types';
import { getModelManager } from '../services/whisper/ModelManager';
import { recommendModelVariant, type ModelRecommendation } from '../lib/modelRecommendation';

/**
 * Hook to get model recommendations based on system resources
 * @returns Model recommendation state and loading status
 */
export function useModelRecommendation() {
  const [recommendation, setRecommendation] = useState<ModelRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchRecommendation() {
      try {
        setLoading(true);
        setError(null);

        const modelManager = getModelManager();
        await modelManager.initialize();

        const diskSpace = await modelManager.getAvailableDiskSpace();
        const metadata = modelManager.getAllModelMetadata();

        const rec = await recommendModelVariant(diskSpace, metadata);

        if (mounted) {
          setRecommendation(rec);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to get recommendation');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchRecommendation();

    return () => {
      mounted = false;
    };
  }, []);

  return { recommendation, loading, error };
}

/**
 * Hook to check if a specific variant is recommended
 * @param variant - Model variant to check
 * @returns Whether the variant is recommended and loading status
 */
export function useIsVariantRecommended(variant: ModelVariant) {
  const { recommendation, loading } = useModelRecommendation();

  const isRecommended =
    recommendation &&
    (recommendation.recommendedVariant === variant ||
      recommendation.alternativeVariants.includes(variant));

  return { isRecommended: !!isRecommended, loading };
}
