import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { ref, onValue, update, remove } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { useI18n } from '@/hooks/use-i18n';

export interface BookRequest {
  id: string;
  bookId: string;
  bookTitle: string;
  bookImage: string;
  requesterUid: string;
  requesterName: string;
  donorUid: string;
  donorName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'received' | 'completed';
  createdAt: string;
}

export const useMyRequests = () => {
  const { t, isRTL } = useI18n();
  const currentUser = FIREBASE_AUTH.currentUser;

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingVisible, setRatingVisible] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState({ id: '', name: '' });

  useEffect(() => {
    if (!currentUser) return;

    const requestsRef = ref(FIREBASE_DB, 'Requests');
    const unsubscribe = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: BookRequest[] = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(req =>
            activeTab === 'received'
              ? req.donorUid === currentUser.uid
              : req.requesterUid === currentUser.uid
          )
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRequests(list);
      } else {
        setRequests([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeTab, currentUser]);

  const handleUpdateStatus = async (requestId: string, bookId: string, newStatus: string) => {
    try {
      await update(ref(FIREBASE_DB, `Requests/${requestId}`), { status: newStatus });
      await update(ref(FIREBASE_DB, `Books/${bookId}`), { status: newStatus });
      if (newStatus === 'accepted') {
        Alert.alert(t('common.success'), isRTL ? 'تم قبول الطلب، تواصل مع الزميل لتحديد موعد' : 'Request accepted, contact your colleague to arrange pickup');
      }
    } catch (e) {
      console.error('Update status error:', e);
    }
  };

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
              await update(ref(FIREBASE_DB, `Books/${bookId}`), { status: 'active' });
              Alert.alert(t('common.success'), isRTL ? 'تم إلغاء الطلب بنجاح' : 'Request cancelled successfully');
            } catch {
              Alert.alert(t('common.error'), 'Failed to cancel request');
            }
          }
        }
      ]
    );
  };

  const handleMarkReceived = async (request: BookRequest) => {
    try {
      await handleUpdateStatus(request.id, request.bookId, 'received');
      setSelectedDonor({ id: request.donorUid, name: request.donorName });
      setRatingVisible(true);
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted': return isRTL ? 'مقبول' : 'Accepted';
      case 'rejected': return isRTL ? 'مرفوض' : 'Rejected';
      case 'received': return isRTL ? 'تم الاستلام' : 'Received';
      default: return isRTL ? 'قيد الانتظار' : 'Pending';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'received': return '#3B82F6';
      default: return '#F59E0B';
    }
  };

  return {
    activeTab, setActiveTab, requests, loading,
    ratingVisible, setRatingVisible, selectedDonor,
    handleUpdateStatus, handleCancelRequest, handleMarkReceived,
    getStatusLabel, getStatusColor, t, isRTL,
  };
};
