import axios from 'axios';
import { ParseRubricResponse, Criterion } from '../types/rubric';

const API_URL = '/api';

export const rubricApi = {
  parseRubric: async (content: string): Promise<ParseRubricResponse> => {
    const response = await axios.post(`${API_URL}/rubric/parse`, { content });
    return response.data;
  },
};

export const rubricStorage = {
  saveRubric: (name: string, criteria: Criterion[]): void => {
    const rubrics = rubricStorage.getAllRubrics();
    rubrics.push({
      id: Date.now().toString(),
      name,
      criteria,
      totalPoints: criteria.reduce((sum, c) => sum + c.maxPoints, 0),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('epigrader_rubrics', JSON.stringify(rubrics));
  },

  getAllRubrics: (): Array<{
    id: string;
    name: string;
    criteria: Criterion[];
    totalPoints: number;
    createdAt: string;
  }> => {
    const stored = localStorage.getItem('epigrader_rubrics');
    return stored ? JSON.parse(stored) : [];
  },

  getRubric: (id: string) => {
    const rubrics = rubricStorage.getAllRubrics();
    return rubrics.find((r) => r.id === id);
  },

  deleteRubric: (id: string): void => {
    const rubrics = rubricStorage.getAllRubrics().filter((r) => r.id !== id);
    localStorage.setItem('epigrader_rubrics', JSON.stringify(rubrics));
  },
};