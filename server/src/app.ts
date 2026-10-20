import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config } from './config/env.js';
import { globalApiLimiter } from './middleware/rate-limiter.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

import chatRoutes from './modules/chat/chat.routes.js';
import specialistRoutes from './modules/specialists/specialist.routes.js';
import appointmentRoutes from './modules/appointments/appointment.routes.js';
import consultationRoutes from './modules/consultations/consultation.routes.js';
import contactRoutes from './modules/contact/contact.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import { contactController } from './modules/contact/contact.controller.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.disable('x-powered-by');
// Required behind Render / reverse proxies for correct client IPs and rate limiting
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '32kb' }));

// Global rate limiting for all API routes
app.use('/api/', globalApiLimiter);

// Health check endpoint (used by Render)
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'Manospring Healthcare Platform',
    version: '2.1.0',
    aiConfigured: Boolean(config.groqApiKey),
    model: config.groqModel,
    environment: config.nodeEnv,
    time: new Date().toISOString()
  });
});

// Mount modules
app.use('/api/specialists', specialistRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultation', consultationRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/contact', contactRoutes);
app.post('/api/privacy/request', (req, res, next) => contactController.submitPrivacyRequest(req, res, next));
app.use('/api/auth', authRoutes);

// Static client files (Vite build output)
const clientDist = path.resolve(__dirname, '../../dist/client');
const publicDir = path.resolve(__dirname, '../../public');

app.use(express.static(clientDist, {
  index: false,
  maxAge: config.isProduction ? '1h' : 0
}));
app.use(express.static(publicDir, {
  index: false,
  maxAge: config.isProduction ? '1h' : 0
}));

// SPA fallback for client-side routing (never intercept /api)
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  if (req.path.startsWith('/api/')) return next();

  res.sendFile(path.resolve(clientDist, 'index.html'), (err) => {
    if (err) {
      res.sendFile(path.resolve(publicDir, 'index.html'), next);
    }
  });
});

// Centralized error handling
app.use(errorHandler);

export default app;
