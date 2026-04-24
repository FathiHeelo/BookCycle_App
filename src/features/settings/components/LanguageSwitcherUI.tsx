import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/hooks/use-i18n';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { SettingsStyles as styles } from '../styles';

export const LanguageSwitcherUI = () => {
  const { t, locale, isRTL, changeLanguage } = useI18n();
  const { theme } = useAppTheme();
  const themeColors = Colors[theme];

  const textAlign = isRTL ? 'right' : 'left';
  const rowDir = isRTL ? 'row-reverse' : 'row';
  const isEnglish = locale === 'en' || locale?.startsWith('en');
  const isArabic = locale === 'ar' || locale?.startsWith('ar');

  const OptionRow = ({
    label, selected, onPress, leftIcon, showBorder,
  }: { label: string; selected: boolean; onPress: () => void; leftIcon: string; showBorder?: boolean }) => (
    <Pressable
      style={({ pressed }) => [
        styles.optionRow,
        { flexDirection: rowDir, borderBottomWidth: showBorder ? 1 : 0, borderBottomColor: themeColors.border, opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.optionLeftSection, { flexDirection: rowDir }]}>
        <Ionicons name={leftIcon as any} size={20} color={selected ? '#001B39' : themeColors.textSecondary} />
        <Text style={[
          styles.optionLabel,
          {
            color: selected ? themeColors.text : themeColors.textSecondary,
            fontWeight: selected ? '700' : '500',
            textAlign,
            marginLeft: rowDir === 'row' ? 12 : 0,
            marginRight: rowDir === 'row-reverse' ? 12 : 0,
          }
        ]}>
          {label}
        </Text>
      </View>
      {selected && (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={16} color="#fff" />
        </View>
      )}
    </Pressable>
  );

  return (
    <View>
      <OptionRow
        label={t('settings.english')}
        selected={!!isEnglish}
        onPress={() => changeLanguage('en')}
        leftIcon="language-outline"
        showBorder
      />
      <OptionRow
        label={t('settings.arabic')}
        selected={!!isArabic}
        onPress={() => changeLanguage('ar')}
        leftIcon="text-outline"
      />
    </View>
  );
};
