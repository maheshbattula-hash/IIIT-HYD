import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { initializeDatabase } from './db/database.js';
import { authMiddleware } from './middleware/auth.js';

import customersRouter from './routes/customers.js';
import collectionsRouter from './routes/collections.js';
import analyticsRouter from './routes/analytics.js';
import dataQualityRouter from './routes/dataQuality.js';
import aiRouter from './routes/ai.js';
import auditRouter from './routes/audit.js';
import searchRouter from './routes/search.js';

const app = express();

// Initialize database tables if not created
initializeDatabase();

// Middleware setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-collectiq-role', 'x-collectiq-user-id', 'x-collectiq-user-name']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// RBAC and Context Injector
app.use(authMiddleware);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'CollectIQ Intelligence Engine',
    version: '1.0.0',
    aiProvider: config.aiProvider,
    timestamp: new Date().toISOString()
  });
});

// Register API Routes
app.use('/api/customers', customersRouter);
app.use('/api/collections', collectionsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/data-quality', dataQualityRouter);
app.use('/api/ai', aiRouter);
app.use('/api/audit-logs', auditRouter);
app.use('/api/search', searchRouter);

// Start server
app.listen(config.port, '127.0.0.1', () => {
  console.log(`=======================================================`);
  console.log(` COLLECTIQ SERVER RUNNING AT http://127.0.0.1:${config.port}`);
  console.log(` AI Provider: ${config.aiProvider.toUpperCase()}`);
  console.log(` Database: SQLite (Node.js native DatabaseSync)`);
  console.log(`=======================================================`);
});
