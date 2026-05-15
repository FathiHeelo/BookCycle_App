import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { ref, onValue, query, orderByChild, equalTo, remove } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { useI18n } from '@/hooks/use-i18n';
import { useAppTheme } from '@/context/ThemeContext';

export interface SharedBookItem {
  id: string;
  title: string;
  facultyId?: string;
  facultyIds?: string[];
  donorName: string;
  createdAt: string;
  conditionId: string;
  imageUrl?: string;
  image?: string;
  status: string;
}

export const useMySharedItems = () => {
  const { t, isRTL } = useI18n();
  const { colors, isAccessible } = useAppTheme();
  const currentUser = FIREBASE_AUTH.currentUser;

  const [books, setBooks] = useState<SharedBookItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const booksRef = ref(FIREBASE_DB, 'Books');
    const userBooksQuery = query(booksRef, orderByChild('donorUid'), equalTo(currentUser.uid));

    const unsubscribe = onValue(userBooksQuery, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list: SharedBookItem[] = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBooks(list);
      } else {
        setBooks([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleDelete = (bookId: string) => {
    Alert.alert(
      t('shared.deleteConfirmTitle'),
      t('shared.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(ref(FIREBASE_DB, `Books/${bookId}`));
              Alert.alert(t('common.success'), t('shared.deleteSuccess'));
            } catch {
              Alert.alert(t('common.error'), t('shared.deleteError'));
            }
          }
        }
      ]
    );
  };

  const getStatusLabel = (status: string) => {
    return t(`requests.status.${status}`);
  };

  const getStatusColor = (status: string) => {
    if (isAccessible) {
      switch (status) {
        case 'requested': return colors.accent;
        case 'received':
        case 'completed': return colors.success;
        default: return colors.primary;
      }
    }
    switch (status) {
      case 'requested': return '#F59E0B';
      case 'received':
      case 'completed': return '#10B981';
      default: return '#3B82F6';
    }
  };

  return { books, loading, handleDelete, getStatusLabel, getStatusColor, t, isRTL };
};
