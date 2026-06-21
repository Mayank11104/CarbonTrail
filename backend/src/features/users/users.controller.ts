import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      message: 'Profile retrieved successfully',
      data: {
        uid: req.user?.uid,
        email: req.user?.email,
      }
    });
  } catch {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
};
