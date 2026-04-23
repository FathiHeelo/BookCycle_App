import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { useI18n } from '@/hooks/use-i18n';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';

export default function SettingsProfileCard() {
  const auth = getAuth();
  const user = auth.currentUser;
  const { width } = useWindowDimensions();
  const { t, isRTL } = useI18n();
  const { theme } = useAppTheme();
  const themeColors = Colors[theme];

  const imageSize = Math.min(width * 0.22, 88);
  const textAlign = isRTL ? 'right' : 'left';
  const rowDir = isRTL ? 'row-reverse' : 'row';

  return (
    <Pressable onPress={() => router.push('/profile')}>
    <View style={[styles.card, { backgroundColor: themeColors.card, flexDirection: rowDir }]}>
      {/* Avatar */}
      <View style={[styles.avatarWrapper, { width: imageSize, height: imageSize, borderRadius: imageSize / 2 }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400' }}
          style={[styles.avatar, { width: imageSize, height: imageSize, borderRadius: imageSize / 2 }]}
        />
        <View style={styles.onlineDot} />
      </View>

      {/* Info */}
      <View style={[styles.infoContainer, { marginLeft: isRTL ? 0 : 16, marginRight: isRTL ? 16 : 0 }]}>
        <Text style={[styles.name, { color: themeColors.text, textAlign }]} numberOfLines={1}>
          {user?.displayName ?? 'Ahmed Al-Masri'}
        </Text>
        <Text style={[styles.email, { color: themeColors.textSecondary, textAlign }]} numberOfLines={1}>
          {user?.email ?? 'ahmed@stu.najah.edu'}
        </Text>
        <View style={[styles.idRow, { flexDirection: rowDir, alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Ionicons name="card-outline" size={13} color={themeColors.textSecondary} />
          <Text style={[styles.idText, { color: themeColors.textSecondary, marginLeft: isRTL ? 0 : 5, marginRight: isRTL ? 5 : 0 }]}>
            {t('settings.studentId')}: 11920345
          </Text>
        </View>
      </View>
      

      {/* Arrow */}
      <Ionicons
        name={isRTL ? 'chevron-back' : 'chevron-forward'}
        size={20}
        color={themeColors.textSecondary}
        style={styles.arrow}
      />
    </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    resizeMode: 'cover',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  email: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  idRow: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  idText: {
    fontSize: 12,
    fontWeight: '600',
  },
  arrow: {
    marginLeft: 8,
  },
});
