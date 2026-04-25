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
      if (newStatus === 'accepted') {
        Alert.alert(
          isRTL ? 'تأكيد الموافقة' : 'Confirm Acceptance',
          isRTL 
            ? 'عند موافقتك على هذا الطلب، سيتم حجز المصدر لهذا الشخص ولن يتمكن أي مستخدم آخر من طلبه. هل أنت متأكد من موافقتك؟'
            : 'By accepting this request, the resource will be reserved for this user and no one else can request it. Are you sure?',
          [
            { text: t('common.cancel'), style: 'cancel' },
            { 
              text: isRTL ? 'موافق' : 'Confirm', 
              onPress: async () => {
                await update(ref(FIREBASE_DB, `Requests/${requestId}`), { status: 'accepted' });
                // We set the book status to 'requested' so it shows as unavailable to others
                await update(ref(FIREBASE_DB, `Books/${bookId}`), { status: 'requested' });
                Alert.alert(t('common.success'), t('requests.notifications.acceptSuccess'));
              }
            }
          ]
        );
      } else {
        await update(ref(FIREBASE_DB, `Requests/${requestId}`), { status: newStatus });
        await update(ref(FIREBASE_DB, `Books/${bookId}`), { status: newStatus });
      }
    } catch (e) {
      console.error('Update status error:', e);
    }
  };

  const handleRepublish = async (requestId: string, bookId: string) => {
    Alert.alert(
      isRTL ? 'إعادة نشر المصدر' : 'Republish Resource',
      isRTL 
        ? 'سيتم إلغاء هذا الطلب وإعادة توفير المصدر لجميع المستخدمين الآخرين. استخدم هذا الخيار إذا لم يتم الاتفاق مع الشخص الحالي.'
        : 'This request will be cancelled and the resource will be available to all other users. Use this if the deal fell through.',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: isRTL ? 'إعادة نشر' : 'Republish', 
          onPress: async () => {
            try {
              await remove(ref(FIREBASE_DB, `Requests/${requestId}`));
              await update(ref(FIREBASE_DB, `Books/${bookId}`), { status: 'active' });
              Alert.alert(t('common.success'), isRTL ? 'تم إعادة نشر المصدر بنجاح' : 'Resource republished successfully');
            } catch (e) {
              console.error(e);
            }
          }
        }
      ]
    );
  };

  const handleCancelRequest = (requestId: string, bookId: string) => {
    Alert.alert(
      t('requests.notifications.cancelTitle'),
      t('requests.notifications.cancelConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.save'), // Reuse 'Save' as 'Confirm' or similar, but better use a specific key if needed. Wait, 'Confirm' isn't in common.
          // Let's use isRTL for now or just t('common.save')
          onPress: async () => {
            try {
              await remove(ref(FIREBASE_DB, `Requests/${requestId}`));
              await update(ref(FIREBASE_DB, `Books/${bookId}`), { status: 'active' });
              Alert.alert(t('common.success'), t('requests.notifications.cancelSuccess'));
            } catch {
              Alert.alert(t('common.error'), t('requests.notifications.cancelError'));
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
    return t(`requests.status.${status}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'received': return '#3B82F6';
      case 'completed': return '#10B981';
      default: return '#F59E0B';
    }
  };

  return {
    activeTab, setActiveTab, requests, loading,
    ratingVisible, setRatingVisible, selectedDonor,
    handleUpdateStatus, handleCancelRequest, handleMarkReceived, handleRepublish,
    getStatusLabel, getStatusColor, t, isRTL,
  };
};
