import { Alert } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { router } from 'expo-router';
import { useI18n } from '@/hooks/use-i18n';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

export const useSettings = () => {
  const { t, isRTL } = useI18n();
  const { theme, isDark } = useAppTheme();
  const themeColors = Colors[theme];

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logoutSubtitle'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.logout'),
          style: 'destructive',
          onPress: async () => {
            await signOut(getAuth());
            router.replace('/welcome' as any);
          },
        },
      ]
    );
  };

  return { t, isRTL, theme, isDark, themeColors, handleLogout };
};
