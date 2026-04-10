import { AnalysisJob, AnalysisResult, AnalyzedCriterion, AnalysisStep } from '../types/analysis.js';
import { Criterion } from '../types/rubric.js';
import { MoonshotService } from './moonshot.js';
import { GitHubService } from './github.js';
import { AnalysisCache } from './cache.js';

// In-memory job storage (replace with Redis/DB in production)
const jobs = new Map<string, AnalysisJob>();

// Maximum number of jobs to keep in memory (for future cleanup implementation)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  createJob(repoUrl: string, rubricId: string, criteria: Criterion[], pat?: string): AnalysisJob {
    const job: AnalysisJob = {
      id: this.generateJobId(),
      status: 'pending',
      repoUrl,
      rubricId,
      progress: 0,
      steps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    jobs.set(job.id, job);
    
    // Start async processing with optional PAT
    this.processJob(job, criteria, pat);

    return job;
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): AnalysisJob | undefined {
    return jobs.get(jobId);
  }

  /**
   * Get all jobs (for history)
   */
  getAllJobs(): AnalysisJob[] {
    return Array.from(jobs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear specific cache entry
   */
  clearCacheEntry(repoUrl: string): void {
    this.cache.delete(repoUrl);
  }

  /**
   * Process job asynchronously with detailed steps
   */
  private async processJob(job: AnalysisJob, criteria: Criterion[], pat?: string): Promise<void> {
    // Use provided PAT or fall back to environment token
    const githubToken = pat || process.env.GITHUB_TOKEN || '';
    const githubService = new GitHubService(githubToken);
    const steps: AnalysisStep[] = [];
    
    const addStep = (name: string, status: 'pending' | 'running' | 'completed' | 'error', message?: string) => {
      const step: AnalysisStep = {
        id: steps.length + 1,
        name,
        status,
        message,
        timestamp: new Date().toISOString(),
      };
      steps.push(step);
      job.steps = steps;
      job.updatedAt = new Date().toISOString();
      return step;
    };

    try {
      job.status = 'processing';
      job.updatedAt = new Date().toISOString();

      // Step 1: Validate Configuration
      addStep('Configuration', 'running', 'Validating environment...');
      
      const hasGitHubToken = !!githubToken && githubToken.length > 10;
      const hasMoonshotKey = !!process.env.MOONSHOT_API_KEY;
      
      if (!hasGitHubToken) {
        addStep('Configuration', 'error', '⚠️ No GitHub PAT configured. Using public API (rate limits apply).');
      } else {
        addStep('Configuration', 'completed', '✅ GitHub PAT configured');
      }
      
      if (!hasMoonshotKey) {
        throw new Error('Moonshot API key not configured');
      }
      addStep('Configuration', 'completed', '✅ Moonshot API key configured');

      // Step 2: Validate GitHub PAT
      addStep('GitHub Authentication', 'running', 'Verifying GitHub access...');
      
      let githubUser = null;
      try {
        githubUser = await githubService.validateToken();
        addStep('GitHub Authentication', 'completed', `✅ Connected as ${githubUser.login}`);
      } catch (error: any) {
        const errorMessage = error.message || 'Unknown error';
        if (hasGitHubToken) {
          addStep('GitHub Authentication', 'error', `❌ GitHub PAT invalid: ${errorMessage}`);
          // Don't throw here, let it continue and fail later with better error context
        } else {
          addStep('GitHub Authentication', 'completed', '⚠️ Using unauthenticated access (60 req/hour limit)');
        }
      }

      // Step 3: Check Cache
      addStep('Cache Check', 'running', 'Checking for cached results...');
      const cachedResult = this.cache.get(job.repoUrl, criteria);
      if (cachedResult) {
        addStep('Cache Check', 'completed', '✅ Found cached result');
        job.status = 'completed';
        job.result = cachedResult;
        job.progress = 100;
        job.updatedAt = new Date().toISOString();
        addStep('Analysis Complete', 'completed', '✅ Analysis completed using cached result');
        return;
      }
      addStep('Cache Check', 'completed', 'ℹ️ No cache found, proceeding with analysis');

      // Step 4: Parse Repository URL
      addStep('Repository', 'running', 'Parsing repository URL...');
      let owner: string, repo: string;
      try {
        ({ owner, repo } = this.parseRepoUrl(job.repoUrl));
        addStep('Repository', 'completed', `✅ Repository: ${owner}/${repo}`);
      } catch (error) {
        addStep('Repository', 'error', '❌ Invalid repository URL');
        throw error;
      }

      // Step 5: Fetch Repository Info
      addStep('Repository Info', 'running', 'Fetching repository information...');
      try {
        const repoInfo = await githubService.getRepo(owner, repo);
        addStep('Repository Info', 'completed', `✅ ${repoInfo.stargazers_count} ⭐ | ${repoInfo.language || 'Unknown language'} | Default branch: ${repoInfo.default_branch}`);
      } catch (error: any) {
        const message = error.message || 'Unknown error';
        if (message.includes('404')) {
          addStep('Repository Info', 'error', '❌ Repository not found or private');
        } else if (message.includes('SAML')) {
          addStep('Repository Info', 'error', '❌ SAML SSO required. Authorize your PAT at https://github.com/orgs/EpitechBachelorPromo2028/sso');
        } else if (message.includes('Access denied') || message.includes('403')) {
          addStep('Repository Info', 'error', '❌ Access denied. Your PAT may not have access to this repository or SAML SSO authorization is required.');
        } else {
          addStep('Repository Info', 'error', `❌ ${message}`);
        }
        throw error;
      }

      // Step 6: List Files
      addStep('File Discovery', 'running', 'Discovering repository files...');
      let repoFiles: Array<{ path: string; content: string }> = [];
      let allFilePaths: string[] = [];
      
      try {
        const tree = await githubService.getRepoTree(owner, repo);
        allFilePaths = tree.filter(item => item.type === 'blob').map(item => item.path);
        
        addStep('File Discovery', 'completed', `✅ Found ${allFilePaths.length} total files`);
        
        // Step 7: Filter and Fetch Code Files
        addStep('File Filtering', 'running', 'Filtering code files...');
        repoFiles = await this.fetchRepoFiles(owner, repo, allFilePaths, githubService);
        addStep('File Filtering', 'completed', `✅ Selected ${repoFiles.length} code files for analysis`);
        
        if (repoFiles.length === 0) {
          addStep('File Filtering', 'error', '❌ No code files found in repository');
          throw new Error('No code files found');
        }
        
        // List analyzed files
        const fileList = repoFiles.map(f => f.path).join(', ');
        addStep('Files Selected', 'completed', `📁 ${fileList.substring(0, 200)}${fileList.length > 200 ? '...' : ''}`);
        
      } catch (error: any) {
        addStep('File Discovery', 'error', `❌ Failed to fetch files: ${error.message}`);
        throw error;
      }

      // Step 8: Analyze with LLM (parallel processing for faster analysis)
      addStep('LLM Analysis', 'running', `Analyzing ${criteria.length} criteria in parallel...`);
      
      // Process criteria in parallel batches of 3 for optimal speed/quality balance
      const batchSize = 3;
      const analyzedCriteria: AnalyzedCriterion[] = new Array(criteria.length);
      
      for (let batchStart = 0; batchStart < criteria.length; batchStart += batchSize) {
        const batchEnd = Math.min(batchStart + batchSize, criteria.length);
        const batch = criteria.slice(batchStart, batchEnd);
        
        addStep('LLM Analysis', 'running', `Processing batch ${Math.floor(batchStart / batchSize) + 1}/${Math.ceil(criteria.length / batchSize)}...`);
        
        // Analyze batch in parallel
        const batchResults = await Promise.all(
          batch.map(async (criterion, index) => {
            try {
              const analyzed = await this.moonshotService.analyzeCriterion(criterion, repoFiles);
              return { index: batchStart + index, criterion: analyzed };
            } catch (error) {
              return {
                index: batchStart + index,
                criterion: {
                  id: criterion.id,
                  name: criterion.name,
                  description: criterion.description,
                  maxPoints: criterion.maxPoints,
                  score: 0,
                  status: 'failed' as const,
                  justification: 'Analysis failed due to an error',
                  references: [],
                }
              };
            }
          })
        );
        
        // Store results
        batchResults.forEach(({ index, criterion }) => {
          analyzedCriteria[index] = criterion;
        });
        
        job.progress = Math.round((batchEnd / criteria.length) * 80) + 10;
        job.updatedAt = new Date().toISOString();
      }
      
      addStep('LLM Analysis', 'completed', `✅ Analyzed ${criteria.length} criteria`);

      // Step 9: Generate Report
      addStep('Report Generation', 'running', 'Generating final report...');
      
      const result: AnalysisResult = {
        criteria: analyzedCriteria,
        totalScore: analyzedCriteria.reduce((sum, c) => sum + c.score, 0),
        maxScore: criteria.reduce((sum, c) => sum + c.maxPoints, 0),
        globalComment: `Analysis completed with ${analyzedCriteria.filter(c => c.status === 'passed').length}/${analyzedCriteria.length} criteria passed`,
        analyzedAt: new Date().toISOString(),
      };

      // Cache the result
      this.cache.set(job.repoUrl, criteria, result);
      
      addStep('Report Generation', 'completed', `✅ Final score: ${result.totalScore}/${result.maxScore}`);

      // Mark job as completed
      job.status = 'completed';
      job.result = result;
      job.progress = 100;
      job.updatedAt = new Date().toISOString();
      
      addStep('Analysis Complete', 'completed', '✅ Analysis completed successfully');

    } catch (error) {
      job.status = 'error';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.updatedAt = new Date().toISOString();
      addStep('Analysis Failed', 'error', `❌ ${job.error}`);
    }
  }

  /**
   * Fetch repository files for analysis
   */
  private async fetchRepoFiles(
    owner: string,
    repo: string,
    allFilePaths: string[],
    githubService: GitHubService,
    maxFiles: number = 50
  ): Promise<Array<{ path: string; content: string }>> {
    const files: Array<{ path: string; content: string }> = [];
    
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
    const codeFiles = allFilePaths.filter(path => {
      if (path.startsWith('.')) return false;
      if (path.includes('node_modules')) return false;
      if (path.includes('vendor')) return false;
      if (path.includes('__pycache__')) return false;
      if (path.includes('.git/')) return false;
      if (path.includes('dist/')) return false;
      if (path.includes('build/')) return false;
      if (path.includes('target/')) return false;
      if (path.includes('bin/')) return false;
      if (path.includes('obj/')) return false;
      
      const lowerPath = path.toLowerCase();
      const fileName = lowerPath.split('/').pop() || '';
      
      if (codeExtensions.includes(fileName)) return true;
      return codeExtensions.some(ext => lowerPath.endsWith(ext));
    });

    // Prioritize important files first
    const priorityOrder = [
      'README', 'readme',
      'Makefile', 'makefile', 'GNUmakefile',
      'main.', 'index.', 'app.', 'server.',
      'package.json', 'Cargo.toml', 'go.mod', 'requirements.txt',
    ];
    
    const prioritizedFiles = codeFiles.sort((a, b) => {
      const aPriority = priorityOrder.findIndex(p => a.toLowerCase().includes(p.toLowerCase()));
      const bPriority = priorityOrder.findIndex(p => b.toLowerCase().includes(p.toLowerCase()));
      if (aPriority === -1 && bPriority === -1) return 0;
      if (aPriority === -1) return 1;
      if (bPriority === -1) return -1;
      return aPriority - bPriority;
    });

    // Fetch content for each file in parallel (limited to maxFiles)
    const filesToFetch = prioritizedFiles.slice(0, maxFiles);
    const fileContents = await Promise.all(
      filesToFetch.map(async (filePath) => {
        try {
          const content = await githubService.getFileContent(owner, repo, filePath);
          return content ? { path: filePath, content } : null;
        } catch (e) {
          console.warn(`Failed to fetch ${filePath}:`, e);
          return null;
        }
      })
    );

    return fileContents.filter((f): f is { path: string; content: string } => f !== null);
  }

  /**
   * Parse GitHub URL to extract owner and repo
   */
  private parseRepoUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub URL');
    }
    return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

export default AnalysisService;