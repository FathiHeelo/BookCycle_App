import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ProfileStyles as styles } from '../styles';
import { useBooksReceived } from '../hooks/useBooksReceived';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

export const BooksReceivedUI = () => {
  const { requests, loading, handleCancelRequest, getStatusLabel, getStatusColor, t, isRTL } = useBooksReceived();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { theme: themeKey, isAccessible, colors: themeColors } = useAppTheme();
  const cardPadding = Math.min(width * 0.04, 16);
  const textAlign = isRTL ? 'right' : 'left';
  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const alignSelfValue: 'flex-start' | 'flex-end' = isRTL ? 'flex-end' : 'flex-start';
  const isDark = themeKey === 'dark';

  return (
    <View style={[styles.historyContainer, { marginBottom: 40 }]}>
      <View style={styles.historyHeader}>
        <Text style={[styles.historyHeaderTitle, { textAlign, color: themeColors.text }]}>{t('profile.history.booksReceived')}</Text>
        <TouchableOpacity 
          style={[styles.viewAllButton, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}
          onPress={() => router.push('/(tabs)/my-requests')}
        >
          <Text style={[styles.viewAllText, { color: themeColors.textSecondary }]}>{t('profile.history.viewAll')}</Text>
          <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={14} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={themeColors.primary} />
      ) : (
        requests.map((req) => (
          <View key={req.id} style={[styles.bookCard, { padding: cardPadding, backgroundColor: themeColors.card, shadowColor: isDark ? '#000' : '#000', elevation: isDark ? 0 : 2 }]}>
            <View style={{ flexDirection, alignItems: 'center', marginBottom: req.status !== 'received' ? 12 : 0 }}>
              <View style={[styles.bookImageContainer, { backgroundColor: isDark ? themeColors.background : '#F3F4F6' }]}>
                <Image
                  source={{ uri: req.bookImage || 'https://via.placeholder.com/150' }}
                  style={styles.bookImage}
                />
              </View>

              <View style={[styles.bookContentContainer, isRTL ? { marginRight: 16 } : { marginLeft: 16 }]}>
                <View style={[styles.statusBadge, { 
                  backgroundColor: getStatusColor(req.status) + (isAccessible ? '25' : '15'), 
                  alignSelf: isRTL ? 'flex-end' : 'flex-start',
                  borderWidth: isAccessible ? 1.5 : 0,
                  borderColor: getStatusColor(req.status)
                }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(req.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(req.status), fontWeight: isAccessible ? '800' : '600' }]}>
                    {getStatusLabel(req.status)}
                  </Text>
                </View>
                <Text style={[styles.bookTitle, { textAlign, color: themeColors.text }]} numberOfLines={1}>{req.bookTitle}</Text>
                <View style={[styles.metaRow, { flexDirection }]}>
                  <Ionicons name="person-outline" size={14} color={themeColors.textSecondary} />
                  <Text style={[styles.metaText, { textAlign, color: themeColors.textSecondary }]} numberOfLines={1}>
                    {isRTL ? `من: ${req.donorName}` : `From: ${req.donorName}`}
                  </Text>
                </View>
              </View>
            </View>

            {(req.status === 'pending' || req.status === 'accepted') && (
              <TouchableOpacity
                style={[styles.cancelRequestButton, { flexDirection, borderTopColor: themeColors.border }]}
                onPress={() => handleCancelRequest(req.id, req.bookId || '')}
              >
                <Ionicons name="close-circle-outline" size={18} color={themeColors.error} />
                <Text style={[styles.cancelRequestButtonText, { color: themeColors.error }]}>{isRTL ? 'إلغاء هذا الطلب' : 'Cancel this Request'}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}

      {!loading && requests.length === 0 && (
        <View style={[styles.emptyContainer, { backgroundColor: isDark ? themeColors.background : '#F9FAFB', borderColor: themeColors.border }]}>
          <Ionicons name="gift-outline" size={40} color={themeColors.textSecondary} />
          <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>{isRTL ? 'لم تستلم أي مصادر بعد' : 'No materials received yet'}</Text>
        </View>
      )}
    </View>
  );
};
