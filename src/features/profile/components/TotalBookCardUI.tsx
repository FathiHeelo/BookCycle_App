import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStyles as styles } from '../styles';
import { UserStats } from '../types';
import { useI18n } from '@/hooks/use-i18n';

interface Props { stats: UserStats; }

export const TotalBookCardUI = ({ stats }: Props) => {
  const { width } = useWindowDimensions();
  const { t, isRTL } = useI18n();
  const cardPadding = Math.min(width * 0.06, 24);
  const titleFontSize = Math.min(width * 0.085, 36);
  const textAlign = isRTL ? 'right' : 'left';

  return (
    <View style={[styles.totalBookCardContainer, { padding: cardPadding }]}>
      <View style={[styles.watermarkIcon, isRTL ? { left: -10 } : { right: -10 }]} pointerEvents="none">
        <Ionicons name="heart" size={130} color="rgba(255,255,255,0.07)" />
      </View>
      <Text style={[styles.totalLabel, { textAlign }]}>{t('profile.stats.communityImpact')}</Text>
      <Text style={[styles.totalTitle, { fontSize: titleFontSize, textAlign }]}>
        {t('profile.stats.totalBooks')}{'\n'}
        {t('profile.stats.given')}: {stats.totalGiven}
      </Text>
      <Text style={[styles.totalSavings, { textAlign }]}>
        {isRTL ? `لقد حصلت أيضاً على ${stats.totalReceived} مصادر` : `You also received ${stats.totalReceived} resources`}
      </Text>
    </View>
  );
};
