"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const rubric_js_1 = require("../services/rubric.js");
const rubricStorage_js_1 = require("../services/rubricStorage.js");
const router = (0, express_1.Router)();
const parseRubricSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Content is required'),
});
const saveRubricSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    criteria: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        description: zod_1.z.string(),
        maxPoints: zod_1.z.number(),
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
        const rubricService = new rubric_js_1.RubricService();
        const criteria = await rubricService.parseRubric(content);
        const totalPoints = rubricService.calculateTotalPoints(criteria);
        res.json({
            success: true,
            criteria,
            totalPoints,
            count: criteria.length,
        });
    }
    catch (error) {
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
        const id = await rubricStorage_js_1.rubricStorage.saveRubric(name, criteria);
        res.status(201).json({
            success: true,
            id,
            message: 'Rubric saved successfully',
        });
    }
    catch (error) {
        console.error('Save rubric error:', error);
        res.status(500).json({
            error: 'Failed to save rubric',
        });
    }
});
// GET /api/rubric - Get all rubrics
router.get('/', async (req, res) => {
    try {
        const rubrics = await rubricStorage_js_1.rubricStorage.getAllRubrics();
        res.json({
            success: true,
            rubrics,
        });
    }
    catch (error) {
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
        const rubric = await rubricStorage_js_1.rubricStorage.getRubric(id);
        if (!rubric) {
            return res.status(404).json({
                error: 'Rubric not found',
            });
        }
        res.json({
            success: true,
            rubric,
        });
    }
    catch (error) {
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
        await rubricStorage_js_1.rubricStorage.deleteRubric(id);
        res.json({
            success: true,
            message: 'Rubric deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete rubric error:', error);
        res.status(500).json({
            error: 'Failed to delete rubric',
        });
    }
});
exports.default = router;
//# sourceMappingURL=rubric.js.map