import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMarketplace } from '@/src/features/marketplace/hooks/useMarketplace';
import { useVoucher } from '@/src/features/marketplace/hooks/useVoucher';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/hooks/use-i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OfferDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme, isAccessible } = useAppTheme();
  const themeColors = Colors[theme];
  const { t, isRTL } = useI18n();
  const insets = useSafeAreaInsets();

  const { getOfferById, getStoreById } = useMarketplace();
  const { generateVoucher } = useVoucher();
  const [generating, setGenerating] = useState(false);

  const offer = getOfferById(id as string);
  const store = offer ? getStoreById(offer.storeId) : undefined;

  if (!offer) {
    return (
      <View style={[styles.centered, { backgroundColor: themeColors.background }]}>
        <ThemedText style={{ color: themeColors.textSecondary }}>
          Offer not found
        </ThemedText>
        <TouchableOpacity style={[styles.backBtn, { marginTop: 20 }]} onPress={() => router.back()}>
          <ThemedText style={{ color: '#FFF' }}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  const isOutOfStock = offer.stock <= 0;
  const discountPercent = Math.round(
    ((offer.originalPrice - offer.discountedPrice) / offer.originalPrice) * 100
  );
  const savings = offer.originalPrice - offer.discountedPrice;

  const handleGetCode = async () => {
    if (isOutOfStock) {
      Alert.alert(t('marketplace.offerDetail.outOfStock', 'Out of stock'), 'This offer is no longer available.');
      return;
    }

    setGenerating(true);
    try {
      const voucher = await generateVoucher(offer, store);
      // Navigate to the voucher details screen
      router.push(`/marketplace/voucher/${voucher.id}` as any);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to generate discount voucher. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Floating Header Actions */}
      <View
        style={[
          styles.floatingHeader,
          {
            top: insets.top + (Platform.OS === 'ios' ? 0 : 10),
            flexDirection,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.floatingIconBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          onPress={() => router.back()}
        >
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {offer.imageUrl ? (
            <Image source={{ uri: offer.imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: themeColors.surface }]}>
              <Ionicons name="gift-outline" size={64} color={themeColors.textSecondary} />
            </View>
          )}
          {discountPercent > 0 && (
            <View style={[styles.imageDiscountBadge, { backgroundColor: theme === 'dark' ? '#F59E0B' : '#10B981' }]}>
              <ThemedText style={styles.imageDiscountText}>-{discountPercent}%</ThemedText>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          {/* Category Tag & Stock Status */}
          <View style={[styles.badgeRow, { flexDirection }]}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7' },
              ]}
            >
              <ThemedText style={[styles.categoryText, { color: themeColors.primary }]}>
                {t(`marketplace.categories.${offer.category}`, offer.category.toUpperCase())}
              </ThemedText>
            </View>
            
            <View
              style={[
                styles.stockBadge,
                { backgroundColor: isOutOfStock ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)' },
              ]}
            >
              <ThemedText
                style={[
                  styles.stockText,
                  { color: isOutOfStock ? '#EF4444' : '#10B981' },
                ]}
              >
                {isOutOfStock
                  ? t('marketplace.offerCard.outOfStock', 'Out of Stock')
                  : `${offer.stock} ${t('marketplace.offerCard.inStock', 'in stock')}`}
              </ThemedText>
            </View>
          </View>

          {/* Title */}
          <ThemedText style={[styles.title, { color: themeColors.text, textAlign }]} type="title">
            {offer.title}
          </ThemedText>

          {/* Price Box */}
          <View style={[styles.priceCard, { backgroundColor: themeColors.surface, flexDirection, borderWidth: isAccessible ? 1.5 : 0, borderColor: themeColors.border }]}>
            <View style={[styles.priceSubContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <ThemedText style={[styles.priceLabel, { color: themeColors.textSecondary }]}>
                {t('marketplace.offerDetail.yourPrice', 'Your Price')}
              </ThemedText>
              <ThemedText style={[styles.priceValue, { color: theme === 'dark' ? '#F59E0B' : '#10B981' }]}>
                {offer.discountedPrice} NIS
              </ThemedText>
            </View>

            <View style={styles.divider} />

            <View style={[styles.priceSubContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <ThemedText style={[styles.priceLabel, { color: themeColors.textSecondary }]}>
                {t('marketplace.offerDetail.originalPrice', 'Original Price')}
              </ThemedText>
              <ThemedText style={[styles.oldPriceValue, { color: themeColors.textSecondary }]}>
                {offer.originalPrice} NIS
              </ThemedText>
            </View>

            <View style={styles.divider} />

            <View style={[styles.priceSubContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <ThemedText style={[styles.priceLabel, { color: themeColors.textSecondary }]}>
                {t('marketplace.offerDetail.save', 'You Save')}
              </ThemedText>
              <ThemedText style={[styles.saveValue, { color: themeColors.primary }]}>
                {savings} NIS
              </ThemedText>
            </View>
          </View>

          {/* Partner Store Card */}
          {store && (
            <TouchableOpacity
              style={[
                styles.storeCard,
                {
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                  borderWidth: isAccessible ? 2 : 1,
                },
              ]}
              onPress={() => router.push(`/marketplace/store/${store.id}` as any)}
            >
              <View style={[styles.storeRow, { flexDirection }]}>
                <Image source={{ uri: store.logoUrl }} style={styles.storeLogo} />
                <View style={[styles.storeDetails, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                  <ThemedText style={[styles.storeLabel, { color: themeColors.textSecondary }]}>
                    {t('marketplace.offerDetail.store', 'Available At')}
                  </ThemedText>
                  <ThemedText style={[styles.storeNameText, { color: themeColors.text }]}>
                    {store.name}
                  </ThemedText>
                  <View style={[styles.storeRatingRow, { flexDirection }]}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <ThemedText style={styles.storeRatingText}>
                      {store.rating.toFixed(1)}
                    </ThemedText>
                  </View>
                </View>
                <Ionicons
                  name={isRTL ? 'chevron-back' : 'chevron-forward'}
                  size={20}
                  color={themeColors.textSecondary}
                  style={styles.chevron}
                />
              </View>
            </TouchableOpacity>
          )}

          {/* Description */}
          {offer.description && (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: themeColors.text, textAlign }]}>
                {t('explore.filter.title', 'Details')}
              </ThemedText>
              <ThemedText style={[styles.descriptionText, { color: themeColors.text, textAlign }]}>
                {offer.description}
              </ThemedText>
            </View>
          )}

          {/* Validity Note */}
          <View style={[styles.validityRow, { flexDirection }]}>
            <Ionicons name="calendar-outline" size={16} color={themeColors.textSecondary} />
            <ThemedText style={[styles.validityText, { color: themeColors.textSecondary }]}>
              {t('marketplace.offerDetail.validity', 'Valid Until')}:{' '}
              {new Date(offer.validUntil).toLocaleDateString()}
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      {/* Fixed CTA Button at Bottom */}
      <View
        style={[
          styles.ctaContainer,
          {
            backgroundColor: themeColors.card,
            borderTopColor: themeColors.border,
            borderTopWidth: isAccessible ? 2 : 1,
            paddingBottom: insets.bottom + Spacing.sm,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.ctaBtn,
            {
              backgroundColor: isOutOfStock ? '#94A3B8' : themeColors.primary,
            },
          ]}
          disabled={isOutOfStock || generating}
          onPress={handleGetCode}
        >
          {generating ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <View style={[styles.ctaContent, { flexDirection }]}>
              <Ionicons name="qr-code-outline" size={20} color="#FFF" style={styles.ctaIcon} />
              <ThemedText style={styles.ctaBtnText}>
                {t('marketplace.offerDetail.getDiscount', 'Get Discount Code')}
              </ThemedText>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    backgroundColor: '#001B39',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  floatingHeader: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  floatingIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 140,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: 280,
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
  imageDiscountBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  imageDiscountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  contentContainer: {
    padding: Spacing.md,
  },
  badgeRow: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '800',
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
    marginBottom: Spacing.md,
  },
  priceCard: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  priceSubContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  oldPriceValue: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  saveValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    marginHorizontal: Spacing.xs,
  },
  storeCard: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  storeRow: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  storeLogo: {
    width: 50,
    height: 50,
    borderRadius: Radius.md,
  },
  storeDetails: {
    flex: 1,
  },
  storeLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  storeNameText: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  storeRatingRow: {
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  storeRatingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chevron: {
    alignSelf: 'center',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  validityRow: {
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  validityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  ctaBtn: {
    height: 54,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  ctaIcon: {
    marginRight: 4,
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
