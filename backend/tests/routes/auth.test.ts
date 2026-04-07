import request from 'supertest';
import express from 'express';
import authRouter from '../../src/routes/auth';

jest.mock('../../src/services/github', () => ({
  GitHubService: jest.fn().mockImplementation(() => ({
    validateToken: jest.fn().mockResolvedValue({
      login: 'testuser',
      id: 123,
    }),
  })),
}));

describe('Auth Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRouter);
    jest.clearAllMocks();
  });

  describe('POST /api/auth/validate-token', () => {
    it('should return 400 when token is missing', async () => {
      const response = await request(app)
        .post('/api/auth/validate-token')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should validate token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/validate-token')
        .send({ token: 'valid-token' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('user');
    });
  });


});