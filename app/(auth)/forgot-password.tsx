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
import { FIREBASE_AUTH } from '@/firebaseConfig';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
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
      setSuccessMsg('A password reset link has been sent to your email.');
    } catch (error: any) {
      let message = 'Failed to send reset email. Please try again.';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      setGlobalError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>🔑</Text>
          </View>
          <Text style={styles.appName}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter the email associated with your account and we'll send a reset link.
          </Text>
        </View>

        <View style={styles.card}>
          {globalError && (
            <View style={styles.globalErrorBox}>
              <Text style={styles.globalErrorText}>{globalError}</Text>
            </View>
          )}

          {successMsg && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{successMsg}</Text>
              <Link href="/login" asChild>
                <Pressable style={styles.backToLoginBtnSmall}>
                  <Text style={styles.backToLoginBtnTextSmall}>Back to Login</Text>
                </Pressable>
              </Link>
            </View>
          )}

          {!successMsg && (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email Address</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputWrapper, errors.email && styles.inputErrorBorder]}>
                      <Text style={styles.inputIcon}>✉️</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. name@example.com"
                        placeholderTextColor="#9CA3AF"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit(onSubmit)}
                      />
                    </View>
                  )}
                />
                {errors.email && <Text style={styles.errorText}>⚠️ {errors.email.message}</Text>}
              </View>

              <Pressable
                style={({ pressed }) => [styles.resetBtn, pressed && styles.resetBtnPressed]}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.resetBtnText}>Send Reset Link</Text>}
              </Pressable>

              <View style={styles.footer}>
                <Link href="/login" asChild>
                  <Pressable>
                    <Text style={styles.footerLink}>Back to Login</Text>
                  </Pressable>
                </Link>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const PURPLE = '#7C3AED';
const PURPLE_DARK = '#5B21B6';

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F5F3FF' },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
  headerContainer: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  logoIcon: { fontSize: 36 },
  appName: { fontSize: 32, fontWeight: '800', color: PURPLE_DARK },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 10, textAlign: 'center', lineHeight: 20 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 28, elevation: 6 },
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 14,
    height: 52,
  },
  inputErrorBorder: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#111827' },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 6, marginLeft: 4 },
  globalErrorBox: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#EF4444', borderRadius: 10, padding: 12, marginBottom: 20 },
  globalErrorText: { color: '#B91C1C', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  successBox: { backgroundColor: '#D1FAE5', borderWidth: 1, borderColor: '#10B981', borderRadius: 10, padding: 20, alignItems: 'center' },
  successText: { color: '#047857', fontSize: 15, fontWeight: '700', textAlign: 'center', marginBottom: 15 },
  resetBtn: {
    backgroundColor: PURPLE,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  resetBtnPressed: { opacity: 0.85 },
  resetBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { marginTop: 20, alignItems: 'center' },
  footerLink: { color: PURPLE, fontWeight: '700', fontSize: 14 },
  backToLoginBtnSmall: { backgroundColor: '#10B981', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  backToLoginBtnTextSmall: { color: '#fff', fontWeight: '700' },
});
