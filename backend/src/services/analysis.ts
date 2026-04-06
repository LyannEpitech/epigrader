import { AnalysisJob, AnalysisResult, AnalyzedCriterion } from '../types/analysis.js';
import { Criterion } from '../types/rubric.js';
import { MoonshotService } from './moonshot.js';
import { GitHubService } from './github.js';
import { AnalysisCache } from './cache.js';

// In-memory job storage (replace with Redis/DB in production)
const jobs = new Map<string, AnalysisJob>();

// Maximum number of jobs to keep in memory
const MAX_JOBS = 100;

export class AnalysisService {
  private moonshotService: MoonshotService;
  private githubService: GitHubService;
  private cache: AnalysisCache;

  constructor() {
    this.moonshotService = new MoonshotService();
    this.githubService = new GitHubService(process.env.GITHUB_TOKEN || '');
    this.cache = new AnalysisCache();
  }

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

      // Check cache first
      const cachedResult = this.cache.get(job.repoUrl, criteria);
      if (cachedResult) {
        job.status = 'completed';
        job.result = cachedResult;
        job.progress = 100;
        job.updatedAt = new Date().toISOString();
        return;
      }

      // Extract owner/repo from URL
      const { owner, repo } = this.parseRepoUrl(job.repoUrl);

      // Fetch repository files
      const repoFiles = await this.fetchRepoFiles(owner, repo);

      // Analyze each criterion with LLM
      const analyzedCriteria: AnalyzedCriterion[] = [];
      
      for (let i = 0; i < criteria.length; i++) {
        const criterion = criteria[i];
        
        // Analyze with Moonshot API
        const analyzedCriterion = await this.moonshotService.analyzeCriterion(
          criterion,
          repoFiles
        );
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

      // Cache the result
      this.cache.set(job.repoUrl, criteria, result);

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
   * Parse GitHub repo URL to extract owner and repo
   */
  private parseRepoUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub URL');
    }
    return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
  }

  /**
   * Fetch repository files for analysis
   */
  private async fetchRepoFiles(
    owner: string,
    repo: string,
    maxFiles: number = 50
  ): Promise<Array<{ path: string; content: string }>> {
    const files: Array<{ path: string; content: string }> = [];
    
    try {
      // Get repo tree
      const tree = await this.githubService.getRepoTree(owner, repo);
      
      // Supported file extensions
      const codeExtensions = [
        '.c', '.h', '.cpp', '.cc', '.cxx', '.hpp',
        '.py', '.pyc', '.pyo',
        '.js', '.jsx', '.ts', '.tsx', '.mjs',
        '.java', '.class', '.jar',
        '.go', '.mod', '.sum',
        '.rs', '.toml',
        '.rb', '.erb',
        '.php', '.phtml',
        '.swift',
        '.kt', '.kts',
        '.scala', '.sc',
        '.r', '.R',
        '.m', '.mm',
        '.cs', '.csproj',
        '.fs', '.fsx',
        '.hs', '.lhs',
        '.lua',
        '.pl', '.pm',
        '.sh', '.bash', '.zsh', '.fish',
        '.ps1', '.psm1',
        '.bat', '.cmd',
        '.sql',
        '.html', '.htm', '.xhtml',
        '.css', '.scss', '.sass', '.less',
        '.xml', '.xsl', '.xslt',
        '.json', '.yaml', '.yml', '.toml',
        '.md', '.markdown', '.rst',
        '.dockerfile', 'dockerfile',
        '.gitignore', '.gitattributes',
        '.env', '.env.example',
        'Makefile', 'makefile', 'GNUmakefile',
        'CMakeLists.txt', 'Cargo.toml', 'package.json',
        'requirements.txt', 'Pipfile', 'setup.py', 'pyproject.toml',
        'Gemfile', 'Rakefile',
        'pom.xml', 'build.gradle',
        'go.mod', 'go.sum',
      ];
      
      // Filter for code files
      const codeFiles = tree
        .filter(item => {
          if (item.type !== 'blob') return false;
          if (item.path.startsWith('.')) return false;
          if (item.path.includes('node_modules')) return false;
          if (item.path.includes('vendor')) return false;
          if (item.path.includes('__pycache__')) return false;
          if (item.path.includes('.git/')) return false;
          if (item.path.includes('dist/')) return false;
          if (item.path.includes('build/')) return false;
          if (item.path.includes('target/')) return false;
          if (item.path.includes('bin/')) return false;
          if (item.path.includes('obj/')) return false;
          
          const path = item.path.toLowerCase();
          const fileName = path.split('/').pop() || '';
          
          // Check if it's a known file by name
          if (codeExtensions.includes(fileName)) return true;
          
          // Check by extension
          return codeExtensions.some(ext => path.endsWith(ext));
        })
        .slice(0, maxFiles);

      // Fetch content for each file
      for (const file of codeFiles) {
        try {
          const content = await this.githubService.getFileContent(owner, repo, file.path);
          if (content) {
            files.push({ path: file.path, content });
          }
        } catch (e) {
          console.warn(`Failed to fetch ${file.path}:`, e);
        }
      }
    } catch (error) {
      console.error('Failed to fetch repo files:', error);
    }

    return files;
  }

  /**
   * Generate global comment based on results
   */
  private generateGlobalComment(criteria: AnalyzedCriterion[]): string {
    const passed = criteria.filter(c => c.status === 'passed').length;
    const failed = criteria.filter(c => c.status === 'failed').length;
    const partial = criteria.filter(c => c.status === 'partial').length;
    const totalScore = criteria.reduce((sum, c) => sum + c.score, 0);
    const maxScore = criteria.reduce((sum, c) => sum + c.maxPoints, 0);

    return `Analysis complete: ${totalScore}/${maxScore} points. ${passed} passed, ${partial} partial, ${failed} failed.`;
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all jobs (for history)
   */
  getAllJobs(): AnalysisJob[] {
    return Array.from(jobs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get recent jobs with limit
   */
  getRecentJobs(limit: number = 10): AnalysisJob[] {
    return this.getAllJobs().slice(0, limit);
  }

  /**
   * Clean up old jobs to prevent memory leaks
   */
  private cleanupOldJobs(): void {
    if (jobs.size > MAX_JOBS) {
      const sortedJobs = this.getAllJobs();
      const jobsToRemove = sortedJobs.slice(MAX_JOBS);
      jobsToRemove.forEach(job => jobs.delete(job.id));
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; oldestEntry: number | null } {
    return this.cache.getStats();
  }
}

export default AnalysisService;