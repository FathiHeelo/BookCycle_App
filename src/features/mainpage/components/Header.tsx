import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HeaderStyles } from '../styles';
import { HeaderProps } from '../types';

export const Header: React.FC<HeaderProps> = ({ title, isRTL, theme, onFilterPress }) => {
  const flexDirection = isRTL ? 'row-reverse' : 'row';

  return (
    <View style={[HeaderStyles.header, { flexDirection }]}>
      <Text style={[HeaderStyles.headerTitle, { color: theme.text }]}>{title}</Text>
      <Pressable 
        style={[HeaderStyles.filterButton, { backgroundColor: theme.card }]}
        onPress={onFilterPress}
      >
        <Ionicons name="options-outline" size={20} color={theme.primary} />
      </Pressable>
    </View>
  );
};
