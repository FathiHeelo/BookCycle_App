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
import { FIREBASE_AUTH, FIREBASE_DB, firebaseConfig } from '@/firebaseConfig';

export default function VerifyPhoneScreen() {
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
      } else if (err.message) {
        message = `Error: ${err.message}`;
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
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Recaptcha (Hidden until triggered) */}
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={firebaseConfig}
          attemptInvisibleVerification={true}
        />

        <View style={styles.headerContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>📱</Text>
          </View>
          <Text style={styles.appName}>Secure Account</Text>
          <Text style={styles.subtitle}>
            Please link your phone number to secure your account. This is required for resetting your password later.
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
            </View>
          )}

          {!verificationId ? (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>📞</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+970xxxxxxxxx"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>
              </View>

              <Pressable style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]} onPress={sendVerification} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionBtnText}>Send SMS Code</Text>}
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>SMS Verification Code</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>💬</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123456"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    maxLength={6}
                  />
                </View>
              </View>

              <Pressable style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]} onPress={confirmCode} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionBtnText}>Verify & Link Account</Text>}
              </Pressable>

              <Pressable onPress={() => setVerificationId('')} style={styles.resendWrapper}>
                <Text style={styles.resendText}>Change phone number</Text>
              </Pressable>
            </>
          )}

          <Pressable onPress={handleSignOut} style={styles.logoutWrapper}>
            <Text style={styles.logoutText}>Cancel & Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const PURPLE = '#7C3AED';

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F5F3FF' },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
  headerContainer: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  logoIcon: { fontSize: 30 },
  appName: { fontSize: 28, fontWeight: '800', color: '#5B21B6' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 10, textAlign: 'center', lineHeight: 20 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 28, elevation: 6 },
  fieldGroup: { marginBottom: 18 },
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
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#111827' },
  actionBtn: {
    backgroundColor: PURPLE,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 6,
  },
  actionBtnPressed: { opacity: 0.85 },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resendWrapper: { marginTop: 20, alignItems: 'center' },
  resendText: { color: PURPLE, fontSize: 14, fontWeight: '600' },
  logoutWrapper: { marginTop: 20, alignItems: 'center' },
  logoutText: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
  globalErrorBox: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#EF4444', borderRadius: 10, padding: 12, marginBottom: 20 },
  globalErrorText: { color: '#B91C1C', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  successBox: { backgroundColor: '#D1FAE5', borderWidth: 1, borderColor: '#10B981', borderRadius: 10, padding: 12, marginBottom: 20 },
  successText: { color: '#047857', fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
