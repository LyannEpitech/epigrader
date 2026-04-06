import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { MoonshotService } from '../../src/services/moonshot';
import { Criterion } from '../../src/types/rubric';
import axios from 'axios';

jest.mock('axios');

describe('MoonshotService with mocked API', () => {
  let service: MoonshotService;
  const mockedAxios = jest.mocked(axios);

  beforeEach(() => {
    service = new MoonshotService();
    jest.clearAllMocks();
  });

  describe('successful API responses', () => {
    it('should parse valid JSON response with all fields', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                score: 8,
                status: 'passed',
                justification: 'Excellent code quality',
                references: [{ file: 'main.c', lines: [1, 10] }],
              }),
            },
          }],
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const criterion: Criterion = {
        id: '1',
        name: 'Code Quality',
        description: 'Code should be clean',
        maxPoints: 10,
      };

      const result = await service.analyzeCriterion(criterion, [
        { path: 'main.c', content: 'int main() { return 0; }' },
      ]);

      expect(result.score).toBe(8);
      expect(result.status).toBe('passed');
      expect(result.justification).toBe('Excellent code quality');
      expect(result.references).toHaveLength(1);
    });

    it('should handle JSON response with missing optional fields', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                score: 5,
                status: 'partial',
              }),
            },
          }],
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const criterion: Criterion = {
        id: '2',
        name: 'Documentation',
        description: 'Should have docs',
        maxPoints: 10,
      };

      const result = await service.analyzeCriterion(criterion, []);

      expect(result.score).toBe(5);
      expect(result.status).toBe('partial');
      expect(result.justification).toBe('No justification provided');
      expect(result.references).toEqual([]);
    });

    it('should cap score at maxPoints', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                score: 15, // Higher than maxPoints
                status: 'passed',
              }),
            },
          }],
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const criterion: Criterion = {
        id: '3',
        name: 'Test',
        description: 'Test',
        maxPoints: 10,
      };

      const result = await service.analyzeCriterion(criterion, []);

      expect(result.score).toBe(10); // Capped at maxPoints
    });

    it('should handle score of 0', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                score: 0,
                status: 'failed',
              }),
            },
          }],
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const criterion: Criterion = {
        id: '4',
        name: 'Test',
        description: 'Test',
        maxPoints: 10,
      };

      const result = await service.analyzeCriterion(criterion, []);

      expect(result.score).toBe(0);
      expect(result.status).toBe('failed');
    });
  });

  describe('API error handling', () => {
    it('should fallback on API error', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      const criterion: Criterion = {
        id: '5',
        name: 'Test',
        description: 'Test',
        maxPoints: 10,
      };

      const result = await service.analyzeCriterion(criterion, []);

      expect(result.id).toBe('5');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(10);
      expect(result.status).toBe('partial');
    });

    it('should fallback on invalid JSON response', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: 'Not valid JSON',
            },
          }],
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const criterion: Criterion = {
        id: '6',
        name: 'Test',
        description: 'Test',
        maxPoints: 10,
      };

      const result = await service.analyzeCriterion(criterion, []);

      expect(result.id).toBe('6');
      expect(result.status).toBe('partial');
    });

    it('should fallback when no choices in response', async () => {
      const mockResponse = {
        data: {
          choices: [],
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const criterion: Criterion = {
        id: '7',
        name: 'Test',
        description: 'Test',
        maxPoints: 10,
      };

      const result = await service.analyzeCriterion(criterion, []);

      expect(result.id).toBe('7');
    });
  });

  describe('response parsing edge cases', () => {
    it('should extract JSON from markdown code block', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: '```json\n{"score": 7, "status": "passed"}\n```',
            },
          }],
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const criterion: Criterion = {
        id: '8',
        name: 'Test',
        description: 'Test',
        maxPoints: 10,
      };

      const result = await service.analyzeCriterion(criterion, []);

      expect(result.score).toBe(7);
    });

    it('should handle JSON with extra text around it', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: 'Here is the analysis: {"score": 9, "status": "passed"} Thank you!',
            },
          }],
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const criterion: Criterion = {
        id: '9',
        name: 'Test',
        description: 'Test',
        maxPoints: 10,
      };

      const result = await service.analyzeCriterion(criterion, []);

      expect(result.score).toBe(9);
    });
  });
});