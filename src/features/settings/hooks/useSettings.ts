import { Alert } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { router } from 'expo-router';
import { useI18n } from '@/hooks/use-i18n';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';

export const useSettings = () => {
  const { t, isRTL } = useI18n();
  const { theme, isDark } = useAppTheme();
  const themeColors = Colors[theme];
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const currentUser = FIREBASE_AUTH.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const userRef = ref(FIREBASE_DB, `Users/${currentUser.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.notificationsEnabled !== undefined) {
        setNotificationsEnabled(data.notificationsEnabled);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const toggleNotifications = async () => {
    if (!currentUser) return;
    try {
      const userRef = ref(FIREBASE_DB, `Users/${currentUser.uid}`);
      await update(userRef, { notificationsEnabled: !notificationsEnabled });
    } catch (e) {
      console.error('Error toggling notifications:', e);
    }
  };

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

  return { t, isRTL, theme, isDark, themeColors, handleLogout, notificationsEnabled, toggleNotifications };
};
