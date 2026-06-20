import { Router } from 'express';
import { getProfile } from './users.controller';
import { verifyToken } from '../../middleware/auth.middleware';

const router = Router();

// Secure this route using the Firebase verifyToken middleware
router.get('/profile', verifyToken, getProfile);

export default router;
