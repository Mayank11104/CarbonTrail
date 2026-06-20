const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

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

