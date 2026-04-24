import React, { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useI18n } from '@/hooks/use-i18n';

export const useUploadPhoto = (initialImage?: string, onNext?: (imageUri: string) => void) => {
  const { t, isRTL } = useI18n();
  const [image, setImage] = useState<string | null>(initialImage || null);
  
  // Sync state with prop if it changes (e.g. when editing or going back)
  React.useEffect(() => {
    if (initialImage) setImage(initialImage);
  }, [initialImage]);

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
    if (onNext) onNext(image);
  };

  return {
    image,
    pickImage,
    takePhoto,
    handleContinue,
    t,
    isRTL,
  };
};
