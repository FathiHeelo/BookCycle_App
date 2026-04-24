import React from 'react';
import {
  StyleSheet, View, FlatList, Pressable, ActivityIndicator,
  SafeAreaView, Image, TouchableOpacity, Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { ThemedText } from '@/components/themed-text';
import { CustomHeader } from '@/src/components/shared/CustomHeader';
import { useRouter } from 'expo-router';
import RatingModal from '@/src/components/RatingModal';
import { useMyRequests, BookRequest } from '../hooks/useMyRequests';

export const MyRequestsScreenUI = () => {
  const {
    activeTab, setActiveTab, requests, loading,
    ratingVisible, setRatingVisible, selectedDonor,
    handleUpdateStatus, handleCancelRequest, handleMarkReceived,
    getStatusLabel, getStatusColor, t, isRTL,
  } = useMyRequests();

  const { theme: themeKey } = useAppTheme();
  const theme = Colors[themeKey];
  const router = useRouter();
  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  const renderRequestItem = ({ item }: { item: BookRequest }) => (
    <View style={[styles.requestCard, { flexDirection, backgroundColor: theme.card, shadowColor: themeKey === 'dark' ? '#000' : '#E5E7EB', elevation: themeKey === 'dark' ? 0 : 2 }]}>
      <Image 
        source={{ uri: item.bookImage || 'https://via.placeholder.com/150' }} 
        style={styles.bookThumb} 
      />
      <View style={[styles.requestInfo, isRTL ? { marginRight: 16 } : { marginLeft: 16 }]}>
        <Text style={[styles.bookTitle, { textAlign, color: theme.text }]} numberOfLines={2}>
          {item.bookTitle}
        </Text>
        <Text style={[styles.personName, { textAlign, color: theme.textSecondary }]}>
          {activeTab === 'received'
            ? (isRTL ? `من: ${item.requesterName}` : `From: ${item.requesterName}`)
            : (isRTL ? `إلى: ${item.donorName}` : `To: ${item.donorName}`)}
        </Text>

        <View style={[styles.statusBadgeRow, { flexDirection }]}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {t(`requests.status.${item.status}`)}
            </Text>
          </View>
        </View>

        {activeTab === 'received' && item.status === 'pending' && (
          <View style={[styles.actionRow, { flexDirection }]}>
            <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => handleUpdateStatus(item.id, item.bookId, 'accepted')}>
              <Text style={styles.acceptBtnText}>{t('requests.accept')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleUpdateStatus(item.id, item.bookId, 'rejected')}>
              <Text style={styles.rejectBtnText}>{t('requests.reject')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'sent' && (item.status === 'pending' || item.status === 'accepted') && (
          <View style={[styles.sentActionRow, { flexDirection }]}>
            {item.status === 'accepted' && (
              <TouchableOpacity style={[styles.receivedBtn, { backgroundColor: theme.primary }]} onPress={() => handleMarkReceived(item)}>
                <Ionicons name="checkmark-done-circle-outline" size={18} color="#fff" />
                <ThemedText style={styles.receivedBtnText}>{t('requests.markAsReceived')}</ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.cancelBtn, item.status === 'pending' ? { flex: 1 } : { width: 50 }]}
              onPress={() => handleCancelRequest(item.id, item.bookId)}
            >
              <Ionicons name="close-circle" size={item.status === 'pending' ? 18 : 24} color="#EF4444" />
              {item.status === 'pending' && <ThemedText style={styles.cancelBtnText}>{isRTL ? 'إلغاء الطلب' : 'Cancel'}</ThemedText>}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader 
        title={t('requests.title')}
        leftMode="back"
        hideSafeArea
      />

      <View style={[styles.tabContainer, { flexDirection, borderBottomColor: theme.border }]}>
        <Pressable
          style={[styles.tab, activeTab === 'received' && { borderBottomColor: theme.primary, borderBottomWidth: 3 }]}
          onPress={() => setActiveTab('received')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'received' && { color: theme.primary, fontWeight: '800' }]}>
            {t('requests.incoming')}
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'sent' && { borderBottomColor: theme.primary, borderBottomWidth: 3 }]}
          onPress={() => setActiveTab('sent')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'sent' && { color: theme.primary, fontWeight: '800' }]}>
            {t('requests.outgoing')}
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
              <Ionicons name="document-text-outline" size={64} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{t('requests.empty')}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, justifyContent: 'space-between' },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  backBtn: { padding: 4 },
  tabContainer: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#64748B' },
  listContent: { padding: Spacing.lg, paddingBottom: 120 },
  requestCard: { padding: 12, borderRadius: Radius.lg, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, alignItems: 'center' },
  bookThumb: { width: 80, height: 100, borderRadius: Radius.md },
  requestInfo: { flex: 1, justifyContent: 'center' },
  bookTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  personName: { fontSize: 13, color: '#64748B', marginBottom: 8 },
  statusBadgeRow: { marginBottom: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: '900' },
  actionRow: { gap: 8 },
  sentActionRow: { gap: 8, alignItems: 'center' },
  actionBtn: { flex: 1, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  acceptBtn: { backgroundColor: '#10B981' },
  rejectBtn: { backgroundColor: '#EF4444' },
  acceptBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  rejectBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  receivedBtn: { flex: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 40, borderRadius: 10, gap: 6 },
  receivedBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  cancelBtn: { height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#FEF2F2', gap: 6 },
  cancelBtnText: { color: '#EF4444', fontSize: 13, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100, gap: 16 },
  emptyText: { fontSize: 16, color: '#94A3B8', fontWeight: '600' },
});
