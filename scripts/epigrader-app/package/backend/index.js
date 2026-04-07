"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = require("fs");
const path_1 = require("path");
// Load .env file manually to ensure it's loaded before any other imports
try {
    const envPath = (0, path_1.resolve)(process.cwd(), '.env');
    const envContent = (0, fs_1.readFileSync)(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match && !process.env[match[1]]) {
            process.env[match[1]] = match[2];
        }
    });
    console.log('[DEBUG] Loaded .env file from:', envPath);
}
catch (e) {
    console.log('[DEBUG] Could not load .env file:', e);
}
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const auth_js_1 = __importDefault(require("./routes/auth.js"));
const rubric_js_1 = __importDefault(require("./routes/rubric.js"));
const analyze_js_1 = __importDefault(require("./routes/analyze.js"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});
// Routes
app.use('/api/auth', auth_js_1.default);
app.use('/api/rubric', rubric_js_1.default);
app.use('/api/analyze', analyze_js_1.default);
// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map