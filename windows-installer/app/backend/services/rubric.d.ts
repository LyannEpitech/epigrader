import { Criterion } from '../types/rubric.js';
export declare class RubricService {
    /**
     * Parse a rubric from any text format using LLM
     */
    parseRubric(content: string): Promise<Criterion[]>;
    /**
     * Quick regex parse for simple markdown format
     */
    private quickParse;
    /**
     * Parse using Moonshot LLM - handles any format
     */
    private parseWithLLM;
    /**
     * Extract JSON array from LLM response
     */
    private extractJSON;
    /**
     * Calculate total points
     */
    calculateTotalPoints(criteria: Criterion[]): number;
}
export default RubricService;
//# sourceMappingURL=rubric.d.ts.map