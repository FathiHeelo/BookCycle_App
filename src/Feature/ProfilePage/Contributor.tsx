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
  punctuality?: number; // 0 to 100
  bookCondition?: number; // 0 to 5
}

export default function ContributorCard({ punctuality = 100, bookCondition = 4.8 }: ContributorCardProps) {
  const { width } = useWindowDimensions();
  const { t, isRTL } = useI18n();
  const cardPadding = Math.min(width * 0.06, 24);

  const getPunctualityStatement = (val: number) => {
    if (val >= 100) return t('profile.reliability.punctualityStatements.always');
    if (val >= 90) return t('profile.reliability.punctualityStatements.veryReliable');
    if (val >= 75) return t('profile.reliability.punctualityStatements.generally');
    return t('profile.reliability.punctualityStatements.improving');
  };

  const getConditionStatement = (val: number) => {
    if (val >= 4.5) return t('profile.reliability.conditionStatements.excellent');
    if (val >= 3.5) return t('profile.reliability.conditionStatements.good');
    if (val >= 2.5) return t('profile.reliability.conditionStatements.fair');
    return t('profile.reliability.conditionStatements.improving');
  };

  const textAlign = isRTL ? 'right' : 'left';

  return (
    <View style={[styles.cardContainer, { padding: cardPadding }]}>
      <Text style={[styles.headerTitle, { textAlign }]}>{t('profile.reliability.title')}</Text>

      {/* Punctuality Section */}
      <View style={styles.statSection}>
        <View style={[styles.statHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.labelRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons name="time-outline" size={24} color="#85700D" />
            <Text style={[styles.statLabel, { textAlign }]}>{t('profile.reliability.punctuality')}</Text>
          </View>
          <Text style={styles.statValue}>{punctuality}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${punctuality}%`, alignSelf: isRTL ? 'flex-end' : 'flex-start' }]} />
        </View>
        <Text style={[styles.description, { textAlign }]}>{getPunctualityStatement(punctuality)}</Text>
      </View>

      {/* Book Condition Section */}
      <View style={styles.statSection}>
        <View style={[styles.statHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.labelRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons name="book-outline" size={24} color="#85700D" />
            <Text style={[styles.statLabel, { textAlign }]}>{t('profile.reliability.bookCondition')}</Text>
          </View>
          <Text style={styles.statValue}>{bookCondition}/5</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${(bookCondition / 5) * 100}%`, alignSelf: isRTL ? 'flex-end' : 'flex-start' }]} />
        </View>
        <Text style={[styles.description, { textAlign }]}>{getConditionStatement(bookCondition)}</Text>
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
    fontSize: 24,
    fontWeight: '800',
    color: '#001B39',
    marginBottom: 24,
  },
  statSection: {
    marginBottom: 24,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#001B39',
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#001B39',
    borderRadius: 6,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    lineHeight: 20,
  },
});
