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
  const decoded = await adminAuth.verifyIdToken(idToken);
  const uid = decoded.uid;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const logsSnap = await adminDb
    .collection(`users/${uid}/logs`)
    .where('timestamp', '>=', sevenDaysAgo)
    .get();

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

  const result = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: prompt,
  });
  const text = (result.text || '').trim();

  let parsed: Omit<AICoachResponse, 'worstCategory' | 'weeklyTotal'>;
  try {
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
  const decoded = await adminAuth.verifyIdToken(idToken);
  const uid = decoded.uid;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const logsSnap = await adminDb
    .collection(`users/${uid}/logs`)
    .where('timestamp', '>=', sevenDaysAgo)
    .get();

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

  const result = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: prompt,
  });
  const text = (result.text || '').trim();

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

export interface AIScanResponse {
  category: 'transport' | 'food' | 'energy' | 'shopping';
  value: number;
  unit: string;
  carbonImpact: number;
  details: string;
}

export const scanReceiptOrBill = async (
  idToken: string,
  base64Image: string,
  mimeType: string
): Promise<AIScanResponse> => {
  await adminAuth.verifyIdToken(idToken);

  const prompt = `
You are an expert carbon footprint assistant for CarbonTrail. 
Analyze the provided image of a receipt, ticket, invoice, or utility bill.

Perform the following tasks:
1. Determine which category it belongs to: "transport", "food", "energy", or "shopping".
2. Extract the usage value (e.g. distance traveled, energy consumed in kWh, number of meals, or number of items purchased) and determine the unit of measurement.
3. Calculate or estimate the carbon footprint impact (in kg CO2) associated with this activity. 
   - For electricity (energy), use roughly 0.4 kg CO2 per kWh.
   - For gasoline/driving (transport), use roughly 0.2 kg CO2 per km.
   - For other categories, use reasonable, standard multipliers.
4. Summarize what was detected (e.g., "Electricity bill of 320 kWh found").

Respond ONLY with a JSON object (no markdown, no code blocks) in this exact format:
{
  "category": "energy", // must be exactly "transport", "food", "energy", or "shopping"
  "value": 320.0, // number
  "unit": "kWh", // string
  "carbonImpact": 128.0, // estimated kg CO2
  "details": "Parsed electricity bill showing 320 kWh used."
}

Rules:
- If you cannot read the image or it is not a bill/receipt, return a fallback object targeting 'shopping' with 0 carbon impact.
- Do not wrap the JSON in markdown code blocks like \`\`\`json. Return only raw JSON.
`.trim();

  const result = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: [
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      },
      prompt,
    ],
  });

  const text = (result.text || '').trim();

  let parsed: AIScanResponse;
  try {
    const clean = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    // Fallback if parsing fails
    parsed = {
      category: 'shopping',
      value: 1,
      unit: 'item',
      carbonImpact: 1.0,
      details: 'Analyzed receipt, category is shopping.',
    };
  }

  return parsed;
};


