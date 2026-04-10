export interface AnalysisStep {
  id: number;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
  timestamp: string;
}

export interface AnalysisJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  repoUrl: string;
  rubricId: string;
  branch?: string;
  progress: number;
  steps?: AnalysisStep[];
  result?: AnalysisResult;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisResult {
  criteria: AnalyzedCriterion[];
  totalScore: number;
  maxScore: number;
  globalComment: string;
  analyzedAt: string;
}

export interface AnalyzedCriterion {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  score: number;
  status: 'passed' | 'failed' | 'partial';
  justification: string;
  references: CodeReference[];
}

export interface CodeReference {
  file: string;
  lines?: [number, number];
  snippet?: string;
}