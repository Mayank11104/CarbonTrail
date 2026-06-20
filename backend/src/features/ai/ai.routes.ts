import { Router, type Request, type Response } from 'express';
import { getCoachInsight, getPersonalizedChallenge } from './ai.service';

const router = Router();

/**
 * POST /api/ai/coach
 * Headers: Authorization: Bearer <Firebase ID token>
 * Returns: AICoachResponse
 */
router.post('/coach', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const insight = await getCoachInsight(idToken);
    res.json(insight);
  } catch (err: any) {
    console.error('[AI Coach Error]', err?.message || err);
    if (err?.code === 'auth/argument-error' || err?.code === 'auth/id-token-expired') {
      res.status(401).json({ error: 'Invalid or expired token' });
    } else {
      res.status(500).json({ error: 'Failed to generate AI insight' });
    }
  }
});

/**
 * POST /api/ai/challenge
 * Headers: Authorization: Bearer <Firebase ID token>
 * Returns: AIChallengeResponse
 */
router.post('/challenge', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const challenge = await getPersonalizedChallenge(idToken);
    res.json(challenge);
  } catch (err: any) {
    console.error('[AI Challenge Error]', err?.message || err);
    if (err?.code === 'auth/argument-error' || err?.code === 'auth/id-token-expired') {
      res.status(401).json({ error: 'Invalid or expired token' });
    } else {
      res.status(500).json({ error: 'Failed to generate AI challenge' });
    }
  }
});

export default router;
