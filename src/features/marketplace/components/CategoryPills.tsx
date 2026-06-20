import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/hooks/use-i18n';
import { OfferCategory } from '../types';

interface CategoryPillsProps {
  selectedCategory: OfferCategory | 'all';
  onSelectCategory: (category: OfferCategory | 'all') => void;
}

const CATEGORIES: (OfferCategory | 'all')[] = [
  'all',
  'books',
  'stationery',
  'printing',
  'tools',
  'electronics',
  'bundles',
];

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const { theme } = useAppTheme();
  const themeColors = Colors[theme];
  const { t, isRTL } = useI18n();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          const label = t(`marketplace.categories.${cat}`, cat.toUpperCase());
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => onSelectCategory(cat)}
              activeOpacity={0.8}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? themeColors.primary : themeColors.surface,
                  borderColor: isActive ? themeColors.primary : themeColors.border,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  {
                    color: isActive ? '#FFFFFF' : themeColors.text,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 14,
  },
});
