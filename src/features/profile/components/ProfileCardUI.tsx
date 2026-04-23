import React from 'react';
import { View, Text, Image, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStyles as styles } from '../styles';
import { useProfileCard } from '../hooks/useProfileCard';
import { ProfileCardProps } from '../types';

export const ProfileCardUI = ({ stats, userProfile }: ProfileCardProps) => {
  const {
    user, modalVisible, setModalVisible, newName, setNewName,
    uploadingImage, pickImage, handleUpdateName, t, isRTL
  } = useProfileCard();

  const imageSize = 110;
  const textAlign = isRTL ? 'right' : 'left';
  const flexDirection = isRTL ? 'row-reverse' : 'row';

  const getRoleLabel = () => {
    const role = userProfile?.role || 'student';
    return role === 'professor' ? t('auth.signup.professor') : t('auth.signup.student');
  };

  return (
    <View style={styles.profileCardContainer}>
      <View style={styles.profileHeader}>
        <TouchableOpacity 
          style={[styles.imageContainer, { width: imageSize + 8, height: imageSize + 8, borderRadius: (imageSize + 8) / 2 }]} 
          onPress={pickImage}
          disabled={uploadingImage}
        >
          {user?.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
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

        <View style={[styles.roleBadge, { flexDirection, marginTop: 4 }]}>
          <Ionicons name={userProfile?.role === 'professor' ? 'school' : 'person'} size={12} color="#001B39" />
          <Text style={styles.roleText}>{getRoleLabel()}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.userName, { textAlign }]}>{user?.displayName || 'User'}</Text>
          
          <TouchableOpacity 
            style={styles.blueEditBtn}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="pencil" size={14} color="#fff" />
            <Text style={styles.blueEditBtnText}>{t('profile.card.edit')}</Text>
          </TouchableOpacity>

          <View style={[styles.universityRow, { flexDirection }]}>
            <Ionicons name="location" size={14} color="#64748B" />
            <Text style={[styles.universityName, { textAlign }]}>{t('profile.card.university')}</Text>
          </View>
          <View style={[styles.facultyRow, { flexDirection }]}>
            <Ionicons name="briefcase" size={14} color="#64748B" />
            <Text style={[styles.facultyName, { textAlign }]}>{userProfile?.facultyName || 'Najah Faculty'}</Text>
          </View>
        </View>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('profile.card.edit')}</Text>
            <TextInput
              style={styles.nameInput}
              value={newName}
              onChangeText={setNewName}
              placeholder={t('auth.signup.fullNamePlaceholder')}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={handleUpdateName}>
                <Text style={styles.saveBtnText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
