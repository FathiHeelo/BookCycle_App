import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useVoucher } from '@/src/features/marketplace/hooks/useVoucher';
import { useMarketplace } from '@/src/features/marketplace/hooks/useMarketplace';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/hooks/use-i18n';
import { CustomHeader } from '@/src/components/shared/CustomHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const QR_SIZE = SCREEN_WIDTH * 0.55;

export default function VoucherDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme, isAccessible } = useAppTheme();
  const themeColors = Colors[theme];
  const { t, isRTL } = useI18n();

  const { getVoucherById, cancelVoucher } = useVoucher();
  const { getOfferById } = useMarketplace();
  const voucher = getVoucherById(id as string);
  const offer = voucher ? getOfferById(voucher.offerId) : undefined;

  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [cancelling, setCancelling] = useState(false);

  const flexDirection = isRTL ? 'row-reverse' : 'row';

  // Countdown timer logic
  useEffect(() => {
    if (!voucher || voucher.status !== 'pending') return;

    const calculateTimeLeft = () => {
      const difference = new Date(voucher.expiresAt).getTime() - Date.now();
      
      if (difference <= 0) {
        setTimeLeft('00h 00m 00s');
        setIsExpired(true);
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const pad = (num: number) => String(num).padStart(2, '0');
      setTimeLeft(`${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [voucher]);

  if (!voucher) {
    return (
      <View style={[styles.centered, { backgroundColor: themeColors.background }]}>
        <ThemedText style={{ color: themeColors.textSecondary }}>Voucher not found</ThemedText>
        <TouchableOpacity style={[styles.backBtn, { marginTop: 20 }]} onPress={() => router.back()}>
          <ThemedText style={{ color: '#FFF' }}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const expiredOrPast = isExpired || voucher.status !== 'pending';

  const handleCancel = () => {
    Alert.alert(
      t('marketplace.voucher.cancel', 'Cancel Voucher'),
      'Are you sure you want to cancel this discount voucher?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await cancelVoucher(voucher.id);
              Alert.alert('Voucher Cancelled', 'Your discount voucher has been cancelled successfully.');
            } catch (err) {
              Alert.alert('Error', 'Failed to cancel voucher. Please try again.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    if (expiredOrPast && status === 'pending') {
      return { bg: 'rgba(100, 116, 139, 0.1)', text: '#64748B' }; // Expired/Gray
    }
    switch (status) {
      case 'pending':
        return { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B' };
      case 'completed':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981' };
      case 'cancelled':
      case 'rejected':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.1)', text: '#64748B' };
    }
  };

  const colors = getStatusColor(voucher.status);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <CustomHeader title={t('marketplace.voucher.title', 'Your Discount Code')} leftMode="back" hideSafeArea={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.mainCard, { backgroundColor: themeColors.card, borderColor: themeColors.border, borderWidth: isAccessible ? 2 : 1 }]}>
          {/* Offer & Store details */}
          <ThemedText style={[styles.storeName, { color: themeColors.textSecondary }]}>
            {voucher.storeName}
          </ThemedText>
          <ThemedText style={[styles.offerTitle, { color: themeColors.text }]}>
            {voucher.offerTitle || 'Discount Offer'}
          </ThemedText>

          {/* Pricing Info */}
          <View style={[styles.priceRow, { flexDirection }]}>
            <View style={styles.priceCol}>
              <ThemedText style={styles.priceVal}>
                {voucher.discountedPrice} NIS
              </ThemedText>
              <ThemedText style={[styles.priceLabel, { color: themeColors.textSecondary }]}>
                {t('marketplace.offerDetail.yourPrice', 'Your Price')}
              </ThemedText>
            </View>
            <View style={styles.priceCol}>
              <ThemedText style={styles.savingsVal}>
                {voucher.originalPrice - voucher.discountedPrice} NIS
              </ThemedText>
              <ThemedText style={[styles.priceLabel, { color: themeColors.textSecondary }]}>
                {t('marketplace.offerDetail.save', 'Saved')}
              </ThemedText>
            </View>
          </View>

          {/* QR Code Container */}
          <View style={styles.qrOuterWrapper}>
            <View style={[styles.qrContainer, { borderColor: themeColors.border }]}>
              {/* Ensure QR is always scannable on white bg */}
              <View style={styles.qrBackground}>
                {expiredOrPast ? (
                  <View style={styles.qrOverlay}>
                    <Ionicons
                      name={
                        voucher.status === 'completed'
                          ? 'checkmark-circle-outline'
                          : 'close-circle-outline'
                      }
                      size={64}
                      color={colors.text}
                    />
                    <ThemedText style={[styles.qrOverlayText, { color: colors.text }]}>
                      {voucher.status === 'completed'
                        ? t('marketplace.voucher.status.completed', 'USED')
                        : isExpired
                        ? t('marketplace.voucher.status.expired', 'EXPIRED')
                        : t(`marketplace.voucher.status.${voucher.status}`, 'INACTIVE')}
                    </ThemedText>
                  </View>
                ) : (
                  <QRCode value={voucher.id} size={QR_SIZE} color="#000000" backgroundColor="#FFFFFF" />
                )}
              </View>
            </View>
          </View>

          {/* Voucher Short Code */}
          <View style={styles.shortCodeContainer}>
            <ThemedText style={[styles.shortCodeLabel, { color: themeColors.textSecondary }]}>
              {t('marketplace.voucher.code', 'SHORT CODE')}
            </ThemedText>
            <ThemedText style={[styles.shortCodeVal, { color: themeColors.text }]}>
              {voucher.voucherCode}
            </ThemedText>
          </View>

          {/* Timer Section (Only if Pending) */}
          {voucher.status === 'pending' && !isExpired && (
            <View style={styles.timerSection}>
              <ThemedText style={[styles.timerLabel, { color: themeColors.textSecondary }]}>
                {t('marketplace.voucher.expiresIn', 'EXPIRES IN')}
              </ThemedText>
              <View style={[styles.timerRow, { flexDirection }]}>
                <Ionicons name="time-outline" size={16} color={themeColors.primary} />
                <ThemedText style={[styles.timerText, { color: themeColors.primary }]}>
                  {timeLeft}
                </ThemedText>
              </View>
            </View>
          )}

          {/* Instructions note */}
          <View style={[styles.instructionBox, { backgroundColor: themeColors.surface }]}>
            <Ionicons name="information-circle-outline" size={20} color={themeColors.textSecondary} />
            <ThemedText style={[styles.instructionText, { color: themeColors.textSecondary }]}>
              {t('marketplace.voucher.showAtStore', 'Show this QR code or Short Code to the store clerk at checkout to redeem your discount.')}
            </ThemedText>
          </View>
        </View>

        {/* Cancel Button */}
        {voucher.status === 'pending' && !isExpired && (
          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: themeColors.error, borderWidth: isAccessible ? 2 : 1 }]}
            onPress={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator size="small" color={themeColors.error} />
            ) : (
              <ThemedText style={[styles.cancelBtnText, { color: themeColors.error }]}>
                {t('marketplace.voucher.cancel', 'Cancel Voucher')}
              </ThemedText>
            )}
          </TouchableOpacity>
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
    paddingBottom: 60,
  },
  mainCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  storeName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  priceRow: {
    width: '100%',
    justifyContent: 'space-around',
    marginVertical: Spacing.md,
  },
  priceCol: {
    alignItems: 'center',
  },
  priceVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981',
  },
  savingsVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0EA5E9',
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  qrOuterWrapper: {
    marginVertical: Spacing.lg,
    alignItems: 'center',
  },
  qrContainer: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  qrBackground: {
    width: QR_SIZE,
    height: QR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  qrOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrOverlayText: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: Spacing.sm,
    letterSpacing: 1,
  },
  shortCodeContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  shortCodeLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  shortCodeVal: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  timerRow: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '800',
  },
  instructionBox: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    gap: Spacing.sm,
    width: '100%',
  },
  instructionText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  cancelBtn: {
    height: 50,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.md,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
