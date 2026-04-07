import request from 'supertest';
import express from 'express';
import analyzeRoutes from '../../src/routes/analyze';
import { rubricStorage } from '../../src/services/rubricStorage';

const app = express();
app.use(express.json());
app.use('/api/analyze', analyzeRoutes);

describe('POST /api/analyze', () => {
  beforeEach(async () => {
    // Clear rubrics before each test
    const rubrics = await rubricStorage.getAllRubrics();
    for (const r of rubrics) {
      await rubricStorage.deleteRubric(r.id);
    }
  });

  it('should return 400 for missing repoUrl', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .send({ rubricId: '123' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
  });

  it('should return 400 for missing rubricId', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .send({ repoUrl: 'https://github.com/test/repo' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
  });

  it('should return 404 for non-existent rubric', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .send({
        repoUrl: 'https://github.com/test/repo',
        rubricId: 'non-existent',
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Rubric not found');
  });

  it('should start analysis with valid rubric', async () => {
    // Create a rubric first
    const rubricId = await rubricStorage.saveRubric('Test Rubric', [
      { id: '1', name: 'Test', description: '', maxPoints: 5 },
    ]);

    const response = await request(app)
      .post('/api/analyze')
      .send({
        repoUrl: 'https://github.com/test/repo',
        rubricId: rubricId,
      });

    expect(response.status).toBe(202);
    expect(response.body.success).toBe(true);
    expect(response.body.jobId).toBeDefined();
    expect(response.body.status).toBeDefined();
  });
});

describe('GET /api/analyze/status/:jobId', () => {
  it('should return 404 for non-existent job', async () => {
    const response = await request(app)
      .get('/api/analyze/status/non-existent');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Job not found');
  });

  it('should return job status for existing job', async () => {
    // Create a rubric and start analysis
    const rubricId = await rubricStorage.saveRubric('Test Rubric', [
      { id: '1', name: 'Test', description: '', maxPoints: 5 },
    ]);

    const startResponse = await request(app)
      .post('/api/analyze')
      .send({
        repoUrl: 'https://github.com/test/repo',
        rubricId: rubricId,
      });

    const jobId = startResponse.body.jobId;

    const response = await request(app)
      .get(`/api/analyze/status/${jobId}`);

    expect(response.status).toBe(200);
    expect(response.body.jobId).toBe(jobId);
    expect(response.body.status).toBeDefined();
    expect(response.body.progress).toBeDefined();
  });
});