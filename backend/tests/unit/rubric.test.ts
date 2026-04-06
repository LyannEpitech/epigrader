import { RubricService } from '../../src/services/rubric';

describe('RubricService', () => {
  let service: RubricService;

  beforeEach(() => {
    service = new RubricService();
  });

  describe('parseRubric', () => {
    it('should parse simple rubric', async () => {
      const content = `
## Presentation (5 pts)
- README complete
- Makefile present

## Features (10 pts)
- Arguments handling
- Error handling
`;

      const criteria = await service.parseRubric(content);

      expect(criteria).toHaveLength(2);
      expect(criteria[0].name).toBe('Presentation');
      expect(criteria[0].maxPoints).toBe(5);
      expect(criteria[0].description).toContain('README complete');
      expect(criteria[1].name).toBe('Features');
      expect(criteria[1].maxPoints).toBe(10);
    });

    it('should parse rubric with "points" format', async () => {
      const content = `## Test - 5 points`;

      const criteria = await service.parseRubric(content);

      expect(criteria).toHaveLength(1);
      expect(criteria[0].maxPoints).toBe(5);
    });

    it('should parse rubric with "pt" format', async () => {
      const content = `## Test (3 pt)`;

      const criteria = await service.parseRubric(content);

      expect(criteria).toHaveLength(1);
      expect(criteria[0].maxPoints).toBe(3);
    });

    it('should handle empty content', async () => {
      const criteria = await service.parseRubric('');
      expect(criteria).toHaveLength(0);
    });

    it('should handle content without criteria', async () => {
      const criteria = await service.parseRubric('Just some text\nWithout any criteria');
      expect(criteria).toHaveLength(0);
    });

    it('should assign sequential IDs', async () => {
      const content = `
## First (5 pts)
## Second (10 pts)
## Third (15 pts)
`;

      const criteria = await service.parseRubric(content);

      expect(criteria[0].id).toBe('1');
      expect(criteria[1].id).toBe('2');
      expect(criteria[2].id).toBe('3');
    });
  });

  describe('calculateTotalPoints', () => {
    it('should calculate total points', () => {
      const criteria = [
        { id: '1', name: 'A', description: '', maxPoints: 5 },
        { id: '2', name: 'B', description: '', maxPoints: 10 },
        { id: '3', name: 'C', description: '', maxPoints: 15 },
      ];

      const total = service.calculateTotalPoints(criteria);

      expect(total).toBe(30);
    });

    it('should return 0 for empty criteria', () => {
      const total = service.calculateTotalPoints([]);
      expect(total).toBe(0);
    });
  });
});