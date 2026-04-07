import { AnalysisJob } from '../types/analysis.js';
import { Criterion } from '../types/rubric.js';
export declare class AnalysisService {
    private moonshotService;
    private githubService;
    private cache;
    constructor();
    /**
     * Create a new analysis job
     */
    createJob(repoUrl: string, rubricId: string, criteria: Criterion[], pat?: string): AnalysisJob;
    /**
     * Get job by ID
     */
    getJob(jobId: string): AnalysisJob | undefined;
    /**
     * Get all jobs (for history)
     */
    getAllJobs(): AnalysisJob[];
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        oldestEntry: number | null;
        entries: Array<{
            repoUrl: string;
            timestamp: number;
        }>;
    };
    /**
     * Clear all cache
     */
    clearCache(): void;
    /**
     * Clear specific cache entry
     */
    clearCacheEntry(repoUrl: string): void;
    /**
     * Process job asynchronously with detailed steps
     */
    private processJob;
    /**
     * Fetch repository files for analysis
     */
    private fetchRepoFiles;
    /**
     * Parse GitHub URL to extract owner and repo
     */
    private parseRepoUrl;
    /**
     * Generate unique job ID
     */
    private generateJobId;
}
export default AnalysisService;
//# sourceMappingURL=analysis.d.ts.map