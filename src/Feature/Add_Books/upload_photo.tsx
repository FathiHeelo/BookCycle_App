import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '@/src/services/cloudinary.service';
import { ref as dbRef, push, set } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useI18n } from '@/hooks/use-i18n';

const VIBRANT_GOLD = '#B58D3D';

interface UploadPhotoProps {
  onNext: (bookId: string) => void;
}

export default function UploadPhotoScreen({ onNext }: UploadPhotoProps) {
  const { t, isRTL } = useI18n();
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const textAlign = isRTL ? 'right' : 'left';
  const flexDirection = isRTL ? 'row-reverse' : 'row';

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(isRTL ? 'تم رفض الإذن' : 'Permission Denied', isRTL ? 'نحتاج للوصول لصورك لرفع صورة الكتاب.' : 'We need access to your photos to upload book images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(isRTL ? 'تم رفض الإذن' : 'Permission Denied', isRTL ? 'نحتاج للوصول للكاميرا لالتقاط صورة الكتاب.' : 'We need access to your camera to take book images.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUploadAndSave = async () => {
    if (!image) {
      Alert.alert(isRTL ? 'لا توجد صورة' : 'No Image', isRTL ? 'يرجى اختيار أو التقاط صورة للكتاب.' : 'Please select or take a photo of the book.');
      return;
    }

    const user = FIREBASE_AUTH.currentUser;
    if (!user) {
      Alert.alert(t('common.error'), t('auth.errors.mustBeLoggedIn'));
      return;
    }

    setUploading(true);

    try {
      const downloadURL = await uploadImageToCloudinary({
        uri: image,
        folder: `bookcycle/books/${user.uid}`,
        fileName: `${Date.now()}`,
      });

      const newBookRef = push(dbRef(FIREBASE_DB, 'Books'));
      await set(newBookRef, {
        imageUrl: downloadURL,
        donorUid: user.uid,
        donorName: user.displayName || 'Anonymous Student',
        status: 'pending_details',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (newBookRef.key) {
        onNext(newBookRef.key);
      }
      
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert(isRTL ? 'فشل الرفع' : 'Upload Failed', isRTL ? 'حدث خطأ أثناء رفع الصورة.' : 'Something went wrong during upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.stepLabel, { textAlign }]}>{isRTL ? 'الخطوة 1 من 4' : 'STEP 1 OF 4'}</Text>
        
        <View style={[styles.progressContainer, { flexDirection }]}>
          <Text style={styles.title}>{isRTL ? 'تفاصيل الكتاب' : 'Book Details'}</Text>
          <Text style={styles.progressText}>{isRTL ? '25% مكتمل' : '25% Complete'}</Text>
        </View>

        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, isRTL && { alignSelf: 'flex-end' }]} />
        </View>

        <TouchableOpacity 
          style={styles.uploadCard} 
          onPress={() => {
            Alert.alert(
              isRTL ? 'رفع صورة' : 'Upload Photo',
              isRTL ? 'اختر خياراً' : 'Choose an option',
              [
                { text: isRTL ? 'الكاميرا' : 'Camera', onPress: takePhoto },
                { text: isRTL ? 'المعرض' : 'Gallery', onPress: pickImage },
                { text: t('common.cancel'), style: 'cancel' },
              ]
            );
          }}
          disabled={uploading}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.uploadCardInner}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="add-a-photo" size={32} color="#355C9B" />
              </View>
              <Text style={styles.uploadTitle}>{isRTL ? 'ارفع صورة الكتاب' : 'Upload book photos'}</Text>
              <Text style={styles.uploadDescription}>
                {isRTL ? 'الصور الواضحة للغلاف تساعد الطلاب الآخرين في العثور على ما يحتاجونه.' : 'Clear photos of the cover and back help students find what they need.'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {image && (
          <TouchableOpacity 
            style={[styles.mainButton, { flexDirection }, uploading && styles.buttonDisabled]} 
            onPress={handleUploadAndSave}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.mainButtonText}>{t('common.save')}</Text>
                <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={20} color="#FFF" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: Spacing.lg },
  stepLabel: { color: VIBRANT_GOLD, fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: Spacing.xs },
  progressContainer: { justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: Spacing.sm },
  title: { fontSize: 28, fontWeight: '800', color: Colors.light.primary },
  progressText: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  progressBarBackground: { height: 8, backgroundColor: '#E2E8F0', borderRadius: Radius.pill, marginBottom: Spacing.xl, overflow: 'hidden' },
  progressBarFill: { width: '25%', height: '100%', backgroundColor: Colors.light.primary, borderRadius: Radius.pill },
  uploadCard: { width: '100%', height: 300, backgroundColor: '#FFFFFF', borderRadius: Radius.lg, borderWidth: 1.5, borderColor: '#E2E8F0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', elevation: 2 },
  uploadCardInner: { alignItems: 'center', padding: Spacing.lg },
  iconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EAF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  uploadTitle: { fontSize: 18, fontWeight: '700', color: Colors.light.primary, marginBottom: Spacing.xs },
  uploadDescription: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  mainButton: { marginTop: Spacing.xl, backgroundColor: Colors.light.primary, height: 56, borderRadius: Radius.pill, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },
  buttonDisabled: { opacity: 0.7 },
  mainButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
