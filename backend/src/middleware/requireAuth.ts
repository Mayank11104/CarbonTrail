import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';

// Extend Express Request type to include the decoded user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const sessionCookie = req.cookies.session || '';

  if (!sessionCookie) {
    return res.status(401).json({ error: 'Unauthorized: No session cookie found.' });
  }

  try {
    // Verify the session cookie and get the user's decoded claims
    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
    req.user = decodedClaims;
    next();
  } catch (error) {
    console.error('Session verification error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session.' });
  }
};
