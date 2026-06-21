import { Router, type Request, type Response } from 'express';
import { getCoachInsight, getPersonalizedChallenge, scanReceiptOrBill } from './ai.service';

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
    if (err?.code === 'auth/argument-error' || err?.code === 'auth/id-token-expired') {
      res.status(401).json({ error: 'Invalid or expired token' });
    } else {
      res.status(500).json({ error: 'Failed to generate AI challenge' });
    }
  }
});

/**
 * POST /api/ai/scan
 * Headers: Authorization: Bearer <Firebase ID token>
 * Body: { base64Image: string, mimeType: string }
 * Returns: AIScanResponse
 */
router.post('/scan', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];
  const { base64Image, mimeType } = req.body;

  if (!base64Image || !mimeType) {
    res.status(400).json({ error: 'Missing base64Image or mimeType' });
    return;
  }

  try {
    const scanResult = await scanReceiptOrBill(idToken, base64Image, mimeType);
    res.json(scanResult);
  } catch (err: any) {
    if (err?.code === 'auth/argument-error' || err?.code === 'auth/id-token-expired') {
      res.status(401).json({ error: 'Invalid or expired token' });
    } else {
      res.status(500).json({ error: 'Failed to scan image' });
    }
  }
});

export default router;

