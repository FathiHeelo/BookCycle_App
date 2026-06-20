import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/hooks/use-i18n';
import { Offer } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.82;

interface FeaturedOffersCarouselProps {
  offers: Offer[];
}

export const FeaturedOffersCarousel: React.FC<FeaturedOffersCarouselProps> = ({ offers }) => {
  const { theme, isAccessible } = useAppTheme();
  const themeColors = Colors[theme];
  const { t, isRTL } = useI18n();
  const router = useRouter();

  if (offers.length === 0) return null;

  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  return (
    <View style={styles.container}>
      <View style={[styles.header, { flexDirection }]}>
        <ThemedText style={styles.title} type="subtitle">
          {t('marketplace.featured', 'Featured Offers')}
        </ThemedText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + Spacing.md}
        decelerationRate="fast"
        contentContainerStyle={[
          styles.scrollContent,
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        {offers.map((offer) => {
          const discountPercent = Math.round(
            ((offer.originalPrice - offer.discountedPrice) / offer.originalPrice) * 100
          );

          return (
            <Pressable
              key={offer.id}
              style={({ pressed }) => [
                styles.card,
                {
                  borderColor: themeColors.border,
                  borderWidth: isAccessible ? 2 : 0,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              onPress={() => router.push(`/marketplace/offer-details/${offer.id}` as any)}
            >
              {offer.imageUrl ? (
                <Image source={{ uri: offer.imageUrl }} style={styles.cardImage} />
              ) : (
                <View style={[styles.placeholderImage, { backgroundColor: themeColors.surface }]}>
                  <ThemedText style={{ color: themeColors.textSecondary }}>No Image Available</ThemedText>
                </View>
              )}

              {/* Gradient Overlay for premium look and text readability */}
              <LinearGradient
                colors={['transparent', 'rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.95)']}
                locations={[0.2, 0.6, 1.0]}
                style={styles.gradient}
              />

              {/* Content overlaid on image */}
              <View style={[styles.cardContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                {/* Upper tags row */}
                <View style={[styles.tagRow, { flexDirection }]}>
                  <View style={[styles.badge, { backgroundColor: '#F59E0B' }]}>
                    <ThemedText style={styles.badgeText}>
                      {t('marketplace.discount', 'SPECIAL')}
                    </ThemedText>
                  </View>
                  {discountPercent > 0 && (
                    <View style={[styles.badge, { backgroundColor: '#10B981' }]}>
                      <ThemedText style={styles.badgeText}>-{discountPercent}%</ThemedText>
                    </View>
                  )}
                </View>

                {/* Title and Store */}
                <ThemedText style={[styles.offerTitle, { textAlign }]} numberOfLines={1}>
                  {offer.title}
                </ThemedText>
                
                <ThemedText style={[styles.storeName, { textAlign }]} numberOfLines={1}>
                  {offer.storeName || 'Partner Store'}
                </ThemedText>

                {/* Pricing Details */}
                <View style={[styles.priceRow, { flexDirection }]}>
                  <ThemedText style={styles.priceText}>
                    {offer.discountedPrice} NIS
                  </ThemedText>
                  <ThemedText style={styles.oldPriceText}>
                    {offer.originalPrice} NIS
                  </ThemedText>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  header: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    height: 180,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardImage: {
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
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    zIndex: 2,
  },
  tagRow: {
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  offerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  storeName: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  priceRow: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  priceText: {
    color: '#F59E0B',
    fontSize: 18,
    fontWeight: '900',
  },
  oldPriceText: {
    color: '#94A3B8',
    fontSize: 13,
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
});
