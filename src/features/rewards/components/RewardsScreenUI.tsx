import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRewards } from '../hooks/useRewards';
import { Sponsor, LEVELS_CONFIG } from '../types';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/hooks/use-i18n';
import { CustomHeader } from '@/src/components/shared/CustomHeader';

const { width } = Dimensions.get('window');

export default function RewardsScreenUI() {
  const { theme, isAccessible } = useAppTheme();
  const themeColors = Colors[theme];
  const { t, isRTL } = useI18n();
  const { rewards, sponsors, coupons, loading, redeemReward, redeeming } = useRewards();

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  const currentLevelInfo = LEVELS_CONFIG.find(l => l.level === rewards?.currentLevel) || LEVELS_CONFIG[0];
  const nextLevelInfo = LEVELS_CONFIG.find(l => l.level === (rewards?.currentLevel || 1) + 1);
  const progress = nextLevelInfo 
    ? (rewards?.totalPoints || 0) / nextLevelInfo.minPoints 
    : 1;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <CustomHeader 
        title={t('rewards.loyalty')} 
        leftMode="none"
        rightIcons={['search']}
        hideSafeArea={true}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Progress Header */}
        <View style={[styles.headerCard, { backgroundColor: themeColors.primary }]}>
          <View style={styles.headerTop}>
            <View>
              <ThemedText style={styles.levelLabel}>{t('rewards.currentLevel')}</ThemedText>
              <ThemedText style={styles.levelTitle}>{currentLevelInfo.title}</ThemedText>
            </View>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsValue}>{rewards?.totalPoints || 0}</Text>
              <Text style={styles.pointsLabel}>{t('rewards.pointsUnit')}</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={[styles.progressBarBase, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: '#F59E0B' }]} />
            </View>
            {nextLevelInfo && (
              <ThemedText style={styles.progressText}>
                {t('rewards.ptsToReach', { pts: nextLevelInfo.minPoints - (rewards?.totalPoints || 0), levelTitle: nextLevelInfo.title })}
              </ThemedText>
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="share-social" size={20} color="#FFF" />
              <ThemedText style={styles.statNum}>{rewards?.resourcesShared || 0}</ThemedText>
              <ThemedText style={styles.statLabelSmall}>{t('rewards.shared')}</ThemedText>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <ThemedText style={styles.statNum}>{rewards?.successfulExchanges || 0}</ThemedText>
              <ThemedText style={styles.statLabelSmall}>{t('rewards.exchanges')}</ThemedText>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="ribbon" size={20} color="#FFF" />
              <ThemedText style={styles.statNum}>{rewards?.badges?.length || 0}</ThemedText>
              <ThemedText style={styles.statLabelSmall}>{t('rewards.badges')}</ThemedText>
            </View>
          </View>
        </View>

        {/* My Active Coupons */}
        {coupons.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t('rewards.activeCoupons')}</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.couponScroll}>
              {coupons.map((coupon) => (
                <View key={coupon.id} style={[styles.couponCard, { backgroundColor: themeColors.card, borderColor: themeColors.primary }]}>
                  <View style={styles.couponIcon}>
                    <Ionicons name="ticket" size={24} color={themeColors.primary} />
                  </View>
                  <View>
                    <ThemedText style={styles.couponCode}>{coupon.couponCode}</ThemedText>
                    <ThemedText style={styles.couponExpiry}>
                      {t('rewards.expires')}{new Date(coupon.expiryDate).toLocaleDateString()}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Reward Sponsors */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('rewards.availableRewards')}</ThemedText>
          <View style={styles.sponsorsGrid}>
            {sponsors.map((sponsor) => (
              <View key={sponsor.id} style={[styles.sponsorCard, { backgroundColor: themeColors.card }]}>
                <Image source={{ uri: sponsor.logo }} style={styles.sponsorLogo} />
                <View style={styles.sponsorInfo}>
                  <ThemedText style={styles.sponsorName}>{sponsor.name}</ThemedText>
                  <ThemedText style={styles.sponsorDesc} numberOfLines={2}>{sponsor.description}</ThemedText>
                  
                  <View style={styles.rewardFooter}>
                    <View style={styles.costContainer}>
                      <Ionicons name="flash" size={14} color="#F59E0B" />
                      <ThemedText style={styles.costText}>{sponsor.pointsRequired} pts</ThemedText>
                    </View>
                    
                    <TouchableOpacity 
                      style={[
                        styles.redeemBtn, 
                        { backgroundColor: themeColors.primary },
                        (rewards?.totalPoints || 0) < sponsor.pointsRequired && { backgroundColor: '#94A3B8' }
                      ]}
                      onPress={() => redeemReward(sponsor)}
                      disabled={redeeming === sponsor.id || (rewards?.totalPoints || 0) < sponsor.pointsRequired}
                    >
                      {redeeming === sponsor.id ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <ThemedText style={styles.redeemBtnText}>{t('rewards.redeem')}</ThemedText>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={themeColors.textSecondary} />
          <ThemedText style={styles.infoText}>
            {t('rewards.infoDesc')}
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 120 },
  headerCard: {
    margin: 20,
    borderRadius: 30,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  levelLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  levelTitle: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  pointsBadge: { backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center' },
  pointsValue: { color: '#001B39', fontSize: 20, fontWeight: '800' },
  pointsLabel: { color: '#001B39', fontSize: 10, fontWeight: '700' },
  progressSection: { marginBottom: 24 },
  progressBarBase: { height: 8, borderRadius: 4, width: '100%', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 8, fontWeight: '600' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 20 },
  statItem: { alignItems: 'center' },
  statNum: { color: '#FFF', fontSize: 18, fontWeight: '800', marginTop: 4 },
  statLabelSmall: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600' },
  section: { paddingHorizontal: 20, marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16 },
  couponScroll: { gap: 12, paddingRight: 20 },
  couponCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 20, 
    borderWidth: 2,
    borderStyle: 'dashed',
    minWidth: 220
  },
  couponIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(59, 130, 246, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  couponCode: { fontSize: 18, fontWeight: '800', color: '#001B39' },
  couponExpiry: { fontSize: 11, color: '#64748B', marginTop: 2 },
  sponsorsGrid: { gap: 16 },
  sponsorCard: { borderRadius: 24, padding: 12, flexDirection: 'row', gap: 16 },
  sponsorLogo: { width: 90, height: 90, borderRadius: 20 },
  sponsorInfo: { flex: 1, justifyContent: 'center' },
  sponsorName: { fontSize: 17, fontWeight: '800' },
  sponsorDesc: { fontSize: 13, color: '#64748B', marginTop: 4, lineHeight: 18 },
  rewardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  costContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  costText: { fontSize: 14, fontWeight: '700', color: '#F59E0B' },
  redeemBtn: { paddingHorizontal: 16, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  redeemBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  infoBox: { flexDirection: 'row', padding: 20, backgroundColor: 'rgba(148, 163, 184, 0.05)', margin: 20, borderRadius: 20, alignItems: 'center', gap: 12 },
  infoText: { flex: 1, fontSize: 13, color: '#64748B', lineHeight: 18, fontWeight: '500' }
});
