import axios from 'axios';
import { AnalysisJob } from '../types/analysis';

const API_URL = '/api';

export interface CacheEntry {
  repoUrl: string;
  timestamp: number;
}

export const analysisApi = {
  startAnalysis: async (repoUrl: string, rubricId: string, pat?: string): Promise<{ jobId: string; status: string }> => {
    const response = await axios.post(`${API_URL}/analyze`, { repoUrl, rubricId, pat });
    return response.data;
  },

  getJobStatus: async (jobId: string): Promise<AnalysisJob> => {
    const response = await axios.get(`${API_URL}/analyze/status/${jobId}`);
    return response.data;
  },

  getCacheEntries: async (): Promise<{ entries: CacheEntry[]; totalEntries: number }> => {
    const response = await axios.get(`${API_URL}/analyze/cache/entries`);
    return response.data;
  },

  clearCache: async (): Promise<void> => {
    await axios.delete(`${API_URL}/analyze/cache`);
  },

  clearCacheEntry: async (repoUrl: string): Promise<void> => {
    await axios.delete(`${API_URL}/analyze/cache/entry?repoUrl=${encodeURIComponent(repoUrl)}`);
  },
};