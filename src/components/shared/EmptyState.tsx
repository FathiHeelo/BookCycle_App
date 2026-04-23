import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmptyStateStyles as styles } from './styles';
import { EmptyStateProps } from './types';

export const EmptyState = ({ iconName, message }: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      <Ionicons name={iconName} size={40} color="#E2E8F0" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};
