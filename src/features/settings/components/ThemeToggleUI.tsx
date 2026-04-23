import React from 'react';
import { View, Text, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/hooks/use-i18n';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { SettingsStyles as styles } from '../styles';

export const ThemeToggleUI = () => {
  const { t, isRTL } = useI18n();
  const { isDark, setThemeMode } = useAppTheme();
  const themeColors = Colors[isDark ? 'dark' : 'light'];

  const rowDir = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  return (
    <View style={[styles.themeRow, { flexDirection: rowDir }]}>
      <View style={[styles.themeLeftSection, { flexDirection: rowDir }]}>
        <View style={[styles.themeIconBg, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]}>
          <Ionicons
            name={isDark ? 'moon' : 'sunny'}
            size={20}
            color={isDark ? '#818CF8' : '#F59E0B'}
          />
        </View>
        <View style={{ marginLeft: rowDir === 'row' ? 12 : 0, marginRight: rowDir === 'row-reverse' ? 12 : 0 }}>
          <Text style={[styles.themeLabel, { color: themeColors.text, textAlign }]}>
            {t('settings.darkMode')}
          </Text>
          <Text style={[styles.themeSubtitle, { color: themeColors.textSecondary, textAlign }]}>
            {t('settings.darkModeSubtitle')}
          </Text>
        </View>
      </View>

      <Switch
        value={isDark}
        onValueChange={(value) => setThemeMode(value ? 'dark' : 'light')}
        trackColor={{ false: '#E5E7EB', true: '#001B39' }}
        thumbColor={isDark ? '#4D80B3' : '#FFFFFF'}
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );
};
