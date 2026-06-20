import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/context/ThemeContext';
import { useUniversity } from '@/context/UniversityContext';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { UNIVERSITIES, University } from '@/src/config/universities';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useI18n } from '@/hooks/use-i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function UniversitySelectScreen() {
  const { theme: themeKey } = useAppTheme();
  const themeColors = Colors[themeKey];
  const { selectUniversity, selectedUniversity } = useUniversity();
  const { t, isRTL } = useI18n();
  const flexDirection = isRTL ? 'row-reverse' : 'row';

  const [selected, setSelected] = useState<string>(selectedUniversity.id);
  const [saving, setSaving] = useState(false);

  const activeUniversities = UNIVERSITIES.filter((u) => u.isActive && u.mode !== 'disabled');

  const handleConfirm = async () => {
    setSaving(true);
    await selectUniversity(selected);
    setSaving(false);
    router.replace('/welcome');
  };

  return (
    <View style={[styles.flex, { backgroundColor: themeColors.background }]}>
      {/* Gradient header */}
      <LinearGradient
        colors={themeKey === 'dark' ? ['#0B1020', '#111827'] : ['#001B39', '#003366']}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.topRow}>
              <View style={styles.brandRow}>
                <Ionicons name="book" size={22} color="#F59E0B" />
                <Text style={styles.brandText}>BookCycle</Text>
              </View>
              <View style={styles.topActions}>
                <ThemeToggle />
                <LanguageToggle />
              </View>
            </View>

            <Text style={[styles.headerTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('university.select.title', 'Choose Your University')}</Text>
            <Text style={[styles.headerSubtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('university.select.subtitle', 'Your university determines which books, resources, and offers are available to you.')}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* University cards */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: themeColors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('university.select.sectionLabel', 'SELECT YOUR INSTITUTION')}
        </Text>

        {activeUniversities.map((uni) => {
          const isSelected = selected === uni.id;
          const isLive = uni.mode === 'live';

          return (
            <Pressable
              key={uni.id}
              style={({ pressed }) => [
                styles.uniCard,
                {
                  backgroundColor: themeColors.card,
                  borderColor: isSelected ? uni.primaryColor : themeColors.border,
                  borderWidth: isSelected ? 2.5 : 1,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}
              onPress={() => setSelected(uni.id)}
            >
              {/* Selected indicator */}
              {isSelected && (
                <View style={[styles.selectedRibbon, { backgroundColor: uni.primaryColor }]}>
                  <Ionicons name="checkmark" size={12} color="#FFF" />
                </View>
              )}

              <View style={styles.cardInner}>
                {/* Logo */}
                <View
                  style={[
                    styles.logoCircle,
                    { backgroundColor: uni.primaryColor + '20', borderColor: uni.primaryColor + '40' },
                  ]}
                >
                  <Text style={styles.logoFlag}>{uni.flag}</Text>
                </View>

                {/* Info */}
                <View style={styles.uniInfo}>
                  <View style={styles.uniNameRow}>
                    <Text
                      style={[
                        styles.uniName,
                        { color: themeColors.text },
                      ]}
                      numberOfLines={1}
                    >
                      {uni.name}
                    </Text>
                  </View>

                  <Text style={[styles.uniCountry, { color: themeColors.textSecondary }]}>
                    {uni.country}
                  </Text>

                  <View style={styles.badgeRow}>
                    <View
                      style={[
                        styles.modeBadge,
                        {
                          backgroundColor: isLive
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(245, 158, 11, 0.15)',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.modeDot,
                          { backgroundColor: isLive ? '#10B981' : '#F59E0B' },
                        ]}
                      />
                      <Text
                        style={[
                          styles.modeBadgeText,
                          { color: isLive ? '#10B981' : '#F59E0B' },
                        ]}
                      >
                        {isLive ? t('university.mode.live', 'Live Environment') : t('university.mode.preview', 'Partner Preview')}
                      </Text>
                    </View>

                    <View style={[styles.domainBadge, { backgroundColor: themeColors.surface }]}>
                      <Ionicons name="mail-outline" size={10} color={themeColors.textSecondary} />
                      <Text style={[styles.domainText, { color: themeColors.textSecondary }]}>
                        @{uni.domain}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Radio */}
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: isSelected ? uni.primaryColor : themeColors.border,
                      backgroundColor: isSelected ? uni.primaryColor : 'transparent',
                    },
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </View>

              {/* Preview disclaimer */}
              {!isLive && isSelected && (
                <View style={[styles.previewNote, { backgroundColor: '#F59E0B10', flexDirection }]}>
                  <Ionicons name="information-circle-outline" size={14} color="#F59E0B" />
                  <Text style={[styles.previewNoteText, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('university.select.previewDisclaimer', 'This is a prototype environment. Content will be activated after official partnership approval.')}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}

        {/* Info note */}
        <View style={[styles.infoBox, { backgroundColor: themeColors.surface, flexDirection }]}>
          <Ionicons name="swap-horizontal-outline" size={18} color={themeColors.textSecondary} />
          <Text style={[styles.infoText, { color: themeColors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('university.select.changeNote', 'You can change your university later from your profile settings.')}
          </Text>
        </View>
      </ScrollView>

      {/* Confirm button */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: themeColors.card,
            borderTopColor: themeColors.border,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.confirmBtn,
            {
              backgroundColor:
                UNIVERSITIES.find((u) => u.id === selected)?.primaryColor ?? '#001B39',
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          onPress={handleConfirm}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <View style={[styles.btnContent, { flexDirection }]}>
              <Text style={styles.confirmBtnText}>{t('university.select.confirmButton', 'Continue with Selected University')}</Text>
              <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={18} color="#FFF" style={isRTL ? { marginRight: 8 } : { marginLeft: 8 }} />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerGradient: {
    paddingBottom: Spacing.xl,
  },
  headerContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Platform.OS === 'android' ? Spacing.md : 0,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  uniCard: {
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  selectedRibbon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFlag: {
    fontSize: 28,
  },
  uniInfo: {
    flex: 1,
  },
  uniNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  uniName: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  uniCountry: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    gap: 4,
  },
  modeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  domainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    gap: 3,
  },
  domainText: {
    fontSize: 10,
    fontWeight: '600',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFF',
  },
  previewNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    paddingTop: 4,
  },
  previewNoteText: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.md,
    borderTopWidth: 1,
  },
  confirmBtn: {
    height: 56,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
