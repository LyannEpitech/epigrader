import request from 'supertest';
import app from '../src/index';

describe('Health Check', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });
});