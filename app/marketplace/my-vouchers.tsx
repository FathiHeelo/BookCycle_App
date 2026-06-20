import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVoucher } from '@/src/features/marketplace/hooks/useVoucher';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/hooks/use-i18n';
import { CustomHeader } from '@/src/components/shared/CustomHeader';
import { Voucher } from '@/src/features/marketplace/types';

export default function MyVouchersScreen() {
  const router = useRouter();
  const { theme, isAccessible } = useAppTheme();
  const themeColors = Colors[theme];
  const { t, isRTL } = useI18n();

  const { vouchers, loading } = useVoucher();
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  // Filter vouchers based on status
  const filteredVouchers = vouchers.filter((v) => {
    const isExpired = new Date(v.expiresAt).getTime() < Date.now();
    
    // Active if pending AND not expired
    if (activeTab === 'active') {
      return v.status === 'pending' && !isExpired;
    } else {
      // Past if completed, expired, cancelled, or pending but expired
      return v.status !== 'pending' || isExpired;
    }
  });

  const getStatusColor = (status: string, isExpired: boolean) => {
    if (isExpired) return { bg: 'rgba(100, 116, 139, 0.1)', text: '#64748B' }; // Gray
    switch (status) {
      case 'pending':
        return { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B' }; // Orange/Gold
      case 'completed':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981' }; // Green
      case 'cancelled':
      case 'rejected':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444' }; // Red
      default:
        return { bg: 'rgba(100, 116, 139, 0.1)', text: '#64748B' };
    }
  };

  const getStatusLabel = (status: string, isExpired: boolean) => {
    if (isExpired) return t('marketplace.voucher.status.expired', 'Expired');
    return t(`marketplace.voucher.status.${status}`, status.toUpperCase());
  };

  const renderVoucherItem = ({ item }: { item: Voucher }) => {
    const isExpired = new Date(item.expiresAt).getTime() < Date.now();
    const colors = getStatusColor(item.status, isExpired);

    return (
      <TouchableOpacity
        style={[
          styles.voucherCard,
          {
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
            borderWidth: isAccessible ? 2 : 1,
          },
        ]}
        onPress={() => router.push(`/marketplace/voucher/${item.id}` as any)}
      >
        <View style={[styles.cardHeader, { flexDirection }]}>
          <View style={[styles.offerInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
            <ThemedText style={[styles.storeName, { color: themeColors.textSecondary }]} numberOfLines={1}>
              {item.storeName}
            </ThemedText>
            <ThemedText style={[styles.offerTitle, { color: themeColors.text }]} numberOfLines={1}>
              {item.offerTitle || 'Discount Offer'}
            </ThemedText>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
            <ThemedText style={[styles.statusText, { color: colors.text }]}>
              {getStatusLabel(item.status, isExpired)}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.cardDivider, { backgroundColor: themeColors.border }]} />

        <View style={[styles.cardFooter, { flexDirection }]}>
          <View style={[styles.codeContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
            <ThemedText style={[styles.codeLabel, { color: themeColors.textSecondary }]}>
              {t('marketplace.voucher.code', 'VOUCHER CODE')}
            </ThemedText>
            <ThemedText style={[styles.codeText, { color: themeColors.primary }]}>
              {item.voucherCode}
            </ThemedText>
          </View>

          <View style={[styles.priceContainer, { alignItems: isRTL ? 'flex-start' : 'flex-end' }]}>
            <ThemedText style={[styles.priceLabel, { color: themeColors.textSecondary }]}>
              {t('marketplace.offerDetail.yourPrice', 'PRICE')}
            </ThemedText>
            <ThemedText style={[styles.priceText, { color: theme === 'dark' ? '#F59E0B' : '#10B981' }]}>
              {item.discountedPrice} NIS
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <CustomHeader title={t('marketplace.myVouchers.title', 'My Discount Codes')} leftMode="back" hideSafeArea={true} />

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: themeColors.border, flexDirection }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'active' && { borderBottomColor: themeColors.primary },
          ]}
          onPress={() => setActiveTab('active')}
        >
          <ThemedText
            style={[
              styles.tabText,
              {
                color: activeTab === 'active' ? themeColors.text : themeColors.textSecondary,
                fontWeight: activeTab === 'active' ? '800' : '600',
              },
            ]}
          >
            {t('marketplace.myVouchers.active', 'Active')}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'past' && { borderBottomColor: themeColors.primary },
          ]}
          onPress={() => setActiveTab('past')}
        >
          <ThemedText
            style={[
              styles.tabText,
              {
                color: activeTab === 'past' ? themeColors.text : themeColors.textSecondary,
                fontWeight: activeTab === 'past' ? '800' : '600',
              },
            ]}
          >
            {t('marketplace.myVouchers.past', 'Past')}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredVouchers}
          renderItem={renderVoucherItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="ticket-outline" size={64} color={themeColors.border} />
              <ThemedText style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                {t('marketplace.myVouchers.empty', 'No vouchers yet')}
              </ThemedText>
            </View>
          }
        />
      )}
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
  tabBar: {
    height: 48,
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 60,
  },
  voucherCard: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  offerInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardDivider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  cardFooter: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeContainer: {
    flex: 1,
  },
  codeLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '900',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '900',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
