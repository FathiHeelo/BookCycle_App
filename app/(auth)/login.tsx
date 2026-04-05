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
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FIREBASE_AUTH } from '@/firebaseConfig';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid university email').endsWith('@stu.najah.edu', 'Use your university email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
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
      let message = 'Invalid email or password. Please try again.';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Try again later.';
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
          <Ionicons name="book" size={24} color="#001B39" />
          <Text style={[styles.appName, { color: '#001B39' }]}>BookCycle</Text>
        </View>

        <View style={styles.welcomeContainer}>
          <Text style={[styles.welcomeTitle, { color: '#1A1A1A' }]}>Welcome Back</Text>
          <Text style={[styles.welcomeSubtitle, { color: '#8E9BAE' }]}>
            Please enter your university credentials to continue.
          </Text>
        </View>

        <View style={styles.formContainer}>
          {!!globalError && (
            <View style={[styles.errorBox, { backgroundColor: theme.error + '10', borderColor: theme.error }]}>
              <Text style={[styles.errorText, { color: theme.error }]}>{globalError}</Text>
            </View>
          )}

          {/* Email */}
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
            {!!errors.email && <Text style={[styles.fieldError, { color: theme.error }]}>{errors.email.message}</Text>}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: '#4A4A4A' }]}>Password</Text>
              <Link href="/forgot-password" asChild>
                <Pressable>
                  <Text style={[styles.forgotText, { color: '#001B39' }]}>Forgot?</Text>
                </Pressable>
              </Link>
            </View>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputWrapper, { backgroundColor: '#F1F4F7', borderColor: errors.password ? theme.error : 'transparent' }]}>
                  <Ionicons name="lock-closed" size={18} color="#8E9BAE" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: '#1A1A1A' }]}
                    placeholder="••••••••"
                    placeholderTextColor="#A0AEC0"
                    secureTextEntry={!showPassword}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={18} color="#8E9BAE" />
                  </Pressable>
                </View>
              )}
            />
            {!!errors.password && <Text style={[styles.fieldError, { color: theme.error }]}>{errors.password.message}</Text>}
          </View>

          {/* Login Button */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: '#001B39' },
              pressed && { opacity: 0.9 }
            ]}
            onPress={handleSubmit(onLogin)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.btnContent}>
                <Text style={styles.primaryBtnText}>Login</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
              </View>
            )}
          </Pressable>

          {/* OR Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={[styles.dividerText, { color: '#A0AEC0' }]}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign Up Button */}
            <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: '#9d9d9dff' },
              pressed && { opacity: 0.9 }
            ]}
            onPress={() => router.push('/(auth)/signup')}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.btnContent}>
                <Text style={styles.primaryBtnText}>Sign Up</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
              </View>
            )}
          </Pressable>
          
          {/* Footer Info */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: '#8E9BAE' }]}>
              Join your campus community and start gifting.
            </Text>
            <Text style={[styles.footerTextArabic, { color: '#8E9BAE' }]}>
              انضم إلى مجتمعك الجامعي وابدأ في الإهداء والتبادل.
            </Text>
          </View>

          {/* Utility Icons */}
          <View style={styles.utilityIcons}>
            <Ionicons name="help-circle" size={24} color="#8E9BAE" />
            <Ionicons name="globe-outline" size={24} color="#8E9BAE" />
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
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
  },
  brandingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    marginLeft: 8,
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
  signupBtn: {
   backgroundColor: '#acadaeff',
   color: '#001B39',
  
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 6,
    marginLeft: 4,
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
  secondaryBtn: {
    height: 56,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '800',
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
  footerTextArabic: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
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
});
