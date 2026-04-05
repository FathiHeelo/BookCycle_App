import { Link, router } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, set } from 'firebase/database';
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
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FIREBASE_AUTH, FIREBASE_DB } from '@/firebaseConfig';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/hooks/use-i18n';
import { LanguageToggle } from '@/components/LanguageToggle';

const FACULTIES = [
  { id: 'med', icon: 'medical', color: '#EF4444' },
  { id: 'eng', icon: 'construct', color: '#F59E0B' },
  { id: 'bus', icon: 'business', color: '#3B82F6' },
  { id: 'grad', icon: 'school', color: '#8B5CF6' },
  { id: 'hon', icon: 'star', color: '#FACC15' },
  { id: 'sha', icon: 'library', color: '#10B981' },
  { id: 'vet', icon: 'leaf', color: '#059669' },
  { id: 'sci', icon: 'flask', color: '#6366F1' },
  { id: 'hum', icon: 'people', color: '#EC4899' },
  { id: 'art', icon: 'brush', color: '#F43F5E' },
  { id: 'law', icon: 'book', color: '#475569' },
  { id: 'it', icon: 'hardware-chip', color: '#06B6D4' },
  { id: 'den', icon: 'medical', color: '#2DD4BF' },
  { id: 'pha', icon: 'flask', color: '#84CC16' },
  { id: 'nur', icon: 'medkit', color: '#0EA5E9' },
];

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { t } = useI18n();

  const signupSchema = z.object({
    fullName: z.string().min(2, t('auth.errors.fullNameMinLength')),
    email: z.string()
      .min(1, t('auth.errors.emailRequired'))
      .email(t('auth.errors.invalidEmail'))
      .endsWith('@stu.najah.edu', t('auth.errors.useUniversityEmail')),
    password: z.string()
      .min(1, t('auth.errors.passwordRequired'))
      .min(6, t('auth.errors.passwordMinLength')),
    confirmPassword: z.string(),
    facultyId: z.string().min(1, t('auth.errors.selectFaculty')),
    major: z.string().min(1, t('auth.errors.selectMajor')),
    universityID: z.string()
      .min(8, t('auth.errors.universityIdLength'))
      .max(10, t('auth.errors.universityIdLength')),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.errors.passwordsDoNotMatch'),
    path: ["confirmPassword"],
  });

  type SignupData = z.infer<typeof signupSchema>;
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [facultyModalVisible, setFacultyModalVisible] = useState(false);
  const [majorModalVisible, setMajorModalVisible] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { 
      fullName: '', email: '', password: '', confirmPassword: '',
      facultyId: '', major: '', universityID: '',
    },
  });

  const selectedFacultyId = watch('facultyId');
  const majorOptions = selectedFacultyId ? t(`majors.${selectedFacultyId}`, { returnObjects: true }) as string[] : [];

  const onSignup = async (data: SignupData) => {
    setLoading(true);
    setGlobalError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, data.email.trim().toLowerCase(), data.password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: data.fullName });
      
      const facultyNameEn = t(`faculties.${data.facultyId}`, { lng: 'en' });
      
      await set(ref(FIREBASE_DB, `users/${user.uid}`), {
        uid: user.uid,
        fullName: data.fullName,
        email: data.email.trim().toLowerCase(),
        facultyId: data.facultyId,
        facultyName: facultyNameEn, // Store EN name for consistent DB records
        major: data.major,
        universityID: data.universityID,
        createdAt: new Date().toISOString(),
      });
      router.replace('/verify-phone');
    } catch (error: any) {
      let message = t('auth.errors.failedToSignup');
      if (error.code === 'auth/email-already-in-use') message = t('auth.errors.emailAlreadyInUse');
      setGlobalError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: '#FFFFFF' }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#001B39" />
            </Pressable>
            <Text style={[styles.headerTitle, { color: '#001B39' }]}>BookCycle</Text>
            <LanguageToggle />
          </View>

          <View style={styles.heroSection}>
            <Text style={[styles.heroTitle, { color: '#001B39' }]}>{t('auth.signup.title')}</Text>
            <Text style={[styles.heroSubtitle, { color: '#6B7280' }]}>
              {t('auth.signup.subtitle')}
            </Text>
          </View>

          <View style={styles.formContainer}>
            {!!globalError && (
              <View style={[styles.errorBox, { backgroundColor: theme.error + '10', borderColor: theme.error }]}>
                <Text style={[styles.errorText, { color: theme.error }]}>{globalError}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('auth.signup.fullNameLabel')}</Text>
              <Controller control={control} name="fullName" render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={[styles.input, { backgroundColor: '#F1F4F7' }]} placeholder={t('auth.signup.fullNamePlaceholder')} placeholderTextColor="#A0AEC0" onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
              {!!errors.fullName && <Text style={[styles.fieldError, { color: theme.error }]}>{errors.fullName.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('auth.signup.emailLabel')}</Text>
              <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={[styles.input, { backgroundColor: '#F1F4F7' }]} placeholder={t('auth.signup.emailPlaceholder')} placeholderTextColor="#A0AEC0" onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="email-address" />
              )} />
              {!!errors.email && <Text style={[styles.fieldError, { color: theme.error }]}>{errors.email.message}</Text>}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>{t('auth.signup.passwordLabel')}</Text>
                <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput style={[styles.input, { backgroundColor: '#F1F4F7' }]} placeholder={t('auth.signup.passwordPlaceholder')} placeholderTextColor="#A0AEC0" secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} />
                )} />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>{t('auth.signup.confirmPasswordLabel')}</Text>
                <Controller control={control} name="confirmPassword" render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput style={[styles.input, { backgroundColor: '#F1F4F7' }]} placeholder={t('auth.signup.passwordPlaceholder')} placeholderTextColor="#A0AEC0" secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} />
                )} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('auth.signup.facultyLabel')}</Text>
              <Pressable onPress={() => setFacultyModalVisible(true)} style={[styles.input, { backgroundColor: '#F1F4F7', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <Text style={{ color: selectedFacultyId ? '#1A1A1A' : '#A0AEC0', fontSize: 13, fontWeight: '600' }}>
                  {selectedFacultyId ? t(`faculties.${selectedFacultyId}`) : t('auth.signup.facultyPlaceholder')}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#8E9BAE" />
              </Pressable>
              {!!errors.facultyId && <Text style={[styles.fieldError, { color: theme.error }]}>{errors.facultyId.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('auth.signup.majorLabel')}</Text>
              <Pressable onPress={() => { if (selectedFacultyId) setMajorModalVisible(true); }} style={[styles.input, { backgroundColor: '#F1F4F7', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', opacity: selectedFacultyId ? 1 : 0.6 }]}>
                <Text style={{ color: watch('major') ? '#1A1A1A' : '#A0AEC0', fontSize: 13, fontWeight: '600' }}>
                  {watch('major') || t('auth.signup.majorPlaceholder')}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#8E9BAE" />
              </Pressable>
              {!!errors.major && <Text style={[styles.fieldError, { color: theme.error }]}>{errors.major.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('auth.signup.universityIdLabel')}</Text>
              <Controller control={control} name="universityID" render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={[styles.input, { backgroundColor: '#F1F4F7' }]} placeholder={t('auth.signup.universityIdPlaceholder')} placeholderTextColor="#A0AEC0" onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="numeric" />
              )} />
              {!!errors.universityID && <Text style={[styles.fieldError, { color: theme.error }]}>{errors.universityID.message}</Text>}
            </View>

            <Text style={styles.legalText}>
              {t('auth.signup.legalText')}
            </Text>

            <Pressable style={({ pressed }) => [styles.primaryBtn, { backgroundColor: '#001B39' }, pressed && { opacity: 0.9 }]} onPress={handleSubmit(onSignup)} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{t('auth.signup.signupButton')}</Text>}
            </Pressable>

            <View style={styles.loginLinkRow}>
              <Text style={styles.loginLinkText}>{t('auth.signup.alreadyAccount')}</Text>
              <Link href="/login" asChild>
                <Pressable><Text style={[styles.loginLinkText, { fontWeight: '800', color: '#001B39' }]}>{t('auth.signup.loginLink')}</Text></Pressable>
              </Link>
            </View>

            <View style={styles.universityBranding}>
              <Ionicons name="school" size={14} color="#8E9BAE" style={{ marginRight: 8 }} />
              <Text style={styles.universityName}>AN-NAJAH NATIONAL UNIVERSITY</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={facultyModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('auth.signup.facultyLabel')}</Text>
              <Pressable onPress={() => setFacultyModalVisible(false)}><Ionicons name="close" size={24} color="#1A1A1A" /></Pressable>
            </View>
            <FlatList
              data={FACULTIES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable style={styles.modalItem} onPress={() => { setValue('facultyId', item.id); setValue('major', ''); setFacultyModalVisible(false); }}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} style={{ marginRight: 12 }} />
                  <Text style={styles.modalItemText}>{t(`faculties.${item.id}`)}</Text>
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={majorModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('auth.signup.majorLabel')}</Text>
              <Pressable onPress={() => setMajorModalVisible(false)}><Ionicons name="close" size={24} color="#1A1A1A" /></Pressable>
            </View>
            <FlatList
              data={majorOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable style={styles.modalItem} onPress={() => { setValue('major', item); setMajorModalVisible(false); }}>
                  <Text style={styles.modalItemText}>{item}</Text>
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  heroSection: { marginBottom: 32 },
  heroTitle: { fontSize: 28, fontWeight: '800', marginBottom: 12, lineHeight: 34 },
  heroSubtitle: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  formContainer: { width: '100%' },
  label: { fontSize: 13, fontWeight: '700', color: '#001B39', marginBottom: 8 },
  inputGroup: { marginBottom: 20 },
  row: { flexDirection: 'row', width: '100%' },
  input: { height: 52, borderRadius: Radius.md, paddingHorizontal: 16, borderWidth: 1.5, borderColor: 'transparent', fontSize: 15, fontWeight: '500' },
  legalText: { fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 18, marginVertical: 24, paddingHorizontal: 10 },
  legalLink: { fontWeight: '700', color: '#001B39', textDecorationLine: 'underline' },
  primaryBtn: { height: 56, borderRadius: Radius.pill, justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  loginLinkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginLinkText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  universityBranding: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  universityName: { fontSize: 11, fontWeight: '800', color: '#8E9BAE', letterSpacing: 1 },
  fieldError: { fontSize: 12, fontWeight: '600', marginTop: 4, marginLeft: 4 },
  errorBox: { padding: 12, borderRadius: Radius.md, borderWidth: 1, marginBottom: 20 },
  errorText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#F1F3F5' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  modalItem: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  modalItemText: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', flexShrink: 1 },
  divider: { height: 1, backgroundColor: '#F1F3F5', marginHorizontal: 20 },
});
