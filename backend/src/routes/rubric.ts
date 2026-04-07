import { Router } from 'express';
import { z } from 'zod';
import { RubricService } from '../services/rubric.js';
import { rubricStorage } from '../services/rubricStorage.js';

const router = Router();

const parseRubricSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

const saveRubricSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  criteria: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    maxPoints: z.number(),
  })),
});

// POST /api/rubric/parse - Parse rubric from markdown/text
router.post('/parse', async (req, res) => {
  try {
    const result = parseRubricSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors,
      });
    }

    const { content } = result.data;
    const rubricService = new RubricService();
    const criteria = await rubricService.parseRubric(content);
    const totalPoints = rubricService.calculateTotalPoints(criteria);

    res.json({
      success: true,
      criteria,
      totalPoints,
      count: criteria.length,
    });
  } catch (error) {
    console.error('Parse rubric error:', error);
    res.status(500).json({
      error: 'Failed to parse rubric',
    });
  }
});

// POST /api/rubric - Save a rubric
router.post('/', async (req, res) => {
  try {
    const result = saveRubricSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors,
      });
    }

    const { name, criteria } = result.data;
    const id = await rubricStorage.saveRubric(name, criteria);

    res.status(201).json({
      success: true,
      id,
      message: 'Rubric saved successfully',
    });
  } catch (error) {
    console.error('Save rubric error:', error);
    res.status(500).json({
      error: 'Failed to save rubric',
    });
  }
});

// GET /api/rubric - Get all rubrics
router.get('/', async (req, res) => {
  try {
    const rubrics = await rubricStorage.getAllRubrics();
    res.json({
      success: true,
      rubrics,
    });
  } catch (error) {
    console.error('Get rubrics error:', error);
    res.status(500).json({
      error: 'Failed to get rubrics',
    });
  }
});

// GET /api/rubric/:id - Get a specific rubric
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rubric = await rubricStorage.getRubric(id);
    
    if (!rubric) {
      return res.status(404).json({
        error: 'Rubric not found',
      });
    }

    res.json({
      success: true,
      rubric,
    });
  } catch (error) {
    console.error('Get rubric error:', error);
    res.status(500).json({
      error: 'Failed to get rubric',
    });
  }
});

// DELETE /api/rubric/:id - Delete a rubric
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await rubricStorage.deleteRubric(id);
    
    res.json({
      success: true,
      message: 'Rubric deleted successfully',
    });
  } catch (error) {
    console.error('Delete rubric error:', error);
    res.status(500).json({
      error: 'Failed to delete rubric',
    });
  }
});

export default router;