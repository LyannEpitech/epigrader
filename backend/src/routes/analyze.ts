import { Router } from 'express';
import { z } from 'zod';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { AnalysisService } from '../services/analysis.js';
import { rubricStorage } from '../services/rubricStorage.js';
import { GitHubService } from '../services/github.js';
import { AnalysisJob } from '../types/analysis.js';

const router = Router();
const analysisService = new AnalysisService();

// Load GitHub token from .env file directly
function loadGitHubToken(): string {
  try {
    const envPath = resolve(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const match = envContent.match(/^GITHUB_TOKEN=(.+)$/m);
    if (match) {
      console.log('[DEBUG] Loaded GITHUB_TOKEN from .env file');
      return match[1].trim();
    }
  } catch (e) {
    console.log('[DEBUG] Could not load GITHUB_TOKEN from .env:', e);
  }
  return process.env.GITHUB_TOKEN || '';
}

const githubService = new GitHubService(loadGitHubToken());

const startAnalysisSchema = z.object({
  repoUrl: z.string().min(1, 'Repository URL is required'),
  rubricId: z.string().min(1, 'Rubric ID is required'),
  pat: z.string().optional(),
});

// POST /api/analyze - Start analysis job
router.post('/', async (req, res) => {
  try {
    const result = startAnalysisSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors,
      });
    }

    const { repoUrl, rubricId, pat } = result.data;

    // Get rubric from storage
    const rubric = await rubricStorage.getRubric(rubricId);
    if (!rubric) {
      return res.status(404).json({
        error: 'Rubric not found',
      });
    }

    // Create analysis job with optional PAT
    const job = analysisService.createJob(repoUrl, rubricId, rubric.criteria, pat);

    res.status(202).json({
      success: true,
      jobId: job.id,
      status: job.status,
      message: 'Analysis job started',
    });
  } catch (error) {
    console.error('Start analysis error:', error);
    res.status(500).json({
      error: 'Failed to start analysis',
    });
  }
});

// GET /api/analyze/status/:jobId - Get job status
router.get('/status/:jobId', (req, res) => {
  try {
    const { jobId } = req.params;
    const job = analysisService.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
      });
    }

    res.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    });
  } catch (error) {
    console.error('Get job status error:', error);
    res.status(500).json({
      error: 'Failed to get job status',
    });
  }
});

// GET /api/analyze/history - Get analysis history
router.get('/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const jobs = analysisService.getAllJobs().slice(0, limit);

    res.json({
      jobs: jobs.map((job: AnalysisJob) => ({
        jobId: job.id,
        repoUrl: job.repoUrl,
        rubricId: job.rubricId,
        status: job.status,
        progress: job.progress,
        steps: job.steps,
        totalScore: job.result?.totalScore,
        maxScore: job.result?.maxScore,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      })),
      total: jobs.length,
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      error: 'Failed to get analysis history',
    });
  }
});

// GET /api/analyze/cache/stats - Get cache statistics
router.get('/cache/stats', (req, res) => {
  try {
    const stats = analysisService.getCacheStats();
    res.json(stats);
  } catch (error) {
    console.error('Get cache stats error:', error);
    res.status(500).json({
      error: 'Failed to get cache stats',
    });
  }
});

// GET /api/analyze/debug/files - Debug: list files in repo
router.get('/debug/files', async (req, res) => {
  try {
    const repoUrl = req.query.repoUrl as string;
    if (!repoUrl) {
      return res.status(400).json({ error: 'repoUrl query param required' });
    }

    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid GitHub URL' });
    }

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, '');

    const tree = await githubService.getRepoTree(owner, repo);
    
    // Filter for code files (same logic as analysis.ts)
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

    const codeFiles = tree.filter(item => {
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
      
      if (codeExtensions.includes(fileName)) return true;
      return codeExtensions.some(ext => path.endsWith(ext));
    });

    res.json({
      owner,
      repo,
      totalFiles: tree.length,
      codeFilesFound: codeFiles.length,
      allFiles: tree.map(t => t.path),
      filteredFiles: codeFiles.map(t => t.path),
    });
  } catch (error) {
    console.error('Debug files error:', error);
    res.status(500).json({
      error: 'Failed to fetch files',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;