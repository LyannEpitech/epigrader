"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisCache = void 0;
// In-memory cache (replace with Redis for production)
const cache = new Map();
// Cache TTL: 24 hours
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
class AnalysisCache {
    /**
     * Generate cache key from repo URL and rubric criteria
     */
    generateKey(repoUrl, criteria) {
        const rubricHash = this.hashCriteria(criteria);
        return `${repoUrl}:${rubricHash}`;
    }
    /**
     * Simple hash function for criteria
     */
    hashCriteria(criteria) {
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
    get(repoUrl, criteria) {
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
    set(repoUrl, criteria, result) {
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
    cleanup() {
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
    clear() {
        cache.clear();
    }
    /**
     * Get cache stats
     */
    getStats() {
        let oldest = Infinity;
        const entries = [];
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
    delete(repoUrl) {
        for (const [key, entry] of cache.entries()) {
            if (entry.repoUrl === repoUrl) {
                cache.delete(key);
            }
        }
    }
}
exports.AnalysisCache = AnalysisCache;
exports.default = AnalysisCache;
//# sourceMappingURL=cache.js.map