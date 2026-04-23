import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  Pressable, 
  ActivityIndicator, 
  SafeAreaView, 
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { ThemedText } from '@/components/themed-text';
import { ref, onValue, update } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { useI18n } from '@/hooks/use-i18n';

interface BookRequest {
  id: string;
  bookId: string;
  bookTitle: string;
  bookImage: string;
  requesterUid: string;
  requesterName: string;
  donorUid: string;
  donorName: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export default function MyRequestsScreen() {
  const { theme: themeKey } = useAppTheme();
  const theme = Colors[themeKey];
  const router = useRouter();
  const { t } = useI18n();
  const currentUser = FIREBASE_AUTH.currentUser;

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleUpdateStatus = async (requestId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      const requestRef = ref(FIREBASE_DB, `Requests/${requestId}`);
      await update(requestRef, { status: newStatus });
    } catch (e) {
      console.error('Update status error:', e);
    }
  };

  const renderRequestItem = ({ item }: { item: BookRequest }) => (
    <View style={[styles.requestCard, { backgroundColor: theme.card }]}>
      <Image source={{ uri: item.bookImage }} style={styles.bookThumb} />
      <View style={styles.requestInfo}>
        <ThemedText style={styles.bookTitle} numberOfLines={1}>{item.bookTitle}</ThemedText>
        <ThemedText style={styles.personName}>
          {activeTab === 'received' ? `From: ${item.requesterName}` : `To: ${item.donorName}`}
        </ThemedText>
        
        <View style={styles.statusBadgeRow}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(item.status) + '20' }
          ]}>
            <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </ThemedText>
          </View>
        </View>

        {activeTab === 'received' && item.status === 'pending' && (
          <View style={styles.actionRow}>
            <Pressable 
              style={[styles.actionBtn, styles.acceptBtn]} 
              onPress={() => handleUpdateStatus(item.id, 'accepted')}
            >
              <ThemedText style={styles.acceptBtnText}>Accept</ThemedText>
            </Pressable>
            <Pressable 
              style={[styles.actionBtn, styles.rejectBtn]} 
              onPress={() => handleUpdateStatus(item.id, 'rejected')}
            >
              <ThemedText style={styles.rejectBtnText}>Reject</ThemedText>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#10B981';
      case 'rejected': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </Pressable>
        <ThemedText style={[styles.headerTitle, { color: theme.primary }]}>My Requests</ThemedText>
      </View>

      {/* Custom Tabs */}
      <View style={styles.tabContainer}>
        <Pressable 
          style={[styles.tab, activeTab === 'received' && { borderBottomColor: theme.primary, borderBottomWidth: 3 }]}
          onPress={() => setActiveTab('received')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'received' && { color: theme.primary, fontWeight: '800' }]}>Received</ThemedText>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'sent' && { borderBottomColor: theme.primary, borderBottomWidth: 3 }]}
          onPress={() => setActiveTab('sent')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'sent' && { color: theme.primary, fontWeight: '800' }]}>Sent</ThemedText>
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
              <ThemedText style={styles.emptyText}>No requests found</ThemedText>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  backBtn: { padding: 4 },
  tabContainer: {
    flexDirection: 'row',
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
    flexDirection: 'row',
    padding: 12,
    borderRadius: Radius.lg,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  bookThumb: {
    width: 80,
    height: 100,
    borderRadius: Radius.md,
  },
  requestInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  bookTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  personName: { fontSize: 13, color: '#64748B', marginBottom: 8 },
  statusBadgeRow: { flexDirection: 'row', marginBottom: 12 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: { fontSize: 10, fontWeight: '900' },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100, gap: 16 },
  emptyText: { fontSize: 16, color: '#94A3B8', fontWeight: '600' },
});
