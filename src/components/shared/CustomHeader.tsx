import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform , SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useI18n } from '@/hooks/use-i18n';

export type CustomHeaderProps = {
  title: string;
  subtitle?: string;
  leftMode?: 'back' | 'avatar' | 'none';
  avatarUrl?: string;
  rightIcons?: ('search' | 'notification' | 'bookmark' | 'menu' | 'share' | 'requests')[];
  onRightIconPress?: (iconName: string) => void;
  hideSafeArea?: boolean;
  notificationCount?: number;
};

export const CustomHeader = ({
  title,
  subtitle,
  leftMode = 'back',
  avatarUrl,
  rightIcons = [],
  onRightIconPress,
  hideSafeArea = false,
  notificationCount = 0,
}: CustomHeaderProps) => {
  const router = useRouter();
  const { theme: themeKey } = useAppTheme();
  const theme = Colors[themeKey];
  const { isRTL } = useI18n();
  const insets = useSafeAreaInsets();

  const flexDirection = isRTL ? 'row-reverse' : 'row';

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.background, 
        flexDirection,
        paddingTop: hideSafeArea ? (insets.top + (Platform.OS === 'ios' ? 0 : 10)) : 10,
        height: hideSafeArea ? (56 + insets.top + (Platform.OS === 'ios' ? 0 : 10)) : 66,
        borderBottomColor: theme.border,
      }
    ]}>
      {/* Left Section */}
      <View style={[styles.leftSection, { flexDirection }]}>
        {leftMode === 'back' && (
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text} />
          </TouchableOpacity>
        )}
        
        {leftMode === 'avatar' && (
          <TouchableOpacity 
            style={[styles.avatarContainer, { borderColor: theme.border }]}
            onPress={() => router.push('/profile' as any)}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: themeKey === 'dark' ? theme.card : '#F1F5F9' }]}>
                <Ionicons name="person" size={20} color={theme.textSecondary} />
              </View>
            )}
          </TouchableOpacity>
        )}

        <View style={[styles.titleContainer, isRTL ? { marginRight: leftMode !== 'none' ? 12 : 0 } : { marginLeft: leftMode !== 'none' ? 12 : 0 }]}>
          <Text style={[styles.title, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
              {subtitle.toUpperCase()}
            </Text>
          )}
        </View>
      </View>

      {/* Right Section */}
      <View style={[styles.rightSection, { flexDirection }]}>
        {rightIcons.map((icon, index) => {
          let iconName = '';
          switch (icon) {
            case 'search': iconName = 'search-outline'; break;
            case 'notification': iconName = 'notifications-outline'; break;
            case 'bookmark': iconName = 'bookmark-outline'; break;
            case 'menu': iconName = 'ellipsis-vertical'; break;
            case 'share': iconName = 'share-social-outline'; break;
            case 'requests': iconName = 'git-pull-request-outline'; break;
          }

          return (
            <TouchableOpacity 
              key={`${icon}-${index}`} 
              onPress={() => onRightIconPress?.(icon)}
              style={styles.iconBtn}
            >
              <Ionicons name={iconName as any} size={22} color={theme.text} />
              {(icon === 'notification' || icon === 'requests') && notificationCount > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.badgeText}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  leftSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    alignItems: 'center',
    gap: 8,
  },
  titleContainer: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  iconBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '800',
  },
});
