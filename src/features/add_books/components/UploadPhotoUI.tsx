import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Image, SafeAreaView,
  Modal, TextInput, ActivityIndicator, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UploadStyles as styles } from '../styles';
import { VIBRANT_GOLD } from '../constants';
import { useUploadPhoto } from '../hooks/useUploadPhoto';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { AI_MOTIVATIONAL_MESSAGES, AI_MOTIVATIONAL_MESSAGES_AR } from '../constants/ai_mocks';

type UploadPhotoUIProps = ReturnType<typeof useUploadPhoto>;

// 4 resource types matching RESOURCE_CATEGORIES IDs
const RESOURCE_TYPES = [
  { id: 'books',    iconEn: 'book-outline',          en: 'Books',     ar: 'كتب' },
  { id: 'notes',    iconEn: 'easel-outline',          en: 'Slides',    ar: 'سلايدات' },
  { id: 'hardware', iconEn: 'construct-outline',      en: 'Equipment', ar: 'قطع وعدة' },
  { id: 'others',   iconEn: 'ellipsis-horizontal-outline', en: 'Other', ar: 'أخرى' },
];

export const UploadPhotoUI = (props: UploadPhotoUIProps) => {
  const {
    image, pickImage, takePhoto, handleContinue,
    handleGenerateFromForm, aiLoading, isMockImage, pendingAnalysis,
    isRTL,
  } = props;

  const { theme: themeKey } = useAppTheme();
  const themeColors = Colors[themeKey];
  const textAlign = isRTL ? 'right' : 'left';
  const rowDir: 'row' | 'row-reverse' = isRTL ? 'row-reverse' : 'row';

  // AI form modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('books');
  const [titleInput, setTitleInput] = useState('');
  const [titleFocused, setTitleFocused] = useState(false);

  // Motivational message cycling during load
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = isRTL ? AI_MOTIVATIONAL_MESSAGES_AR : AI_MOTIVATIONAL_MESSAGES;
  useEffect(() => {
    let interval: any;
    if (aiLoading) {
      interval = setInterval(() => setMessageIndex(p => (p + 1) % messages.length), 2000);
    } else {
      setMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [aiLoading]);

  const onGenerate = () => {
    setModalVisible(false);
    handleGenerateFromForm(selectedType, titleInput.trim());
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.card }]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
        <View style={styles.content}>

          {/* Header */}
          <View style={styles.header}>
            <View style={[local.guideBox, { backgroundColor: themeKey === 'dark' ? '#0A1A2F' : '#F0F9FF', borderColor: themeColors.primary + '30' }]}>
              <Ionicons name="information-circle" size={20} color={themeColors.primary} />
              <Text style={[local.guideText, { color: themeColors.text, textAlign }]}>
                {isRTL 
                  ? 'هذه الخطوة مخصصة لإضافة صورة للمصدر. يمكنك التصوير، الاختيار من المعرض، أو استخدام الذكاء الاصطناعي لتسهيل العملية.' 
                  : 'This step is for adding a photo of your resource. You can take a photo, pick from gallery, or use AI to simplify the process.'}
              </Text>
            </View>
            <Text style={[styles.title, { textAlign, color: themeColors.text }]}>
              {isRTL ? 'صورة المصدر' : 'Material Image'}
            </Text>
            <Text style={[styles.subtitle, { textAlign, color: themeColors.textSecondary }]}>
              {isRTL
                ? 'التقط صورة أو اختر من المعرض، أو استخدم الذكاء الاصطناعي لتوليد صورة ووصف تلقائي.'
                : 'Take a photo, pick from gallery, or use AI to generate a suitable image and description.'}
            </Text>
          </View>

          {/* Image Preview */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={pickImage}
            style={[styles.imageBox, {
              borderColor: image ? themeColors.primary : themeColors.border,
              backgroundColor: themeKey === 'dark' ? themeColors.background : '#F8FAFC',
            }]}
          >
            {image ? (
              <View style={{ width: '100%', height: '100%' }}>
                <Image source={{ uri: image }} style={styles.previewImage} />
                {isMockImage && (
                  <View style={local.imageBadge}>
                    <Ionicons name="sparkles" size={11} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600', marginLeft: 4 }}>
                      {isRTL ? 'AI • اضغط لتغيير' : 'AI • tap to change'}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="image-outline" size={52} color={themeColors.textSecondary} />
                <Text style={[styles.placeholderText, { color: themeColors.textSecondary, marginTop: 10 }]}>
                  {isRTL ? 'اضغط لاختيار صورة' : 'Tap to select image'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Auto-description badge */}
          {pendingAnalysis?.description && (
            <View style={[local.descBadge, { backgroundColor: themeKey === 'dark' ? '#0A2218' : '#ECFDF5', borderColor: '#10B981' }]}>
              <Ionicons name="checkmark-circle" size={15} color="#10B981" />
              <Text style={{ fontSize: 12, color: '#10B981', fontWeight: '700', flex: 1, marginLeft: 6, textAlign }}>
                {isRTL ? 'وصف تلقائي جاهز ✓' : 'Description auto-generated ✓'}
              </Text>
            </View>
          )}

          {/* Camera & Gallery */}
          <View style={{ flexDirection: rowDir, gap: 10, marginBottom: 12 }}>
            <TouchableOpacity
              style={[local.photoBtn, { flex: 1, borderColor: themeColors.border, backgroundColor: themeKey === 'dark' ? themeColors.background : '#fff' }]}
              onPress={takePhoto}
            >
              <Ionicons name="camera" size={20} color={themeColors.primary} />
              <Text style={[local.photoBtnText, { color: themeColors.text }]}>{isRTL ? 'الكاميرا' : 'Camera'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[local.photoBtn, { flex: 1, borderColor: themeColors.border, backgroundColor: themeKey === 'dark' ? themeColors.background : '#fff' }]}
              onPress={pickImage}
            >
              <Ionicons name="images" size={20} color={themeColors.primary} />
              <Text style={[local.photoBtnText, { color: themeColors.text }]}>{isRTL ? 'المعرض' : 'Gallery'}</Text>
            </TouchableOpacity>
          </View>

          {/* AI Generate Button */}
          <TouchableOpacity
            style={[local.aiBtn, { backgroundColor: VIBRANT_GOLD, marginBottom: 20 }]}
            onPress={() => setModalVisible(true)}
            disabled={aiLoading}
          >
            <Ionicons name="sparkles" size={18} color="#fff" />
            <Text style={local.aiBtnText}>
              {isRTL ? 'توليد بالذكاء الاصطناعي' : 'Generate with AI'}
            </Text>
          </TouchableOpacity>

          {/* Next */}
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: themeColors.primary, flexDirection: rowDir }]}
            onPress={handleContinue}
          >
            <Text style={styles.nextBtnText}>{isRTL ? 'التالي' : 'Next'}</Text>
            <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* AI Loading Overlay */}
      {aiLoading && (
        <View style={local.loadingOverlay}>
          <View style={[local.loadingCard, { backgroundColor: themeColors.card }]}>
            <ActivityIndicator size="large" color={VIBRANT_GOLD} />
            <Text style={[local.loadingMsg, { color: themeColors.text }]}>{messages[messageIndex]}</Text>
          </View>
        </View>
      )}

      {/* AI Generation Form Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={local.modalOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <View style={[local.modalContent, { backgroundColor: themeColors.card }]}>

            {/* Modal Header */}
            <View style={{ flexDirection: rowDir, justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <View style={{ flexDirection: rowDir, alignItems: 'center', gap: 8 }}>
                <Ionicons name="sparkles" size={20} color={VIBRANT_GOLD} />
                <Text style={{ fontSize: 17, fontWeight: '800', color: themeColors.text }}>
                  {isRTL ? 'توليد بالذكاء الاصطناعي' : 'Generate with AI'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Resource Type */}
              <Text style={[local.label, { color: themeColors.textSecondary, textAlign }]}>
                {isRTL ? 'نوع المصدر' : 'Resource Type'}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                {RESOURCE_TYPES.map(type => {
                  const active = selectedType === type.id;
                  return (
                    <TouchableOpacity
                      key={type.id}
                      onPress={() => setSelectedType(type.id)}
                      style={[local.typeChip, {
                        backgroundColor: active ? VIBRANT_GOLD : (themeKey === 'dark' ? themeColors.background : '#F1F5F9'),
                        borderColor: active ? VIBRANT_GOLD : themeColors.border,
                      }]}
                    >
                      <Ionicons name={type.iconEn as any} size={14} color={active ? '#fff' : themeColors.text} />
                      <Text style={{ fontSize: 13, fontWeight: '700', color: active ? '#fff' : themeColors.text }}>
                        {isRTL ? type.ar : type.en}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Title */}
              <Text style={[local.label, { color: themeColors.textSecondary, textAlign }]}>
                {isRTL ? 'اسم المصدر (اختياري)' : 'Resource Name (optional)'}
              </Text>
              <TextInput
                style={[local.input, {
                  color: themeColors.text,
                  borderColor: titleFocused ? VIBRANT_GOLD : themeColors.border,
                  borderWidth: titleFocused ? 2 : 1,
                  backgroundColor: themeKey === 'dark' ? themeColors.background : '#F8FAFC',
                  textAlign,
                }]}
                placeholder={isRTL ? 'مثال: ملخص فيزياء أو أردوينو' : 'e.g. Physics Summary or Arduino Kit'}
                placeholderTextColor={themeColors.textSecondary}
                value={titleInput}
                onChangeText={setTitleInput}
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
              />


              {/* Generate Button */}
              <TouchableOpacity
                style={[local.aiBtn, { backgroundColor: VIBRANT_GOLD, marginTop: 16, marginBottom: 20 }]}
                onPress={onGenerate}
              >
                <Ionicons name="sparkles" size={18} color="#fff" />
                <Text style={local.aiBtnText}>{isRTL ? 'توليد' : 'Generate'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const local = StyleSheet.create({
  photoBtn: {
    height: 50, borderRadius: 14, borderWidth: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  photoBtnText: { fontSize: 14, fontWeight: '700' },
  aiBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 52, borderRadius: 14,
  },
  aiBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  imageBadge: {
    position: 'absolute', bottom: 10, left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, flexDirection: 'row', alignItems: 'center',
  },
  descBadge: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 12,
  },
  guideBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 10,
  },
  guideText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center', alignItems: 'center', zIndex: 1000,
  },
  loadingCard: {
    padding: 32, borderRadius: 24, width: '80%', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  loadingMsg: {
    marginTop: 18, textAlign: 'center', fontSize: 15, fontWeight: '600', lineHeight: 22,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, maxHeight: '80%',
  },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  input: {
    borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 14, fontSize: 15,
  },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5,
  },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderWidth: 1, borderRadius: 10, padding: 10,
  },
});
