import React from 'react';
import { View, Text, SafeAreaView, ScrollView, StatusBar, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SettingsStyles as styles } from '../styles';
import { useSettings } from '../hooks/useSettings';
import { SettingsProfileCardUI } from './SettingsProfileCardUI';
import { ThemeToggleUI } from './ThemeToggleUI';
import { AccessibilityToggleUI } from './AccessibilityToggleUI';
import { LanguageSwitcherUI } from './LanguageSwitcherUI';
import { NotificationToggleUI } from './NotificationToggleUI';
import { CustomHeader } from '@/src/components/shared/CustomHeader';
import { useRouter } from 'expo-router';

export const SettingsScreenUI = () => {
  const { t, isRTL, isDark, isAccessible, themeColors, handleLogout } = useSettings();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const hPad = Math.min(width * 0.05, 20);
  const textAlign = isRTL ? 'right' : 'left';

  const SectionLabel = ({ label }: { label: string }) => (
    <Text style={[styles.sectionLabel, { color: themeColors.textSecondary, textAlign }]}>
      {label.toUpperCase()}
    </Text>
  );

  const SettingsCard = ({ children }: { children: React.ReactNode }) => (
    <View style={[styles.card, { backgroundColor: themeColors.card }]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <CustomHeader 
        title={t('settings.title')}
        leftMode="none"
        rightIcons={['search']}
        hideSafeArea
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: hPad, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >

        {/* Profile Section */}
        <SectionLabel label={t('settings.profile')} />
        <SettingsProfileCardUI />

        {/* Appearance Section */}
        <SectionLabel label={t('settings.appearance')} />
        <SettingsCard>
          <ThemeToggleUI />
        </SettingsCard>

        {/* Accessibility Section */}
        <SectionLabel label={t('settings.accessibility')} />
        <SettingsCard>
          <AccessibilityToggleUI />
        </SettingsCard>

        {/* Notifications Section */}
        <SectionLabel label={isRTL ? 'التنبيهات' : 'Notifications'} />
        <SettingsCard>
          <NotificationToggleUI />
        </SettingsCard>

        {/* Language Section */}
        <SectionLabel label={t('settings.language')} />
        <SettingsCard>
          <LanguageSwitcherUI />
        </SettingsCard>

        {/* Account Section */}
        <SectionLabel label={t('settings.account')} />
        <SettingsCard>
          <Pressable
            style={({ pressed }) => [
              styles.logoutRow,
              { opacity: pressed ? 0.7 : 1, flexDirection: isRTL ? 'row-reverse' : 'row', borderBottomWidth: 1, borderBottomColor: themeColors.border || '#F1F5F9' },
            ]}
            onPress={() => router.push('/change-password')}
          >
            <View style={[styles.logoutIconBg, { backgroundColor: themeColors.primary + '15' }]}>
              <Ionicons name="lock-closed-outline" size={20} color={themeColors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }}>
              <Text style={[styles.logoutLabel, { textAlign, color: themeColors.text }]}>{isRTL ? 'تغيير كلمة المرور' : 'Change Password'}</Text>
            </View>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={themeColors.textSecondary} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.logoutRow,
              { opacity: pressed ? 0.7 : 1, flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
            onPress={handleLogout}
          >
            <View style={[styles.logoutIconBg, { backgroundColor: isAccessible ? themeColors.error + '20' : '#FEE2E2' }]}>
              <Ionicons name="log-out-outline" size={20} color={themeColors.error} />
            </View>
            <View style={{ flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }}>
              <Text style={[styles.logoutLabel, { textAlign, color: themeColors.error, fontWeight: isAccessible ? '900' : '700' }]}>{t('settings.logout')}</Text>
              <Text style={[styles.logoutSubtitle, { textAlign, color: isAccessible ? themeColors.textSecondary : '#F87171' }]}>{t('settings.logoutSubtitle')}</Text>
            </View>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={18}
              color={themeColors.error}
            />
          </Pressable>
        </SettingsCard>

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
};
