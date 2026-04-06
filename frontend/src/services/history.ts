import { AnalysisJob } from '../types/analysis';
import axios from 'axios';

const API_URL = '/api';

export const historyApi = {
  getHistory: async (limit: number = 10): Promise<Array<{
    jobId: string;
    repoUrl: string;
    rubricId: string;
    status: string;
    progress: number;
    totalScore?: number;
    maxScore?: number;
    createdAt: string;
    updatedAt: string;
  }>> => {
    const response = await axios.get(`${API_URL}/analyze/history?limit=${limit}`);
    return response.data.jobs;
  },
};

export const exportPdf = (job: AnalysisJob): void => {
  // Simple text export for now (PDF generation can be added later)
  const content = generateReportContent(job);
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analysis-${job.id}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const generateReportContent = (job: AnalysisJob): string => {
  const lines = [
    `# Analysis Report`,
    ``,
    `**Repository:** ${job.repoUrl}`,
    `**Date:** ${new Date(job.createdAt).toLocaleString()}`,
    `**Status:** ${job.status}`,
    ``,
  ];

  if (job.result) {
    lines.push(`## Score: ${job.result.totalScore} / ${job.result.maxScore}`, ``);
    lines.push(`### Global Comment`, job.result.globalComment, ``);
    lines.push(`### Criteria`, ``);

    job.result.criteria.forEach(c => {
      lines.push(`#### ${c.name} (${c.score}/${c.maxPoints})`);
      lines.push(`Status: ${c.status}`);
      lines.push(`Justification: ${c.justification}`, ``);
    });
  }

  return lines.join('\n');
};