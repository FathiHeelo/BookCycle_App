import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/hooks/use-i18n';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { SettingsStyles as styles } from '../styles';
import { SUPPORTED_LANGUAGES } from '@/src/i18n/languages';

export const LanguageSwitcherUI = () => {
  const { locale, isRTL, changeLanguage } = useI18n();
  const { theme } = useAppTheme();
  const themeColors = Colors[theme];

  const textAlign = isRTL ? 'right' : 'left';
  const rowDir = isRTL ? 'row-reverse' : 'row';

  const OptionRow = ({
    label, subLabel, selected, onPress, leftIcon, showBorder,
  }: { label: string; subLabel: string; selected: boolean; onPress: () => void; leftIcon: string; showBorder?: boolean }) => (
    <Pressable
      style={({ pressed }) => [
        styles.optionRow,
        { flexDirection: rowDir, borderBottomWidth: showBorder ? 1 : 0, borderBottomColor: themeColors.border, opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.optionLeftSection, { flexDirection: rowDir }]}>
        <Ionicons name={leftIcon as any} size={20} color={selected ? themeColors.primary : themeColors.textSecondary} />
        <View style={{ flex: 1, marginLeft: rowDir === 'row' ? 12 : 0, marginRight: rowDir === 'row-reverse' ? 12 : 0 }}>
          <Text style={[
            styles.optionLabel,
            {
              color: selected ? themeColors.text : themeColors.textSecondary,
              fontWeight: selected ? '700' : '500',
              textAlign,
            }
          ]}>
            {label}
          </Text>
          <Text style={{
            fontSize: 12,
            color: themeColors.textSecondary,
            textAlign,
            marginTop: 2,
          }}>
            {subLabel}
          </Text>
        </View>
      </View>
      {selected && (
        <View style={[styles.checkBadge, { backgroundColor: themeColors.primary }]}>
          <Ionicons name="checkmark" size={16} color={theme === 'dark' ? '#0B1020' : '#fff'} />
        </View>
      )}
    </Pressable>
  );

  return (
    <View>
      {SUPPORTED_LANGUAGES.map((language, index) => {
        const isSelected = locale === language.code || (locale && locale.startsWith(language.code));
        const showBorder = index < SUPPORTED_LANGUAGES.length - 1;
        return (
          <OptionRow
            key={language.code}
            label={language.nativeName}
            subLabel={language.name}
            selected={isSelected}
            onPress={() => changeLanguage(language.code)}
            leftIcon="language-outline"
            showBorder={showBorder}
          />
        );
      })}
    </View>
  );
};
