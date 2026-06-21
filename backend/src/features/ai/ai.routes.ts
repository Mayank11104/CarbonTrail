import { Router, type Request, type Response } from 'express';
import { getCoachInsight, getPersonalizedChallenge, scanReceiptOrBill } from './ai.service';

const router = Router();

const extractBearerToken = (req: Request, res: Response): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return null;
  }
  return authHeader.split('Bearer ')[1];
};

const handleAuthError = (err: unknown, res: Response, fallbackMessage: string) => {
  const error = err as { code?: string };
  if (error?.code === 'auth/argument-error' || error?.code === 'auth/id-token-expired') {
    res.status(401).json({ error: 'Invalid or expired token' });
  } else {
    res.status(500).json({ error: fallbackMessage });
  }
};

/**
 * POST /api/ai/coach
 * Headers: Authorization: Bearer <Firebase ID token>
 * Returns: AICoachResponse
 */
router.post('/coach', async (req: Request, res: Response) => {
  const idToken = extractBearerToken(req, res);
  if (!idToken) return;

  try {
    const insight = await getCoachInsight(idToken);
    res.json(insight);
  } catch (err) {
    handleAuthError(err, res, 'Failed to generate AI insight');
  }
});

/**
 * POST /api/ai/challenge
 * Headers: Authorization: Bearer <Firebase ID token>
 * Returns: AIChallengeResponse
 */
router.post('/challenge', async (req: Request, res: Response) => {
  const idToken = extractBearerToken(req, res);
  if (!idToken) return;

  try {
    const challenge = await getPersonalizedChallenge(idToken);
    res.json(challenge);
  } catch (err) {
    handleAuthError(err, res, 'Failed to generate AI challenge');
  }
});

/**
 * POST /api/ai/scan
 * Headers: Authorization: Bearer <Firebase ID token>
 * Body: { base64Image: string, mimeType: string }
 * Returns: AIScanResponse
 */
router.post('/scan', async (req: Request, res: Response) => {
  const idToken = extractBearerToken(req, res);
  if (!idToken) return;

  const { base64Image, mimeType } = req.body;
  if (!base64Image || !mimeType) {
    res.status(400).json({ error: 'Missing base64Image or mimeType' });
    return;
  }

  try {
    const scanResult = await scanReceiptOrBill(idToken, base64Image, mimeType);
    res.json(scanResult);
  } catch (err) {
    handleAuthError(err, res, 'Failed to scan image');
  }
});

export default router;
