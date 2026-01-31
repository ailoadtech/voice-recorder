import { describe, it, expect, jest } from '@jest/globals';
import type { ModelMetadata } from '../services/whisper/types';
import {
  recommendModelVariant,
  isVariantRecommended,
  getModelMemoryRequirement,
} from './modelRecommendation';

// Mock the resourceMonitoring module
jest.mock('./resourceMonitoring', () => ({
  getSystemMemory: jest.fn(),
  checkMemoryStatus: jest.fn((available: number) => {
    if (available < 2 * 1024 * 1024 * 1024) return 'critical';
    if (available < 4 * 1024 * 1024 * 1024) return 'low';
    return 'sufficient';
  }),
  MEMORY_THRESHOLDS: {
    LOW_MEMORY_GB: 4,
    CRITICAL_MEMORY_GB: 2,
    LOW_MEMORY_BYTES: 4 * 1024 * 1024 * 1024,
    CRITICAL_MEMORY_BYTES: 2 * 1024 * 1024 * 1024,
  },
}));

const mockModelMetadata: ModelMetadata[] = [
  {
    variant: 'tiny',
    size: 75 * 1024 * 1024,
    checksum: 'test',
    downloadUrl: 'test',
    accuracy: 'good',
    estimatedSpeed: 'fast',
  },
  {
    variant: 'base',
    size: 142 * 1024 * 1024,
    checksum: 'test',
    downloadUrl: 'test',
    accuracy: 'better',
    estimatedSpeed: 'fast',
  },
  {
    variant: 'small',
    size: 466 * 1024 * 1024,
    checksum: 'test',
    downloadUrl: 'test',
    accuracy: 'better',
    estimatedSpeed: 'medium',
  },
  {
    variant: 'medium',
    size: 1.5 * 1024 * 1024 * 1024,
    checksum: 'test',
    downloadUrl: 'test',
    accuracy: 'best',
    estimatedSpeed: 'slow',
  },
  {
    variant: 'large',
    size: 2.9 * 1024 * 1024 * 1024,
    checksum: 'test',
    downloadUrl: 'test',
    accuracy: 'best',
    estimatedSpeed: 'slow',
  },
];

describe('modelRecommendation', () => {
  describe('recommendModelVariant', () => {
    it('should recommend API when memory is critical', async () => {
      const { getSystemMemory } = require('./resourceMonitoring');
      getSystemMemory.mockResolvedValue({
        total: 8 * 1024 * 1024 * 1024,
        available: 1.5 * 1024 * 1024 * 1024, // 1.5 GB - critical
        used: 6.5 * 1024 * 1024 * 1024,
        free: 1.5 * 1024 * 1024 * 1024,
      });

      const recommendation = await recommendModelVariant(
        10 * 1024 * 1024 * 1024, // 10 GB disk space
        mockModelMetadata
      );

      expect(recommendation.recommendedVariant).toBe('api');
      expect(recommendation.canUseLocal).toBe(false);
      expect(recommendation.memoryStatus).toBe('critical');
      expect(recommendation.reason).toContain('Critical memory');
    });

    it('should recommend smallest variant when memory is low', async () => {
      const { getSystemMemory } = require('./resourceMonitoring');
      getSystemMemory.mockResolvedValue({
        total: 8 * 1024 * 1024 * 1024,
        available: 3 * 1024 * 1024 * 1024, // 3 GB - low
        used: 5 * 1024 * 1024 * 1024,
        free: 3 * 1024 * 1024 * 1024,
      });

      const recommendation = await recommendModelVariant(
        10 * 1024 * 1024 * 1024, // 10 GB disk space
        mockModelMetadata
      );

      expect(recommendation.recommendedVariant).toBe('tiny');
      expect(recommendation.canUseLocal).toBe(true);
      expect(recommendation.memoryStatus).toBe('low');
      expect(recommendation.reason).toContain('Low memory');
    });

    it('should recommend balanced variant when memory is sufficient', async () => {
      const { getSystemMemory } = require('./resourceMonitoring');
      getSystemMemory.mockResolvedValue({
        total: 16 * 1024 * 1024 * 1024,
        available: 8 * 1024 * 1024 * 1024, // 8 GB - sufficient
        used: 8 * 1024 * 1024 * 1024,
        free: 8 * 1024 * 1024 * 1024,
      });

      const recommendation = await recommendModelVariant(
        10 * 1024 * 1024 * 1024, // 10 GB disk space
        mockModelMetadata
      );

      // Should recommend "small" as the balanced option
      expect(recommendation.recommendedVariant).toBe('small');
      expect(recommendation.canUseLocal).toBe(true);
      expect(recommendation.memoryStatus).toBe('sufficient');
      expect(recommendation.alternativeVariants.length).toBeGreaterThan(0);
    });

    it('should recommend API when disk space is insufficient', async () => {
      const { getSystemMemory } = require('./resourceMonitoring');
      getSystemMemory.mockResolvedValue({
        total: 16 * 1024 * 1024 * 1024,
        available: 8 * 1024 * 1024 * 1024,
        used: 8 * 1024 * 1024 * 1024,
        free: 8 * 1024 * 1024 * 1024,
      });

      const recommendation = await recommendModelVariant(
        50 * 1024 * 1024, // Only 50 MB disk space
        mockModelMetadata
      );

      expect(recommendation.recommendedVariant).toBe('api');
      expect(recommendation.canUseLocal).toBe(false);
      expect(recommendation.reason).toContain('disk space');
    });

    it('should only recommend variants that fit in available resources', async () => {
      const { getSystemMemory } = require('./resourceMonitoring');
      getSystemMemory.mockResolvedValue({
        total: 16 * 1024 * 1024 * 1024,
        available: 8 * 1024 * 1024 * 1024,
        used: 8 * 1024 * 1024 * 1024,
        free: 8 * 1024 * 1024 * 1024,
      });

      const recommendation = await recommendModelVariant(
        200 * 1024 * 1024, // 200 MB disk space - only tiny and base fit
        mockModelMetadata
      );

      expect(recommendation.canUseLocal).toBe(true);
      expect(['tiny', 'base']).toContain(recommendation.recommendedVariant);
      
      // Should not recommend variants that don't fit
      const allRecommended = [
        recommendation.recommendedVariant,
        ...recommendation.alternativeVariants,
      ];
      expect(allRecommended).not.toContain('small');
      expect(allRecommended).not.toContain('medium');
      expect(allRecommended).not.toContain('large');
    });
  });

  describe('isVariantRecommended', () => {
    it('should return true for recommended variant', async () => {
      const { getSystemMemory } = require('./resourceMonitoring');
      getSystemMemory.mockResolvedValue({
        total: 16 * 1024 * 1024 * 1024,
        available: 8 * 1024 * 1024 * 1024,
        used: 8 * 1024 * 1024 * 1024,
        free: 8 * 1024 * 1024 * 1024,
      });

      const isRecommended = await isVariantRecommended(
        'small',
        10 * 1024 * 1024 * 1024,
        mockModelMetadata
      );

      expect(isRecommended).toBe(true);
    });

    it('should return false when API is recommended', async () => {
      const { getSystemMemory } = require('./resourceMonitoring');
      getSystemMemory.mockResolvedValue({
        total: 8 * 1024 * 1024 * 1024,
        available: 1.5 * 1024 * 1024 * 1024, // Critical
        used: 6.5 * 1024 * 1024 * 1024,
        free: 1.5 * 1024 * 1024 * 1024,
      });

      const isRecommended = await isVariantRecommended(
        'small',
        10 * 1024 * 1024 * 1024,
        mockModelMetadata
      );

      expect(isRecommended).toBe(false);
    });
  });

  describe('getModelMemoryRequirement', () => {
    it('should return memory requirement for each variant', () => {
      expect(getModelMemoryRequirement('tiny')).toBe(500 * 1024 * 1024);
      expect(getModelMemoryRequirement('base')).toBe(800 * 1024 * 1024);
      expect(getModelMemoryRequirement('small')).toBe(1.5 * 1024 * 1024 * 1024);
      expect(getModelMemoryRequirement('medium')).toBe(3 * 1024 * 1024 * 1024);
      expect(getModelMemoryRequirement('large')).toBe(5 * 1024 * 1024 * 1024);
    });
  });
});
