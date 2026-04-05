import { router } from 'expo-router';
import { PhoneAuthProvider, linkWithCredential } from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { ref, get } from 'firebase/database';
import React, { useRef, useState, useEffect } from 'react';
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
import { FIREBASE_AUTH, FIREBASE_DB, firebaseConfig } from '@/firebaseConfig';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function VerifyPhoneScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-fetch phone number from DB if exists
  useEffect(() => {
    const fetchUserData = async () => {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        try {
          const snapshot = await get(ref(FIREBASE_DB, `users/${user.uid}`));
          if (snapshot.exists()) {
            const data = snapshot.val();
            if (data.phoneNumber) {
              setPhoneNumber(data.phoneNumber);
            }
          }
        } catch (error) {
          console.error("Error fetching user phone:", error);
        }
      }
    };
    fetchUserData();
  }, []);

  // Step 1: Send SMS
  const sendVerification = async () => {
    setGlobalError(null);
    if (!phoneNumber || phoneNumber.length < 8) {
      setGlobalError('Please enter a valid phone number with country code (e.g. +970...).');
      return;
    }

    setLoading(true);
    try {
      if (recaptchaVerifier.current) {
        const phoneProvider = new PhoneAuthProvider(FIREBASE_AUTH);
        const vid = await phoneProvider.verifyPhoneNumber(phoneNumber, recaptchaVerifier.current);
        setVerificationId(vid);
        setSuccessMsg('SMS verification code has been sent to your phone.');
      }
    } catch (err: any) {
      console.error("Firebase Verification Error:", err);
      let message = 'Error sending SMS. Ensure the phone number format is correct: +[code][number]';
      if (err.code === 'auth/operation-not-allowed') {
        message = 'Phone authentication is not enabled in Firebase Console.';
      } else if (err.code === 'auth/invalid-phone-number') {
        message = 'The phone number provided is invalid.';
      }
      setGlobalError(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm Code and Link
  const confirmCode = async () => {
    setGlobalError(null);
    if (!verificationCode) {
      setGlobalError('Please enter the 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        await linkWithCredential(user, credential);
        setSuccessMsg('Phone number linked successfully! Welcome to BookCycle.');
        setTimeout(() => {
          router.replace('/');
        }, 1500);
      } else {
        setGlobalError('You must be logged in to link a phone number.');
      }
    } catch (err: any) {
      if (err.code === 'auth/credential-already-in-use') {
        setGlobalError('This phone number is already linked to another account.');
      } else if (err.code === 'auth/invalid-verification-code') {
        setGlobalError('The code you entered is incorrect.');
      } else {
        setGlobalError('Failed to verify code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    FIREBASE_AUTH.signOut();
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
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={firebaseConfig}
          attemptInvisibleVerification={true}
        />

        <View style={styles.brandingContainer}>
          <Text style={[styles.appName, { color: '#001B39' }]}>BookCycle</Text>
        </View>

        <View style={styles.welcomeContainer}>
          <Text style={[styles.welcomeTitle, { color: '#1A1A1A' }]}>Secure Account</Text>
          <Text style={[styles.welcomeSubtitle, { color: '#8E9BAE' }]}>
            Link your phone to secure your account.
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
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          )}

          {!verificationId ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: '#4A4A4A' }]}>Phone Number</Text>
                <View style={[styles.inputWrapper, { backgroundColor: '#F1F4F7', borderColor: globalError ? theme.error : 'transparent' }]}>
                  <Ionicons name="call" size={18} color="#8E9BAE" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: '#1A1A1A' }]}
                    placeholder="+970xxxxxxxxx"
                    placeholderTextColor="#A0AEC0"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: '#001B39' },
                  pressed && { opacity: 0.9 }
                ]}
                onPress={sendVerification}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Send SMS Code</Text>}
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: '#4A4A4A' }]}>SMS Verification Code</Text>
                <View style={[styles.inputWrapper, { backgroundColor: '#F1F4F7', borderColor: globalError ? theme.error : 'transparent' }]}>
                  <Ionicons name="chatbubble" size={18} color="#8E9BAE" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: '#1A1A1A' }]}
                    placeholder="123456"
                    placeholderTextColor="#A0AEC0"
                    keyboardType="number-pad"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    maxLength={6}
                  />
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: '#001B39' },
                  pressed && { opacity: 0.9 }
                ]}
                onPress={confirmCode}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Verify & Link Account</Text>}
              </Pressable>

              <Pressable onPress={() => setVerificationId('')} style={styles.secondaryAction}>
                <Text style={[styles.secondaryActionText, { color: '#001B39' }]}>Change phone number</Text>
              </Pressable>
            </>
          )}

          <Pressable onPress={handleSignOut} style={styles.logoutBtn}>
            <Text style={styles.logoutBtnText}>Cancel & Sign Out</Text>
          </Pressable>
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
  primaryBtn: {
    height: 56,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryAction: {
    marginTop: 20,
    alignItems: 'center',
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  logoutBtn: {
    marginTop: 40,
    alignItems: 'center',
    padding: 10,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
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
  successBox: {
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: 20,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#065F46',
  },
});
