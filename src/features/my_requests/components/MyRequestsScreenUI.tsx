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
    handleUpdateStatus, handleCancelRequest, handleMarkReceived, handleRepublish,
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
              <Ionicons name="checkmark-circle" size={18} color="#FFF" />
              <Text style={styles.acceptBtnText}>{t('requests.accept')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleUpdateStatus(item.id, item.bookId, 'rejected')}>
              <Ionicons name="close-circle" size={18} color="#EF4444" />
              <Text style={styles.rejectBtnText}>{t('requests.reject')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'received' && item.status === 'accepted' && (
          <View style={[styles.actionRow, { flexDirection }]}>
            <TouchableOpacity 
              style={[styles.republishBtn, { backgroundColor: theme.primary + '15' }]} 
              onPress={() => handleRepublish(item.id, item.bookId)}
            >
              <Ionicons name="refresh-circle" size={20} color={theme.primary} />
              <Text style={[styles.republishText, { color: theme.primary }]}>{isRTL ? 'إعادة نشر' : 'Republish'}</Text>
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

      <View style={[styles.tabContainer, { borderBottomColor: theme.border }]}>
        <View style={[styles.tabRow, { flexDirection }]}>
          <Pressable
            style={[styles.tab, activeTab === 'received' && styles.activeTab]}
            onPress={() => setActiveTab('received')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'received' && { color: theme.primary, fontWeight: '800' }]}>
              {t('requests.incoming')}
            </ThemedText>
            {activeTab === 'received' && <View style={[styles.tabIndicator, { backgroundColor: theme.primary }]} />}
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
            onPress={() => setActiveTab('sent')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'sent' && { color: theme.primary, fontWeight: '800' }]}>
              {t('requests.outgoing')}
            </ThemedText>
            {activeTab === 'sent' && <View style={[styles.tabIndicator, { backgroundColor: theme.primary }]} />}
          </Pressable>
        </View>
      </View>

      {activeTab === 'received' && (
        <View style={[styles.warningBanner, { backgroundColor: theme.primary + '08', flexDirection }]}>
          <Ionicons name="information-circle" size={20} color={theme.primary} />
          <Text style={[styles.warningText, { color: theme.textSecondary, textAlign }]}>
            {isRTL 
              ? 'تنبيه: عند قبول الطلب سيتم حجز المصدر للمستلم ولن يظهر للآخرين. تأكد من جديّة الطرف الآخر قبل القبول.' 
              : 'Note: Accepting a request reserves the item and hides it from others. Ensure the requester is serious before accepting.'}
          </Text>
        </View>
      )}

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
  tabContainer: { 
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  tabRow: {
    gap: 24,
  },
  tab: { 
    paddingVertical: 14, 
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
  },
  tabText: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#94A3B8' 
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 3,
    borderRadius: 3,
  },
  listContent: { padding: 20, paddingBottom: 120 },
  requestCard: { 
    padding: 16, 
    borderRadius: Radius.xl, 
    marginBottom: 16, 
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  bookThumb: { 
    width: 85, 
    height: 115, 
    borderRadius: Radius.md,
    backgroundColor: '#F1F5F9',
  },
  requestInfo: { flex: 1, justifyContent: 'flex-start' },
  bookTitle: { 
    fontSize: 17, 
    fontWeight: '900', 
    marginBottom: 4,
    lineHeight: 22,
  },
  personName: { 
    fontSize: 13, 
    fontWeight: '600',
    marginBottom: 8,
  },
  statusBadgeRow: { marginBottom: 14 },
  statusBadge: { 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: Radius.sm,
  },
  statusText: { 
    fontSize: 11, 
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionRow: { gap: 10, marginTop: 4 },
  sentActionRow: { gap: 10, alignItems: 'center', marginTop: 4 },
  actionBtn: { 
    flex: 1, 
    height: 42, 
    borderRadius: Radius.md, 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 6,
  },
  acceptBtn: { backgroundColor: '#10B981' },
  rejectBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  acceptBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  rejectBtnText: { color: '#EF4444', fontSize: 13, fontWeight: '800' },
  receivedBtn: { 
    flex: 2, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 44, 
    borderRadius: Radius.md, 
    gap: 8,
  },
  receivedBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  cancelBtn: { 
    height: 44, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: Radius.md, 
    backgroundColor: 'rgba(239, 68, 68, 0.08)', 
    gap: 8,
    paddingHorizontal: 12,
  },
  cancelBtnText: { color: '#EF4444', fontSize: 13, fontWeight: '800' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100, gap: 20 },
  emptyText: { fontSize: 16, fontWeight: '700', textAlign: 'center', maxWidth: '80%' },
  warningBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 12,
    borderRadius: Radius.md,
    gap: 12,
    alignItems: 'center',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  republishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: 42,
    borderRadius: Radius.md,
    gap: 8,
  },
  republishText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
