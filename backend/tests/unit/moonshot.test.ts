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
    });



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
    });

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
    });
  });
});