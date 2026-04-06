import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rubricStorage } from '../src/services/rubric';
import { Criterion } from '../src/types/rubric';

describe('rubricStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should save and retrieve rubrics', () => {
    const criteria: Criterion[] = [
      { id: '1', name: 'Test', description: 'Desc', maxPoints: 5 },
    ];

    rubricStorage.saveRubric('My Rubric', criteria);
    const rubrics = rubricStorage.getAllRubrics();

    expect(rubrics).toHaveLength(1);
    expect(rubrics[0].name).toBe('My Rubric');
    expect(rubrics[0].totalPoints).toBe(5);
    expect(rubrics[0].criteria).toEqual(criteria);
  });

  it('should get rubric by id', () => {
    const criteria: Criterion[] = [{ id: '1', name: 'Test', description: '', maxPoints: 5 }];
    rubricStorage.saveRubric('Test', criteria);

    const rubrics = rubricStorage.getAllRubrics();
    const found = rubricStorage.getRubric(rubrics[0].id);

    expect(found).toBeDefined();
    expect(found?.name).toBe('Test');
  });

  it('should return undefined for non-existent rubric', () => {
    const found = rubricStorage.getRubric('non-existent');
    expect(found).toBeUndefined();
  });

  it('should delete rubric', () => {
    const criteria: Criterion[] = [{ id: '1', name: 'Test', description: '', maxPoints: 5 }];
    rubricStorage.saveRubric('Test', criteria);

    const rubrics = rubricStorage.getAllRubrics();
    rubricStorage.deleteRubric(rubrics[0].id);

    expect(rubricStorage.getAllRubrics()).toHaveLength(0);
  });

  it('should return empty array when no rubrics', () => {
    expect(rubricStorage.getAllRubrics()).toEqual([]);
  });

  it('should handle multiple rubrics', () => {
    rubricStorage.saveRubric('Rubric 1', [{ id: '1', name: 'A', description: '', maxPoints: 5 }]);
    rubricStorage.saveRubric('Rubric 2', [{ id: '1', name: 'B', description: '', maxPoints: 10 }]);

    const rubrics = rubricStorage.getAllRubrics();
    expect(rubrics).toHaveLength(2);
  });
});