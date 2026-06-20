import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMarketplace } from '@/src/features/marketplace/hooks/useMarketplace';
import { OfferCard } from '@/src/features/marketplace/components/OfferCard';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/hooks/use-i18n';
import { CustomHeader } from '@/src/components/shared/CustomHeader';
import { useUniversity } from '@/context/UniversityContext';

export default function StoreDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme, isAccessible } = useAppTheme();
  const themeColors = Colors[theme];
  const { t, isRTL } = useI18n();
  const { selectedUniversity } = useUniversity();

  const { getStoreById, getOffersByStore } = useMarketplace(selectedUniversity?.id);
  const store = getStoreById(id as string);
  const storeOffers = getOffersByStore(id as string);

  const [logoError, setLogoError] = useState(false);

  if (!store) {
    return (
      <View style={[styles.centered, { backgroundColor: themeColors.background }]}>
        <ThemedText style={{ color: themeColors.textSecondary }}>Store not found</ThemedText>
        <TouchableOpacity style={[styles.backBtn, { marginTop: 20 }]} onPress={() => router.back()}>
          <ThemedText style={{ color: '#FFF' }}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  const handleCall = () => {
    if (store.phone) {
      Linking.openURL(`tel:${store.phone}`);
    }
  };

  const handleLocation = () => {
    const address = encodeURIComponent(store.location.address);
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
      default: `https://www.google.com/maps/search/?api=1&query=${address}`,
    });
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <CustomHeader title={store.name} leftMode="back" hideSafeArea={true} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Store Information Card */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
              borderWidth: isAccessible ? 2 : 1,
            },
          ]}
        >
          <View style={[styles.profileRow, { flexDirection }]}>
            {/* Store Logo with error fallback */}
            {store.logoUrl && !logoError ? (
              <Image
                source={{ uri: store.logoUrl }}
                style={styles.logo}
                onError={() => setLogoError(true)}
              />
            ) : (
              <View style={[styles.placeholderLogo, { backgroundColor: themeColors.surface }]}>
                <Ionicons name="storefront-outline" size={32} color={themeColors.textSecondary} />
              </View>
            )}

            <View style={[styles.metaData, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <ThemedText style={[styles.storeTitle, { color: themeColors.text }]}>
                {store.name}
              </ThemedText>

              <View style={[styles.ratingRow, { flexDirection }]}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <ThemedText style={styles.ratingText}>{store.rating.toFixed(1)}</ThemedText>
                <ThemedText style={[styles.dot, { color: themeColors.textSecondary }]}>•</ThemedText>
                <ThemedText style={[styles.offersAvailable, { color: themeColors.textSecondary }]}>
                  {storeOffers.length} {t('marketplace.store.offers', 'offers available')}
                </ThemedText>
              </View>
            </View>
          </View>

          {store.description && (
            <ThemedText
              style={[styles.description, { color: themeColors.text, textAlign }]}
              numberOfLines={3}
            >
              {store.description}
            </ThemedText>
          )}

          {/* Action Buttons (Call / Location) */}
          <View style={[styles.actionsRow, { flexDirection }]}>
            {store.phone && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: themeColors.surface }]}
                onPress={handleCall}
              >
                <Ionicons name="call" size={18} color={themeColors.primary} />
                <ThemedText style={[styles.actionBtnText, { color: themeColors.primary }]}>
                  {t('marketplace.store.contact', 'Contact')}
                </ThemedText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: themeColors.surface }]}
              onPress={handleLocation}
            >
              <Ionicons name="location" size={18} color={themeColors.primary} />
              <ThemedText style={[styles.actionBtnText, { color: themeColors.primary }]}>
                {t('marketplace.store.location', 'Location')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Offers Section Title */}
        <ThemedText
          style={[styles.sectionTitle, { color: themeColors.text, textAlign }]}
          type="subtitle"
        >
          {t('marketplace.store.offersSection', 'Available Offers')}
        </ThemedText>

        {/* Offers Grid — flexWrap approach fixes the odd-item-last-row issue */}
        {storeOffers.length > 0 ? (
          <View style={[styles.grid, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {storeOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="pricetag-outline" size={48} color={themeColors.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: themeColors.textSecondary }]}>
              {t('marketplace.empty', 'No offers found from this store')}
            </ThemedText>
          </View>
        )}
      </ScrollView>
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
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 80,
  },
  infoCard: {
    borderRadius: Radius.lg,
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
  profileRow: {
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
  },
  placeholderLogo: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  metaData: {
    flex: 1,
  },
  storeTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  ratingRow: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dot: {
    fontSize: 12,
  },
  offersAvailable: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
    fontWeight: '500',
  },
  actionsRow: {
    gap: Spacing.md,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: Spacing.md,
  },
  // flexWrap grid — same approach as MarketplaceScreen, no FlatList numColumns issues
  grid: {
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
