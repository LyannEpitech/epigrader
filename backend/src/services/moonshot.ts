import axios from 'axios';
import { AnalyzedCriterion } from '../types/analysis.js';
import { Criterion } from '../types/rubric.js';

const MOONSHOT_API_URL = 'https://api.moonshot.ai/v1/chat/completions';
const API_KEY = process.env.MOONSHOT_API_KEY || 'sk-3wnoZ7hg9ZDaR42aWt88JIyzgNw3XU1QZ2We8tPBlPA4MumV';

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
          model: 'kimi-k2.5',
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
          temperature: 1,
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
    } catch (error: any) {
      console.error('Moonshot API error:', error.response?.status, error.response?.data || error.message);
      // Fallback to mock analysis if API fails
      return this.fallbackAnalysis(criterion);
    }
  }

  /**
   * Prioritize files based on importance
   */
  private prioritizeFiles(files: Array<{ path: string; content: string }>): Array<{ path: string; content: string }> {
    const priorityOrder = [
      'README',
      'Makefile',
      'main.c',
      'main.cpp',
      'main.py',
      'main.js',
      'main.ts',
      'index.js',
      'index.ts',
      'app.js',
      'app.ts',
    ];

    return files.sort((a, b) => {
      const aPriority = priorityOrder.findIndex(p => a.path.toLowerCase().includes(p.toLowerCase()));
      const bPriority = priorityOrder.findIndex(p => b.path.toLowerCase().includes(p.toLowerCase()));
      
      if (aPriority === -1 && bPriority === -1) return 0;
      if (aPriority === -1) return 1;
      if (bPriority === -1) return -1;
      return aPriority - bPriority;
    });
  }

  /**
   * Compress file content by removing unnecessary whitespace and comments
   */
  private compressContent(content: string, filePath: string): string {
    // Don't compress binary or data files
    if (filePath.match(/\.(json|xml|yaml|yml|md|txt|csv)$/i)) {
      return content;
    }
    
    // Remove C-style comments (/* */ and //)
    let compressed = content
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
      .replace(/\/\/.*$/gm, '') // Remove // comments
      .replace(/#.*$/gm, '') // Remove # comments (Python, shell)
      .replace(/<!--[\s\S]*?-->/g, ''); // Remove HTML comments
    
    // Remove extra whitespace but preserve structure
    let lines = compressed
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0); // Remove empty lines
    
    // Limit to max 300 lines per file to keep prompt size reasonable
    const maxLines = 300;
    if (lines.length > maxLines) {
      // Keep first 150 lines and last 150 lines (usually contains important parts)
      const firstPart = lines.slice(0, 150);
      const lastPart = lines.slice(-150);
      lines = [...firstPart, '\n... [truncated ' + (lines.length - 300) + ' lines] ...\n', ...lastPart];
    }
    
    return lines.join('\n');
  }

  /**
   * Group files by their directory
   */
  private groupFilesByDirectory(
    files: Array<{ path: string; content: string }>
  ): Record<string, Array<{ path: string; content: string }>> {
    const groups: Record<string, Array<{ path: string; content: string }>> = {};
    
    for (const file of files) {
      const dir = file.path.includes('/') 
        ? file.path.substring(0, file.path.lastIndexOf('/'))
        : '.';
      
      if (!groups[dir]) {
        groups[dir] = [];
      }
      groups[dir].push(file);
    }
    
    return groups;
  }

  /**
   * Build the prompt for the LLM
   */
  private buildPrompt(criterion: Criterion, repoFiles: Array<{ path: string; content: string }>): string {
    // Group files by directory for better context
    const filesByDir = this.groupFilesByDirectory(repoFiles);
    
    // Build content with directory structure
    let fileContents = '';
    for (const [dir, files] of Object.entries(filesByDir)) {
      if (dir === '.') {
        fileContents += '## Root Directory:\n';
      } else {
        fileContents += `## Directory: ${dir}/\n`;
      }
      for (const f of files) {
        // Compress content to fit more data
        const compressed = this.compressContent(f.content, f.path);
        
        // Limit content per file to avoid exceeding LLM context (max ~100k chars total)
        const remainingChars = 100000 - fileContents.length;
        const contentToAdd = compressed.substring(0, Math.min(8000, remainingChars));
        fileContents += `--- ${f.path} (${compressed.length} chars) ---\n${contentToAdd}\n\n`;
        if (fileContents.length >= 100000) break;
      }
    }

    return `You are an expert code reviewer evaluating an Epitech student project. Analyze ALL provided files across ALL directories.

## Criterion: ${criterion.name} (${criterion.maxPoints} points)
${criterion.description}

## Repository Structure:
${Object.keys(filesByDir).map(d => d === '.' ? '- / (root)' : `- ${d}/`).join('\n')}

## Code Files to Analyze:
${fileContents}

## Evaluation Guidelines:
- Score 0-${Math.floor(criterion.maxPoints * 0.3)}: Criterion not met or severely lacking
- Score ${Math.floor(criterion.maxPoints * 0.3) + 1}-${Math.floor(criterion.maxPoints * 0.7)}: Partially met with issues (status: "partial")
- Score ${Math.floor(criterion.maxPoints * 0.7) + 1}-${criterion.maxPoints}: Fully met (status: "passed")

## Important:
- Analyze files in ALL directories, not just root
- Look for implementation across the entire codebase
- Consider project structure and organization

## Response (JSON only):
{
  "score": <number 0-${criterion.maxPoints}>,
  "status": "passed|failed|partial",
  "justification": "<2-3 sentences explaining the score, mentioning specific files and directories>",
  "references": [{"file": "<path>", "lines": [<start>, <end>]}]
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
    // Conservative fallback: 50% of max points
    const fallbackScore = Math.floor(criterion.maxPoints * 0.5);
    return {
      id: criterion.id,
      name: criterion.name,
      description: criterion.description,
      maxPoints: criterion.maxPoints,
      score: fallbackScore,
      status: 'partial',
      justification: '⚠️ LLM analysis failed - manual review recommended. Using conservative fallback score.',
      references: [],
    };
  }
}

export default MoonshotService;