import request from 'supertest';
import express from 'express';
import analyzeRoutes from '../../src/routes/analyze';

const app = express();
app.use(express.json());
app.use('/api/analyze', analyzeRoutes);

describe('POST /api/analyze', () => {
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
});

describe('GET /api/analyze/status/:jobId', () => {
  it('should return 404 for non-existent job', async () => {
    const response = await request(app)
      .get('/api/analyze/status/non-existent');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Job not found');
  });
});