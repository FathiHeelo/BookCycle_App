import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkAndIncrementUsage } from './usageLimit';

export const generateResourceImage = functions.region('europe-west1').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
  }

  const { title, resourceType, course, faculty, description } = data;

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

  // Use Gemini to generate a descriptive prompt for an image generation service
  const promptCrafting = `You are an expert at crafting prompts for AI image generators.
Create a detailed prompt for an image of an academic resource.
Resource Details:
Title: ${title}
Type: ${resourceType}
Course: ${course}
Faculty: ${faculty}
Description: ${description}

Style: Professional, clean, academic, premium quality.
Return ONLY the prompt text.`;

  try {
    const result = await model.generateContent(promptCrafting);
    const imagePrompt = result.response.text().trim();

    // In a real scenario, you'd call Imagen or another API here.
    // For this implementation, we'll use a prompt-to-image service (like pollinations.ai) 
    // to "simulate" the real AI image generation within the Gemini flow.
    const encodedPrompt = encodeURIComponent(imagePrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;

    return { success: true, imageUrl, isRealAI: true, remainingRequests: usage.remaining };
  } catch (error: any) {
    console.error('Gemini Image Gen Prompt Error:', error);
    // If Gemini prompt crafting fails, we'll let the frontend handle the mock fallback
    return { success: false, error: error.message, remainingRequests: usage.remaining };
  }
});
