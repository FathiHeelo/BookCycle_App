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
import { useColorScheme } from '@/hooks/use-color-scheme';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid university email'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
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
        message = 'No account found with this email.';
      }
      setGlobalError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: '#FFFFFF' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandingContainer}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#001B39" />
          </Pressable>
          <Text style={[styles.appName, { color: '#001B39' }]}>BookCycle</Text>
        </View>

        <View style={styles.welcomeContainer}>
          <Text style={[styles.welcomeTitle, { color: '#1A1A1A' }]}>Reset Password</Text>
          <Text style={[styles.welcomeSubtitle, { color: '#8E9BAE' }]}>
            Enter your university email and we'll send a reset link.
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
                <Text style={styles.primaryBtnText}>Back to Login</Text>
              </Pressable>
            </View>
          )}

          {!successMsg && (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: '#4A4A4A' }]}>University Email</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputWrapper, { backgroundColor: '#F1F4F7', borderColor: errors.email ? theme.error : 'transparent' }]}>
                      <Ionicons name="mail" size={18} color="#8E9BAE" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { color: '#1A1A1A' }]}
                        placeholder="username@stu.najah.edu"
                        placeholderTextColor="#A0AEC0"
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
                  { backgroundColor: '#001B39' },
                  pressed && { opacity: 0.9 }
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.btnContent}>
                    <Text style={styles.primaryBtnText}>Send Reset Link</Text>
                    <Ionicons name="paper-plane" size={18} color="#fff" style={{ marginLeft: 8 }} />
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
});
