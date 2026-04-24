import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Radius, Spacing } from '@/constants/theme';
import { FacultyScrollerProps } from '../types';
import { TITLES } from '../constants';

export const FacultyScroller: React.FC<FacultyScrollerProps> = ({ 
  faculties, 
  selectedIds, 
  onToggle, 
  isRTL, 
  theme,
  t
}) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
      >
        {faculties.map((faculty) => {
          const isSelected = selectedIds.includes(faculty.id);
          const label = faculty.id === 'all' 
            ? (isRTL ? TITLES.UNI_REQUIREMENTS_AR : TITLES.UNI_REQUIREMENTS_EN)
            : t(`faculties.${faculty.id}`);

          return (
            <TouchableOpacity
              key={faculty.id}
              style={[
                styles.chip, 
                { 
                  backgroundColor: isSelected ? theme.primary : theme.card,
                  borderColor: isSelected ? theme.primary : theme.border,
                  flexDirection: isRTL ? 'row-reverse' : 'row'
                }
              ]}
              onPress={() => onToggle(faculty.id)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={faculty.icon as any} 
                size={16} 
                color={isSelected ? theme.background : theme.primary} 
              />
              <Text style={[styles.chipText, { color: isSelected ? theme.background : theme.text }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
