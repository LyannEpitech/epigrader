"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const github_js_1 = require("../services/github.js");
const router = (0, express_1.Router)();
const validateTokenSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Token is required').trim(),
});
router.post('/validate-token', async (req, res) => {
    try {
        const result = validateTokenSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: result.error.errors,
            });
        }
        const { token } = result.data;
        const githubService = new github_js_1.GitHubService(token);
        const user = await githubService.validateToken();
        res.json({
            valid: true,
            user: {
                id: user.id,
                login: user.login,
                name: user.name,
                email: user.email,
                avatar_url: user.avatar_url,
                html_url: user.html_url,
            },
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Invalid token' || error.message.includes('GitHub API error')) {
                return res.status(401).json({
                    valid: false,
                    error: 'Invalid GitHub token',
                });
            }
        }
        console.error('Auth error:', error);
        res.status(500).json({
            valid: false,
            error: 'Internal server error',
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map