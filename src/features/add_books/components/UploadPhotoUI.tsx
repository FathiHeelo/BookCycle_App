import React from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UploadStyles as styles } from '../styles';
import { VIBRANT_GOLD } from '../constants';
import { useUploadPhoto } from '../hooks/useUploadPhoto';

type UploadPhotoUIProps = ReturnType<typeof useUploadPhoto>;

export const UploadPhotoUI = (props: UploadPhotoUIProps) => {
  const { image, pickImage, takePhoto, handleContinue, t, isRTL } = props;
  const textAlign = isRTL ? 'right' : 'left';
  const flexDirection = isRTL ? 'row-reverse' : 'row';

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

        <TouchableOpacity style={styles.nextBtn} onPress={handleContinue}>
          <Text style={styles.nextBtnText}>{isRTL ? 'التالي' : 'Next'}</Text>
          <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
