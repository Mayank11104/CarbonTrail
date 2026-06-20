import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    // req.user is populated by the verifyToken middleware
    const userId = req.user?.uid;
    const email = req.user?.email;

    res.json({
      message: 'Profile retrieved successfully',
      data: {
        uid: userId,
        email: email,
        // In the future, fetch more details from Firestore using this uid
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
};
