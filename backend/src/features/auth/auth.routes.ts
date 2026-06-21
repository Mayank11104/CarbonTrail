import { Router } from 'express';
import { getAuth } from 'firebase-admin/auth';

const router = Router();

/**
 * POST /api/auth/session
 * Creates an httpOnly session cookie after verifying the Firebase ID token.
 * Requires the user to have signed in within the last 5 minutes (replay attack prevention).
 */
router.post('/session', async (req, res) => {
  const idToken = req.body.idToken?.toString();

  if (!idToken) {
    return res.status(401).json({ error: 'Unauthorized: No ID token provided.' });
  }

  const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days

  try {
    const decodedIdToken = await getAuth().verifyIdToken(idToken);

    if (new Date().getTime() / 1000 - decodedIdToken.auth_time < 5 * 60) {
      const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });
      const options = {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
      };
      res.cookie('session', sessionCookie, options);
      res.json({ status: 'success' });
    } else {
      res.status(401).json({ error: 'Recent sign in required.' });
    }
  } catch {
    res.status(401).json({ error: 'Unauthorized: Invalid ID token.' });
  }
});

/**
 * POST /api/auth/logout
 * Clears the session cookie.
 */
router.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.json({ status: 'success' });
});

export default router;
