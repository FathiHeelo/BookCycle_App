import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Image, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/hooks/use-i18n';
import { Store } from '../types';

interface StoreSectionCardProps {
  stores: Store[];
}

export const StoreSectionCard: React.FC<StoreSectionCardProps> = ({ stores }) => {
  const { theme, isAccessible } = useAppTheme();
  const themeColors = Colors[theme];
  const { t, isRTL } = useI18n();
  const router = useRouter();

  if (stores.length === 0) return null;

  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  return (
    <View style={styles.container}>
      <View style={[styles.header, { flexDirection }]}>
        <ThemedText style={styles.title} type="subtitle">
          {t('marketplace.partnerStores', 'Partner Stores')}
        </ThemedText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        {stores.map((store) => {
          // Track per-store logo errors
          return <StoreCard key={store.id} store={store} themeColors={themeColors} isAccessible={isAccessible} router={router} t={t} flexDirection={flexDirection} textAlign={textAlign} isRTL={isRTL} />;
        })}
      </ScrollView>
    </View>
  );
};

// Inner component to manage per-card logo error state
const StoreCard: React.FC<{
  store: any;
  themeColors: any;
  isAccessible: boolean;
  router: any;
  t: any;
  flexDirection: any;
  textAlign: any;
  isRTL: boolean;
}> = ({ store, themeColors, isAccessible, router, t, flexDirection, textAlign }) => {
  const [logoError, setLogoError] = useState(false);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: themeColors.card,
          borderColor: themeColors.border,
          borderWidth: isAccessible ? 2 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      onPress={() => router.push(`/marketplace/store/${store.id}` as any)}
    >
      {/* Logo / Avatar */}
      <View style={styles.logoContainer}>
        {store.logoUrl && !logoError ? (
          <Image
            source={{ uri: store.logoUrl }}
            style={styles.logo}
            onError={() => setLogoError(true)}
          />
        ) : (
          <View style={[styles.placeholderLogo, { backgroundColor: themeColors.surface }]}>
            <Ionicons name="storefront-outline" size={24} color={themeColors.textSecondary} />
          </View>
        )}
      </View>

      {/* Store Details */}
      <View style={styles.details}>
        <ThemedText style={[styles.storeName, { color: themeColors.text, textAlign }]} numberOfLines={1}>
          {store.name}
        </ThemedText>

        {/* Rating & Count Row */}
        <View style={[styles.infoRow, { flexDirection }]}>
          <View style={[styles.ratingContainer, { flexDirection }]}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <ThemedText style={styles.ratingText}>{store.rating.toFixed(1)}</ThemedText>
          </View>
          <ThemedText style={[styles.offerCount, { color: themeColors.textSecondary }]}>
            {store.totalOffers} {t('marketplace.offerCard.offersAvailable', 'offers')}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
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
    paddingBottom: Spacing.xs,
  },
  card: {
    width: 220,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderLogo: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  storeName: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  infoRow: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ratingContainer: {
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  offerCount: {
    fontSize: 11,
    fontWeight: '500',
  },
});
