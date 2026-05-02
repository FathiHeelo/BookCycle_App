import { httpsCallable } from 'firebase/functions';
import { FIREBASE_FUNCTIONS } from '@/firebaseConfig';
import { AI_MOCK_IMAGES } from '@/src/features/add_books/constants/ai_mocks';

export interface AIAnalysisResult {
  title: string;
  resourceType: string;
  course: string;
  faculty: string;
  category: string;
  description: string;
  keywords: string[];
  confidence: string;
}

export interface AIDescriptionResult {
  description: string;
  keywords: string[];
}

export const aiService = {
  async generateImage(data: { title: string; resourceType: string; course: string; faculty: string; description: string }) {
    const generateImageFn = httpsCallable(FIREBASE_FUNCTIONS, 'generateResourceImage');
    
    // 5 second timeout logic
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('TIMEOUT')), 5000)
    );

    try {
      const result = await Promise.race([
        generateImageFn(data),
        timeoutPromise
      ]) as any;

      if (result.data?.success && result.data?.imageUrl) {
        return {
          imageUrl: result.data.imageUrl,
          isMock: false,
          remainingRequests: result.data.remainingRequests
        };
      }
      throw new Error('AI_FAILED');
    } catch (error: any) {
      console.warn('AI Image Gen Error or Timeout:', error.message);
      // Fallback to mock based on resourceType
      const mockUrl = AI_MOCK_IMAGES[data.resourceType] || AI_MOCK_IMAGES['other'];
      return {
        imageUrl: mockUrl,
        isMock: true,
        remainingRequests: undefined // We don't know if it failed or timed out before getting usage
      };
    }
  },

  async analyzeImage(base64Image: string) {
    const analyzeImageFn = httpsCallable(FIREBASE_FUNCTIONS, 'analyzeResourceImage');
    const result = await analyzeImageFn({ base64Image }) as any;
    
    if (result.data?.success) {
      return {
        analysis: result.data.analysis as AIAnalysisResult,
        remainingRequests: result.data.remainingRequests
      };
    }
    throw new Error(result.data?.error || 'Analysis failed');
  },

  async generateDescription(data: any) {
    const generateDescriptionFn = httpsCallable(FIREBASE_FUNCTIONS, 'generateResourceDescription');
    const result = await generateDescriptionFn(data) as any;
    
    if (result.data?.success) {
      return {
        description: result.data.description as string,
        keywords: result.data.keywords as string[],
        remainingRequests: result.data.remainingRequests
      };
    }
    throw new Error(result.data?.error || 'Description generation failed');
  }
};
