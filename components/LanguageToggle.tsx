import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '@/hooks/use-i18n';
import { Ionicons } from '@expo/vector-icons';

export const LanguageToggle = () => {
  const { locale, changeLanguage } = useI18n();

  const toggleLanguage = () => {
    const nextLang = locale.startsWith('en') ? 'ar' : 'en';
    changeLanguage(nextLang as any);
  };

  return (
    <Pressable style={styles.container} onPress={toggleLanguage}>
      <Ionicons name="globe-outline" size={20} color="#001B39" style={{ marginRight: 6 }} />
      <Text style={styles.text}>
        {locale.startsWith('en') ? 'العربية' : 'English'}
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
    backgroundColor: '#F1F4F7',
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    color: '#001B39',
  },
});
