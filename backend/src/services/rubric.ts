import { Criterion } from '../types/rubric.js';
import axios from 'axios';

const MOONSHOT_API_URL = 'https://api.moonshot.cn/v1/chat/completions';
const API_KEY = process.env.MOONSHOT_API_KEY || '';

export class RubricService {
  /**
   * Parse a rubric from markdown/text format
   * Uses regex for basic parsing + LLM fallback for unstructured text
   */
  async parseRubric(content: string): Promise<Criterion[]> {
    // First try regex parsing
    const regexCriteria = this.parseWithRegex(content);
    
    // If regex parsing found criteria, return them
    if (regexCriteria.length > 0) {
      return regexCriteria;
    }
    
    // If no criteria found with regex, try LLM parsing
    if (API_KEY && content.length > 10) {
      try {
        const llmCriteria = await this.parseWithLLM(content);
        if (llmCriteria.length > 0) {
          return llmCriteria;
        }
      } catch (error) {
        console.warn('LLM parsing failed, returning empty criteria:', error);
      }
    }
    
    return [];
  }

  /**
   * Parse rubric using regex patterns
   */
  private parseWithRegex(content: string): Criterion[] {
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
   * Parse rubric using Moonshot LLM
   * For unstructured text descriptions
   */
  private async parseWithLLM(content: string): Promise<Criterion[]> {
    const prompt = `Parse the following grading rubric text and extract criteria with their point values.

## Rubric Text:
${content.substring(0, 4000)}

## Instructions:
Extract each grading criterion with:
1. Name of the criterion
2. Maximum points (number)
3. Description of what is expected

## Response Format (JSON array):
[
  {
    "name": "Criterion Name",
    "maxPoints": 10,
    "description": "Description of what is expected for this criterion"
  }
]

Return ONLY the JSON array, no other text.`;

    const response = await axios.post(
      MOONSHOT_API_URL,
      {
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'system',
            content: 'You are a rubric parser. Extract structured criteria from text.',
          },
          {
            role: 'user',
            content: prompt,
          },
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

    const responseContent = response.data.choices[0]?.message?.content || '';
    return this.parseLLMResponse(responseContent);
  }

  /**
   * Parse LLM response to extract criteria
   */
  private parseLLMResponse(content: string): Criterion[] {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return [];
      }

      const parsed = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map((item: any, index: number) => ({
        id: String(index + 1),
        name: item.name || 'Unnamed Criterion',
        description: item.description || '',
        maxPoints: Number(item.maxPoints) || 0,
      }));
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      return [];
    }
  }

  /**
   * Calculate total points from criteria
   */
  calculateTotalPoints(criteria: Criterion[]): number {
    return criteria.reduce((sum, c) => sum + c.maxPoints, 0);
  }
}

export default RubricService;