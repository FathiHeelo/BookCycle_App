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
  useColorScheme,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FIREBASE_AUTH } from '@/firebaseConfig';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useI18n } from '@/hooks/use-i18n';

export default function ChangePasswordScreen() {
  const { t } = useI18n();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
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
      setGlobalError(t('auth.errors.userNotFound'));
      return;
    }

    if (!currentPassword) {
      setGlobalError(t('auth.errors.currentPasswordRequired'));
      return;
    }
    if (newPassword.length < 6) {
      setGlobalError(t('auth.errors.newPasswordTooWeak'));
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setSuccessMsg(t('auth.success.passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');

      setTimeout(() => {
        router.back();
      }, 2000);
      
    } catch (error: any) {
      let message = t('auth.errors.failedToUpdatePassword');
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = t('auth.errors.currentPasswordIncorrect');
      } else if (error.code === 'auth/weak-password') {
        message = t('auth.errors.newPasswordTooWeak');
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
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>

        <View style={styles.welcomeContainer}>
          <Text style={[styles.welcomeTitle, { color: theme.text }]}>{t('auth.changePassword.title')}</Text>
          <Text style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>
            {t('auth.changePassword.description')}
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

          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{t('auth.changePassword.currentPassword')}</Text>
            <View style={[styles.inputWrapper, { backgroundColor: '#F1F3F5', borderColor: 'transparent' }]}>
              <Ionicons name="key-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder={t('auth.changePassword.enterCurrentPassword')}
                placeholderTextColor={theme.textSecondary + '80'}
                value={currentPassword}
                onChangeText={(val) => {
                  setCurrentPassword(val);
                  setGlobalError(null);
                }}
                secureTextEntry={!showCurrentPassword}
              />
              <Pressable onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={styles.eyeBtn}>
                <Ionicons name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.textSecondary} />
              </Pressable>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{t('auth.changePassword.newPassword')}</Text>
            <View style={[styles.inputWrapper, { backgroundColor: '#F1F3F5', borderColor: 'transparent' }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder={t('auth.changePassword.min6Characters')}
                placeholderTextColor={theme.textSecondary + '80'}
                value={newPassword}
                onChangeText={(val) => {
                  setNewPassword(val);
                  setGlobalError(null);
                }}
                secureTextEntry={!showNewPassword}
              />
              <Pressable onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeBtn}>
                <Ionicons name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.textSecondary} />
              </Pressable>
            </View>
          </View>

          {/* Action Button */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: theme.primary },
              pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
            ]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>{t('auth.changePassword.updatePassword')}</Text>
            )}
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: Spacing.xl,
    padding: 4,
    width: 40,
  },
  welcomeContainer: {
    marginBottom: Spacing.xl,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 8,
  },
  primaryBtn: {
    height: 56,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
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
