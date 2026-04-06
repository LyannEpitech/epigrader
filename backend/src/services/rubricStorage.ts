import { Criterion } from '../types/rubric.js';

// In-memory storage for rubrics (replace with database in production)
const rubrics = new Map<string, {
  id: string;
  name: string;
  criteria: Criterion[];
  totalPoints: number;
  createdAt: string;
}>();

export const rubricStorage = {
  saveRubric: (name: string, criteria: Criterion[]): string => {
    const id = Date.now().toString();
    const rubric = {
      id,
      name,
      criteria,
      totalPoints: criteria.reduce((sum, c) => sum + c.maxPoints, 0),
      createdAt: new Date().toISOString(),
    };
    rubrics.set(id, rubric);
    return id;
  },

  getAllRubrics: () => {
    return Array.from(rubrics.values());
  },

  getRubric: (id: string) => {
    return rubrics.get(id);
  },

  deleteRubric: (id: string): void => {
    rubrics.delete(id);
  },
};

export default rubricStorage;