"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeResourceImage = void 0;
const functions = __importStar(require("firebase-functions"));
const generative_ai_1 = require("@google/generative-ai");
const usageLimit_1 = require("./usageLimit");
exports.analyzeResourceImage = functions.region('europe-west1').https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }
    const { base64Image } = data;
    if (!base64Image) {
        throw new functions.https.HttpsError('invalid-argument', 'No image provided.');
    }
    const usage = await (0, usageLimit_1.checkAndIncrementUsage)(context.auth.uid);
    if (!usage.allowed) {
        throw new functions.https.HttpsError('resource-exhausted', 'Daily AI limit reached.');
    }
    const apiKey = ((_a = functions.config().gemini) === null || _a === void 0 ? void 0 : _a.key) || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new functions.https.HttpsError('failed-precondition', 'Gemini API key not configured.');
    }
    const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
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
    }
    catch (error) {
        console.error('Gemini Analysis Error:', error);
        return { success: false, error: error.message, remainingRequests: usage.remaining };
    }
});
//# sourceMappingURL=imageAnalysis.js.map