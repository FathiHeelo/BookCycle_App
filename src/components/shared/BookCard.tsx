import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { useI18n } from '@/hooks/use-i18n';
import { BookCardStyles as styles } from './styles';
import { BookCardProps } from './types';
import { StatusBadge } from './StatusBadge';

export const BookCard = ({
  id,
  title,
  imageUrl,
  image,
  status,
  facultyId,
  facultyIds,
  isRTL = false,
  onPress,
  showNewBadge = false,
  createdAt
}: BookCardProps) => {
  const { t } = useI18n();

  const isUnavailable = status === 'requested' || status === 'completed' || status === 'received';
  const overlayText = status === 'requested' ? (isRTL ? 'قيد الطلب' : 'Requested') : (isRTL ? 'تم التسليم' : 'Given');
  const isNew = createdAt ? (new Date().getTime() - new Date(createdAt).getTime() < 1000 * 60 * 60 * 24 * 3) : false;

  const displayFaculty = facultyIds ? t(`faculties.${facultyIds[0]}`) : (facultyId ? t(`faculties.${facultyId}`) : 'General');

  return (
    <Pressable 
      style={[styles.card, isUnavailable && { opacity: 0.75 }]} 
      onPress={() => onPress(id)}
    >
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: imageUrl || image || 'https://via.placeholder.com/150' }} 
            style={styles.image} 
          />
          
          {isUnavailable && (
            <View style={styles.overlayContainer}>
              <View style={styles.overlayBadge}>
                <Text style={styles.overlayText}>{overlayText}</Text>
              </View>
            </View>
          )}

          {showNewBadge && isNew && !isUnavailable && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>{isRTL ? 'جديد' : 'NEW'}</Text>
            </View>
          )}
        </View>

        <View style={[styles.infoContainer, isRTL ? { marginRight: 16 } : { marginLeft: 16 }]}>
          {/* Internal Status Badge for List Views */}
          <StatusBadge status={status} isRTL={isRTL} />

          <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>
            {title}
          </Text>

          <View style={styles.facultyBadge}>
            <Text style={styles.facultyText}>{displayFaculty.toUpperCase()}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};
