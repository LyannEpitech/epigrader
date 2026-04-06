import { Router } from 'express';
import { z } from 'zod';
import { AnalysisService } from '../services/analysis.js';
import { rubricStorage } from '../services/rubricStorage.js';

const router = Router();
const analysisService = new AnalysisService();

const startAnalysisSchema = z.object({
  repoUrl: z.string().min(1, 'Repository URL is required'),
  rubricId: z.string().min(1, 'Rubric ID is required'),
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

    const { repoUrl, rubricId } = result.data;

    // Get rubric from storage
    const rubric = rubricStorage.getRubric(rubricId);
    if (!rubric) {
      return res.status(404).json({
        error: 'Rubric not found',
      });
    }

    // Create analysis job
    const job = analysisService.createJob(repoUrl, rubricId, rubric.criteria);

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
    const jobs = analysisService.getRecentJobs(limit);

    res.json({
      jobs: jobs.map(job => ({
        jobId: job.id,
        repoUrl: job.repoUrl,
        rubricId: job.rubricId,
        status: job.status,
        progress: job.progress,
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

export default router;