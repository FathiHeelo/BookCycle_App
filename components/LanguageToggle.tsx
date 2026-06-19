import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useI18n } from '@/hooks/use-i18n';
import { Ionicons } from '@expo/vector-icons';
import { SUPPORTED_LANGUAGES } from '@/src/i18n/languages';
import { useAppTheme } from '@/context/ThemeContext';

export const LanguageToggle = () => {
  const { locale, changeLanguage } = useI18n();
  const { colors } = useAppTheme();

  const currentIndex = SUPPORTED_LANGUAGES.findIndex(
    (lang) => locale === lang.code || (locale && locale.startsWith(lang.code))
  );
  
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
  const nextLang = SUPPORTED_LANGUAGES[nextIndex];

  const toggleLanguage = () => {
    changeLanguage(nextLang.code);
  };

  return (
    <Pressable style={[styles.container, { backgroundColor: colors.surface }]} onPress={toggleLanguage}>
      <Ionicons name="globe-outline" size={20} color={colors.primary} style={{ marginRight: 6 }} />
      <Text style={[styles.text, { color: colors.primary }]}>
        {nextLang.nativeName}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
  },
});
