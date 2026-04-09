import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env file manually to ensure it's loaded before any other imports
try {
  const envPath = resolve(process.cwd(), '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  });
  console.log('[DEBUG] Loaded .env file from:', envPath);
} catch (e) {
  console.log('[DEBUG] Could not load .env file:', e);
}

dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import rubricRoutes from './routes/rubric.js';
import analyzeRoutes from './routes/analyze.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://avatars.githubusercontent.com", "https://github.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rubric', rubricRoutes);
app.use('/api/analyze', analyzeRoutes);

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = resolve(process.cwd(), 'frontend/dist');
  console.log('[DEBUG] Serving frontend from:', frontendPath);
  
  app.use(express.static(frontendPath));
  
  // Serve index.html for all non-API routes (SPA support)
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(resolve(frontendPath, 'index.html'));
    }
  });
}

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(PORT, () => {
  const actualPort = (server.address() as any).port;
  console.log(`🚀 Server running on http://localhost:${actualPort}`);
  
  // Write port to file for Electron to read
  if (process.env.ELECTRON_RUN) {
    const fs = require('fs');
    const path = require('path');
    const portFile = path.join(process.cwd(), '.port');
    fs.writeFileSync(portFile, actualPort.toString());
  }
});

export default app;