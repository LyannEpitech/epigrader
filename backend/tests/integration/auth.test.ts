import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('POST /api/auth/validate-token', () => {
  it('should return 400 for missing token', async () => {
    const response = await request(app)
      .post('/api/auth/validate-token')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
  });

  it('should return 400 for empty token', async () => {
    const response = await request(app)
      .post('/api/auth/validate-token')
      .send({ token: '' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
  });

  it('should return 401 for invalid token', async () => {
    const response = await request(app)
      .post('/api/auth/validate-token')
      .send({ token: 'invalid_token' });

    expect(response.status).toBe(401);
    expect(response.body.valid).toBe(false);
    expect(response.body.error).toBe('Invalid GitHub token');
  });
});