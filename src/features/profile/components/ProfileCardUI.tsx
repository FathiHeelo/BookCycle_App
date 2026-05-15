import React from 'react';
import { View, Text, Image, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStyles as styles } from '../styles';
import { useProfileCard } from '../hooks/useProfileCard';
import { ProfileCardProps } from '../types';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

export const ProfileCardUI = ({ stats, userProfile }: ProfileCardProps) => {
  const {
    user, modalVisible, setModalVisible, newName, setNewName,
    uploadingImage, pickImage, handleRemoveImage, handleUpdateName, t, isRTL
  } = useProfileCard();

  const { theme: themeKey, isAccessible, colors: themeColors } = useAppTheme();


  const imageSize = 110;
  const textAlign = isRTL ? 'right' : 'left';
  const flexDirection = isRTL ? 'row-reverse' : 'row';

  const getRoleLabel = () => {
    const role = userProfile?.role || 'student';
    return role === 'professor' ? t('auth.signup.professor') : t('auth.signup.student');
  };

  return (
    <View style={[styles.profileCardContainer, { backgroundColor: themeColors.card, shadowColor: themeKey === 'dark' ? '#000' : '#000', elevation: themeKey === 'dark' ? 0 : 5 }]}>
      <View style={styles.profileHeader}>
        <TouchableOpacity 
          style={[styles.imageContainer, { width: imageSize + 8, height: imageSize + 8, borderRadius: (imageSize + 8) / 2 }]} 
          onPress={pickImage}
          disabled={uploadingImage}
        >
          {userProfile?.photoURL || user?.photoURL ? (
            <Image
              source={{ uri: userProfile?.photoURL || user?.photoURL } as any}
              style={[styles.profileImage, { width: imageSize, height: imageSize, borderRadius: imageSize / 2 }]}
            />
          ) : (
            <View style={[styles.placeholderImage, { width: imageSize, height: imageSize, borderRadius: imageSize / 2 }]}>
              <Ionicons name="person" size={imageSize * 0.5} color="#94A3B8" />
            </View>
          )}
          
          <View style={styles.editIconBadge}>
            <Ionicons name="camera" size={18} color="#fff" />
          </View>

          {uploadingImage && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        <View style={[styles.roleBadge, { 
          flexDirection, 
          marginTop: 4, 
          backgroundColor: themeKey === 'dark' ? themeColors.background : '#F1F4F7', 
          borderColor: themeColors.primary,
          borderWidth: isAccessible ? 1.5 : 1
        }]}>
          <Ionicons name={userProfile?.role === 'professor' ? 'school' : 'person'} size={12} color={themeColors.primary} />
          <Text style={[styles.roleText, { color: themeColors.text, fontWeight: isAccessible ? '900' : '700' }]}>{getRoleLabel()}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.userName, { textAlign, color: themeColors.text }]}>{userProfile?.fullName || user?.displayName || 'User'}</Text>
          
          <TouchableOpacity 
            style={[styles.blueEditBtn, { 
              backgroundColor: themeColors.primary,
              borderWidth: isAccessible ? 2 : 0,
              borderColor: '#FFF'
            }]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="pencil" size={14} color={themeKey === 'dark' ? '#0B1020' : '#fff'} />
            <Text style={[styles.blueEditBtnText, { color: themeKey === 'dark' ? '#0B1020' : '#fff', fontWeight: isAccessible ? '900' : '700' }]}>{t('profile.card.edit')}</Text>
          </TouchableOpacity>

          <View style={[styles.universityRow, { flexDirection }]}>
            <Ionicons name="location" size={14} color={themeColors.textSecondary} />
            <Text style={[styles.universityName, { textAlign, color: themeColors.textSecondary }]}>{t('profile.card.university')}</Text>
          </View>
          <View style={[styles.facultyRow, { flexDirection }]}>
            <Ionicons name="briefcase" size={14} color={themeColors.primary} />
            <Text style={[styles.facultyName, { textAlign, color: themeColors.text }]}>{userProfile?.facultyName || 'Najah Faculty'}</Text>
          </View>
        </View>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>{t('profile.card.edit')}</Text>
            <TextInput
              style={[styles.nameInput, { backgroundColor: themeKey === 'dark' ? themeColors.card : '#F1F5F9', color: themeColors.text }]}
              value={newName}
              onChangeText={setNewName}
              placeholderTextColor={themeColors.textSecondary}
            />
            
            {/* Remove Photo Option */}
            {(userProfile?.photoURL || user?.photoURL) && (
              <TouchableOpacity 
                style={[styles.removePhotoBtn, { flexDirection, alignItems: 'center', justifyContent: 'center', marginVertical: 12 }]} 
                onPress={() => {
                  setModalVisible(false);
                  handleRemoveImage();
                }}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text style={{ color: '#EF4444', fontWeight: '700', marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}>
                  {isRTL ? 'إزالة الصورة' : 'Remove Photo'}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.cancelBtn, { backgroundColor: themeKey === 'dark' ? themeColors.card : '#F1F5F9' }]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.cancelBtnText, { color: themeColors.text }]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.saveBtn, { backgroundColor: themeColors.primary }]} onPress={handleUpdateName}>
                <Text style={[styles.saveBtnText, { color: themeKey === 'dark' ? '#0B1020' : '#fff' }]}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
