import { Link, router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FIREBASE_AUTH } from '@/firebaseConfig';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useI18n } from '@/hooks/use-i18n';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useUniversity } from '@/context/UniversityContext';
import { LanguageToggle } from '@/components/LanguageToggle';

export default function ForgotPasswordScreen() {
  const { theme: themeKey } = useAppTheme();
  const theme = Colors[themeKey];
  const { t, isRTL } = useI18n();
  const { selectedUniversity, isValidEmail } = useUniversity();
  const isLive = selectedUniversity.mode === 'live';
  
  const forgotPasswordSchema = z.object({
    email: z.string()
      .min(1, t('auth.errors.emailRequired'))
      .email(t('auth.errors.invalidEmail'))
      .refine(
        (email) => isValidEmail(email),
        { message: t('auth.errors.useUniversityEmail', { domain: selectedUniversity.domain }) }
      ),
  });

  type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setLoading(true);
    setGlobalError(null);
    setSuccessMsg(null);
    try {
      await sendPasswordResetEmail(FIREBASE_AUTH, data.email.trim().toLowerCase());
      setSuccessMsg(t('auth.success.resetLinkSent'));
    } catch (error: any) {
      let message = t('auth.errors.failedToUpdatePassword'); // Or a generic error
      if (error.code === 'auth/user-not-found') {
        message = t('auth.errors.userNotFound');
      }
      setGlobalError(message);
    } finally {
      setLoading(false);
    }
  };

  const flexDirection = isRTL ? 'row-reverse' : 'row';

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.brandingContainer, { flexDirection }]}>
          <View style={{ flexDirection, alignItems: 'center', flex: 1 }}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={theme.primary} />
            </Pressable>
            <Text style={[styles.appName, { color: theme.primary }]}>BookCycle</Text>
          </View>
          <View style={{ flexDirection, gap: 12, alignItems: 'center' }}>
            <ThemeToggle />
            <LanguageToggle />
          </View>
        </View>

        {/* University chip */}
        <Pressable
          style={[styles.uniChip, { backgroundColor: theme.surface ?? theme.card, borderColor: theme.border }]}
          onPress={() => router.push('/university-select' as any)}
        >
          <Text style={{ fontSize: 16 }}>{selectedUniversity.flag}</Text>
          <Text style={[styles.uniChipText, { color: theme.text }]} numberOfLines={1}>
            {selectedUniversity.shortName}
          </Text>
          <View style={[styles.uniChipBadge, { backgroundColor: isLive ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)' }]}>
            <Text style={[styles.uniChipBadgeText, { color: isLive ? '#10B981' : '#F59E0B' }]}>
              {isLive ? t('university.mode.live', 'Live') : t('university.mode.preview', 'Preview')}
            </Text>
          </View>
          <Ionicons name="swap-horizontal-outline" size={14} color={theme.textSecondary} />
        </Pressable>

        <View style={styles.welcomeContainer}>
          <Text style={[styles.welcomeTitle, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>{t('auth.forgotPassword.title')}</Text>
          <Text style={[styles.welcomeSubtitle, { color: theme.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('auth.forgotPassword.subtitle')}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {globalError && (
            <View style={[styles.errorBox, { backgroundColor: theme.error + '10', borderColor: theme.error }]}>
              <Text style={[styles.errorText, { color: theme.error }]}>{globalError}</Text>
            </View>
          )}

          {successMsg && (
            <View style={[styles.successBox, { backgroundColor: '#D1FAE5', borderColor: '#10B981' }]}>
              <Ionicons name="checkmark-circle" size={48} color="#10B981" style={{ marginBottom: 16 }} />
              <Text style={styles.successText}>{successMsg}</Text>
              <Pressable
                style={[styles.primaryBtn, { backgroundColor: '#001B39', width: '100%' }]}
                onPress={() => router.replace('/login')}
              >
                <Text style={styles.primaryBtnText}>{t('auth.forgotPassword.backToLogin')}</Text>
              </Pressable>
            </View>
          )}

          {!successMsg && (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>{t('auth.forgotPassword.emailLabel')}</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputWrapper, { flexDirection, backgroundColor: themeKey === 'dark' ? theme.card : '#F1F4F7', borderColor: errors.email ? theme.error : theme.border }]}>
                      <Ionicons name="mail" size={18} color="#8E9BAE" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}
                        placeholder={t('auth.forgotPassword.emailPlaceholder', { domain: selectedUniversity.domain })}
                        placeholderTextColor={theme.textSecondary}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  )}
                />
                {errors.email && <Text style={[styles.fieldError, { color: theme.error }]}>{errors.email.message}</Text>}
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: theme.primary },
                  pressed && { opacity: 0.9 }
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.btnContent}>
                    <Text style={[styles.primaryBtnText, { color: themeKey === 'dark' ? '#0B1020' : '#FFF' }]}>{t('auth.forgotPassword.sendButton')}</Text>
                    <Ionicons name="paper-plane" size={18} color={themeKey === 'dark' ? '#0B1020' : '#FFF'} style={{ marginLeft: 8 }} />
                  </View>
                )}
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
  },
  brandingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  backBtn: {
    marginRight: 12,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  welcomeContainer: {
    marginBottom: Spacing.xl,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  fieldError: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 4,
  },
  primaryBtn: {
    height: 56,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  successBox: {
    padding: 24,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  successText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorBox: {
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  uniChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  uniChipText: {
    fontSize: 13,
    fontWeight: '700',
    maxWidth: 160,
  },
  uniChipBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  uniChipBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
