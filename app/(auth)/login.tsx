import { Link, router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FIREBASE_AUTH } from '@/firebaseConfig';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useI18n } from '@/hooks/use-i18n';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useUniversity } from '@/context/UniversityContext';

export default function LoginScreen() {
  const { theme: themeKey } = useAppTheme();
  const themeColors = Colors[themeKey];
  const { t, isRTL } = useI18n();
  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const { selectedUniversity, isValidEmail } = useUniversity();
  const isLive = selectedUniversity.mode === 'live';

  const loginSchema = z.object({
    email: z.string()
      .min(1, t('auth.errors.emailRequired'))
      .email(t('auth.errors.invalidEmail'))
      .refine(
        (email) => isValidEmail(email),
        { message: t('auth.errors.useUniversityEmail', { domain: selectedUniversity.domain }) }
      ),
    password: z.string()
      .min(1, t('auth.errors.passwordRequired'))
      .min(6, t('auth.errors.passwordMinLength')),
  });

  type LoginData = z.infer<typeof loginSchema>;
  
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onLogin = async (data: LoginData) => {
    setLoading(true);
    setGlobalError(null);
    try {
      await signInWithEmailAndPassword(FIREBASE_AUTH, data.email.trim().toLowerCase(), data.password);
      router.replace('/');
    } catch (error: any) {
      let message = t('auth.errors.failedToSignIn');
      if (error.code === 'auth/user-not-found') {
        message = t('auth.errors.userNotFound');
      } else if (error.code === 'auth/wrong-password') {
        message = t('auth.errors.wrongPassword');
      } else if (error.code === 'auth/too-many-requests') {
        message = t('auth.errors.tooManyRequests');
      }
      setGlobalError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { flexDirection }]}>
          <View style={{ flexDirection, alignItems: 'center', flex: 1 }}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={themeColors.text} />
            </Pressable>
            <View style={styles.brandingContainer}>
              <Ionicons name="book" size={20} color={themeColors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.headerTitle, { color: themeColors.text }]}>BookCycle</Text>
            </View>
          </View>
          <View style={{ flexDirection, gap: 12, alignItems: 'center' }}>
            <ThemeToggle />
            <LanguageToggle />
          </View>
        </View>

        {/* University chip */}
        <Pressable
          style={[styles.uniChip, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
          onPress={() => router.push('/university-select' as any)}
        >
          <Text style={{ fontSize: 16 }}>{selectedUniversity.flag}</Text>
          <Text style={[styles.uniChipText, { color: themeColors.text }]} numberOfLines={1}>
            {selectedUniversity.shortName}
          </Text>
          <View style={[styles.uniChipBadge, { backgroundColor: isLive ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)' }]}>
            <Text style={[styles.uniChipBadgeText, { color: isLive ? '#10B981' : '#F59E0B' }]}>
              {isLive ? t('university.mode.live', 'Live') : t('university.mode.preview', 'Preview')}
            </Text>
          </View>
          <Ionicons name="swap-horizontal-outline" size={14} color={themeColors.textSecondary} />
        </Pressable>

        <View style={styles.welcomeContainer}>
          <Text style={[styles.welcomeTitle, { color: themeColors.text }]}>{t('auth.login.title')}</Text>
          <Text style={[styles.welcomeSubtitle, { color: themeColors.textSecondary }]}>
            {t('auth.login.subtitle')}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {!!globalError && (
            <View style={[styles.errorBox, { backgroundColor: themeColors.error + '10', borderColor: themeColors.error }]}>
              <Text style={[styles.errorText, { color: themeColors.error }]}>{globalError}</Text>
            </View>
          )}

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.text }]}>{t('auth.login.emailLabel')}</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }: any) => (
                <View style={[styles.inputWrapper, { backgroundColor: themeKey === 'dark' ? themeColors.card : '#F1F4F7', borderColor: errors.email ? themeColors.error : themeColors.border }]}>
                  <Ionicons name="mail" size={18} color={themeColors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: themeColors.text }]}
                    placeholder={t('auth.login.emailPlaceholder', { domain: selectedUniversity.domain })}
                    placeholderTextColor={themeColors.textSecondary}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              )}
            />
            {!!errors.email && <Text style={[styles.fieldError, { color: themeColors.error }]}>{errors.email.message}</Text>}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: themeColors.text }]}>{t('auth.login.passwordLabel')}</Text>
              <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                <Text style={[styles.forgotText, { color: themeColors.primary }]}>{t('auth.login.forgotPassword')}</Text>
              </TouchableOpacity>
            </View>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }: any) => (
                <View style={[styles.inputWrapper, { backgroundColor: themeKey === 'dark' ? themeColors.card : '#F1F4F7', borderColor: errors.password ? themeColors.error : themeColors.border }]}>
                  <Ionicons name="lock-closed" size={18} color={themeColors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: themeColors.text }]}
                    placeholder={t('auth.login.passwordPlaceholder')}
                    placeholderTextColor={themeColors.textSecondary}
                    secureTextEntry={!showPassword}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={18} color={themeColors.textSecondary} />
                  </Pressable>
                </View>
              )}
            />
            {!!errors.password && <Text style={[styles.fieldError, { color: themeColors.error }]}>{errors.password.message}</Text>}
          </View>

          {/* Login Button */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: themeColors.primary },
              pressed && { opacity: 0.9 }
            ]}
            onPress={handleSubmit(onLogin)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={themeKey === 'dark' ? '#0B1020' : '#fff'} />
            ) : (
              <View style={styles.btnContent}>
                <Text style={[styles.primaryBtnText, { color: themeKey === 'dark' ? '#0B1020' : '#FFF' }]}>{t('auth.login.loginButton')}</Text>
                <Ionicons name="arrow-forward" size={18} color={themeKey === 'dark' ? '#0B1020' : '#FFF'} style={{ marginLeft: 8 }} />
              </View>
            )}
          </Pressable>

          {/* OR Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: themeColors.border }]} />
            <Text style={[styles.dividerText, { color: themeColors.textSecondary }]}>{t('common.or')}</Text>
            <View style={[styles.dividerLine, { backgroundColor: themeColors.border }]} />
          </View>

          {/* Sign Up Button */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: themeKey === 'dark' ? themeColors.card : '#F1F4F7' },
              pressed && { opacity: 0.9 }
            ]}
            onPress={() => router.push('/(auth)/signup')}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={themeColors.primary} />
            ) : (
              <View style={styles.btnContent}>
                <Text style={[styles.primaryBtnText, { color: themeColors.text }]}>{t('auth.login.signupButton')}</Text>
                <Ionicons name="arrow-forward-outline" size={18} color={themeColors.text} style={{ marginLeft: 8 }} />
              </View>
            )}
          </Pressable>
          
          {/* Footer Info */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
              {t('auth.login.footer')}
            </Text>
          </View>

          {/* Utility Icons removed from here */}
          <View style={styles.utilityIcons}>
            <Ionicons name="help-circle" size={24} color="#8E9BAE" />
          </View>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 40,
  },
  brandingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '800',
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F3F5',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  utilityIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    gap: 20,
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
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginBottom: Spacing.lg,
  },
  uniChipText: {
    fontSize: 13,
    fontWeight: '700',
    maxWidth: 160,
  },
  uniChipBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  uniChipBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
