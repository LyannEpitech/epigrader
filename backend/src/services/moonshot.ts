import axios from 'axios';
import { AnalyzedCriterion } from '../types/analysis.js';
import { Criterion } from '../types/rubric.js';

const MOONSHOT_API_URL = 'https://api.moonshot.cn/v1/chat/completions';
const API_KEY = process.env.MOONSHOT_API_KEY || '';

export class MoonshotService {
  /**
   * Analyze a criterion using Moonshot API
   */
  async analyzeCriterion(
    criterion: Criterion,
    repoFiles: Array<{ path: string; content: string }>
  ): Promise<AnalyzedCriterion> {
    try {
      const prompt = this.buildPrompt(criterion, repoFiles);
      
      const response = await axios.post(
        MOONSHOT_API_URL,
        {
          model: 'moonshot-v1-8k',
          messages: [
            {
              role: 'system',
              content: 'You are an expert code reviewer for Epitech projects. Analyze the code against the given criterion and provide a detailed assessment.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
        },
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0]?.message?.content || '';
      return this.parseResponse(criterion, content);
    } catch (error) {
      console.error('Moonshot API error:', error);
      // Fallback to mock analysis if API fails
      return this.fallbackAnalysis(criterion);
    }
  }

  /**
   * Build the prompt for the LLM
   */
  private buildPrompt(criterion: Criterion, repoFiles: Array<{ path: string; content: string }>): string {
    const fileContents = repoFiles
      .map(f => `--- ${f.path} ---\n${f.content.substring(0, 2000)}...`)
      .join('\n\n');

    return `Analyze the following code repository against this criterion:

## Criterion: ${criterion.name} (${criterion.maxPoints} points)
Description: ${criterion.description}

## Repository Files:
${fileContents}

## Instructions:
1. Evaluate if the criterion is met
2. Assign a score from 0 to ${criterion.maxPoints}
3. Provide a brief justification
4. Reference specific files/lines if relevant

## Response Format (JSON):
{
  "score": <number>,
  "status": "passed|failed|partial",
  "justification": "<explanation>",
  "references": [{"file": "<path>", "lines": [start, end]}]
}`;
  }

  /**
   * Parse the LLM response
   */
  private parseResponse(criterion: Criterion, content: string): AnalyzedCriterion {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          id: criterion.id,
          name: criterion.name,
          description: criterion.description,
          maxPoints: criterion.maxPoints,
          score: Math.min(parsed.score || 0, criterion.maxPoints),
          status: parsed.status || 'partial',
          justification: parsed.justification || 'No justification provided',
          references: parsed.references || [],
        };
      }
    } catch (e) {
      console.error('Failed to parse LLM response:', e);
    }

    return this.fallbackAnalysis(criterion);
  }

  /**
   * Fallback analysis when API fails
   */
  private fallbackAnalysis(criterion: Criterion): AnalyzedCriterion {
    return {
      id: criterion.id,
      name: criterion.name,
      description: criterion.description,
      maxPoints: criterion.maxPoints,
      score: Math.floor(Math.random() * (criterion.maxPoints + 1)),
      status: 'partial',
      justification: 'Analysis failed - using fallback scoring',
      references: [],
    };
  }
}

export default MoonshotService;