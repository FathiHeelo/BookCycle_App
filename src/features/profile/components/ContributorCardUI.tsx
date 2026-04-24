import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStyles as styles } from '../styles';
import { UserStats } from '../types';
import { useI18n } from '@/hooks/use-i18n';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

interface Props { stats: UserStats; }

export const ContributorCardUI = ({ stats }: Props) => {
  const { width } = useWindowDimensions();
  const { t, isRTL } = useI18n();
  const { theme: themeKey } = useAppTheme();
  const themeColors = Colors[themeKey];
  const cardPadding = Math.min(width * 0.06, 24);
  const textAlign = isRTL ? 'right' : 'left';
  const isDark = themeKey === 'dark';

  const safeRating = stats?.rating || 0;
  const safeReliability = stats?.reliability || 0;
  const safeImpact = stats?.impact || 0;

  const getReliabilityStatement = (val: number) => {
    if (val === 0) return isRTL ? 'لم يتم تقييمك بعد' : 'Not rated yet';
    if (val >= 90) return t('profile.reliability.punctualityStatements.veryReliable');
    if (val >= 75) return t('profile.reliability.punctualityStatements.generally');
    return t('profile.reliability.punctualityStatements.improving');
  };

  const getRatingStatement = (val: number) => {
    if (val === 0) return isRTL ? 'ابدأ بمشاركة المصادر لرفع تقييمك' : 'Start sharing to build your rating';
    if (val >= 4.5) return t('profile.reliability.conditionStatements.excellent');
    if (val >= 3.5) return t('profile.reliability.conditionStatements.good');
    return t('profile.reliability.conditionStatements.fair');
  };

  return (
    <View style={[styles.contributorCardContainer, { padding: cardPadding, backgroundColor: themeColors.card, shadowColor: isDark ? '#000' : '#000', elevation: isDark ? 0 : 5 }]}>
      <Text style={[styles.headerTitle, { textAlign, color: themeColors.text }]}>
        {isRTL ? 'موثوقية وتأثير المساهم' : 'Contributor Reliability & Impact'}
      </Text>

      {/* Rating */}
      <View style={styles.statSection}>
        <View style={[styles.statHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.labelRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons name="star-outline" size={24} color={themeColors.primary} />
            <Text style={[styles.statLabel, { textAlign, color: themeColors.text }]}>{isRTL ? 'تقييم الطلاب لك' : 'Student Rating'}</Text>
          </View>
          <Text style={[styles.statValue, { color: themeColors.primary }]}>{safeRating.toFixed(1)}/5</Text>
        </View>
        <View style={[styles.progressBarBg, { backgroundColor: isDark ? themeColors.background : '#F3F4F6' }]}>
          <View style={[styles.progressBarFill, { width: `${(safeRating / 5) * 100}%`, alignSelf: isRTL ? 'flex-end' : 'flex-start', backgroundColor: themeColors.primary }]} />
        </View>
        <Text style={[styles.description, { textAlign, color: themeColors.textSecondary }]}>{getRatingStatement(safeRating)}</Text>
      </View>

      {/* Reliability */}
      <View style={styles.statSection}>
        <View style={[styles.statHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.labelRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons name="shield-checkmark-outline" size={24} color={themeColors.primary} />
            <Text style={[styles.statLabel, { textAlign, color: themeColors.text }]}>{isRTL ? 'موثوقية المواعيد' : 'Punctuality Reliability'}</Text>
          </View>
          <Text style={[styles.statValue, { color: themeColors.primary }]}>{safeReliability}%</Text>
        </View>
        <View style={[styles.progressBarBg, { backgroundColor: isDark ? themeColors.background : '#F3F4F6' }]}>
          <View style={[styles.progressBarFill, { width: `${safeReliability}%`, alignSelf: isRTL ? 'flex-end' : 'flex-start', backgroundColor: themeColors.primary }]} />
        </View>
        <Text style={[styles.description, { textAlign, color: themeColors.textSecondary }]}>{getReliabilityStatement(safeReliability)}</Text>
      </View>

      {/* Impact */}
      <View style={[styles.impactCard, { flexDirection: isRTL ? 'row-reverse' : 'row', backgroundColor: themeColors.primary }]}>
        <View style={[styles.impactIconContainer, { backgroundColor: isDark ? 'rgba(11,16,32,0.2)' : 'rgba(255,255,255,0.2)' }]}>
          <Ionicons name="people" size={28} color={isDark ? '#0B1020' : '#fff'} />
        </View>
        <View style={[styles.impactInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.impactTitle, { color: isDark ? 'rgba(11,16,32,0.7)' : 'rgba(255,255,255,0.7)' }]}>{isRTL ? 'الأثر المجتمعي' : 'Community Impact'}</Text>
          <Text style={[styles.impactValue, { color: isDark ? '#0B1020' : '#fff' }]}>
            {isRTL ? `لقد ساعدت ${safeImpact} زملاء` : `You helped ${safeImpact} colleagues`}
          </Text>
        </View>
      </View>
    </View>
  );
};
