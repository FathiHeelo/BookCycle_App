import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { ref, onValue, update, remove, get } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { useI18n } from '@/hooks/use-i18n';
import { NotificationService } from '@/src/services/notification.service';
import { useAppTheme } from '@/context/ThemeContext';
import { RewardService } from '@/src/services/reward.service';

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
  const { colors, isAccessible } = useAppTheme();
  const currentUser = FIREBASE_AUTH.currentUser;

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingVisible, setRatingVisible] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState({ id: '', name: '' });
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedRequester, setSelectedRequester] = useState<any>(null);
  const [requesterHistory, setRequesterHistory] = useState<BookRequest[]>([]);
  const [fetchingDetails, setFetchingDetails] = useState(false);

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
    const user = currentUser;
    if (!user) return;
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
                // 1. Get current book data
                const bookRef = ref(FIREBASE_DB, `Books/${bookId}`);
                const bookSnap = await get(bookRef);
                
                if (bookSnap.exists()) {
                  const bookData = bookSnap.val();
                  const currentQty = bookData.quantity !== undefined ? bookData.quantity : 1;
                  const newQty = Math.max(0, currentQty - 1);
                  
                  // 2. Update Request Status
                  await update(ref(FIREBASE_DB, `Requests/${requestId}`), { status: 'accepted' });
                  
                  // 3. Update Book Quantity and Status
                   const bookUpdates: any = { quantity: newQty };
                   if (newQty === 0) {
                     bookUpdates.status = 'requested';
                   }
                   await update(bookRef, bookUpdates);

                   // Award points for helping a student (accepting a request)
                   await RewardService.awardPoints(currentUser.uid, 'HELP_STUDENT');
                 }

                try {
                  const reqSnap = await get(ref(FIREBASE_DB, `Requests/${requestId}`));
                  if (reqSnap.exists()) {
                    const reqData = reqSnap.val();
                    await NotificationService.createNotification({
                      recipientId: reqData.requesterUid,
                      senderId: currentUser.uid,
                      senderName: currentUser.displayName || 'Donor',
                      type: 'resource_request',
                      title: isRTL ? 'تم قبول طلبك' : 'Request Accepted',
                      body: isRTL 
                        ? `تم قبول طلبك للمصدر: ${reqData.bookTitle}` 
                        : `Your request for "${reqData.bookTitle}" has been accepted!`,
                      resourceId: bookId,
                      resourceTitle: reqData.bookTitle,
                      actionTarget: 'resource_requests',
                      read: false,
                      createdAt: null
                    });
                  }
                } catch (notifErr) {
                  console.error('Failed to send acceptance notification:', notifErr);
                }

                Alert.alert(t('common.success'), t('requests.notifications.acceptSuccess'));
              }
            }
          ]
        );
      } else {
        await update(ref(FIREBASE_DB, `Requests/${requestId}`), { status: newStatus });
        await update(ref(FIREBASE_DB, `Books/${bookId}`), { status: newStatus });

        if (newStatus === 'rejected') {
          try {
            const reqSnap = await get(ref(FIREBASE_DB, `Requests/${requestId}`));
            if (reqSnap.exists()) {
              const reqData = reqSnap.val();
              await NotificationService.createNotification({
                recipientId: reqData.requesterUid,
                senderId: currentUser.uid,
                senderName: currentUser.displayName || 'Donor',
                type: 'resource_request',
                title: isRTL ? 'تم رفض الطلب' : 'Request Rejected',
                body: isRTL 
                  ? `للأسف، تم رفض طلبك للمصدر: ${reqData.bookTitle}` 
                  : `Sorry, your request for "${reqData.bookTitle}" was not accepted.`,
                resourceId: bookId,
                resourceTitle: reqData.bookTitle,
                actionTarget: 'resource_requests',
                read: false,
                createdAt: null
              });
            }
          } catch (notifErr) {
            console.error('Failed to send rejection notification:', notifErr);
          }
        }
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
              const bookRef = ref(FIREBASE_DB, `Books/${bookId}`);
              const bookSnap = await get(bookRef);
              if (bookSnap.exists()) {
                const bookData = bookSnap.val();
                const currentQty = bookData.quantity !== undefined ? bookData.quantity : 0;
                await update(bookRef, { 
                  status: 'active', 
                  quantity: currentQty + 1 
                });
              }
              await remove(ref(FIREBASE_DB, `Requests/${requestId}`));
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
          text: t('common.save'), 
          onPress: async () => {
            try {
              const bookRef = ref(FIREBASE_DB, `Books/${bookId}`);
              const bookSnap = await get(bookRef);
              if (bookSnap.exists()) {
                const bookData = bookSnap.val();
                const currentQty = bookData.quantity !== undefined ? bookData.quantity : 0;
                await update(bookRef, { 
                  status: 'active', 
                  quantity: currentQty + 1 
                });
              }
              await remove(ref(FIREBASE_DB, `Requests/${requestId}`));
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
      
      // Award points for a successful exchange completion
      await RewardService.awardPoints(request.donorUid, 'COMPLETE_EXCHANGE');
      
      setSelectedDonor({ id: request.donorUid, name: request.donorName });
      setRatingVisible(true);

      try {
        await NotificationService.createNotification({
          recipientId: request.donorUid,
          senderId: currentUser!.uid,
          senderName: currentUser!.displayName || 'User',
          type: 'resource_request',
          title: isRTL ? 'تم استلام المصدر' : 'Resource Received',
          body: isRTL 
            ? `تم تأكيد استلام "${request.bookTitle}" من قبل المستلم.` 
            : `"${request.bookTitle}" has been confirmed as received.`,
          resourceId: request.bookId,
          resourceTitle: request.bookTitle,
          actionTarget: 'resource_requests',
          read: false,
          createdAt: null
        });
      } catch (notifErr) {
        console.error('Failed to send received notification:', notifErr);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openRequesterDetails = async (requesterUid: string, fallbackName?: string) => {
    if (!requesterUid) return;
    setFetchingDetails(true);
    setDetailsVisible(true);
    setSelectedRequester({ fullName: fallbackName || (isRTL ? 'مستخدم' : 'User') }); 
    
    try {
      const userRef = ref(FIREBASE_DB, `Users/${requesterUid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const val = snapshot.val();
        const name = val.fullName || val.displayName || val.name || fallbackName;
        setSelectedRequester({ ...val, fullName: name });
      } else {
        const altRef = ref(FIREBASE_DB, `users/${requesterUid}`);
        const altSnap = await get(altRef);
        if (altSnap.exists()) {
          const val = altSnap.val();
          const name = val.fullName || val.displayName || val.name || fallbackName;
          setSelectedRequester({ ...val, fullName: name });
        }
      }

      const requestsRef = ref(FIREBASE_DB, 'Requests');
      const reqSnap = await get(requestsRef);
      if (reqSnap.exists()) {
        const data = reqSnap.val();
        const list = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(req => req.requesterUid === requesterUid)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRequesterHistory(list);
      }
    } catch (e) {
      console.error('Error in openRequesterDetails:', e);
    } finally {
      setFetchingDetails(false);
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`requests.status.${status}`);
  };

  const getStatusColor = (status: string) => {
    if (isAccessible) {
      switch (status) {
        case 'accepted':
        case 'completed': return colors.success; // Blue
        case 'rejected': return colors.text; // High contrast
        case 'received': return colors.primary;
        default: return colors.accent; // Yellow
      }
    }
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
    detailsVisible, setDetailsVisible, selectedRequester, requesterHistory, fetchingDetails, openRequesterDetails
  };
};
