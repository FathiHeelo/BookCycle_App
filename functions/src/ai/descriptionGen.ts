import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkAndIncrementUsage } from './usageLimit';

export const generateResourceDescription = functions.region('europe-west1').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
  }

  const { title, resourceType, course, faculty, category, notes } = data;

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

  const prompt = `Generate a short, clear, student-friendly description for an academic resource-sharing app.

Input:
Title: ${title}
Resource Type: ${resourceType}
Course: ${course}
Faculty: ${faculty}
Category: ${category}
User Notes: ${notes || ''}

Return ONLY valid JSON:
{
  "description": "",
  "keywords": []
}

Rules:
- Do not exaggerate.
- Do not invent fake details.
- Mention how this resource can help students.
- Keep it concise.
- Return JSON only.`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedJson = responseText.replace(/```json|```/g, '').trim();
    const resultJson = JSON.parse(cleanedJson);

    return { success: true, ...resultJson, remainingRequests: usage.remaining };
  } catch (error: any) {
    console.error('Gemini Description Error:', error);
    return { success: false, error: error.message, remainingRequests: usage.remaining };
  }
});
