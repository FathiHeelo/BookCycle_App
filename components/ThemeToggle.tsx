import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useAppTheme();
  const themeColors = Colors[theme];

  return (
    <TouchableOpacity 
      onPress={toggleTheme} 
      style={[styles.container, { backgroundColor: theme === 'dark' ? themeColors.card : '#F1F4F7' }]}
    >
      <Ionicons 
        name={theme === 'dark' ? 'sunny' : 'moon'} 
        size={20} 
        color={themeColors.primary} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
