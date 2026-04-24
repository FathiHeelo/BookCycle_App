import React from 'react';
import {
  Platform,
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from '@/firebaseConfig';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { ThemedText } from '@/components/themed-text';
import { CustomHeader } from '@/src/components/shared/CustomHeader';
import { useI18n } from '@/hooks/use-i18n';

export default function HomeScreen() {
  const { theme: themeKey } = useAppTheme();
  const themeColors = Colors[themeKey];
  const { t, isRTL } = useI18n();

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={themeKey === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header Section */}
      <CustomHeader 
        title="BookCycle"
        leftMode="avatar"
        avatarUrl={FIREBASE_AUTH.currentUser?.photoURL || undefined}
        rightIcons={['search']}
        hideSafeArea
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeInfo}>
          <ThemedText style={[styles.welcomeText, { color: themeColors.textSecondary }]}>Welcome back,</ThemedText>
          <ThemedText style={[styles.userName, { color: themeColors.text }]}>{FIREBASE_AUTH.currentUser?.displayName || 'User'}</ThemedText>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: themeColors.text }]}>Quick Actions</ThemedText>
          <View style={styles.actionGrid}>
            <Pressable
              style={[styles.actionCard, { backgroundColor: themeColors.card, shadowColor: themeKey === 'dark' ? '#000' : '#E5E7EB', elevation: themeKey === 'dark' ? 0 : 2 }]}
              onPress={() => router.push('/(tabs)/Add_Books')}
            >
              <View style={[styles.iconCircle, { backgroundColor: themeColors.primary + '15' }]}>
                <Ionicons name="add" size={24} color={themeColors.primary} />
              </View>
              <ThemedText style={[styles.actionLabel, { color: themeColors.text }]}>{isRTL ? 'إضافة مادة' : 'Add Material'}</ThemedText>
            </Pressable>
            
            <Pressable 
              style={[styles.actionCard, { backgroundColor: themeColors.card, shadowColor: themeKey === 'dark' ? '#000' : '#E5E7EB', elevation: themeKey === 'dark' ? 0 : 2 }]}
              onPress={() => router.push('/(tabs)/my-requests')}
            >
              <View style={[styles.iconCircle, { backgroundColor: themeColors.accent ? themeColors.accent + '15' : 'rgba(245,158,11,0.1)' }]}>
                <Ionicons name="mail-outline" size={24} color={themeColors.accent || '#F59E0B'} />
              </View>
              <ThemedText style={[styles.actionLabel, { color: themeColors.text }]}>{isRTL ? 'الطلبات' : 'Requests'}</ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F4F7',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: -0.5,
  },
  welcomeInfo: {
    marginBottom: Spacing.xl,
  },
  welcomeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: 120, // Prevents tab bar overlap
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  accountCard: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  accountItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountItemText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  itemDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: Radius.md,
    marginTop: 20,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '800',
  },
  footerSpace: {
    height: 40,
  },
});
