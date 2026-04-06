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
   * Supports both markdown format and Epitech rubric format
   */
  private parseWithRegex(content: string): Criterion[] {
    const criteria: Criterion[] = [];
    const lines = content.split('\n');
    let currentCriterion: Partial<Criterion> | null = null;
    let idCounter = 1;
    let inNotesSection = false;
    let maxPointsInSection = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      if (!trimmedLine) continue;
      
      // Try markdown format first: ## Criterion Name (X pts)
      const markdownMatch = trimmedLine.match(/^##\s+(.+?)\s*\((\d+)\s*(?:pts?|points?)\)/i) ||
                           trimmedLine.match(/^##\s+(.+?)\s*-\s*(\d+)\s*(?:pts?|points?)/i);
      
      if (markdownMatch) {
        // Save previous criterion if exists
        if (currentCriterion && currentCriterion.name) {
          if (maxPointsInSection > 0 && !currentCriterion.maxPoints) {
            currentCriterion.maxPoints = maxPointsInSection;
          }
          criteria.push({
            id: String(idCounter++),
            name: currentCriterion.name,
            description: currentCriterion.description || '',
            maxPoints: currentCriterion.maxPoints || 0,
          });
        }
        
        currentCriterion = {
          name: markdownMatch[1].trim(),
          maxPoints: parseInt(markdownMatch[2], 10),
          description: '',
        };
        inNotesSection = false;
        maxPointsInSection = 0;
        continue;
      }
      
      // Try Epitech format: standalone title before metadata
      const nextLines = lines.slice(i + 1, Math.min(i + 5, lines.length)).join(' ');
      const isEpitechCriterion = trimmedLine.length > 3 && 
                                !trimmedLine.startsWith('-') && 
                                !trimmedLine.startsWith('Module:') &&
                                !trimmedLine.startsWith('Critères') &&
                                !trimmedLine.startsWith('Ordre:') &&
                                !trimmedLine.startsWith('Compétences:') &&
                                !trimmedLine.startsWith('Notes') &&
                                !trimmedLine.includes('[') &&
                                !trimmedLine.startsWith('##') &&
                                (nextLines.includes('Ordre:') || nextLines.includes('Compétences:') || nextLines.includes('Notes possibles:'));
      
      if (isEpitechCriterion) {
        // Save previous criterion if exists
        if (currentCriterion && currentCriterion.name) {
          if (maxPointsInSection > 0) {
            currentCriterion.maxPoints = maxPointsInSection;
          }
          criteria.push({
            id: String(idCounter++),
            name: currentCriterion.name,
            description: currentCriterion.description || '',
            maxPoints: currentCriterion.maxPoints || 0,
          });
        }
        
        currentCriterion = {
          name: trimmedLine,
          maxPoints: 0,
          description: '',
        };
        inNotesSection = false;
        maxPointsInSection = 0;
      } else if (trimmedLine.startsWith('Notes possibles:')) {
        inNotesSection = true;
      } else if (inNotesSection && /^\d+$/.test(trimmedLine)) {
        const pointValue = parseInt(trimmedLine, 10);
        if (pointValue > maxPointsInSection) {
          maxPointsInSection = pointValue;
        }
      } else if (currentCriterion && trimmedLine.startsWith('-')) {
        const descriptionLine = trimmedLine.substring(1).trim();
        currentCriterion.description = currentCriterion.description 
          ? currentCriterion.description + '\n' + descriptionLine
          : descriptionLine;
      } else if (currentCriterion && trimmedLine && !trimmedLine.startsWith('#')) {
        currentCriterion.description = currentCriterion.description 
          ? currentCriterion.description + '\n' + trimmedLine
          : trimmedLine;
      }
    }

    // Don't forget the last criterion
    if (currentCriterion && currentCriterion.name) {
      if (maxPointsInSection > 0 && !currentCriterion.maxPoints) {
        currentCriterion.maxPoints = maxPointsInSection;
      }
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
    const prompt = `Parse the following grading rubric and extract all criteria with their maximum points and descriptions.

## Rubric Text:
${content.substring(0, 4000)}

## Instructions:
Look for criteria sections that contain:
- Criterion name (e.g., "Business Understanding", "Technical Implementation")
- Maximum points (look for "Notes possibles" with highest number, or count bullet points)
- Description with bullet points explaining what is evaluated

For each criterion, extract:
1. Name: The criterion title (e.g., "Business Understanding")
2. maxPoints: The maximum possible score (highest number in "Notes possibles" or number of bullet points)
3. description: Combine all bullet points into a description

## Response Format (JSON array):
[
  {
    "name": "Business Understanding",
    "maxPoints": 4,
    "description": "1 point per valid statement:\n- Identifies a clear target audience.\n- Describes at least 3 needs..."
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