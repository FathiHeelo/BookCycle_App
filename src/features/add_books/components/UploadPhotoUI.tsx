import React from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UploadStyles as styles } from '../styles';
import { VIBRANT_GOLD } from '../constants';
import { useUploadPhoto } from '../hooks/useUploadPhoto';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

type UploadPhotoUIProps = ReturnType<typeof useUploadPhoto>;

export const UploadPhotoUI = (props: UploadPhotoUIProps) => {
  const { image, pickImage, takePhoto, handleContinue, t, isRTL } = props;
  const { theme: themeKey } = useAppTheme();
  const themeColors = Colors[themeKey];
  const textAlign = isRTL ? 'right' : 'left';
  const flexDirection = isRTL ? 'row-reverse' : 'row';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.card }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { textAlign, color: themeColors.text }]}>{isRTL ? 'صورة المصدر' : 'Material Image'}</Text>
          <Text style={[styles.subtitle, { textAlign, color: themeColors.textSecondary }]}>
            {isRTL ? 'الرجاء تصوير المصدر بشكل واضح أو اختيار صورة من المعرض.' : 'Please take a clear photo of the material or choose from gallery.'}
          </Text>
        </View>

        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={pickImage}
          style={[styles.imageBox, { borderColor: themeColors.border, backgroundColor: themeKey === 'dark' ? themeColors.background : '#F8FAFC' }]}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="camera-outline" size={48} color={themeColors.textSecondary} />
              <Text style={[styles.placeholderText, { color: themeColors.textSecondary, fontSize: 12 }]}>
                {isRTL ? 'اضغط لاختيار صورة' : 'Tap to select image'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={[styles.optionsContainer, { flexDirection }]}>
          <TouchableOpacity style={[styles.optionBtn, { borderColor: themeColors.border, backgroundColor: themeKey === 'dark' ? themeColors.background : '#fff' }]} onPress={takePhoto}>
            <Ionicons name="camera" size={24} color={themeColors.primary} />
            <Text style={[styles.optionText, { color: themeColors.text }]}>{isRTL ? 'الكاميرا' : 'Camera'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.optionBtn, { borderColor: themeColors.border, backgroundColor: themeKey === 'dark' ? themeColors.background : '#fff' }]} onPress={pickImage}>
            <Ionicons name="images" size={24} color={themeColors.primary} />
            <Text style={[styles.optionText, { color: themeColors.text }]}>{isRTL ? 'المعرض' : 'Gallery'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: themeColors.primary }]} onPress={handleContinue}>
          <Text style={styles.nextBtnText}>{isRTL ? 'التالي' : 'Next'}</Text>
          <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
