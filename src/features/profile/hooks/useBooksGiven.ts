import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { ref, onValue, query, orderByChild, equalTo, remove } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { useI18n } from '@/hooks/use-i18n';
import { HistoryBookItem } from '../types';
import { useAppTheme } from '@/context/ThemeContext';

export const useBooksGiven = () => {
  const { t, isRTL } = useI18n();
  const { colors, isAccessible } = useAppTheme();
  const currentUser = FIREBASE_AUTH.currentUser;

  const [books, setBooks] = useState<HistoryBookItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const booksRef = ref(FIREBASE_DB, 'Books');
    const userBooksQuery = query(booksRef, orderByChild('donorUid'), equalTo(currentUser.uid));

    const unsubscribe = onValue(userBooksQuery, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list: HistoryBookItem[] = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBooks(list.slice(0, 3));
      } else {
        setBooks([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleDelete = (bookId: string) => {
    Alert.alert(
      isRTL ? 'حذف المصدر' : 'Delete Resource',
      isRTL ? 'هل أنت متأكد من حذف هذا المصدر نهائياً؟' : 'Are you sure you want to delete this resource permanently?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: isRTL ? 'حذف' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(ref(FIREBASE_DB, `Books/${bookId}`));
              Alert.alert(t('common.success'), isRTL ? 'تم الحذف بنجاح' : 'Deleted successfully');
            } catch (e) {
              Alert.alert(t('common.error'), 'Failed to delete');
            }
          }
        }
      ]
    );
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'requested': return isRTL ? 'تم الطلب منك' : 'Request received';
      case 'received':
      case 'completed': return isRTL ? 'تم التسليم' : 'Given away';
      default: return isRTL ? 'نشط (متوفر)' : 'Active (Available)';
    }
  };

  const getStatusColor = (status: string) => {
    if (isAccessible) {
      switch (status) {
        case 'requested': return colors.accent; // Yellow
        case 'received':
        case 'completed': return colors.success; // Blue
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
