import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStyles as styles } from '../styles';
import { UserStats } from '../types';
import { useI18n } from '@/hooks/use-i18n';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

interface Props { stats: UserStats; }

export const TotalBookCardUI = ({ stats }: Props) => {
  const { width } = useWindowDimensions();
  const { t, isRTL } = useI18n();
  const { theme: themeKey, isAccessible, colors: themeColors } = useAppTheme();

  const cardPadding = Math.min(width * 0.06, 24);
  const titleFontSize = Math.min(width * 0.085, 36);
  const textAlign = isRTL ? 'right' : 'left';
  const isDark = themeKey === 'dark';

  return (
    <View style={[styles.totalBookCardContainer, { 
      padding: cardPadding, 
      backgroundColor: themeColors.primary, 
      shadowColor: isDark ? '#000' : '#001B39', 
      elevation: isDark ? 0 : 10,
      borderWidth: isAccessible ? 3 : 0,
      borderColor: '#FFF'
    }]}>
      <View style={[styles.watermarkIcon, isRTL ? { left: -10 } : { right: -10 }]} pointerEvents="none">
        <Ionicons name="heart" size={130} color={isDark ? "rgba(11,16,32,0.07)" : "rgba(255,255,255,0.07)"} />
      </View>
      <Text style={[styles.totalLabel, { textAlign, color: isDark ? '#0B1020' : '#FFFFFF', opacity: isAccessible ? 1 : 0.65, fontWeight: isAccessible ? '900' : '600' }]}>{t('profile.stats.communityImpact')}</Text>
      <Text style={[styles.totalTitle, { fontSize: titleFontSize, textAlign, color: isDark ? '#0B1020' : '#FFFFFF', fontWeight: isAccessible ? '900' : '800' }]}>
        {t('profile.stats.totalBooks')}{'\n'}
        {t('profile.stats.given')}: {stats.totalGiven}
      </Text>
      <Text style={[styles.totalSavings, { textAlign, color: isDark ? '#0B1020' : '#FFFFFF', opacity: isAccessible ? 1 : 0.65, fontWeight: isAccessible ? '900' : '500' }]}>
        {isRTL ? `لقد حصلت أيضاً على ${stats.totalReceived} مصادر` : `You also received ${stats.totalReceived} resources`}
      </Text>
    </View>
  );
};
