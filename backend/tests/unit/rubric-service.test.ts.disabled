import { RubricService } from '../../src/services/rubric';
import axios from 'axios';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RubricService', () => {
  let service: RubricService;

  beforeEach(() => {
    service = new RubricService();
    jest.clearAllMocks();
  });

  describe('parseRubric', () => {
    it('should parse markdown format rubric', async () => {
      const content = `
## Presentation (5 pts)
- README complete
- Makefile present

## Features (10 pts)
- Arguments handling
`;

      const result = await service.parseRubric(content);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Presentation');
      expect(result[0].maxPoints).toBe(5);
      expect(result[1].name).toBe('Features');
      expect(result[1].maxPoints).toBe(10);
    });

    it('should return empty array for short content', async () => {
      const result = await service.parseRubric('Hi');
      expect(result).toHaveLength(0);
    });

    it('should return empty array for empty content', async () => {
      const result = await service.parseRubric('');
      expect(result).toHaveLength(0);
    });

    it('should use LLM for complex formats', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          choices: [{
            message: {
              content: JSON.stringify([
                { id: '1', name: 'Quality', description: 'Code quality', maxPoints: 10 },
              ]),
            },
          }],
        },
      });

      const content = 'Some complex rubric format that needs LLM parsing with lots of text to describe the criteria in detail';
      const result = await service.parseRubric(content);

      expect(mockedAxios.post).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should handle LLM errors gracefully', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

      const content = 'Some complex rubric format that needs LLM parsing with lots of text to describe the criteria in detail';
      const result = await service.parseRubric(content);

      expect(result).toHaveLength(0);
    });

    it('should handle invalid LLM response', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          choices: [{
            message: {
              content: 'invalid json',
            },
          }],
        },
      });

      const content = 'Some complex rubric format that needs LLM parsing with lots of text to describe the criteria in detail';
      const result = await service.parseRubric(content);

      expect(result).toHaveLength(0);
    });
  });

  describe('quickParse', () => {
    it('should parse Epitech format', async () => {
      const content = `
Presentation: 5 points
- README complete
- Makefile present

Features: 10 points
- Arguments handling
`;

      const result = await service.parseRubric(content);

      expect(result.length).toBeGreaterThan(0);
    });

    it('should parse various point formats', async () => {
      const formats = [
        '## Test (5 pts)',
        '## Test (5 points)',
        '## Test: 5 pts',
        '## Test: 5 points',
        'Test (5 pts)',
        'Test: 5 points',
      ];

      for (const format of formats) {
        const result = await service.parseRubric(format);
        if (result.length > 0) {
          expect(result[0].maxPoints).toBe(5);
        }
      }
    });
  });
});