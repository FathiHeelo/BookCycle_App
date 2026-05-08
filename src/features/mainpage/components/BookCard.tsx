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
  t,
  isAccessible
}) => {
  const isNew = item.createdAt 
    ? (new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 * 60 * 24 * STATIC_VALUES.NEW_THRESHOLD_DAYS)
    : false;
  
  const facultyId = item.facultyIds?.[0] || item.facultyId;
  const isUnavailable = item.status === 'requested' || item.status === 'received' || item.status === 'completed';
  const statusText = item.status === 'requested' ? (isRTL ? 'قيد الطلب' : 'Requested') : (isRTL ? 'تم التسليم' : 'Given');
  
  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  // Define colors based on accessibility mode
  const requestedColor = isAccessible ? theme.accent : '#F59E0B';
  const givenColor = isAccessible ? theme.success : '#10B981';

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
            <View style={[BookCardStyles.statusBadge, { 
              backgroundColor: item.status === 'requested' ? requestedColor : givenColor,
              borderWidth: isAccessible ? 2 : 0,
              borderColor: '#FFF'
            }]}>
              <Ionicons name={item.status === 'requested' ? "timer-outline" : "checkmark-done"} size={14} color="#FFF" />
              <Text style={[BookCardStyles.statusText, { fontWeight: isAccessible ? '900' : '700' }]}>{statusText}</Text>
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

        {/* Price & Donor Info Row */}
        <View style={[BookCardStyles.donorContainer, { flexDirection, justifyContent: 'space-between', width: '100%' }]}>
          <View style={{ flexDirection, alignItems: 'center', gap: 6, flex: 1 }}>
            <View style={[BookCardStyles.avatarCircle, { backgroundColor: themeKey === 'dark' ? 'rgba(248, 250, 252, 0.1)' : '#E2E8F0' }]}>
              <Ionicons name="person" size={10} color={theme.textSecondary} />
            </View>
            <Text style={[styles.donorText, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.donorName || (isRTL ? 'مساهم' : 'Contributor')}
            </Text>
          </View>
          
          {item.price && !isUnavailable && (
            <View style={{
              backgroundColor: isAccessible ? theme.success + '20' : 'rgba(16, 185, 129, 0.15)',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 6,
              borderWidth: isAccessible ? 1.5 : 1,
              borderColor: isAccessible ? theme.success : 'rgba(16, 185, 129, 0.3)',
            }}>
              <Text style={{ color: isAccessible ? theme.success : '#10B981', fontSize: 11, fontWeight: isAccessible ? '900' : '800' }}>₪{item.price}</Text>
            </View>
          )}
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
