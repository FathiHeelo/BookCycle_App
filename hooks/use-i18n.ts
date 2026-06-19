import { useTranslation } from 'react-i18next';
import { changeAppLanguage } from '@/src/i18n';
import { LanguageCode, SUPPORTED_LANGUAGES } from '@/src/i18n/languages';

export const useI18n = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang: LanguageCode) => {
    changeAppLanguage(lang);
  };

  const currentLanguage = (i18n.language || 'en') as LanguageCode;
  const currentLanguageMeta = SUPPORTED_LANGUAGES.find(
    (l) => l.code === currentLanguage
  ) || SUPPORTED_LANGUAGES[0];

  return {
    t,
    locale: currentLanguage,
    changeLanguage,
    isRTL: currentLanguageMeta.direction === 'rtl',
  };
};
