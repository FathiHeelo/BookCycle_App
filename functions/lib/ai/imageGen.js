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
exports.generateResourceImage = void 0;
const functions = __importStar(require("firebase-functions"));
const generative_ai_1 = require("@google/generative-ai");
const usageLimit_1 = require("./usageLimit");
exports.generateResourceImage = functions.region('europe-west1').https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }
    const { title, resourceType, course, faculty, description } = data;
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
        const encodedPrompt = encodeURIComponent(imagePrompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
        return { success: true, imageUrl, isRealAI: true, remainingRequests: usage.remaining };
    }
    catch (error) {
        console.error('Gemini Image Gen Prompt Error:', error);
        return { success: false, error: error.message, remainingRequests: usage.remaining };
    }
});
//# sourceMappingURL=imageGen.js.map