import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Pressable,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
import { useI18n } from '@/hooks/use-i18n';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import SettingsProfileCard from '@/src/Feature/Settings/SettingsProfileCard';
import LanguageSwitcher from '@/src/Feature/Settings/LanguageSwitcher';
import ThemeToggle from '@/src/Feature/Settings/ThemeToggle';

export default function SettingsPage() {
  const { t, isRTL } = useI18n();
  const { theme, isDark } = useAppTheme();
  const themeColors = Colors[theme];
  const { width } = useWindowDimensions();
  const hPad = Math.min(width * 0.05, 20);
  const textAlign = isRTL ? 'right' : 'left';

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

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: hPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: themeColors.text }]}>
            {t('settings.title')}
          </Text>
          <View style={[styles.titleAccent, { backgroundColor: themeColors.primary }]} />
        </View>

        {/* ───── Profile Section ───── */}
        <SectionLabel label={t('settings.profile')} themeColors={themeColors} textAlign={textAlign} />
        <SettingsProfileCard />

        {/* ───── Appearance Section ───── */}
        <SectionLabel label={t('settings.appearance')} themeColors={themeColors} textAlign={textAlign} />
        <SettingsCard themeColors={themeColors}>
          <ThemeToggle />
        </SettingsCard>

        {/* ───── Language Section ───── */}
        <SectionLabel label={t('settings.language')} themeColors={themeColors} textAlign={textAlign} />
        <SettingsCard themeColors={themeColors}>
          <LanguageSwitcher />
        </SettingsCard>

        {/* ───── Account Section ───── */}
        <SectionLabel label={t('settings.account')} themeColors={themeColors} textAlign={textAlign} />
        <SettingsCard themeColors={themeColors}>
          <Pressable
            style={({ pressed }) => [styles.logoutRow, { opacity: pressed ? 0.7 : 1, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            onPress={handleLogout}
          >
            <View style={[styles.logoutIconBg]}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <View style={{ flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }}>
              <Text style={[styles.logoutLabel, { textAlign }]}>{t('settings.logout')}</Text>
              <Text style={[styles.logoutSubtitle, { textAlign }]}>{t('settings.logoutSubtitle')}</Text>
            </View>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={18}
              color="#EF4444"
            />
          </Pressable>
        </SettingsCard>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Reusable sub-components ──────────────────────────────────────────

function SectionLabel({ label, themeColors, textAlign }: { label: string; themeColors: any; textAlign: any }) {
  return (
    <Text style={[styles.sectionLabel, { color: themeColors.textSecondary, textAlign }]}>
      {label.toUpperCase()}
    </Text>
  );
}

function SettingsCard({ children, themeColors }: { children: React.ReactNode; themeColors: any }) {
  return (
    <View style={[styles.card, { backgroundColor: themeColors.card }]}>
      {children}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 28,
    paddingTop: 8,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  titleAccent: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 24,
    paddingHorizontal: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  logoutRow: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoutIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 2,
  },
  logoutSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#F87171',
  },
  bottomPad: {
    height: 32,
  },
});
