import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/hooks/use-i18n';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import i18n from '@/i18n/config';

export default function LanguageSwitcher() {
  const { t, locale, isRTL, changeLanguage } = useI18n();
  const { theme } = useAppTheme();
  const themeColors = Colors[theme];

  const textAlign = isRTL ? 'right' : 'left';
  const rowDir = isRTL ? 'row-reverse' : 'row';

  const isEnglish = locale === 'en' || locale?.startsWith('en');
  const isArabic = locale === 'ar' || locale?.startsWith('ar');

  const handleSelect = (lang: 'en' | 'ar') => {
    changeLanguage(lang);
  };

  return (
    <View style={styles.wrapper}>
      <OptionRow
        label={t('settings.english')}
        selected={isEnglish}
        onPress={() => handleSelect('en')}
        leftIcon="language-outline"
        textAlign={textAlign}
        rowDir={rowDir}
        themeColors={themeColors}
        showBorder
      />
      <OptionRow
        label={t('settings.arabic')}
        selected={isArabic}
        onPress={() => handleSelect('ar')}
        leftIcon="text-outline"
        textAlign={textAlign}
        rowDir={rowDir}
        themeColors={themeColors}
      />
    </View>
  );
}

function OptionRow({
  label, selected, onPress, leftIcon, textAlign, rowDir, themeColors, showBorder,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  leftIcon: string;
  textAlign: any;
  rowDir: any;
  themeColors: any;
  showBorder?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { flexDirection: rowDir, borderBottomWidth: showBorder ? 1 : 0, borderBottomColor: themeColors.border, opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.leftSection, { flexDirection: rowDir }]}>
        <Ionicons name={leftIcon as any} size={20} color={selected ? '#001B39' : themeColors.textSecondary} />
        <Text style={[styles.optionLabel, {
          color: selected ? themeColors.text : themeColors.textSecondary,
          fontWeight: selected ? '700' : '500',
          textAlign,
          marginLeft: rowDir === 'row' ? 12 : 0,
          marginRight: rowDir === 'row-reverse' ? 12 : 0,
        }]}>
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
}

const styles = StyleSheet.create({
  wrapper: {},
  row: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    alignItems: 'center',
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
  },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#001B39',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
