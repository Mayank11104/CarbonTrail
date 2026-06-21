import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import userRoutes from './features/users/users.routes';
import authRoutes from './features/auth/auth.routes';
import aiRoutes from './features/ai/ai.routes';

const app = express();
const port = process.env.PORT || 3000;

// Security Headers (Helmet) - strict defaults for production HTTPS
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "apis.google.com", "www.gstatic.com"],
      connectSrc: ["'self'", "identitytoolkit.googleapis.com", "securetoken.googleapis.com"],
      frameSrc: ["'self'", "carbontrail-74b5b.firebaseapp.com"]
    }
  },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

// Rate Limiting (DoS prevention)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS — locked to explicit origin in production, permissive in development
const corsOrigin: cors.CorsOptions['origin'] =
  process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGIN || false)
    : true;

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '10kb' })); // Body parser limit to prevent payload attacks
app.use(cookieParser());
app.use(hpp()); // HTTP Parameter Pollution prevention

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CarbonTrail API is running' });
});

// Serve frontend static files in production
import path from 'path';
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

// Global Error Handler to prevent stack trace leaks
import type { Request, Response, NextFunction } from 'express';
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ error: 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port as number, '0.0.0.0', () => {
    // Server started
  });
}

export default app;
