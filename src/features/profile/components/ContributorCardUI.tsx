import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStyles as styles } from '../styles';
import { UserStats } from '../types';
import { useI18n } from '@/hooks/use-i18n';

interface Props { stats: UserStats; }

export const ContributorCardUI = ({ stats }: Props) => {
  const { width } = useWindowDimensions();
  const { t, isRTL } = useI18n();
  const cardPadding = Math.min(width * 0.06, 24);
  const textAlign = isRTL ? 'right' : 'left';

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
    <View style={[styles.contributorCardContainer, { padding: cardPadding }]}>
      <Text style={[styles.headerTitle, { textAlign }]}>
        {isRTL ? 'موثوقية وتأثير المساهم' : 'Contributor Reliability & Impact'}
      </Text>

      {/* Rating */}
      <View style={styles.statSection}>
        <View style={[styles.statHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.labelRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons name="star-outline" size={24} color="#001B39" />
            <Text style={[styles.statLabel, { textAlign }]}>{isRTL ? 'تقييم الطلاب لك' : 'Student Rating'}</Text>
          </View>
          <Text style={styles.statValue}>{safeRating.toFixed(1)}/5</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${(safeRating / 5) * 100}%`, alignSelf: isRTL ? 'flex-end' : 'flex-start' }]} />
        </View>
        <Text style={[styles.description, { textAlign }]}>{getRatingStatement(safeRating)}</Text>
      </View>

      {/* Reliability */}
      <View style={styles.statSection}>
        <View style={[styles.statHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.labelRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#001B39" />
            <Text style={[styles.statLabel, { textAlign }]}>{isRTL ? 'موثوقية المواعيد' : 'Punctuality Reliability'}</Text>
          </View>
          <Text style={styles.statValue}>{safeReliability}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${safeReliability}%`, alignSelf: isRTL ? 'flex-end' : 'flex-start' }]} />
        </View>
        <Text style={[styles.description, { textAlign }]}>{getReliabilityStatement(safeReliability)}</Text>
      </View>

      {/* Impact */}
      <View style={[styles.impactCard, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={styles.impactIconContainer}>
          <Ionicons name="people" size={28} color="#fff" />
        </View>
        <View style={[styles.impactInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Text style={styles.impactTitle}>{isRTL ? 'الأثر المجتمعي' : 'Community Impact'}</Text>
          <Text style={styles.impactValue}>
            {isRTL ? `لقد ساعدت ${safeImpact} زملاء` : `You helped ${safeImpact} colleagues`}
          </Text>
        </View>
      </View>
    </View>
  );
};
