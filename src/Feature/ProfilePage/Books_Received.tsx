import React, { useState, useEffect } from 'react';
import { Link } from 'expo-router';
import {
  StyleSheet,
  Text,
  View,
  Image,
  useWindowDimensions,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/hooks/use-i18n';
import { ref, onValue, query, orderByChild, equalTo, remove, update } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';

interface RequestItem {
  id: string;
  bookId: string;
  bookTitle: string;
  bookImage: string;
  donorName: string;
  status: string;
  createdAt: string;
}

export default function Books_Received() {
  const { width } = useWindowDimensions();
  const { t, isRTL } = useI18n();
  const currentUser = FIREBASE_AUTH.currentUser;

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const cardPadding = Math.min(width * 0.04, 16);
  const textAlign = isRTL ? 'right' : 'left';
  const flexDirection = isRTL ? 'row-reverse' : 'row';

  useEffect(() => {
    if (!currentUser) return;

    const requestsRef = ref(FIREBASE_DB, 'Requests');
    const userRequestsQuery = query(requestsRef, orderByChild('requesterUid'), equalTo(currentUser.uid));

    const unsubscribe = onValue(userRequestsQuery, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list: RequestItem[] = Object.keys(data)
          .map(key => ({
            id: key,
            ...data[key]
          }))
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
      case 'pending':
        return isRTL ? 'بانتظار الموافقة' : 'Waiting for approval';
      case 'accepted':
        return isRTL ? 'تم قبول طلبك' : 'Request Accepted';
      case 'received':
      case 'completed':
        return isRTL ? 'تم الاستلام بنجاح' : 'Received successfully';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'received' || status === 'completed' || status === 'accepted') return '#10B981';
    return '#F59E0B';
  };

  const alignSelfValue: 'flex-start' | 'flex-end' = isRTL ? 'flex-end' : 'flex-start';
  const viewAllButtonStyle = StyleSheet.flatten([
    styles.viewAllButton,
    { alignSelf: alignSelfValue },
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { textAlign }]}>{t('profile.history.booksReceived')}</Text>
        <Link href="/my-requests" asChild>
          <Pressable style={viewAllButtonStyle}>
            <Text style={styles.viewAllText}>{t('profile.history.viewAll')}</Text>
            <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={14} color="#64748B" />
          </Pressable>
        </Link>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#001B39" />
      ) : (
        requests.map((req) => (
          <View key={req.id} style={[styles.bookCard, { padding: cardPadding }]}>
            <View style={{ flexDirection, alignItems: 'center', marginBottom: req.status !== 'received' ? 12 : 0 }}>
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: req.bookImage || 'https://via.placeholder.com/150' }} 
                  style={styles.bookImage} 
                />
              </View>
              
              <View style={[styles.contentContainer, isRTL ? { marginRight: 16 } : { marginLeft: 16 }]}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(req.status) + '15', alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(req.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(req.status) }]}>
                    {getStatusLabel(req.status)}
                  </Text>
                </View>
                
                <Text style={[styles.bookTitle, { textAlign }]} numberOfLines={1}>{req.bookTitle}</Text>
                
                <View style={[styles.metaRow, { flexDirection }]}>
                  <Ionicons name="person-outline" size={14} color="#6B7280" />
                  <Text style={[styles.metaText, { textAlign }]} numberOfLines={1}>
                    {isRTL ? `من: ${req.donorName}` : `From: ${req.donorName}`}
                  </Text>
                </View>
              </View>
            </View>

            {(req.status === 'pending' || req.status === 'accepted') && (
              <TouchableOpacity 
                style={[styles.cancelButton, { flexDirection }]}
                onPress={() => handleCancelRequest(req.id, req.bookId)}
              >
                <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                <Text style={styles.cancelButtonText}>{isRTL ? 'إلغاء هذا الطلب' : 'Cancel this Request'}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
      
      {!loading && requests.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="gift-outline" size={40} color="#E2E8F0" />
          <Text style={styles.emptyText}>{isRTL ? 'لم تستلم أي مصادر بعد' : 'No materials received yet'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 24,
    marginBottom: 40,
  },
  header: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#001B39',
    marginBottom: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  bookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    width: 70,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  bookImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#001B39',
    marginBottom: 4,
  },
  metaRow: {
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  cancelButton: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#94A3B8',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  }
});
