import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRewards } from '../../rewards/hooks/useRewards';
import { LEVELS_CONFIG } from '../../rewards/types';
import { useI18n } from '@/hooks/use-i18n';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';

export const RewardsStatusCard = () => {
  const { rewards, loading } = useRewards();
  const { t, isRTL } = useI18n();
  const { theme, colors: themeColors } = useAppTheme();
  const router = useRouter();

  if (loading || !rewards) return null;

  const currentLevel = LEVELS_CONFIG.find(l => l.level === rewards.currentLevel) || LEVELS_CONFIG[0];

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: themeColors.card }]}
      onPress={() => router.push('/rewards' as any)}
    >
      <View style={[styles.iconContainer, { backgroundColor: themeColors.primary }]}>
        <Ionicons name="gift" size={24} color="#FFF" />
      </View>
      
      <View style={styles.info}>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>
          {isRTL ? 'مستوى الولاء' : 'Loyalty Level'}
        </Text>
        <Text style={[styles.levelTitle, { color: themeColors.text }]}>
          {currentLevel.title}
        </Text>
      </View>

      <View style={styles.pointsContainer}>
        <Text style={[styles.points, { color: themeColors.primary }]}>{rewards.totalPoints}</Text>
        <Text style={[styles.ptsLabel, { color: themeColors.textSecondary }]}>{isRTL ? 'نقطة' : 'PTS'}</Text>
        <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} style={{ marginLeft: 4 }} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  points: {
    fontSize: 20,
    fontWeight: '800',
    marginRight: 4,
  },
  ptsLabel: {
    fontSize: 12,
    fontWeight: '700',
  }
});
