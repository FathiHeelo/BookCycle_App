import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from 'firebase/auth';
import { ref, update, get, query, orderByChild, equalTo } from 'firebase/database';
import { FIREBASE_AUTH, FIREBASE_DB } from '@/firebaseConfig';
import { uploadImageToCloudinary } from '@/src/services/cloudinary.service';
import { useI18n } from '@/hooks/use-i18n';

export const useProfileCard = () => {
  const { t, isRTL } = useI18n();
  const user = FIREBASE_AUTH.currentUser;

  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [uploadingImage, setUploadingImage] = useState(false);

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
          fileName: `avatar_${Date.now()}`,
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

  const handleRemoveImage = async () => {
    if (!user) return;
    
    Alert.alert(
      isRTL ? 'إزالة الصورة' : 'Remove Photo',
      isRTL ? 'هل أنت متأكد من رغبتك في إزالة صورة البروفايل؟' : 'Are you sure you want to remove your profile picture?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: isRTL ? 'إزالة' : 'Remove', 
          style: 'destructive',
          onPress: async () => {
            setUploadingImage(true);
            try {
              await updateProfile(user, { photoURL: '' });
              const userRef = ref(FIREBASE_DB, `Users/${user.uid}`);
              await update(userRef, { photoURL: null });
              
              Alert.alert(t('common.success'), isRTL ? 'تم إزالة الصورة بنجاح' : 'Profile picture removed');
            } catch (e) {
              Alert.alert(t('common.error'), isRTL ? 'فشل إزالة الصورة' : 'Failed to remove image');
            } finally {
              setUploadingImage(false);
            }
          }
        }
      ]
    );
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

      // 3. Update all Books owned by this user
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
      
      const donorRequestsSnap = await get(query(requestsRef, orderByChild('donorUid'), equalTo(user.uid)));
      if (donorRequestsSnap.exists()) {
        const dUpdates: any = {};
        donorRequestsSnap.forEach((child) => {
          dUpdates[`Requests/${child.key}/donorName`] = updatedName;
        });
        await update(ref(FIREBASE_DB), dUpdates);
      }

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

  return {
    user,
    modalVisible,
    setModalVisible,
    newName,
    setNewName,
    uploadingImage,
    pickImage,
    handleRemoveImage,
    handleUpdateName,
    t,
    isRTL,
  };
};
