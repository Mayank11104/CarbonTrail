import { BACKEND_URL } from '../../../config/constants';

export interface AICoachResponse {
  insight: string;
  tip: string;
  actions: string[];
  worstCategory: string;
  weeklyTotal: number;
}

export interface AIChallengeResponse {
  title: string;
  description: string;
  targetSaving: number;
  category: string;
  tasks: string[];
}

/**
 * Fetches personalized insights from the AI coach based on user's weekly logs.
 * @param idToken - Firebase authentication token
 * @returns Promise resolving to the AI coach response
 * @throws Error if the request fails
 */
export const fetchCoachInsight = async (idToken: string): Promise<AICoachResponse> => {
  const res = await fetch(`${BACKEND_URL}/api/ai/coach`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Request failed with status ${res.status}`);
  }

  return res.json();
};

/**
 * Fetches a personalized eco-challenge based on the user's worst performing category.
 * @param idToken - Firebase authentication token
 * @returns Promise resolving to the AI challenge response
 * @throws Error if the request fails
 */
export const fetchPersonalizedChallenge = async (idToken: string): Promise<AIChallengeResponse> => {
  const res = await fetch(`${BACKEND_URL}/api/ai/challenge`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Request failed with status ${res.status}`);
  }

  return res.json();
};

export interface AIScanResponse {
  category: 'transport' | 'food' | 'energy' | 'shopping';
  value: number;
  unit: string;
  carbonImpact: number;
  details: string;
}

/**
 * Uploads a utility bill or receipt image to Gemini Vision for automated data extraction.
 * @param idToken - Firebase authentication token
 * @param base64Image - The base64 encoded image string (without data URI prefix)
 * @param mimeType - The MIME type of the image (e.g., image/jpeg)
 * @returns Promise resolving to the extracted scan data and carbon impact
 * @throws Error if the scan fails
 */
export const uploadAndScanBill = async (
  idToken: string,
  base64Image: string,
  mimeType: string
): Promise<AIScanResponse> => {
  const res = await fetch(`${BACKEND_URL}/api/ai/scan`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ base64Image, mimeType }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Scan request failed with status ${res.status}`);
  }

  return res.json();
};

