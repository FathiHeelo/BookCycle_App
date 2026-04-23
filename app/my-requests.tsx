import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  Pressable, 
  ActivityIndicator, 
  SafeAreaView, 
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { ThemedText } from '@/components/themed-text';
import { ref, onValue, update, remove } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { useI18n } from '@/hooks/use-i18n';
import RatingModal from '@/src/components/RatingModal';

interface BookRequest {
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

export default function MyRequestsScreen() {
  const { theme: themeKey } = useAppTheme();
  const theme = Colors[themeKey];
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const currentUser = FIREBASE_AUTH.currentUser;

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Rating Modal State
  const [ratingVisible, setRatingVisible] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState({ id: '', name: '' });

  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

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
      const requestRef = ref(FIREBASE_DB, `Requests/${requestId}`);
      await update(requestRef, { status: newStatus });
      
      const bookRef = ref(FIREBASE_DB, `Books/${bookId}`);
      await update(bookRef, { status: newStatus });

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
              const bookRef = ref(FIREBASE_DB, `Books/${bookId}`);
              await update(bookRef, { status: 'active' });
              Alert.alert(t('common.success'), isRTL ? 'تم إلغاء الطلب بنجاح' : 'Request cancelled successfully');
            } catch (e) {
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

  const renderRequestItem = ({ item }: { item: BookRequest }) => (
    <View style={[styles.requestCard, { backgroundColor: theme.card, flexDirection }]}>
      <Image source={{ uri: item.bookImage }} style={styles.bookThumb} />
      <View style={[styles.requestInfo, isRTL ? { marginRight: 16 } : { marginLeft: 16 }]}>
        <ThemedText style={[styles.bookTitle, { textAlign }]} numberOfLines={1}>{item.bookTitle}</ThemedText>
        <ThemedText style={[styles.personName, { textAlign }]}>
          {activeTab === 'received' 
            ? (isRTL ? `من: ${item.requesterName}` : `From: ${item.requesterName}`) 
            : (isRTL ? `إلى: ${item.donorName}` : `To: ${item.donorName}`)}
        </ThemedText>
        
        <View style={[styles.statusBadgeRow, { flexDirection }]}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(item.status) + '20' }
          ]}>
            <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </ThemedText>
          </View>
        </View>

        {activeTab === 'received' && item.status === 'pending' && (
          <View style={[styles.actionRow, { flexDirection }]}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.acceptBtn]} 
              onPress={() => handleUpdateStatus(item.id, item.bookId, 'accepted')}
            >
              <ThemedText style={styles.acceptBtnText}>{isRTL ? 'قبول' : 'Accept'}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.rejectBtn]} 
              onPress={() => handleUpdateStatus(item.id, item.bookId, 'rejected')}
            >
              <ThemedText style={styles.rejectBtnText}>{isRTL ? 'رفض' : 'Reject'}</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'sent' && (item.status === 'pending' || item.status === 'accepted') && (
          <View style={[styles.sentActionRow, { flexDirection }]}>
            {item.status === 'accepted' && (
              <TouchableOpacity 
                style={[styles.receivedBtn, { backgroundColor: theme.primary }]} 
                onPress={() => handleMarkReceived(item)}
              >
                <Ionicons name="checkmark-done-circle-outline" size={18} color="#fff" />
                <ThemedText style={styles.receivedBtnText}>{isRTL ? 'تم الاستلام' : 'Received'}</ThemedText>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.cancelBtn, item.status === 'pending' ? { flex: 1 } : { width: 50 }]} 
              onPress={() => handleCancelRequest(item.id, item.bookId)}
            >
              <Ionicons name="close-circle" size={item.status === 'pending' ? 18 : 24} color="#EF4444" />
              {item.status === 'pending' && (
                <ThemedText style={styles.cancelBtnText}>{isRTL ? 'إلغاء الطلب' : 'Cancel'}</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { flexDirection }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.primary} />
        </Pressable>
        <ThemedText style={[styles.headerTitle, { color: theme.primary }]}>
          {isRTL ? 'طلباتي' : 'My Requests'}
        </ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.tabContainer, { flexDirection }]}>
        <Pressable 
          style={[styles.tab, activeTab === 'received' && { borderBottomColor: theme.primary, borderBottomWidth: 3 }]}
          onPress={() => setActiveTab('received')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'received' && { color: theme.primary, fontWeight: '800' }]}>
            {isRTL ? 'طلبات استلمتها' : 'Incoming'}
          </ThemedText>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'sent' && { borderBottomColor: theme.primary, borderBottomWidth: 3 }]}
          onPress={() => setActiveTab('sent')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'sent' && { color: theme.primary, fontWeight: '800' }]}>
            {isRTL ? 'طلبات أرسلتها' : 'Outgoing'}
          </ThemedText>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="mail-unread-outline" size={64} color="#CBD5E1" />
              <ThemedText style={styles.emptyText}>{isRTL ? 'لا يوجد طلبات حالياً' : 'No requests found'}</ThemedText>
            </View>
          }
        />
      )}

      <RatingModal 
        visible={ratingVisible}
        onClose={() => setRatingVisible(false)}
        targetUid={selectedDonor.id}
        targetName={selectedDonor.name}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  backBtn: { padding: 4 },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabText: { fontSize: 15, fontWeight: '600', color: '#64748B' },
  listContent: { padding: Spacing.lg },
  requestCard: {
    padding: 12,
    borderRadius: Radius.lg,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    alignItems: 'center',
  },
  bookThumb: {
    width: 80,
    height: 100,
    borderRadius: Radius.md,
  },
  requestInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  personName: { fontSize: 13, color: '#64748B', marginBottom: 8 },
  statusBadgeRow: { marginBottom: 12 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: { fontSize: 10, fontWeight: '900' },
  actionRow: {
    gap: 8,
  },
  sentActionRow: {
    gap: 8,
    alignItems: 'center',
  },
  actionBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtn: { backgroundColor: '#10B981' },
  rejectBtn: { backgroundColor: '#EF4444' },
  acceptBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  rejectBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  receivedBtn: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 10,
    gap: 6,
  },
  receivedBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  cancelBtn: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    gap: 6,
  },
  cancelBtnText: { color: '#EF4444', fontSize: 13, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100, gap: 16 },
  emptyText: { fontSize: 16, color: '#94A3B8', fontWeight: '600' },
});
