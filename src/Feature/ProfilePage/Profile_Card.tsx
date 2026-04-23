import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  useWindowDimensions,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FIREBASE_AUTH, FIREBASE_DB } from '@/firebaseConfig';
import { updateProfile } from 'firebase/auth';
import { ref, update, get, query, orderByChild, equalTo } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '@/src/services/cloudinary.service';
import { useI18n } from '@/hooks/use-i18n';

interface ProfileCardProps {
  stats: {
    rating: number;
    reliability: number;
    impact: number;
  };
  userProfile?: {
    role?: 'student' | 'professor';
    fullName?: string;
    facultyName?: string;
  };
}

export default function Profile_Card({ stats, userProfile }: ProfileCardProps) {
  const { width } = useWindowDimensions();
  const { t, isRTL } = useI18n();
  const user = FIREBASE_AUTH.currentUser;
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [uploadingImage, setUploadingImage] = useState(false);

  const imageSize = 110;
  const textAlign = isRTL ? 'right' : 'left';
  const flexDirection = isRTL ? 'row-reverse' : 'row';

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(isRTL ? 'تم رفض الإذن' : 'Permission Denied', isRTL ? 'نحتاج للوصول لصورك.' : 'Permission to access gallery was denied');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && user) {
      setUploadingImage(true);
      try {
        const downloadURL = await uploadImageToCloudinary({
          uri: result.assets[0].uri,
          folder: `bookcycle/avatars/${user.uid}`,
          fileName: 'avatar',
        });

        await updateProfile(user, { photoURL: downloadURL });
        const userRef = ref(FIREBASE_DB, `Users/${user.uid}`);
        await update(userRef, { photoURL: downloadURL });
        
        Alert.alert(t('common.success'), isRTL ? 'تم تحديث الصورة بنجاح' : 'Profile picture updated');
      } catch (e) {
        Alert.alert(t('common.error'), isRTL ? 'فشل رفع الصورة' : 'Failed to upload image');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleUpdateName = async () => {
    if (!user || !newName.trim()) return;
    try {
      const updatedName = newName.trim();
      
      // 1. Update Auth Profile
      await updateProfile(user, { displayName: updatedName });
      
      // 2. Update Users table
      const userRef = ref(FIREBASE_DB, `Users/${user.uid}`);
      await update(userRef, { fullName: updatedName });

      // 3. Update all Books owned by this user (Donor Name)
      const booksRef = ref(FIREBASE_DB, 'Books');
      const booksSnap = await get(query(booksRef, orderByChild('donorUid'), equalTo(user.uid)));
      if (booksSnap.exists()) {
        const updates: any = {};
        booksSnap.forEach((child) => {
          updates[`Books/${child.key}/donorName`] = updatedName;
        });
        await update(ref(FIREBASE_DB), updates);
      }

      // 4. Update Requests (as donor or requester)
      const requestsRef = ref(FIREBASE_DB, 'Requests');
      
      // Update as donor
      const donorRequestsSnap = await get(query(requestsRef, orderByChild('donorUid'), equalTo(user.uid)));
      if (donorRequestsSnap.exists()) {
        const dUpdates: any = {};
        donorRequestsSnap.forEach((child) => {
          dUpdates[`Requests/${child.key}/donorName`] = updatedName;
        });
        await update(ref(FIREBASE_DB), dUpdates);
      }

      // Update as requester
      const requesterRequestsSnap = await get(query(requestsRef, orderByChild('requesterUid'), equalTo(user.uid)));
      if (requesterRequestsSnap.exists()) {
        const rUpdates: any = {};
        requesterRequestsSnap.forEach((child) => {
          rUpdates[`Requests/${child.key}/requesterName`] = updatedName;
        });
        await update(ref(FIREBASE_DB), rUpdates);
      }

      setModalVisible(false);
      Alert.alert(t('common.success'), isRTL ? 'تم تحديث الاسم في جميع أنحاء التطبيق' : 'Name updated globally');
    } catch (e) {
      console.error('Update name error:', e);
      Alert.alert(t('common.error'), 'Failed to update name');
    }
  };

  const getRoleLabel = () => {
    const role = userProfile?.role || 'student';
    return role === 'professor' ? t('auth.signup.professor') : t('auth.signup.student');
  };

  return (
    <View style={styles.container}>
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

        {/* Role Badge - Closer to Photo */}
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

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
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
              <TouchableOpacity 
                style={[styles.btn, styles.cancelBtn]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btn, styles.saveBtn]} 
                onPress={handleUpdateName}
              >
                <Text style={styles.saveBtnText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  profileHeader: {
    alignItems: 'center',
    gap: 16,
  },
  imageContainer: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
  },
  profileImage: {
    resizeMode: 'cover',
  },
  placeholderImage: {
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#001B39',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    alignItems: 'center',
    width: '100%',
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#001B39',
    marginBottom: 8,
  },
  blueEditBtn: {
    backgroundColor: '#001B39',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  blueEditBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  roleBadge: {
    backgroundColor: '#F1F4F7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#001B39',
    textTransform: 'uppercase',
  },
  universityRow: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  universityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  facultyRow: {
    alignItems: 'center',
    gap: 6,
  },
  facultyName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#001B39',
  },
  editButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    padding: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#001B39',
    marginBottom: 20,
  },
  nameInput: {
    width: '100%',
    height: 56,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9',
  },
  saveBtn: {
    backgroundColor: '#001B39',
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '700',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});