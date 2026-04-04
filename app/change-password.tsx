import { router } from 'expo-router';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import React, { useState } from 'react';
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

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChangePassword = async () => {
    setGlobalError(null);
    setSuccessMsg(null);

    const user = FIREBASE_AUTH.currentUser;
    if (!user || (!user.email)) {
      setGlobalError('You must be logged in to change your password.');
      return;
    }

    if (!currentPassword) {
      setGlobalError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setGlobalError('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      // 1. Re-authenticate the user using their current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // 2. Update to the new password
      await updatePassword(user, newPassword);

      setSuccessMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');

      // Send the user back after a brief moments
      setTimeout(() => {
        router.back();
      }, 2000);
      
    } catch (error: any) {
      let message = 'Something went wrong. Please try again.';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Your current password is incorrect.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Your new password is too weak.';
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
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Change Password</Text>

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

          {/* Current Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔑</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                placeholderTextColor="#9CA3AF"
                value={currentPassword}
                onChangeText={(val) => {
                  setCurrentPassword(val);
                  setGlobalError(null);
                }}
                secureTextEntry={!showCurrentPassword}
              />
              <Pressable onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{showCurrentPassword ? '🙈' : '👁️'}</Text>
              </Pressable>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new password (min. 6 chars)"
                placeholderTextColor="#9CA3AF"
                value={newPassword}
                onChangeText={(val) => {
                  setNewPassword(val);
                  setGlobalError(null);
                }}
                secureTextEntry={!showNewPassword}
              />
              <Pressable onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{showNewPassword ? '🙈' : '👁️'}</Text>
              </Pressable>
            </View>
          </View>

          {/* Action Button */}
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionBtnText}>Update Password</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const PURPLE = '#7C3AED';

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F5F3FF' },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  backButton: {
    marginBottom: 20,
    marginTop: 20,
  },
  backText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '600',
  },
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
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 16 },

  actionBtn: {
    backgroundColor: PURPLE,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  actionBtnPressed: { opacity: 0.85 },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

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

  successBox: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  successText: {
    color: '#047857',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
