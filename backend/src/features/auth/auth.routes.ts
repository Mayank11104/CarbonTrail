import { Router } from 'express';
import { getAuth } from 'firebase-admin/auth';

const router = Router();

// Create session cookie
router.post('/session', async (req, res) => {
  const idToken = req.body.idToken?.toString();

  if (!idToken) {
    return res.status(401).send('UNAUTHORIZED REQUEST!');
  }

  // Set session expiration to 7 days.
  const expiresIn = 60 * 60 * 24 * 7 * 1000;

  try {
    // Verify the ID token first.
    const decodedIdToken = await getAuth().verifyIdToken(idToken);

    // Only process if the user just signed in in the last 5 minutes.
    if (new Date().getTime() / 1000 - decodedIdToken.auth_time < 5 * 60) {
      // Create the session cookie. This will also verify the ID token in the process.
      // The session cookie will have the same claims as the ID token.
      const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });

      const options = { 
        maxAge: expiresIn, 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const
      };
      res.cookie('session', sessionCookie, options);
      res.end(JSON.stringify({ status: 'success' }));
    } else {
      res.status(401).send('Recent sign in required!');
    }
  } catch (error) {
    console.error('Error creating session cookie:', error);
    res.status(401).send('UNAUTHORIZED REQUEST!');
  }
});

// Clear session cookie on logout
router.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.json({ status: 'success' });
});

export default router;
