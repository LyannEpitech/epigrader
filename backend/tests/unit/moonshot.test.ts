import { MoonshotService } from '../../src/services/moonshot';
import { Criterion } from '../../src/types/rubric';

describe('MoonshotService', () => {
  let service: MoonshotService;

  beforeEach(() => {
    service = new MoonshotService();
  });

  describe('analyzeCriterion', () => {
    it('should return fallback analysis when API key is missing', async () => {
      const criterion: Criterion = {
        id: '1',
        name: 'Code Quality',
        description: 'Code should be clean',
        maxPoints: 10,
      };

      const repoFiles = [
        { path: 'main.c', content: 'int main() { return 0; }' },
      ];

      const result = await service.analyzeCriterion(criterion, repoFiles);

      expect(result.id).toBe('1');
      expect(result.name).toBe('Code Quality');
      expect(result.maxPoints).toBe(10);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(10);
      expect(['passed', 'failed', 'partial']).toContain(result.status);
    }, 10000);



    it('should handle empty repo files', async () => {
      const criterion: Criterion = {
        id: '2',
        name: 'Documentation',
        description: 'README should exist',
        maxPoints: 5,
      };

      const result = await service.analyzeCriterion(criterion, []);

      expect(result.id).toBe('2');
      expect(result.maxPoints).toBe(5);
    }, 10000);

    it('should handle large files by truncating', async () => {
      const criterion: Criterion = {
        id: '3',
        name: 'Performance',
        description: 'Efficient code',
        maxPoints: 10,
      };

      const largeContent = 'x'.repeat(10000);
      const repoFiles = [
        { path: 'large.c', content: largeContent },
      ];

      // Should not throw
      const result = await service.analyzeCriterion(criterion, repoFiles);
      expect(result.id).toBe('3');
    }, 10000);

    it('should handle all score ranges', async () => {
      const testCases = [
        { maxPoints: 5 },
        { maxPoints: 10 },
        { maxPoints: 20 },
      ];

      for (const testCase of testCases) {
        const criterion: Criterion = {
          id: `test-${testCase.maxPoints}`,
          name: 'Test',
          description: 'Test',
          maxPoints: testCase.maxPoints,
        };

        const result = await service.analyzeCriterion(criterion, []);
        expect(result.maxPoints).toBe(testCase.maxPoints);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(testCase.maxPoints);
      }
    }, 10000);

    it('should handle multiple files', async () => {
      const criterion: Criterion = {
        id: 'multi',
        name: 'Multi File Test',
        description: 'Test with multiple files',
        maxPoints: 10,
      };

      const repoFiles = [
        { path: 'main.c', content: 'int main() {}' },
        { path: 'helper.c', content: 'void helper() {}' },
        { path: 'header.h', content: '#define TEST 1' },
      ];

      const result = await service.analyzeCriterion(criterion, repoFiles);
      expect(result.id).toBe('multi');
      expect(result.name).toBe('Multi File Test');
    }, 10000);
  });
});