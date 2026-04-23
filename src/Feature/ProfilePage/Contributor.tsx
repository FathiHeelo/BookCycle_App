import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/hooks/use-i18n';

interface ContributorCardProps {
  stats: {
    rating: number;
    reliability: number;
    impact: number;
    totalGiven?: number;
    totalReceived?: number;
  };
}

export default function ContributorCard({ stats }: ContributorCardProps) {
  const { width } = useWindowDimensions();
  const { t, isRTL } = useI18n();
  const cardPadding = Math.min(width * 0.06, 24);

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

  const textAlign = isRTL ? 'right' : 'left';
  
  // Safe fallbacks to prevent undefined errors
  const safeRating = stats?.rating || 0;
  const safeReliability = stats?.reliability || 0;
  const safeImpact = stats?.impact || 0;

  return (
    <View style={[styles.cardContainer, { padding: cardPadding }]}>
      <Text style={[styles.headerTitle, { textAlign }]}>
        {isRTL ? 'موثوقية وتأثير المساهم' : 'Contributor Reliability & Impact'}
      </Text>

      {/* Rating Section */}
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

      {/* Reliability Section */}
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

      {/* Community Impact Section */}
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
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    width: '100%',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#001B39',
    marginBottom: 24,
  },
  statSection: {
    marginBottom: 24,
  },
  statHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelRow: {
    alignItems: 'center',
    gap: 12,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#001B39',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#001B39',
    borderRadius: 5,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    lineHeight: 18,
  },
  impactCard: {
    backgroundColor: '#001B39',
    borderRadius: 20,
    padding: 20,
    marginTop: 8,
    alignItems: 'center',
    gap: 16,
  },
  impactIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  impactInfo: {
    flex: 1,
  },
  impactTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginBottom: 4,
  },
  impactValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '800',
  },
});
