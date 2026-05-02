import { useState, useEffect } from 'react';
import { ref, get, push, set } from 'firebase/database';
import { Alert, Share } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { useI18n } from '@/hooks/use-i18n';
import { BookDetail } from '../types';

export const useBookDetails = (id?: string) => {
  const { t, isRTL } = useI18n();

  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherBooks, setOtherBooks] = useState<BookDetail[]>([]);
  const [requesting, setRequesting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'success'>('none');
  const [modalVisible, setModalVisible] = useState(false);
  const [donorProfile, setDonorProfile] = useState<any>(null);
  const [donorStats, setDonorStats] = useState<any>(null);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        setError(t('bookDetails.noBookId', { defaultValue: 'No book ID provided' }));
        setLoading(false);
        return;
      }

      // Handle Mock Data
      if (id.startsWith('mock-')) {
        const { MOCK_SOURCES } = require('@/src/constants/mockData');
        const mockBook = MOCK_SOURCES.find((b: any) => b.id === id);
        if (mockBook) {
          setBook(mockBook);
          setLoading(false);
          return;
        }
      }

      try {
        const bookRef = ref(FIREBASE_DB, `Books/${id}`);
        const snapshot = await get(bookRef);
        
        if (snapshot.exists()) {
          const bookData = { id: id as string, ...snapshot.val() };
          setBook(bookData);
          
          if (bookData.donorUid) {
            const donorRef = ref(FIREBASE_DB, `Users/${bookData.donorUid}`);
            const donorSnap = await get(donorRef);
            if (donorSnap.exists()) {
              setDonorProfile(donorSnap.val());
            }

            const statsRef = ref(FIREBASE_DB, `Users/${bookData.donorUid}/stats`);
            const statsSnap = await get(statsRef);
            if (statsSnap.exists()) {
              setDonorStats(statsSnap.val());
            }
          }

          const suggestionFaculty = bookData.facultyIds?.[0] || bookData.facultyId;
          if (suggestionFaculty) fetchOtherBooks(suggestionFaculty);
        } else {
          setError(t('bookDetails.notFound', { defaultValue: 'Book not found' }));
        }
      } catch (err) {
        console.error('Error fetching book:', err);
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };


    const fetchOtherBooks = async (facultyId: string) => {
      try {
        const booksRef = ref(FIREBASE_DB, 'Books');
        const snapshot = await get(booksRef);
        if (snapshot.exists()) {
          const allBooks = snapshot.val();
          const list = Object.keys(allBooks)
            .map(key => ({ id: key, ...allBooks[key] }))
            .filter(b => (b.facultyIds?.includes(facultyId) || b.facultyId === facultyId) && b.id !== id)
            .slice(0, 5);
          setOtherBooks(list);
        }
      } catch (e) {
        console.log('Error fetching other books:', e);
      }
    };

    fetchBook();
  }, [id, t]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${book?.title}\n\n${t('bookDetails.description')}: ${book?.description || ''}\n\nShared via BookCycle App`,
        title: book?.title,
      });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const handleRequest = async () => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) {
      Alert.alert(t('common.error'), t('auth.errors.mustBeLoggedIn'));
      return;
    }

    if (user.uid === book?.donorUid) {
      Alert.alert(t('common.notice', { defaultValue: 'Notice' }), t('bookDetails.ownBookError', { defaultValue: "You cannot request your own book." }));
      return;
    }

    setRequesting(true);
    try {
      const requestsRef = ref(FIREBASE_DB, 'Requests');
      const newRequestRef = push(requestsRef);
      
      await set(newRequestRef, {
        bookId: id,
        bookTitle: book?.title || 'Untitled Book',
        bookImage: book?.imageUrl || book?.image || '',
        requesterUid: user.uid,
        requesterName: user.displayName || user.email || 'Anonymous Student',
        donorUid: book?.donorUid || '',
        donorName: book?.donorName || 'Academic Contributor',
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      // Send Notification to Donor
      try {
        const { NotificationService } = require('@/src/services/notification.service');
        await NotificationService.createNotification({
          recipientId: book?.donorUid || '',
          senderId: user.uid,
          senderName: user.displayName || 'A Student',
          type: 'resource_request',
          title: isRTL ? 'طلب مصدر جديد' : 'New resource request',
          body: isRTL 
            ? `${user.displayName || 'طالب'} طلب مصدرك: ${book?.title}` 
            : `${user.displayName || 'A student'} requested your resource: ${book?.title}`,
          resourceId: id,
          resourceTitle: book?.title,
          actionTarget: 'resource_requests',
          read: false,
          createdAt: null // handled by service
        });
      } catch (notifErr) {
        console.error('Failed to send notification:', notifErr);
      }

      setRequestStatus('success');
      setModalVisible(false);
      Alert.alert(t('common.success', { defaultValue: 'Success!' }), t('bookDetails.requestSent', { defaultValue: 'Your request has been sent to the contributor.' }));
    } catch (e) {
      console.error('Request error:', e);
      Alert.alert(t('common.error'), t('bookDetails.requestFailed', { defaultValue: 'Failed to send request. Please try again.' }));
    } finally {
      setRequesting(false);
    }
  };

  return {
    book,
    loading,
    error,
    otherBooks,
    requesting,
    requestStatus,
    modalVisible,
    setModalVisible,
    handleRequest,
    handleShare,
    donorProfile,
    donorStats,
    t,
    isRTL
  };
};
