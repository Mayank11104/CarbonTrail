import { Request, Response, NextFunction } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getAuth } from 'firebase-admin/auth';

declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const sessionCookie = req.cookies.session || '';

  if (!sessionCookie) {
    return res.status(401).json({ error: 'Unauthorized: No session cookie found.' });
  }

  try {
    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
    req.user = decodedClaims;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session.' });
  }
};
