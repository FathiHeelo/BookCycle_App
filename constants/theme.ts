import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#001B39',        // Deep Navy from mockup
    background: '#FFFFFF',     // Clean White
    surface: '#F1F4F7',        // Soft Gray-Blue for inputs/secondary buttons
    text: '#1A1A1A',           // Dark Charcoal
    textSecondary: '#8E9BAE',  // Light Gray for placeholders
    border: '#E5E7EB',
    error: '#DC2626',
    success: '#10B981',
    tint: '#001B39',
    card: '#FFFFFF',
    icon: '#8E9BAE',
    tabIconDefault: '#8E9BAE',
    tabIconSelected: '#001B39',
  },
  dark: {
    primary: '#4D80B3',        // Softer Blue for Dark Mode
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: '#334155',
    error: '#EF4444',
    success: '#34D399',
    tint: '#4D80B3',
    card: '#1E293B',
    icon: '#94A3B8',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#4D80B3',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 4,
  md: 12,      // Modern rounded corners for inputs
  lg: 20,
  xl: 28,
  pill: 99,    // Perfect for buttons
};

export const Fonts = {
  bold: 'Inter_700Bold',
  semiBold: 'Inter_600SemiBold',
  regular: 'Inter_400Regular',
  rounded: 'Outfit_Bold',
};
