import React from 'react';
import { View, Text } from 'react-native';
import { StatusBadgeStyles as styles } from './styles';
import { StatusBadgeProps } from './types';
import { useAppTheme } from '@/context/ThemeContext';

export const StatusBadge = ({ status, isRTL = false }: StatusBadgeProps) => {
  const { colors, isAccessible } = useAppTheme();

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'requested': return isRTL ? 'قيد الطلب' : 'Requested';
      case 'received':
      case 'completed': return isRTL ? 'تم التسليم' : 'Given away';
      default: return isRTL ? 'نشط' : 'Active';
    }
  };

  const getStatusColor = (s: string) => {
    if (isAccessible) {
      switch (s) {
        case 'requested': return colors.accent; // Yellow
        case 'received':
        case 'completed': return colors.success; // Blue
        default: return colors.primary;
      }
    }
    switch (s) {
      case 'requested': return '#F59E0B';
      case 'received':
      case 'completed': return '#10B981';
      default: return '#3B82F6';
    }
  };

  const color = getStatusColor(status);

  return (
    <View style={[styles.badge, { 
      backgroundColor: color + (isAccessible ? '25' : '15'), 
      alignSelf: isRTL ? 'flex-end' : 'flex-start',
      borderWidth: isAccessible ? 1.5 : 0,
      borderColor: color
    }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color, fontWeight: isAccessible ? '800' : '600' }]}>
        {getStatusLabel(status)}
      </Text>
    </View>
  );
};
