import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#001B39',        // Deep Navy
    background: '#FFFFFF',     // Clean White
    surface: '#F1F4F7',        // Soft Gray-Blue
    text: '#1A1A1A',           // Dark Charcoal
    textSecondary: '#8E9BAE',  // Light Gray
    border: '#E5E7EB',
    error: '#DC2626',
    success: '#10B981',
    tint: '#001B39',
    card: '#FFFFFF',
    icon: '#8E9BAE',
    tabIconDefault: '#8E9BAE',
    tabIconSelected: '#001B39',
    accent: '#0EA5E9',         // Added for type consistency
  },
  dark: {
    background: '#0B1020',
    surface: '#111827',
    card: '#172033',
    primary: '#F59E0B',      // Changed from Blue to Vibrant Gold/Yellow
    accent: '#38BDF8',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: 'rgba(148,163,184,0.18)',
    error: '#EF4444',
    success: '#34D399',
    tint: '#F59E0B',         // Updated to match primary
    icon: '#94A3B8',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#F59E0B', // Updated to match primary
  },
  accessible: {
    light: {
      primary: '#000000',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: '#000000',
      textSecondary: '#475569',
      border: '#000000',
      error: '#000000',      // High contrast
      success: '#0055FF',    // Strong Blue
      tint: '#000000',
      card: '#FFFFFF',
      icon: '#000000',
      tabIconDefault: '#475569',
      tabIconSelected: '#000000',
      accent: '#EAB308',     // Vibrant Yellow
    },
    dark: {
      primary: '#FFFFFF',
      background: '#000000',
      surface: '#0F172A',
      text: '#FFFFFF',
      textSecondary: '#CBD5E1',
      border: '#FFFFFF',
      error: '#FFFFFF',      // High contrast
      success: '#38BDF8',    // Sky Blue
      tint: '#FFFFFF',
      card: '#111827',
      icon: '#FFFFFF',
      tabIconDefault: '#94A3B8',
      tabIconSelected: '#FFFFFF',
      accent: '#FDE047',     // Bright Yellow
    },
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
