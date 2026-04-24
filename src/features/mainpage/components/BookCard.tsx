import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookCardStyles } from '../styles';
import { BookCardProps } from '../types';
import { STATIC_VALUES, TITLES, COLORS } from '../constants';

export const BookCard: React.FC<BookCardProps> = ({ 
  item, 
  onPress, 
  theme, 
  themeKey, 
  isRTL, 
  t 
}) => {
  const isNew = item.createdAt 
    ? (new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 * 60 * 24 * STATIC_VALUES.NEW_THRESHOLD_DAYS)
    : false;
  
  const facultyId = item.facultyIds?.[0] || item.facultyId;
  const isUnavailable = item.status === 'requested' || item.status === 'received' || item.status === 'completed';
  const statusText = item.status === 'requested' ? (isRTL ? 'قيد الطلب' : 'Requested') : (isRTL ? 'تم التسليم' : 'Given');
  
  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  return (
    <Pressable 
      style={[BookCardStyles.card, { backgroundColor: theme.card, opacity: isUnavailable ? 0.75 : 1 }]}
      onPress={() => onPress(item.id)}
    >
      <View style={BookCardStyles.imageContainer}>
        <Image 
          source={{ uri: item.imageUrl || item.image || 'https://via.placeholder.com/300x400?text=No+Image' }} 
          style={BookCardStyles.resourceImage} 
        />
        {isUnavailable && (
          <View style={[StyleSheet.absoluteFill, BookCardStyles.overlay]}>
            <View style={BookCardStyles.statusBadge}>
              <Text style={BookCardStyles.statusText}>{statusText}</Text>
            </View>
          </View>
        )}
        {isNew && !isUnavailable && (
          <View style={[BookCardStyles.newBadge, { backgroundColor: COLORS.VIBRANT_GOLD }]}>
            <Text style={[BookCardStyles.newBadgeText, { color: COLORS.PRIMARY_NAVY }]}>
              {isRTL ? 'أضيف حديثاً' : 'NEWLY ADDED'}
            </Text>
          </View>
        )}
        
        {/* Request Icon following Academic Curator system */}
        {!isUnavailable && (
          <View style={[BookCardStyles.requestIcon, { backgroundColor: theme.background }]}>
            <Ionicons name="hand-right-outline" size={16} color={theme.primary} />
          </View>
        )}
      </View>

      <View style={[BookCardStyles.cardContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
        {facultyId && (
          <View style={[BookCardStyles.categoryBadge, { backgroundColor: themeKey === 'dark' ? 'rgba(245, 158, 11, 0.15)' : '#E0F2FE' }]}>
            <Text style={[BookCardStyles.categoryText, { color: theme.primary }]}>
              {facultyId === 'all' ? (isRTL ? 'إجباري جامعة' : 'University Requirements') : t(`faculties.${facultyId}`).toUpperCase()}
            </Text>
          </View>
        )}
        
        <Text style={[BookCardStyles.resourceTitle, { color: theme.text, textAlign }]} numberOfLines={2}>
          {isRTL ? (item.titleAr || item.title) : item.title || (isRTL ? 'مادة بدون عنوان' : 'Untitled Material')}
        </Text>

        <View style={[BookCardStyles.donorContainer, { flexDirection }]}>
          <View style={[BookCardStyles.avatarCircle, { backgroundColor: themeKey === 'dark' ? 'rgba(248, 250, 252, 0.1)' : '#E2E8F0' }]}>
            <Ionicons name="person" size={10} color={theme.textSecondary} />
          </View>
          <Text style={[styles.donorText, { color: theme.textSecondary }]}>
            {isRTL ? TITLES.GIFTED_BY_AR : TITLES.GIFTED_BY_EN} <Text style={[styles.donorName, { color: theme.text }]}>
              {item.donorName || (isRTL ? 'مساهم' : 'Contributor')}
            </Text>
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  donorText: {
    fontSize: 10,
    fontWeight: '500',
  },
  donorName: {
    fontWeight: '700',
  },
});
