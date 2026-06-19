import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors, Radius } from '@/constants/theme';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../i18n/languages';
import { changeAppLanguage } from '../i18n';

interface LanguageSelectorProps {
  onLanguageChange?: (code: LanguageCode) => void;
}

export function LanguageSelector({ onLanguageChange }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const { theme, colors } = useAppTheme();
  const currentLanguage = (i18n.language || 'en') as LanguageCode;

  // Determine current language layout details
  const currentLangMeta = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === currentLanguage
  ) || SUPPORTED_LANGUAGES[0];
  
  const isRTL = currentLangMeta.direction === 'rtl';
  const rowDir = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  const handleSelectLanguage = async (languageCode: LanguageCode) => {
    if (languageCode === currentLanguage) return;
    await changeAppLanguage(languageCode);
    if (onLanguageChange) {
      onLanguageChange(languageCode);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.headerText, { color: colors.textSecondary, textAlign }]}>
        {t('settings.chooseLanguage')}
      </Text>

      <View style={styles.listContainer}>
        {SUPPORTED_LANGUAGES.map((language, index) => {
          const isSelected = currentLanguage === language.code;
          const showBorder = index < SUPPORTED_LANGUAGES.length - 1;

          return (
            <Pressable
              key={language.code}
              style={({ pressed }) => [
                styles.optionRow,
                {
                  flexDirection: rowDir,
                  borderBottomWidth: showBorder ? 1 : 0,
                  borderBottomColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() => handleSelectLanguage(language.code)}
            >
              <View style={[styles.leftContainer, { flexDirection: rowDir }]}>
                <View
                  style={[
                    styles.iconBg,
                    {
                      backgroundColor: isSelected
                        ? colors.primary + '15'
                        : colors.surface,
                    },
                  ]}
                >
                  <Ionicons
                    name="language-outline"
                    size={20}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                </View>
                <View style={[styles.textWrapper, isRTL ? { marginRight: 12 } : { marginLeft: 12 }]}>
                  <Text
                    style={[
                      styles.nativeNameText,
                      {
                        color: colors.text,
                        fontWeight: isSelected ? '700' : '500',
                        textAlign,
                      },
                    ]}
                  >
                    {language.nativeName}
                  </Text>
                  <Text
                    style={[
                      styles.englishNameText,
                      {
                        color: colors.textSecondary,
                        textAlign,
                      },
                    ]}
                  >
                    {language.name}
                  </Text>
                </View>
              </View>
              {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                  <Ionicons name="checkmark" size={16} color={theme === 'dark' ? '#0B1020' : '#fff'} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 16,
    width: '100%',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  listContainer: {
    width: '100%',
  },
  optionRow: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  leftContainer: {
    alignItems: 'center',
    flex: 1,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  nativeNameText: {
    fontSize: 16,
    marginBottom: 2,
  },
  englishNameText: {
    fontSize: 12,
    fontWeight: '400',
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
