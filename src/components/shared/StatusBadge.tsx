import React from 'react';
import { View, Text } from 'react-native';
import { StatusBadgeStyles as styles } from './styles';
import { StatusBadgeProps } from './types';

export const StatusBadge = ({ status, isRTL = false }: StatusBadgeProps) => {
  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'requested': return isRTL ? 'قيد الطلب' : 'Requested';
      case 'received':
      case 'completed': return isRTL ? 'تم التسليم' : 'Given away';
      default: return isRTL ? 'نشط' : 'Active';
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'requested': return '#F59E0B';
      case 'received':
      case 'completed': return '#10B981';
      default: return '#3B82F6';
    }
  };

  const color = getStatusColor(status);

  return (
    <View style={[styles.badge, { backgroundColor: color + '15', alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>
        {getStatusLabel(status)}
      </Text>
    </View>
  );
};
