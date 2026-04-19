import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/hooks/use-i18n';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

export default function ThemeToggle() {
  const { t, isRTL } = useI18n();
  const { isDark, setThemeMode, themeMode } = useAppTheme();
  const themeColors = Colors[isDark ? 'dark' : 'light'];

  const rowDir = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  const handleToggle = (value: boolean) => {
    setThemeMode(value ? 'dark' : 'light');
  };

  return (
    <View style={[styles.row, { flexDirection: rowDir }]}>
      {/* Left icon + label */}
      <View style={[styles.leftSection, { flexDirection: rowDir }]}>
        <View style={[styles.iconBg, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]}>
          <Ionicons
            name={isDark ? 'moon' : 'sunny'}
            size={20}
            color={isDark ? '#818CF8' : '#F59E0B'}
          />
        </View>
        <View style={{ marginLeft: rowDir === 'row' ? 12 : 0, marginRight: rowDir === 'row-reverse' ? 12 : 0 }}>
          <Text style={[styles.label, { color: themeColors.text, textAlign }]}>
            {t('settings.darkMode')}
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary, textAlign }]}>
            {t('settings.darkModeSubtitle')}
          </Text>
        </View>
      </View>

      {/* Toggle switch */}
      <Switch
        value={isDark}
        onValueChange={handleToggle}
        trackColor={{ false: '#E5E7EB', true: '#001B39' }}
        thumbColor={isDark ? '#4D80B3' : '#FFFFFF'}
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    alignItems: 'center',
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
});
