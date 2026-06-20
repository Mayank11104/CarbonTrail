import { GoogleGenAI } from '@google/genai';
import { auth as adminAuth, db as adminDb } from '../../config/firebase';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AICoachResponse {
  insight: string;
  tip: string;
  actions: string[];
  worstCategory: string;
  weeklyTotal: number;
}

export const getCoachInsight = async (idToken: string): Promise<AICoachResponse> => {
  // 1. Verify Firebase ID token
  const decoded = await adminAuth.verifyIdToken(idToken);
  const uid = decoded.uid;

  // 2. Fetch last 7 days of logs from Firestore
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const logsSnap = await adminDb
    .collection(`users/${uid}/logs`)
    .where('timestamp', '>=', sevenDaysAgo)
    .get();

  // 3. Aggregate data by category
  const categoryTotals: Record<string, number> = {
    transport: 0,
    food: 0,
    energy: 0,
    shopping: 0,
  };
  let weeklyTotal = 0;

  logsSnap.docs.forEach((doc) => {
    const data = doc.data();
    const cat = data.category as string;
    const impact = data.carbonImpact as number;
    if (categoryTotals[cat] !== undefined) {
      categoryTotals[cat] += impact;
    }
    weeklyTotal += impact;
  });

  weeklyTotal = Number(weeklyTotal.toFixed(2));
  const worstCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0][0];

  // 4. Build Gemini prompt
  const prompt = `
You are a carbon footprint coach for CarbonTrail, a sustainability app.

Here is the user's carbon data for the last 7 days:
- Transport: ${categoryTotals.transport.toFixed(2)} kg CO2
- Food: ${categoryTotals.food.toFixed(2)} kg CO2
- Energy: ${categoryTotals.energy.toFixed(2)} kg CO2
- Shopping: ${categoryTotals.shopping.toFixed(2)} kg CO2
- Weekly Total: ${weeklyTotal} kg CO2
- Worst Category: ${worstCategory}

Respond ONLY with a JSON object (no markdown, no code blocks) in this exact format:
{
  "insight": "A 1-2 sentence personalized observation about their data this week",
  "tip": "One specific, actionable tip to reduce their worst category",
  "actions": ["Action 1", "Action 2", "Action 3"]
}

Rules:
- insight must reference actual numbers from their data
- tip must be concrete and specific to their worst category
- actions must be 3 short, practical actions (max 8 words each)
- Keep tone encouraging, not preachy
- If all values are 0, encourage the user to start logging
`.trim();

  // 5. Call Gemini
  const result = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: prompt,
  });
  const text = (result.text || '').trim();

  // 6. Parse JSON response
  let parsed: Omit<AICoachResponse, 'worstCategory' | 'weeklyTotal'>;
  try {
    // Strip markdown code fences if Gemini wraps it anyway
    const clean = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    // Fallback if parsing fails
    parsed = {
      insight: 'Your carbon data is being analyzed. Keep logging to get personalized insights!',
      tip: 'Try logging your daily commute to track transport emissions.',
      actions: ['Log your meals today', 'Track your commute', 'Check your energy usage'],
    };
  }

  return {
    ...parsed,
    worstCategory,
    weeklyTotal,
  };
};

export interface AIChallengeResponse {
  title: string;
  description: string;
  targetSaving: number;
  category: string;
  tasks: string[];
}

export const getPersonalizedChallenge = async (idToken: string): Promise<AIChallengeResponse> => {
  // 1. Verify Firebase ID token
  const decoded = await adminAuth.verifyIdToken(idToken);
  const uid = decoded.uid;

  // 2. Fetch last 7 days of logs from Firestore
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const logsSnap = await adminDb
    .collection(`users/${uid}/logs`)
    .where('timestamp', '>=', sevenDaysAgo)
    .get();

  // 3. Aggregate data by category
  const categoryTotals: Record<string, number> = {
    transport: 0,
    food: 0,
    energy: 0,
    shopping: 0,
  };

  logsSnap.docs.forEach((doc) => {
    const data = doc.data();
    const cat = data.category as string;
    const impact = data.carbonImpact as number;
    if (categoryTotals[cat] !== undefined) {
      categoryTotals[cat] += impact;
    }
  });

  const worstCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0][0];

  // 4. Build challenge prompt
  const prompt = `
You are a carbon footprint coach for CarbonTrail, a sustainability app.

Here is the user's carbon data for the last 7 days:
- Transport: ${categoryTotals.transport.toFixed(2)} kg CO2
- Food: ${categoryTotals.food.toFixed(2)} kg CO2
- Energy: ${categoryTotals.energy.toFixed(2)} kg CO2
- Shopping: ${categoryTotals.shopping.toFixed(2)} kg CO2
- Worst Category: ${worstCategory}

Generate a personalized 7-day challenge to help them reduce their emissions in their worst category: "${worstCategory}".
If all their categories are 0, generate a fun starter challenge for "${worstCategory}" anyway.

Respond ONLY with a JSON object (no markdown, no code blocks) in this exact format:
{
  "title": "A short, catchy, action-oriented title for the challenge (max 5 words)",
  "description": "A 1-2 sentence description explaining the challenge goal and why it matters",
  "targetSaving": 4.5, // estimated CO2 saved in kg by completing this challenge (should be a reasonable number between 1.0 and 20.0 based on their actual logs)
  "category": "${worstCategory}",
  "tasks": [
    "Task 1 (max 8 words, starting with a verb)",
    "Task 2 (max 8 words, starting with a verb)",
    "Task 3 (max 8 words, starting with a verb)"
  ]
}

Rules:
- Tasks must be highly practical and achievable in 7 days.
- Do not use markdown backticks, code block wrappers, or other formatting. Return only raw JSON.
`.trim();

  // 5. Call Gemini
  const result = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: prompt,
  });
  const text = (result.text || '').trim();

  // 6. Parse JSON response
  let parsed: AIChallengeResponse;
  try {
    const clean = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    // Fallback if parsing fails
    parsed = {
      title: 'Eco Commute Week',
      description: `Reduce your transport emissions by swapping car trips for walking, cycling, or public transport.`,
      targetSaving: 5.0,
      category: worstCategory || 'transport',
      tasks: [
        'Take public transit once',
        'Walk or bike for short trips',
        'Combine errands into one trip'
      ]
    };
  }

  return parsed;
};

