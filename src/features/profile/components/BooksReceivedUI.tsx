import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ProfileStyles as styles } from '../styles';
import { useBooksReceived } from '../hooks/useBooksReceived';

export const BooksReceivedUI = () => {
  const { requests, loading, handleCancelRequest, getStatusLabel, getStatusColor, t, isRTL } = useBooksReceived();
  const { width } = useWindowDimensions();
  const cardPadding = Math.min(width * 0.04, 16);
  const textAlign = isRTL ? 'right' : 'left';
  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const alignSelfValue: 'flex-start' | 'flex-end' = isRTL ? 'flex-end' : 'flex-start';

  return (
    <View style={[styles.historyContainer, { marginBottom: 40 }]}>
      <View style={styles.historyHeader}>
        <Text style={[styles.historyHeaderTitle, { textAlign }]}>{t('profile.history.booksReceived')}</Text>
        <Link href="/my-requests" asChild>
          <Pressable style={[styles.viewAllButton, { alignSelf: alignSelfValue }]}>
            <Text style={styles.viewAllText}>{t('profile.history.viewAll')}</Text>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={14} color="#64748B" />
          </Pressable>
        </Link>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#001B39" />
      ) : (
        requests.map((req) => (
          <View key={req.id} style={[styles.bookCard, { padding: cardPadding }]}>
            <View style={{ flexDirection, alignItems: 'center', marginBottom: req.status !== 'received' ? 12 : 0 }}>
              <View style={styles.bookImageContainer}>
                <Image
                  source={{ uri: req.bookImage || 'https://via.placeholder.com/150' }}
                  style={styles.bookImage}
                />
              </View>

              <View style={[styles.bookContentContainer, isRTL ? { marginRight: 16 } : { marginLeft: 16 }]}>
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
                style={[styles.cancelRequestButton, { flexDirection }]}
                onPress={() => handleCancelRequest(req.id, req.bookId || '')}
              >
                <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                <Text style={styles.cancelRequestButtonText}>{isRTL ? 'إلغاء هذا الطلب' : 'Cancel this Request'}</Text>
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
};
