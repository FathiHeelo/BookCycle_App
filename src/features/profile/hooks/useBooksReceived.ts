import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { ref, onValue, query, orderByChild, equalTo, remove, update } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { useI18n } from '@/hooks/use-i18n';
import { useAppTheme } from '@/context/ThemeContext';
import { HistoryBookItem } from '../types';

export const useBooksReceived = () => {
  const { t, isRTL } = useI18n();
  const { colors, isAccessible } = useAppTheme();
  const currentUser = FIREBASE_AUTH.currentUser;

  const [requests, setRequests] = useState<HistoryBookItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const requestsRef = ref(FIREBASE_DB, 'Requests');
    const userRequestsQuery = query(requestsRef, orderByChild('requesterUid'), equalTo(currentUser.uid));

    const unsubscribe = onValue(userRequestsQuery, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list: HistoryBookItem[] = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRequests(list.slice(0, 3));
      } else {
        setRequests([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleCancelRequest = (requestId: string, bookId: string) => {
    Alert.alert(
      isRTL ? 'إلغاء الطلب' : 'Cancel Request',
      isRTL ? 'هل أنت متأكد من إلغاء هذا الطلب؟' : 'Are you sure you want to cancel this request?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: isRTL ? 'تأكيد الإلغاء' : 'Confirm Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(ref(FIREBASE_DB, `Requests/${requestId}`));
              const bookRef = ref(FIREBASE_DB, `Books/${bookId}`);
              await update(bookRef, { status: 'active' });
              Alert.alert(t('common.success'), isRTL ? 'تم إلغاء الطلب بنجاح' : 'Request cancelled successfully');
            } catch {
              Alert.alert(t('common.error'), 'Failed to cancel request');
            }
          }
        }
      ]
    );
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return isRTL ? 'بانتظار الموافقة' : 'Waiting for approval';
      case 'accepted': return isRTL ? 'تم قبول طلبك' : 'Request Accepted';
      case 'received':
      case 'completed': return isRTL ? 'تم الاستلام بنجاح' : 'Received successfully';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    if (isAccessible) {
      if (status === 'received' || status === 'completed' || status === 'accepted') return colors.success;
      return colors.accent;
    }
    if (status === 'received' || status === 'completed' || status === 'accepted') return '#10B981';
    return '#F59E0B';
  };

  return { requests, loading, handleCancelRequest, getStatusLabel, getStatusColor, t, isRTL };
};
