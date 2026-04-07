import { AnalysisResult } from '../types/analysis.js';

interface CacheEntry {
  result: AnalysisResult;
  timestamp: number;
  repoUrl: string;
  rubricHash: string;
}

// In-memory cache (replace with Redis for production)
const cache = new Map<string, CacheEntry>();

// Cache TTL: 24 hours
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export class AnalysisCache {
  /**
   * Generate cache key from repo URL and rubric criteria
   */
  private generateKey(repoUrl: string, criteria: any[]): string {
    const rubricHash = this.hashCriteria(criteria);
    return `${repoUrl}:${rubricHash}`;
  }

  /**
   * Simple hash function for criteria
   */
  private hashCriteria(criteria: any[]): string {
    const str = JSON.stringify(criteria);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * Get cached result if available and not expired
   */
  get(repoUrl: string, criteria: any[]): AnalysisResult | null {
    const key = this.generateKey(repoUrl, criteria);
    const entry = cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      cache.delete(key);
      return null;
    }

    return entry.result;
  }

  /**
   * Store result in cache
   */
  set(repoUrl: string, criteria: any[], result: AnalysisResult): void {
    const key = this.generateKey(repoUrl, criteria);
    cache.set(key, {
      result,
      timestamp: Date.now(),
      repoUrl,
      rubricHash: this.hashCriteria(criteria),
    });
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > CACHE_TTL_MS) {
        cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats(): { size: number; oldestEntry: number | null; entries: Array<{repoUrl: string; timestamp: number}> } {
    let oldest = Infinity;
    const entries: Array<{repoUrl: string; timestamp: number}> = [];
    
    for (const entry of cache.values()) {
      if (entry.timestamp < oldest) {
        oldest = entry.timestamp;
      }
      entries.push({
        repoUrl: entry.repoUrl,
        timestamp: entry.timestamp,
      });
    }
    
    return {
      size: cache.size,
      oldestEntry: oldest === Infinity ? null : oldest,
      entries,
    };
  }

  /**
   * Delete specific cache entry by repo URL
   */
  delete(repoUrl: string): void {
    for (const [key, entry] of cache.entries()) {
      if (entry.repoUrl === repoUrl) {
        cache.delete(key);
      }
    }
  }
}

export default AnalysisCache;