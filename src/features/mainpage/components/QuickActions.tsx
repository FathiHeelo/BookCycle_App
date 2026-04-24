import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { router } from 'expo-router';

interface QuickActionsProps {
  isRTL: boolean;
  themeColors: any;
  themeKey: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ isRTL, themeColors, themeKey }) => {
  return (
    <View style={styles.section}>
      <ThemedText style={[styles.sectionTitle, { color: themeColors.text }]}>Quick Actions</ThemedText>
      <View style={styles.actionGrid}>
        <Pressable
          style={[styles.actionCard, { 
            backgroundColor: themeColors.card, 
            shadowColor: themeKey === 'dark' ? '#000' : '#E5E7EB', 
            elevation: themeKey === 'dark' ? 0 : 2 
          }]}
          onPress={() => router.push('/(tabs)/Add_Books')}
        >
          <View style={[styles.iconCircle, { backgroundColor: themeColors.primary + '15' }]}>
            <Ionicons name="add" size={24} color={themeColors.primary} />
          </View>
          <ThemedText style={[styles.actionLabel, { color: themeColors.text }]}>
            {isRTL ? 'إضافة مادة' : 'Add Material'}
          </ThemedText>
        </Pressable>
        
        <Pressable 
          style={[styles.actionCard, { 
            backgroundColor: themeColors.card, 
            shadowColor: themeKey === 'dark' ? '#000' : '#E5E7EB', 
            elevation: themeKey === 'dark' ? 0 : 2 
          }]}
          onPress={() => router.push('/(tabs)/my-requests')}
        >
          <View style={[styles.iconCircle, { backgroundColor: themeColors.accent ? themeColors.accent + '15' : 'rgba(245,158,11,0.1)' }]}>
            <Ionicons name="mail-outline" size={24} color={themeColors.accent || '#F59E0B'} />
          </View>
          <ThemedText style={[styles.actionLabel, { color: themeColors.text }]}>
            {isRTL ? 'الطلبات' : 'Requests'}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
});
