import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMarketplace } from '../hooks/useMarketplace';
import { useVoucher } from '../hooks/useVoucher';
import { CategoryPills } from './CategoryPills';
import { MarketplaceSearchBar } from './MarketplaceSearchBar';
import { OfferCard } from './OfferCard';
import { FeaturedOffersCarousel } from './FeaturedOffersCarousel';
import { StoreSectionCard } from './StoreSectionCard';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/hooks/use-i18n';
import { CustomHeader } from '@/src/components/shared/CustomHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const MarketplaceScreen: React.FC = () => {
  const router = useRouter();
  const { theme, isAccessible } = useAppTheme();
  const themeColors = Colors[theme];
  const { t, isRTL } = useI18n();

  const {
    stores,
    featuredOffers,
    filteredOffers,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  } = useMarketplace();

  const { vouchers } = useVoucher();
  const activeVouchersCount = vouchers.filter(
    (v) => v.status === 'pending' && new Date(v.expiresAt).getTime() > Date.now()
  ).length;

  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <CustomHeader
        title={t('marketplace.title', 'Marketplace')}
        subtitle={t('marketplace.subtitle', 'Exclusive Student Offers')}
        leftMode="none"
        rightIcons={['bookmark']} // bookmark icon to jump to my-vouchers
        onRightIconPress={(icon) => {
          if (icon === 'bookmark') {
            router.push('/marketplace/my-vouchers' as any);
          }
        }}
        hideSafeArea={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Active Vouchers Banner Indicator */}
        {activeVouchersCount > 0 && (
          <TouchableOpacity
            style={[
              styles.vouchersBanner,
              {
                backgroundColor: themeColors.primary,
                flexDirection,
              },
            ]}
            onPress={() => router.push('/marketplace/my-vouchers' as any)}
          >
            <Ionicons name="ticket" size={20} color="#FFF" style={styles.bannerIcon} />
            <ThemedText style={styles.bannerText}>
              {t('marketplace.myVouchers.activeAlert', {
                count: activeVouchersCount,
                defaultValue: `You have ${activeVouchersCount} active discount codes! Tap to view`,
              })}
            </ThemedText>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={16}
              color="#FFF"
            />
          </TouchableOpacity>
        )}

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <MarketplaceSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
        </View>

        {/* Category Pills */}
        <CategoryPills
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={themeColors.primary} />
          </View>
        ) : (
          <>
            {/* Featured Section (only show if no search/category filter is active) */}
            {searchQuery === '' && selectedCategory === 'all' && featuredOffers.length > 0 && (
              <FeaturedOffersCarousel offers={featuredOffers} />
            )}

            {/* Stores Section (only show if no search/category filter is active) */}
            {searchQuery === '' && selectedCategory === 'all' && stores.length > 0 && (
              <StoreSectionCard stores={stores} />
            )}

            {/* Grid title */}
            <View style={[styles.sectionHeader, { flexDirection }]}>
              <ThemedText style={styles.sectionTitle} type="subtitle">
                {searchQuery !== '' || selectedCategory !== 'all'
                  ? t('marketplace.searchResults', 'Filtered Offers')
                  : t('marketplace.allOffers', 'All Offers')}
              </ThemedText>
            </View>

            {/* Offers Grid */}
            {filteredOffers.length > 0 ? (
              <View style={[styles.grid, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {filteredOffers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={themeColors.textSecondary} />
                <ThemedText style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                  {t('marketplace.empty', 'No offers found')}
                </ThemedText>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  vouchersBanner: {
    margin: Spacing.md,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  bannerIcon: {
    marginHorizontal: Spacing.xs,
  },
  bannerText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  searchSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  loaderContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  grid: {
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
