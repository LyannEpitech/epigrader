import request from 'supertest';
import express from 'express';
import rubricRouter from '../../src/routes/rubric';

jest.mock('../../src/services/rubricStorage', () => ({
  rubricStorage: {
    getAllRubrics: jest.fn().mockResolvedValue([
      { id: '1', name: 'Test Rubric', totalPoints: 20, criteria: [] },
    ]),
    getRubricById: jest.fn().mockResolvedValue({
      id: '1',
      name: 'Test Rubric',
      totalPoints: 20,
      criteria: [],
    }),
    saveRubric: jest.fn().mockResolvedValue('new-rubric-id'),
    deleteRubric: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('../../src/services/rubric', () => ({
  RubricService: jest.fn().mockImplementation(() => ({
    parseRubric: jest.fn().mockResolvedValue([
      { id: '1', name: 'Quality', description: 'Code quality', maxPoints: 10 },
    ]),
  })),
}));

describe('Rubric Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/rubric', rubricRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/rubric', () => {
    it('should return all rubrics', async () => {
      const response = await request(app)
        .get('/api/rubric');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/rubric', () => {
    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/rubric')
        .send({ criteria: [] });

      expect(response.status).toBe(400);
    });

    it('should return 400 when criteria is missing', async () => {
      const response = await request(app)
        .post('/api/rubric')
        .send({ name: 'Test Rubric' });

      expect(response.status).toBe(400);
    });

    it('should create a new rubric', async () => {
      const response = await request(app)
        .post('/api/rubric')
        .send({
          name: 'Test Rubric',
          criteria: [
            { id: '1', name: 'Quality', description: 'Code quality', maxPoints: 10 }
          ]
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('GET /api/rubric/:id', () => {
    it('should return rubric by id', async () => {
      const response = await request(app)
        .get('/api/rubric/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name');
    });
  });

  describe('DELETE /api/rubric/:id', () => {
    it('should delete rubric successfully', async () => {
      const response = await request(app)
        .delete('/api/rubric/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/rubric/parse', () => {
    it('should return 400 when content is missing', async () => {
      const response = await request(app)
        .post('/api/rubric/parse')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should parse rubric content', async () => {
      const response = await request(app)
        .post('/api/rubric/parse')
        .send({ content: '## Quality (10 pts)\nCode should be clean' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('criteria');
    });
  });
});