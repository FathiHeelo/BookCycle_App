import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkAndIncrementUsage } from './usageLimit';

export const analyzeResourceImage = functions.region('europe-west1').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
  }

  const { base64Image } = data;
  if (!base64Image) {
    throw new functions.https.HttpsError('invalid-argument', 'No image provided.');
  }

  const usage = await checkAndIncrementUsage(context.auth.uid);
  if (!usage.allowed) {
    throw new functions.https.HttpsError('resource-exhausted', 'Daily AI limit reached.');
  }

  const apiKey = functions.config().gemini?.key || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new functions.https.HttpsError('failed-precondition', 'Gemini API key not configured.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Analyze this image of an academic resource such as a book, slides, notes, or printed handout.

Return ONLY valid JSON:
{
  "title": "",
  "resourceType": "",
  "course": "",
  "faculty": "",
  "category": "",
  "description": "",
  "keywords": [],
  "confidence": "low"
}

Rules:
- Extract only visible information accurately.
- If something is not visible, infer carefully but do not invent specific details.
- Do not invent author names, instructor names, edition numbers, or university names unless visible.
- Keep the description short and useful.
- Return JSON only.`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg'
        }
      }
    ]);

    const responseText = result.response.text();
    const cleanedJson = responseText.replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(cleanedJson);

    return { success: true, analysis, remainingRequests: usage.remaining };
  } catch (error: any) {
    console.error('Gemini Analysis Error:', error);
    return { success: false, error: error.message, remainingRequests: usage.remaining };
  }
});
