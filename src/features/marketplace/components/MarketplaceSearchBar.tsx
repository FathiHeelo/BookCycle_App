import React from 'react';
import { View, StyleSheet, TextInput, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useI18n } from '@/hooks/use-i18n';

interface MarketplaceSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
}

export const MarketplaceSearchBar: React.FC<MarketplaceSearchBarProps> = ({
  value,
  onChangeText,
  onClear,
}) => {
  const { theme, isAccessible } = useAppTheme();
  const themeColors = Colors[theme];
  const { t, isRTL } = useI18n();

  const flexDirection = isRTL ? 'row-reverse' : 'row';

  return (
    <View
      style={[
        styles.searchContainer,
        {
          backgroundColor: theme === 'dark' ? themeColors.card : '#F1F5F9',
          flexDirection,
          borderWidth: isAccessible ? 2 : 0,
          borderColor: themeColors.primary,
        },
      ]}
    >
      <Ionicons name="search" size={18} color={themeColors.textSecondary} />
      <TextInput
        style={[
          styles.searchInput,
          {
            color: themeColors.text,
            textAlign: isRTL ? 'right' : 'left',
          },
        ]}
        placeholder={t('marketplace.searchPlaceholder', 'Search offers...')}
        placeholderTextColor={themeColors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={onClear || (() => onChangeText(''))} style={styles.clearButton}>
          <Ionicons name="close-circle" size={18} color={themeColors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    height: 50,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    height: '100%',
    paddingVertical: 0,
  },
  clearButton: {
    padding: Spacing.xs,
  },
});
