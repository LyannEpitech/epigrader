import { AnalysisJob, AnalysisResult, AnalyzedCriterion } from '../types/analysis.js';
import { Criterion } from '../types/rubric.js';

// In-memory job storage (replace with Redis/DB in production)
const jobs = new Map<string, AnalysisJob>();

export class AnalysisService {
  /**
   * Create a new analysis job
   */
  createJob(repoUrl: string, rubricId: string, criteria: Criterion[]): AnalysisJob {
    const job: AnalysisJob = {
      id: this.generateJobId(),
      status: 'pending',
      repoUrl,
      rubricId,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    jobs.set(job.id, job);
    
    // Start async processing
    this.processJob(job, criteria);

    return job;
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): AnalysisJob | undefined {
    return jobs.get(jobId);
  }

  /**
   * Process job asynchronously
   */
  private async processJob(job: AnalysisJob, criteria: Criterion[]): Promise<void> {
    try {
      job.status = 'processing';
      job.updatedAt = new Date().toISOString();

      // Simulate processing (replace with actual LLM analysis)
      const analyzedCriteria: AnalyzedCriterion[] = [];
      
      for (let i = 0; i < criteria.length; i++) {
        const criterion = criteria[i];
        
        // Simulate analysis time
        await this.delay(500);
        
        // Mock analysis result (replace with actual LLM call)
        const analyzedCriterion = await this.analyzeCriterion(criterion);
        analyzedCriteria.push(analyzedCriterion);
        
        // Update progress
        job.progress = Math.round(((i + 1) / criteria.length) * 100);
        job.updatedAt = new Date().toISOString();
      }

      const result: AnalysisResult = {
        criteria: analyzedCriteria,
        totalScore: analyzedCriteria.reduce((sum, c) => sum + c.score, 0),
        maxScore: criteria.reduce((sum, c) => sum + c.maxPoints, 0),
        globalComment: this.generateGlobalComment(analyzedCriteria),
        analyzedAt: new Date().toISOString(),
      };

      job.status = 'completed';
      job.result = result;
      job.progress = 100;
      job.updatedAt = new Date().toISOString();
    } catch (error) {
      job.status = 'error';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Analyze a single criterion (mock implementation)
   * TODO: Replace with actual LLM call
   */
  private async analyzeCriterion(criterion: Criterion): Promise<AnalyzedCriterion> {
    // Mock analysis - random score for now
    const score = Math.floor(Math.random() * (criterion.maxPoints + 1));
    let status: 'passed' | 'failed' | 'partial';
    
    if (score === criterion.maxPoints) {
      status = 'passed';
    } else if (score === 0) {
      status = 'failed';
    } else {
      status = 'partial';
    }

    return {
      id: criterion.id,
      name: criterion.name,
      description: criterion.description,
      maxPoints: criterion.maxPoints,
      score,
      status,
      justification: `Analyzed ${criterion.name}: ${score}/${criterion.maxPoints} points`,
      references: [],
    };
  }

  /**
   * Generate global comment based on results
   */
  private generateGlobalComment(criteria: AnalyzedCriterion[]): string {
    const passed = criteria.filter(c => c.status === 'passed').length;
    const failed = criteria.filter(c => c.status === 'failed').length;
    const partial = criteria.filter(c => c.status === 'partial').length;

    return `Analysis complete: ${passed} passed, ${partial} partial, ${failed} failed.`;
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default AnalysisService;