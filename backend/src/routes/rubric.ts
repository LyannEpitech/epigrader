import { Router } from 'express';
import { z } from 'zod';
import { RubricService } from '../services/rubric.js';

const router = Router();

const parseRubricSchema = z.object({
  content: z.string().min(1, 'Content is required'),
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

export default router;