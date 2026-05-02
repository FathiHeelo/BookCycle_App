import React, { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useI18n } from '@/hooks/use-i18n';
import { AI_MOCK_IMAGES, AI_MOCK_DESCRIPTIONS } from '../constants/ai_mocks';

export const useUploadPhoto = (
  initialImage?: string,
  onNext?: (imageUri: string, analysis?: { description?: string; category?: string; title?: string }) => void
) => {
  const { isRTL } = useI18n();
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isMockImage, setIsMockImage] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState<{ description?: string; category?: string; title?: string } | null>(null);

  React.useEffect(() => {
    if (initialImage) setImage(initialImage);
  }, [initialImage]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        isRTL ? 'تم رفض الإذن' : 'Permission Denied',
        isRTL ? 'نحتاج للوصول لصورك.' : 'We need access to your photos.'
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
      setIsMockImage(false);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        isRTL ? 'تم رفض الإذن' : 'Permission Denied',
        isRTL ? 'نحتاج للوصول للكاميرا.' : 'We need access to your camera.'
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
      setIsMockImage(false);
    }
  };

  // Called when user submits the AI generation form (category + title)
  const handleGenerateFromForm = (category: string, title: string) => {
    setAiLoading(true);
    setTimeout(() => {
      const mockUrl = AI_MOCK_IMAGES[category] || AI_MOCK_IMAGES['others'];
      const descObj = AI_MOCK_DESCRIPTIONS[category] || AI_MOCK_DESCRIPTIONS['others'];
      const description = isRTL ? descObj.ar : descObj.en;

      setImage(mockUrl);
      setIsMockImage(true);
      setPendingAnalysis({ description, category, title });
      setAiLoading(false);
    }, 900);
  };

  const handleContinue = () => {
    if (!image) {
      Alert.alert(
        isRTL ? 'لا توجد صورة' : 'No Image',
        isRTL ? 'يرجى اختيار صورة.' : 'Please select an image first.'
      );
      return;
    }
    if (onNext) onNext(image, pendingAnalysis || undefined);
  };

  return {
    image,
    pickImage,
    takePhoto,
    handleContinue,
    handleGenerateFromForm,
    aiLoading,
    isMockImage,
    pendingAnalysis,
    isRTL,
  };
};
