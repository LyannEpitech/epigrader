import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth';

// Mock the GitHubService
jest.mock('../../src/services/github', () => {
  return {
    GitHubService: jest.fn().mockImplementation(() => ({
      validateToken: jest.fn(),
    })),
  };
});

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
    const { GitHubService } = require('../../src/services/github');
    const mockValidateToken = jest.fn().mockRejectedValue(new Error('Invalid token'));
    GitHubService.mockImplementation(() => ({
      validateToken: mockValidateToken,
    }));

    const response = await request(app)
      .post('/api/auth/validate-token')
      .send({ token: 'invalid_token' });

    expect(response.status).toBe(401);
    expect(response.body.valid).toBe(false);
    expect(response.body.error).toBe('Invalid GitHub token');
  });

  it('should return user data for valid token', async () => {
    const mockUser = {
      id: 123,
      login: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      avatar_url: 'https://avatar.url',
      html_url: 'https://github.com/testuser',
    };

    const { GitHubService } = require('../../src/services/github');
    const mockValidateToken = jest.fn().mockResolvedValue(mockUser);
    GitHubService.mockImplementation(() => ({
      validateToken: mockValidateToken,
    }));

    const response = await request(app)
      .post('/api/auth/validate-token')
      .send({ token: 'valid_token' });

    expect(response.status).toBe(200);
    expect(response.body.valid).toBe(true);
    expect(response.body.user).toEqual({
      id: mockUser.id,
      login: mockUser.login,
      name: mockUser.name,
      email: mockUser.email,
      avatar_url: mockUser.avatar_url,
      html_url: mockUser.html_url,
    });
  });
});