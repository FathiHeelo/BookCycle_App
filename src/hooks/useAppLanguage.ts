import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, LanguageCode, TextDirection } from '../i18n/languages';
import { changeAppLanguage } from '../i18n';

export const useAppLanguage = () => {
  const { i18n } = useTranslation();
  const currentLanguage = (i18n.language || 'en') as LanguageCode;

  const currentLanguageMeta = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === currentLanguage
  ) || SUPPORTED_LANGUAGES[0];

  const direction: TextDirection = currentLanguageMeta.direction;
  const isRTL = direction === 'rtl';

  const changeLanguage = async (languageCode: LanguageCode) => {
    await changeAppLanguage(languageCode);
  };

  return {
    currentLanguage,
    direction,
    isRTL,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
};
