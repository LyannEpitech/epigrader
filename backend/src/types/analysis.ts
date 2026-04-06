export interface AnalysisJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  repoUrl: string;
  rubricId: string;
  progress: number;
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