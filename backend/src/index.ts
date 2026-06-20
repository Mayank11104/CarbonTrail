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

// Security Headers (Helmet)
app.use(helmet());

// Rate Limiting (DoS prevention)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Middleware
app.use(cors({ origin: true, credentials: true })); // Ensure credentials can be sent
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

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
