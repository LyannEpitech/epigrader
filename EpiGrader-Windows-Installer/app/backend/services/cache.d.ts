import { AnalysisResult } from '../types/analysis.js';
export declare class AnalysisCache {
    /**
     * Generate cache key from repo URL and rubric criteria
     */
    private generateKey;
    /**
     * Simple hash function for criteria
     */
    private hashCriteria;
    /**
     * Get cached result if available and not expired
     */
    get(repoUrl: string, criteria: any[]): AnalysisResult | null;
    /**
     * Store result in cache
     */
    set(repoUrl: string, criteria: any[], result: AnalysisResult): void;
    /**
     * Clear expired entries
     */
    cleanup(): void;
    /**
     * Clear all cache
     */
    clear(): void;
    /**
     * Get cache stats
     */
    getStats(): {
        size: number;
        oldestEntry: number | null;
        entries: Array<{
            repoUrl: string;
            timestamp: number;
        }>;
    };
    /**
     * Delete specific cache entry by repo URL
     */
    delete(repoUrl: string): void;
}
export default AnalysisCache;
//# sourceMappingURL=cache.d.ts.map