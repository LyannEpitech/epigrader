import { AnalysisCache } from '../../src/services/cache';
import { AnalysisResult } from '../../src/types/analysis';

describe('AnalysisCache', () => {
  let cache: AnalysisCache;
  const mockCriteria = [{ id: '1', name: 'Test', maxPoints: 10 }];
  const mockResult: AnalysisResult = {
    criteria: [],
    totalScore: 10,
    maxScore: 10,
    globalComment: 'Good job',
    analyzedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    cache = new AnalysisCache();
    cache.clear();
    jest.clearAllMocks();
  });

  describe('set and get', () => {
    it('should store and retrieve cached analysis', () => {
      const repoUrl = 'https://github.com/Epitech/test';

      cache.set(repoUrl, mockCriteria, mockResult);
      const result = cache.get(repoUrl, mockCriteria);

      expect(result).toEqual(mockResult);
    });

    it('should return null for non-existent entry', () => {
      const result = cache.get('https://github.com/Epitech/non-existent', mockCriteria);
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete specific entry', () => {
      const repoUrl = 'https://github.com/Epitech/test';

      cache.set(repoUrl, mockCriteria, mockResult);
      cache.delete(repoUrl);

      const result = cache.get(repoUrl, mockCriteria);
      expect(result).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      cache.set('https://github.com/Epitech/test1', mockCriteria, mockResult);
      cache.set('https://github.com/Epitech/test2', mockCriteria, mockResult);
      
      cache.clear();

      const stats = cache.getStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', () => {
      cache.set('https://github.com/Epitech/test1', mockCriteria, mockResult);
      cache.set('https://github.com/Epitech/test2', mockCriteria, mockResult);

      const stats = cache.getStats();

      expect(stats.size).toBe(2);
      expect(stats.entries).toHaveLength(2);
    });

    it('should return empty stats for empty cache', () => {
      const stats = cache.getStats();

      expect(stats.size).toBe(0);
      expect(stats.entries).toHaveLength(0);
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', () => {
      jest.useFakeTimers();
      
      cache.set('https://github.com/Epitech/test1', mockCriteria, mockResult);
      
      // Advance time by 25 hours
      jest.advanceTimersByTime(25 * 60 * 60 * 1000);
      
      cache.cleanup();
      
      const stats = cache.getStats();
      expect(stats.size).toBe(0);
      
      jest.useRealTimers();
    });
  });
});