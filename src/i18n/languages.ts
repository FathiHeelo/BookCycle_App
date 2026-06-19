export type LanguageCode = 'en' | 'ar' | 'fr' | 'it';
export type TextDirection = 'ltr' | 'rtl';

export interface SupportedLanguage {
  code: LanguageCode;
  name: string;
  nativeName: string;
  direction: TextDirection;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', direction: 'ltr' },
];
