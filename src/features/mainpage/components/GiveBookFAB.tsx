import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Radius, Spacing } from '@/constants/theme';
import { GiveBookFABProps } from '../types';
import { TITLES } from '../constants';
import { useRouter } from 'expo-router';

export const GiveBookFAB: React.FC<GiveBookFABProps> = ({ isRTL, theme }) => {
  const router = useRouter();
  
  return (
    <TouchableOpacity 
      style={[
        styles.fab, 
        { 
          backgroundColor: theme.primary,
          flexDirection: isRTL ? 'row-reverse' : 'row',
          right: isRTL ? undefined : 24,
          left: isRTL ? 24 : undefined,
        }
      ]}
      onPress={() => router.push('/Add_Books')}
      activeOpacity={0.9}
    >
      <Ionicons name="add-circle" size={24} color={theme.background} />
      <Text style={[styles.fabText, { color: theme.background }]}>
        {isRTL ? 'أهدِ كتاباً' : 'Give a book'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 85,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: Radius.pill,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  fabText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
