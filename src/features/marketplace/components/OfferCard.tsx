import React, { useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/hooks/use-i18n';
import { Offer } from '../types';

interface OfferCardProps {
  offer: Offer;
  onPress?: () => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, onPress }) => {
  const { theme, isAccessible } = useAppTheme();
  const themeColors = Colors[theme];
  const { t, isRTL } = useI18n();
  const router = useRouter();

  const [imageError, setImageError] = useState(false);

  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/marketplace/offer-details/${offer.id}` as any);
    }
  };

  const isOutOfStock = offer.stock <= 0;
  const discountPercent = Math.round(
    ((offer.originalPrice - offer.discountedPrice) / offer.originalPrice) * 100
  );

  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: themeColors.card,
          borderColor: themeColors.border,
          borderWidth: isAccessible ? 2 : 1,
        },
      ]}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        {offer.imageUrl && !imageError ? (
          <Image
            source={{ uri: offer.imageUrl }}
            style={styles.image}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: themeColors.surface }]}>
            <Ionicons name="gift-outline" size={32} color={themeColors.textSecondary} />
          </View>
        )}

        {/* Discount Badge */}
        {!isOutOfStock && discountPercent > 0 && (
          <View style={[styles.discountBadge, { backgroundColor: theme === 'dark' ? '#F59E0B' : '#10B981' }]}>
            <ThemedText style={styles.discountBadgeText}>-{discountPercent}%</ThemedText>
          </View>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <View style={styles.outOfStockBadge}>
              <ThemedText style={styles.outOfStockText}>
                {t('marketplace.offerCard.outOfStock', 'SOLD OUT')}
              </ThemedText>
            </View>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Store Name */}
        <ThemedText style={[styles.storeName, { color: themeColors.textSecondary, textAlign }]} numberOfLines={1}>
          {offer.storeName || t('marketplace.partnerStores', 'Partner Store')}
        </ThemedText>

        {/* Title */}
        <ThemedText style={[styles.title, { color: themeColors.text, textAlign }]} numberOfLines={2}>
          {offer.title}
        </ThemedText>

        {/* Prices & Action */}
        <View style={[styles.priceRow, { flexDirection }]}>
          <View style={styles.priceContainer}>
            <ThemedText style={[styles.discountedPrice, { color: theme === 'dark' ? '#F59E0B' : '#10B981' }]}>
              {offer.discountedPrice} NIS
            </ThemedText>
            <ThemedText style={[styles.originalPrice, { color: themeColors.textSecondary }]}>
              {offer.originalPrice} NIS
            </ThemedText>
          </View>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: isOutOfStock ? '#94A3B8' : themeColors.primary,
              },
            ]}
            disabled={isOutOfStock}
            onPress={handlePress}
          >
            <ThemedText style={styles.actionBtnText}>
              {t('marketplace.offerCard.getCode', 'Get Code')}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: Spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    zIndex: 1,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  outOfStockBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  outOfStockText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  content: {
    padding: Spacing.sm,
    flex: 1,
    justifyContent: 'space-between',
  },
  storeName: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
    height: 36,
    marginBottom: Spacing.sm,
  },
  priceRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  priceContainer: {
    flexDirection: 'column',
  },
  discountedPrice: {
    fontSize: 14,
    fontWeight: '900',
  },
  originalPrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  actionBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
