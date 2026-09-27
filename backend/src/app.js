import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import aiRoutes from './routes/ai.js';
import authRoutes from './routes/auth.js';
import contactRoutes from './routes/contacts.js';
import dealRoutes from './routes/deals.js';
import { requireAuth } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/contacts', requireAuth, contactRoutes);
app.use('/api/deals', requireAuth, dealRoutes);
app.use('/api/ai', requireAuth, aiRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;