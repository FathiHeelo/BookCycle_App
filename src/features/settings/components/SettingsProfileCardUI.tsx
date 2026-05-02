import React from 'react';
import { View, Text, Image, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { useI18n } from '@/hooks/use-i18n';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import { SettingsStyles as styles } from '../styles';

import { useProfileData } from '@/src/features/profile/hooks/useProfileData';

export const SettingsProfileCardUI = () => {
  const { userProfile } = useProfileData();
  const auth = getAuth();
  const user = auth.currentUser;
  const { width } = useWindowDimensions();
  const { t, isRTL } = useI18n();
  const { theme } = useAppTheme();
  const themeColors = Colors[theme];

  const imageSize = Math.min(width * 0.22, 88);
  const textAlign = isRTL ? 'right' : 'left';
  const rowDir = isRTL ? 'row-reverse' : 'row';

  const photoURL = userProfile?.photoURL || user?.photoURL;
  const displayName = userProfile?.fullName || user?.displayName || 'Student';

  return (
    <Pressable onPress={() => router.push('/profile')}>
      <View style={[styles.profileCard, { backgroundColor: themeColors.card, flexDirection: rowDir }]}>
        <View style={[styles.avatarWrapper, { width: imageSize, height: imageSize, borderRadius: imageSize / 2 }]}>
          {photoURL ? (
            <Image
              source={{ uri: photoURL }}
              style={[styles.avatar, { width: imageSize, height: imageSize, borderRadius: imageSize / 2 }]}
            />
          ) : (
            <View style={[styles.avatarWrapper, { width: imageSize, height: imageSize, borderRadius: imageSize / 2, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="person" size={imageSize * 0.5} color="#94A3B8" />
            </View>
          )}
          <View style={styles.onlineDot} />
        </View>

        <View style={[styles.profileInfoContainer, { marginLeft: isRTL ? 0 : 16, marginRight: isRTL ? 16 : 0 }]}>
          <Text style={[styles.profileName, { color: themeColors.text, textAlign }]} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={[styles.profileEmail, { color: themeColors.textSecondary, textAlign }]} numberOfLines={1}>
            {user?.email ?? ''}
          </Text>
          <View style={[styles.idRow, { flexDirection: rowDir, alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
            <Ionicons name="card-outline" size={13} color={themeColors.textSecondary} />
            <Text style={[styles.idText, { color: themeColors.textSecondary, marginLeft: isRTL ? 0 : 5, marginRight: isRTL ? 5 : 0 }]}>
              {t('settings.studentId')}
            </Text>
          </View>
        </View>

        <Ionicons
          name={isRTL ? 'chevron-back' : 'chevron-forward'}
          size={20}
          color={themeColors.textSecondary}
          style={styles.arrow}
        />
      </View>
    </Pressable>
  );
};
