import React from 'react';
import { View, Text, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/hooks/use-i18n';
import { useAppTheme } from '@/context/ThemeContext';
import { SettingsStyles as styles } from '../styles';

export const AccessibilityToggleUI = () => {
  const { t, isRTL } = useI18n();
  const { isDark, isAccessible, setIsAccessible, colors } = useAppTheme();

  const rowDir = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  return (
    <View style={[styles.themeRow, { flexDirection: rowDir, borderTopWidth: 1, borderTopColor: colors.border + '15' }]}>
      <View style={[styles.themeLeftSection, { flexDirection: rowDir, flex: 1 }]}>
        <View style={[styles.themeIconBg, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]}>
          <Ionicons
            name="eye-outline"
            size={20}
            color={isDark ? '#818CF8' : '#001B39'}
          />
        </View>
        <View style={{ flex: 1, marginLeft: rowDir === 'row' ? 12 : 0, marginRight: rowDir === 'row-reverse' ? 12 : 0 }}>
          <Text style={[styles.themeLabel, { color: colors.text, textAlign }]}>
            {t('settings.colorBlindMode')}
          </Text>
          <Text style={[styles.themeSubtitle, { color: colors.textSecondary, textAlign, fontSize: 11 }]}>
            {t('settings.colorBlindSubtitle')}
          </Text>
        </View>
      </View>

      <Switch
        value={isAccessible}
        onValueChange={setIsAccessible}
        trackColor={{ false: '#E5E7EB', true: colors.primary }}
        thumbColor={isAccessible ? (isDark ? '#FFFFFF' : '#FFFFFF') : '#FFFFFF'}
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );
};
