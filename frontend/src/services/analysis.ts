import axios from 'axios';
import { AnalysisJob } from '../types/analysis';

const API_URL = '/api';

export const analysisApi = {
  startAnalysis: async (repoUrl: string, rubricId: string, pat?: string): Promise<{ jobId: string; status: string }> => {
    const response = await axios.post(`${API_URL}/analyze`, { repoUrl, rubricId, pat });
    return response.data;
  },

  getJobStatus: async (jobId: string): Promise<AnalysisJob> => {
    const response = await axios.get(`${API_URL}/analyze/status/${jobId}`);
    return response.data;
  },
};