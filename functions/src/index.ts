import * as admin from 'firebase-admin';
import { generateResourceImage } from './ai/imageGen';
import { analyzeResourceImage } from './ai/imageAnalysis';
import { generateResourceDescription } from './ai/descriptionGen';

admin.initializeApp();

export {
  generateResourceImage,
  analyzeResourceImage,
  generateResourceDescription
};
