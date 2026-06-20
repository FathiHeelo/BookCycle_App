import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useI18n } from '@/hooks/use-i18n';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAppTheme } from '@/context/ThemeContext';
import { useUniversity } from '@/context/UniversityContext';

export default function WelcomeScreen() {
  const { t } = useI18n();
  const { theme: themeKey } = useAppTheme();
  const themeColors = Colors[themeKey];
  const { selectedUniversity } = useUniversity();
  const isLive = selectedUniversity.mode === 'live';

  // مصفوفة الميزات مع استخدام نصوص مترجمة
  const WELCOME_FEATURES = [
    {
      id: '1',
      icon: 'book',
      title: t('welcome.features.exchangeTitle'),
      description: t('welcome.features.exchangeDesc'),
    },
    {
      id: '2',
      icon: 'leaf',
      title: t('welcome.features.ecoTitle'),
      description: t('welcome.features.ecoDesc'),
    },
  ];

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: themeColors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* صف أيقونة اللغة والدارك مود في الأعلى */}
        <View style={styles.topActions}>
           <ThemeToggle />
           <LanguageToggle />
        </View>

        {/* University chip */}
        <Pressable
          style={[styles.universityChip, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
          onPress={() => router.push('/university-select' as any)}
        >
          <Text style={styles.chipFlag}>{selectedUniversity.flag}</Text>
          <View style={styles.chipTextBlock}>
            <Text style={[styles.chipName, { color: themeColors.text }]} numberOfLines={1}>
              {selectedUniversity.shortName}
            </Text>
            <View style={[styles.chipBadge, { backgroundColor: isLive ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)' }]}>
              <View style={[styles.chipDot, { backgroundColor: isLive ? '#10B981' : '#F59E0B' }]} />
              <Text style={[styles.chipBadgeText, { color: isLive ? '#10B981' : '#F59E0B' }]}>
                {isLive ? 'Live' : 'Preview'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={14} color={themeColors.textSecondary} />
        </Pressable>

        <View style={styles.header}>
          <View style={styles.brandingContainer}>
            <Ionicons name="book" size={24} color={themeColors.primary} />
            <Text style={[styles.appName, { color: themeColors.primary }]}>BookCycle</Text>
          </View>
          
          <View style={styles.welcomeTextContainer}>
            <Text style={[styles.welcomeTitle, { color: themeColors.text }]}>
                {t('welcome.title')}
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: themeColors.textSecondary }]}>
                {t('welcome.subtitle')}
            </Text>
          </View>
        </View>

        <View style={styles.cardsContainer}>
          {WELCOME_FEATURES.map(feature => (
            <View key={feature.id} style={[styles.card, { backgroundColor: themeColors.card }]}>
              <View style={[styles.cardIconWrapper, { backgroundColor: themeKey === 'dark' ? themeColors.background : '#FFFFFF' }]}>
                <Ionicons name={feature.icon as any} size={24} color={themeColors.primary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: themeColors.text }]}>{feature.title}</Text>
                <Text style={[styles.cardText, { color: themeColors.textSecondary }]}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, { backgroundColor: themeColors.primary }, pressed && { opacity: 0.9 }]}
            onPress={() => router.push('/signup')}
          >
            <View style={styles.btnContent}>
              <Text style={[styles.primaryBtnText, { color: themeKey === 'dark' ? '#0B1020' : '#FFF' }]}>{t('auth.login.signupButton')}</Text>
              <Ionicons name="arrow-forward" size={18} color={themeKey === 'dark' ? '#0B1020' : '#FFF'} style={{ marginLeft: 8 }} />
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, { backgroundColor: themeKey === 'dark' ? themeColors.card : '#F1F4F7' }, pressed && { opacity: 0.9 }]}
            onPress={() => router.push('/login')}
          >
            <View style={styles.btnContent}>
              <Text style={[styles.secondaryBtnText, { color: themeColors.text }]}>{t('auth.login.loginButton')}</Text>
              <Ionicons name="arrow-forward-outline" size={18} color={themeColors.text} style={{ marginLeft: 8 }} />
            </View>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>{t('welcome.footer')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { 
    flexGrow: 1, 
    paddingHorizontal: Spacing.xl, 
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 40,
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    gap: 12,
  },
  header: { width: '100%', marginBottom: Spacing.xxl },
  brandingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: -0.5,
  },
  welcomeTextContainer: {
    marginTop: Spacing.sm,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  cardsContainer: { width: '100%', gap: 16, marginBottom: 40 },
  card: {
    backgroundColor: '#F1F4F7',
    borderRadius: Radius.md,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  cardText: { fontSize: 14, color: '#8E9BAE', lineHeight: 20, fontWeight: '500' },
  buttonContainer: { width: '100%', gap: 12 },
  primaryBtn: {
    backgroundColor: '#001B39',
    borderRadius: Radius.md,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  secondaryBtn: {
    backgroundColor: '#F1F4F7',
    borderRadius: Radius.md,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#001B39', fontSize: 16, fontWeight: '800' },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  universityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 8,
    marginBottom: 16,
  },
  chipFlag: {
    fontSize: 18,
  },
  chipTextBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipName: {
    fontSize: 13,
    fontWeight: '700',
  },
  chipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 99,
    gap: 3,
  },
  chipDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  chipBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
});