import { useTranslation } from 'react-i18next';
import i18n from '@/i18n/config';

export const useI18n = () => {
  const { t } = useTranslation();

  const changeLanguage = (lang: 'en' | 'ar') => {
    i18n.changeLanguage(lang);
  };

  return {
    t,
    locale: i18n.language,
    changeLanguage,
    isRTL: i18n.language === 'ar',
  };
};
