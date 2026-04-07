import { AnalyzedCriterion } from '../types/analysis.js';
import { Criterion } from '../types/rubric.js';
export declare class MoonshotService {
    /**
     * Analyze a criterion using Moonshot API
     */
    analyzeCriterion(criterion: Criterion, repoFiles: Array<{
        path: string;
        content: string;
    }>): Promise<AnalyzedCriterion>;
    /**
     * Prioritize files based on importance
     */
    private prioritizeFiles;
    /**
     * Compress file content by removing unnecessary whitespace and comments
     */
    private compressContent;
    /**
     * Group files by their directory
     */
    private groupFilesByDirectory;
    /**
     * Build the prompt for the LLM
     */
    private buildPrompt;
    /**
     * Parse the LLM response
     */
    private parseResponse;
    /**
     * Fallback analysis when API fails
     */
    private fallbackAnalysis;
}
export default MoonshotService;
//# sourceMappingURL=moonshot.d.ts.map