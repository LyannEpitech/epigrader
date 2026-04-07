import axios from 'axios';
import { ParseRubricResponse, Criterion } from '../types/rubric';

const API_URL = '/api';

export const rubricApi = {
  parseRubric: async (content: string): Promise<ParseRubricResponse> => {
    const response = await axios.post(`${API_URL}/rubric/parse`, { content });
    return response.data;
  },

  saveRubric: async (name: string, criteria: Criterion[]): Promise<string> => {
    const response = await axios.post(`${API_URL}/rubric`, { name, criteria });
    return response.data.id;
  },

  getAllRubrics: async (): Promise<Array<{
    id: string;
    name: string;
    criteria: Criterion[];
    totalPoints: number;
    createdAt: string;
  }>> => {
    const response = await axios.get(`${API_URL}/rubric`);
    return response.data.rubrics;
  },

  getRubric: async (id: string) => {
    const response = await axios.get(`${API_URL}/rubric/${id}`);
    return response.data.rubric;
  },

  deleteRubric: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/rubric/${id}`);
  },
};