import { Criterion } from '../types/rubric.js';
import axios from 'axios';

const MOONSHOT_API_URL = 'https://api.moonshot.ai/v1/chat/completions';
const API_KEY = process.env.MOONSHOT_API_KEY || '';

console.log('[RubricService] MOONSHOT_API_KEY present:', !!API_KEY, 'Length:', API_KEY?.length || 0);

export class RubricService {
  /**
   * Parse a rubric from any text format using LLM
   */
  async parseRubric(content: string): Promise<Criterion[]> {
    console.log('[Rubric] Starting parse, content length:', content.length);
    
    // Quick regex parse for simple markdown (fast path)
    const quickParse = this.quickParse(content);
    console.log('[Rubric] Quick parse result:', quickParse.length, 'criteria');
    if (quickParse.length > 0) {
      console.log(`[Rubric] Quick parse found ${quickParse.length} criteria`);
      return quickParse;
    }

    // Use LLM for complex or unstructured formats
    if (!API_KEY) {
      console.warn('[Rubric] No API key, skipping LLM parse');
      return [];
    }

    if (content.length <= 10) {
      console.warn('[Rubric] Content too short');
      return [];
    }

    try {
      console.log('[Rubric] Using LLM parse...');
      const result = await this.parseWithLLM(content);
      console.log(`[Rubric] LLM returned ${result.length} criteria`);
      return result;
    } catch (error) {
      console.error('[Rubric] LLM parsing failed:', error);
      return [];
    }
  }

  /**
   * Quick regex parse for simple markdown format
   */
  private quickParse(content: string): Criterion[] {
    const criteria: Criterion[] = [];
    const lines = content.split('\n');
    let currentCriterion: Partial<Criterion> | null = null;
    let idCounter = 1;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Match: ## Name (X pts) or ## Name - X points
      const match = trimmedLine.match(/^##\s+(.+?)\s*\((\d+)\s*(?:pts?|points?)\)/i) ||
                   trimmedLine.match(/^##\s+(.+?)\s*-\s*(\d+)\s*(?:pts?|points?)/i);
      
      if (match) {
        if (currentCriterion?.name) {
          criteria.push({
            id: String(idCounter++),
            name: currentCriterion.name,
            description: currentCriterion.description || '',
            maxPoints: currentCriterion.maxPoints || 0,
          });
        }
        
        currentCriterion = {
          name: match[1].trim(),
          maxPoints: parseInt(match[2], 10),
          description: '',
        };
      } else if (currentCriterion && trimmedLine.startsWith('-')) {
        const desc = trimmedLine.substring(1).trim();
        currentCriterion.description = currentCriterion.description 
          ? currentCriterion.description + '\n' + desc
          : desc;
      }
    }

    if (currentCriterion?.name) {
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
   * Parse using Moonshot LLM - handles any format
   */
  private async parseWithLLM(content: string): Promise<Criterion[]> {
    const prompt = `Extract all grading criteria from this rubric text. Return as JSON array.

## Rubric Text:
${content.substring(0, 5000)}

## Instructions:
Find all criteria and extract:
1. "name": The criterion name/title
2. "maxPoints": Maximum points possible (look for highest number in scoring scale, or count bullet points, or use indicated max)
3. "description": All evaluation details, requirements, bullet points combined

## Output Format (JSON only):
[
  {"name": "Criterion Name", "maxPoints": 10, "description": "Bullet 1\nBullet 2\nBullet 3"}
]

Return valid JSON array only, no markdown, no explanation.`;

    const response = await axios.post(
      MOONSHOT_API_URL,
      {
        model: 'moonshot-v1-8k',
        messages: [
          { role: 'system', content: 'You extract structured data from rubrics. Output valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const text = response.data.choices[0]?.message?.content || '';
    return this.extractJSON(text);
  }

  /**
   * Extract JSON array from LLM response
   */
  private extractJSON(text: string): Criterion[] {
    try {
      console.log('[Rubric] LLM raw response:', text.substring(0, 200));
      
      // Find JSON array in response
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) {
        console.warn('[Rubric] No JSON array found in response');
        return [];
      }

      const parsed = JSON.parse(match[0]);
      if (!Array.isArray(parsed)) {
        console.warn('[Rubric] Parsed content is not an array');
        return [];
      }

      console.log(`[Rubric] Extracted ${parsed.length} items from JSON`);
      return parsed.map((item: any, i: number) => ({
        id: String(i + 1),
        name: String(item.name || 'Unnamed'),
        maxPoints: Number(item.maxPoints) || 0,
        description: String(item.description || ''),
      }));
    } catch (e) {
      console.error('[Rubric] JSON parse error:', e);
      return [];
    }
  }

  /**
   * Calculate total points
   */
  calculateTotalPoints(criteria: Criterion[]): number {
    return criteria.reduce((sum, c) => sum + c.maxPoints, 0);
  }
}

export default RubricService;