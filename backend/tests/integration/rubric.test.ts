import request from 'supertest';
import express from 'express';
import rubricRoutes from '../../src/routes/rubric';

const app = express();
app.use(express.json());
app.use('/api/rubric', rubricRoutes);

describe('POST /api/rubric/parse', () => {
  it('should return 400 for missing content', async () => {
    const response = await request(app)
      .post('/api/rubric/parse')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
  });

  it('should return 400 for empty content', async () => {
    const response = await request(app)
      .post('/api/rubric/parse')
      .send({ content: '' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
  });

  it('should parse rubric successfully', async () => {
    const content = `
## Presentation (5 pts)
- README complete

## Features (10 pts)
- Error handling
`;

    const response = await request(app)
      .post('/api/rubric/parse')
      .send({ content });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.criteria).toHaveLength(2);
    expect(response.body.totalPoints).toBe(15);
    expect(response.body.count).toBe(2);
  });

  it('should return empty criteria for invalid content', async () => {
    const response = await request(app)
      .post('/api/rubric/parse')
      .send({ content: 'Just some text without criteria' });

    expect(response.status).toBe(200);
    expect(response.body.criteria).toHaveLength(0);
    expect(response.body.totalPoints).toBe(0);
  });
});