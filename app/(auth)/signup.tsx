import { Link, router } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { ref, set } from 'firebase/database';
import React, { useState, useEffect } from 'react';
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
import { FIREBASE_AUTH, FIREBASE_DB } from '@/firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

// Define Form Schema with Zod
const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Full Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phoneNumber: z.string().min(8, 'Phone number must be at least 8 characters (including country code)'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Google Auth Hook
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '480877114724-giupl40beccvaoeem5r0ejmahk409et3.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({
      scheme: 'bookcycleapp',
      preferLocalhost: true,
    }),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      setLoading(true);
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(FIREBASE_AUTH, credential)
        .then(async (userCredential) => {
          const userId = userCredential.user.uid;
          await set(ref(FIREBASE_DB, 'users/' + userId), {
            fullName: userCredential.user.displayName || 'Google User',
            email: userCredential.user.email || '',
            createdAt: new Date().toISOString(),
          });
          router.replace('/');
        })
        .catch((error) => {
          console.error(error);
          setGlobalError('Google Sign-In failed. Please try again.');
          setLoading(false);
        });
    } else if (response?.type === 'error') {
      setGlobalError('Google Sign-In was cancelled or failed.');
    }
  }, [response]);

  const onSubmit = async (data: SignupFormData) => {
    setGlobalError(null);
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        data.email.trim().toLowerCase(),
        data.password
      );

      // Set the display name on the Firebase user profile
      await updateProfile(userCredential.user, { displayName: data.fullName.trim() });

      // Save additional user defaults into the realtime database
      const userId = userCredential.user.uid;
      await set(ref(FIREBASE_DB, 'users/' + userId), {
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phoneNumber: data.phoneNumber.trim(),
        createdAt: new Date().toISOString(),
      });

      router.replace('/');
    } catch (error: any) {
      let message = 'Something went wrong. Please try again.';
      if (error.code === 'auth/email-already-in-use')
        message = 'An account with this email already exists.';
      else if (error.code === 'auth/invalid-email') message = 'Invalid email address format.';
      else if (error.code === 'auth/weak-password')
        message = 'Password is too weak. Use at least 6 characters.';

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
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>📚</Text>
          </View>
          <Text style={styles.appName}>BookCycle</Text>
          <Text style={styles.subtitle}>Create your account to get started.</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Account</Text>

          {globalError && (
            <View style={styles.globalErrorBox}>
              <Text style={styles.globalErrorText}>{globalError}</Text>
            </View>
          )}

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name</Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputWrapper, errors.fullName && styles.inputErrorBorder]}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Ahmad Khalil"
                    placeholderTextColor="#9CA3AF"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              )}
            />
            {errors.fullName && <Text style={styles.errorText}>⚠️ {errors.fullName.message}</Text>}
          </View>

          {/* Email */}
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
                    returnKeyType="next"
                  />
                </View>
              )}
            />
            {errors.email && <Text style={styles.errorText}>⚠️ {errors.email.message}</Text>}
          </View>

          {/* Phone Number */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputWrapper, errors.phoneNumber && styles.inputErrorBorder]}>
                  <Text style={styles.inputIcon}>📞</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+970xxxxxxxxx"
                    placeholderTextColor="#9CA3AF"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                  />
                </View>
              )}
            />
            {errors.phoneNumber && (
              <Text style={styles.errorText}>⚠️ {errors.phoneNumber.message}</Text>
            )}
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputWrapper, errors.password && styles.inputErrorBorder]}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Minimum 6 characters"
                    placeholderTextColor="#9CA3AF"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry={!showPassword}
                    returnKeyType="next"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                  </Pressable>
                </View>
              )}
            />
            {errors.password && <Text style={styles.errorText}>⚠️ {errors.password.message}</Text>}
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[styles.inputWrapper, errors.confirmPassword && styles.inputErrorBorder]}
                >
                  <Text style={styles.inputIcon}>🔑</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter your password"
                    placeholderTextColor="#9CA3AF"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry={!showConfirm}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                  <Pressable onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                    <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
                  </Pressable>
                </View>
              )}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>⚠️ {errors.confirmPassword.message}</Text>
            )}
          </View>

          {/* Sign Up Button */}
          <Pressable
            style={({ pressed }) => [styles.signupBtn, pressed && styles.signupBtnPressed]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signupBtnText}>Create Account</Text>
            )}
          </Pressable>

          {/* Google Button */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={({ pressed }) => [styles.googleBtn, pressed && styles.googleBtnPressed]}
            onPress={() => promptAsync()}
            disabled={!request || loading}
          >
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </Pressable>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/login" asChild>
              <Pressable>
                <Text style={styles.footerLink}>Sign In</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#EDE9FE';
const PURPLE_DARK = '#5B21B6';

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F5F3FF' },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
    backgroundColor: '#F5F3FF',
  },

  // Header
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
    elevation: 10,
  },
  logoIcon: { fontSize: 36 },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: PURPLE_DARK,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 15, color: '#6B7280', marginTop: 6, textAlign: 'center' },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },

  // Fields
  fieldGroup: { marginBottom: 16 },
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
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 16 },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 6, marginLeft: 4 },

  globalErrorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  globalErrorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Sign Up Button
  signupBtn: {
    backgroundColor: PURPLE,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  signupBtnPressed: { opacity: 0.85 },
  signupBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  // OR Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Google Button
  googleBtn: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 5,
  },
  googleBtnPressed: { opacity: 0.7, backgroundColor: '#FAFAFA' },
  googleBtnText: { color: '#374151', fontSize: 15, fontWeight: '700' },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontSize: 14, color: '#6B7280' },
  footerLink: { fontSize: 14, color: PURPLE, fontWeight: '700' },
});
