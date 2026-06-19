import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';

import en from './locales/en.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import { SUPPORTED_LANGUAGES, LanguageCode } from './languages';

const LANGUAGE_STORAGE_KEY = 'bookcycle.language';
const DEFAULT_LANGUAGE: LanguageCode = 'en';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  fr: { translation: fr },
  it: { translation: it },
};

const isSupportedLanguage = (code?: string | null): code is LanguageCode => {
  return !!code && SUPPORTED_LANGUAGES.some((language) => language.code === code);
};

const getInitialLanguage = async (): Promise<LanguageCode> => {
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (isSupportedLanguage(savedLanguage)) {
    return savedLanguage;
  }

  const deviceLanguage = Localization.getLocales?.()[0]?.languageCode;
  return isSupportedLanguage(deviceLanguage) ? deviceLanguage : DEFAULT_LANGUAGE;
};

const applyLayoutDirection = (languageCode: LanguageCode) => {
  const selectedLanguage = SUPPORTED_LANGUAGES.find(
    (language) => language.code === languageCode
  );

  const shouldUseRTL = selectedLanguage?.direction === 'rtl';

  I18nManager.allowRTL(shouldUseRTL);

  if (I18nManager.isRTL !== shouldUseRTL) {
    I18nManager.forceRTL(shouldUseRTL);
    // In many React Native versions, changing RTL direction requires an app reload/restart.
    // Handle restart in the language selector if needed.
  }
};

export const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();
  applyLayoutDirection(initialLanguage);

  await i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: DEFAULT_LANGUAGE,
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
  });
};

export const changeAppLanguage = async (languageCode: LanguageCode) => {
  if (!isSupportedLanguage(languageCode)) return;

  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
  await i18n.changeLanguage(languageCode);
  applyLayoutDirection(languageCode);
};

export default i18n;
