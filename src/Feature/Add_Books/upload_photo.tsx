import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useI18n } from '@/hooks/use-i18n';

const VIBRANT_GOLD = '#B58D3D';

interface UploadPhotoProps {
  onNext: (imageUri: string) => void;
  initialImage?: string;
}

export default function UploadPhotoScreen({ onNext, initialImage }: UploadPhotoProps) {
  const { t, isRTL } = useI18n();
  const [image, setImage] = useState<string | null>(initialImage || null);

  const textAlign = isRTL ? 'right' : 'left';
  const flexDirection = isRTL ? 'row-reverse' : 'row';

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        isRTL ? 'تم رفض الإذن' : 'Permission Denied', 
        isRTL ? 'نحتاج للوصول لصورك لرفع صورة المصدر.' : 'We need access to your photos to upload images.'
      );
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
      Alert.alert(
        isRTL ? 'تم رفض الإذن' : 'Permission Denied', 
        isRTL ? 'نحتاج للوصول للكاميرا لالتقاط صورة المصدر.' : 'We need access to your camera to take images.'
      );
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

  const handleContinue = () => {
    if (!image) {
      Alert.alert(
        isRTL ? 'لا توجد صورة' : 'No Image', 
        isRTL ? 'يرجى اختيار أو التقاط صورة للمصدر الدراسي.' : 'Please select or take a photo of the study material.'
      );
      return;
    }
    onNext(image);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { textAlign }]}>{isRTL ? 'صورة المصدر' : 'Material Image'}</Text>
          <Text style={[styles.subtitle, { textAlign }]}>
            {isRTL ? 'الرجاء تصوير المصدر بشكل واضح أو اختيار صورة من المعرض.' : 'Please take a clear photo of the material or choose from gallery.'}
          </Text>
        </View>

        <View style={styles.imageBox}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="camera-outline" size={64} color="#CBD5E1" />
              <Text style={styles.placeholderText}>
                {isRTL ? 'لم يتم اختيار صورة' : 'No image selected'}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.optionsContainer, { flexDirection }]}>
          <TouchableOpacity style={styles.optionBtn} onPress={takePhoto}>
            <Ionicons name="camera" size={24} color={VIBRANT_GOLD} />
            <Text style={styles.optionText}>{isRTL ? 'الكاميرا' : 'Camera'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionBtn} onPress={pickImage}>
            <Ionicons name="images" size={24} color={VIBRANT_GOLD} />
            <Text style={styles.optionText}>{isRTL ? 'المعرض' : 'Gallery'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.nextBtn} 
          onPress={handleContinue}
        >
          <Text style={styles.nextBtnText}>{t('auth.onboarding.next')}</Text>
          <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#001B39',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  imageBox: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  optionBtn: {
    flex: 1,
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#001B39',
  },
  nextBtn: {
    height: 56,
    backgroundColor: '#001B39',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
