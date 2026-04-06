import { Criterion } from '../types/rubric.js';

export class RubricService {
  /**
   * Parse a rubric from markdown/text format
   * Uses regex for basic parsing + can be enhanced with LLM
   */
  async parseRubric(content: string): Promise<Criterion[]> {
    const criteria: Criterion[] = [];
    const lines = content.split('\n');
    let currentCriterion: Partial<Criterion> | null = null;
    let idCounter = 1;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Match criterion header: ## Criterion Name (X pts) or ## Criterion Name - X points
      const headerMatch = trimmedLine.match(/^##\s+(.+?)\s*\((\d+)\s*(?:pts?|points?)\)/i) ||
                         trimmedLine.match(/^##\s+(.+?)\s*-\s*(\d+)\s*(?:pts?|points?)/i);
      
      if (headerMatch) {
        // Save previous criterion if exists
        if (currentCriterion && currentCriterion.name) {
          criteria.push({
            id: String(idCounter++),
            name: currentCriterion.name,
            description: currentCriterion.description || '',
            maxPoints: currentCriterion.maxPoints || 0,
          });
        }
        
        // Start new criterion
        currentCriterion = {
          name: headerMatch[1].trim(),
          maxPoints: parseInt(headerMatch[2], 10),
          description: '',
        };
      } else if (currentCriterion && trimmedLine.startsWith('-')) {
        // This is a description line (bullet point)
        const descriptionLine = trimmedLine.substring(1).trim();
        currentCriterion.description = currentCriterion.description 
          ? currentCriterion.description + '\n' + descriptionLine
          : descriptionLine;
      } else if (currentCriterion && trimmedLine && !trimmedLine.startsWith('#')) {
        // Additional description text
        currentCriterion.description = currentCriterion.description 
          ? currentCriterion.description + '\n' + trimmedLine
          : trimmedLine;
      }
    }

    // Don't forget the last criterion
    if (currentCriterion && currentCriterion.name) {
      criteria.push({
        id: String(idCounter++),
        name: currentCriterion.name,
        description: currentCriterion.description || '',
        maxPoints: currentCriterion.maxPoints || 0,
      });
    }

    return criteria;
  }

  /**
   * Calculate total points from criteria
   */
  calculateTotalPoints(criteria: Criterion[]): number {
    return criteria.reduce((sum, c) => sum + c.maxPoints, 0);
  }
}

export default RubricService;