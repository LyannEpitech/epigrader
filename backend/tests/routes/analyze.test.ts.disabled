import request from 'supertest';
import express from 'express';
import analyzeRouter from '../../src/routes/analyze';

jest.mock('../../src/services/analysis', () => ({
  AnalysisService: jest.fn().mockImplementation(() => ({
    createJob: jest.fn().mockReturnValue({
      id: 'job-123',
      status: 'pending',
      repoUrl: 'https://github.com/Epitech/test',
      rubricId: 'rubric-1',
      progress: 0,
      steps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    getJob: jest.fn().mockImplementation((id) => ({
      id,
      status: 'pending',
      repoUrl: 'https://github.com/Epitech/test',
      rubricId: 'rubric-1',
      progress: 0,
      steps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    getAllJobs: jest.fn().mockReturnValue([]),
    getCacheStats: jest.fn().mockReturnValue({ size: 0, entries: [] }),
    clearCache: jest.fn(),
    clearCacheEntry: jest.fn(),
  })),
}));

describe('Analyze Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/analyze', analyzeRouter);
    jest.clearAllMocks();
  });

  describe('POST /api/analyze', () => {
    it('should return 400 when repoUrl is missing', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ rubricId: '123' });

      expect(response.status).toBe(400);
    });

    it('should return 400 when rubricId is missing', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ repoUrl: 'https://github.com/Epitech/test' });

      expect(response.status).toBe(400);
    });

    it('should start analysis successfully', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ 
          repoUrl: 'https://github.com/Epitech/test', 
          rubricId: 'rubric-1',
          criteria: [{ id: '1', name: 'Test', maxPoints: 10 }]
        });

      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('jobId');
    });
  });

  describe('GET /api/analyze/status/:jobId', () => {
    it('should return job status', async () => {
      const response = await request(app)
        .get('/api/analyze/status/job-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('GET /api/analyze/history', () => {
    it('should return analysis history', async () => {
      const response = await request(app)
        .get('/api/analyze/history');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/analyze/cache/entries', () => {
    it('should return cache entries', async () => {
      const response = await request(app)
        .get('/api/analyze/cache/entries');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('entries');
    });
  });

  describe('DELETE /api/analyze/cache', () => {
    it('should clear all cache', async () => {
      const response = await request(app)
        .delete('/api/analyze/cache');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/analyze/cache/entry', () => {
    it('should return 400 when repoUrl is missing', async () => {
      const response = await request(app)
        .delete('/api/analyze/cache/entry');

      expect(response.status).toBe(400);
    });

    it('should clear specific cache entry', async () => {
      const response = await request(app)
        .delete('/api/analyze/cache/entry')
        .query({ repoUrl: 'https://github.com/Epitech/test' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});