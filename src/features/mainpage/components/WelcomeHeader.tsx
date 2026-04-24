import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

interface WelcomeHeaderProps {
  userName: string;
  themeColors: any;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ userName, themeColors }) => {
  return (
    <View style={styles.welcomeInfo}>
      <ThemedText style={[styles.welcomeText, { color: themeColors.textSecondary }]}>Welcome back,</ThemedText>
      <ThemedText style={[styles.userName, { color: themeColors.text }]}>{userName}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  welcomeInfo: {
    marginBottom: Spacing.xl,
  },
  welcomeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
  },
});
