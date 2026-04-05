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
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: '#FFFFFF' }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: '#FFFFFF' }]}>
        <View style={styles.headerTop}>
          <Ionicons name="book" size={24} color="#001B39" />
          <ThemedText style={[styles.headerTitle, { color: '#001B39' }]}>BookCycle</ThemedText>
        </View>
        <View style={styles.welcomeInfo}>
          <ThemedText style={[styles.welcomeText, { color: '#8E9BAE' }]}>Welcome back,</ThemedText>
          <ThemedText style={[styles.userName, { color: '#1A1A1A' }]}>{FIREBASE_AUTH.currentUser?.displayName || 'User'}</ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: '#1A1A1A' }]}>Quick Actions</ThemedText>
          <View style={styles.actionGrid}>
            <Pressable style={[styles.actionCard, { backgroundColor: '#F1F4F7' }]}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(0,27,57,0.1)' }]}>
                <Ionicons name="add" size={24} color="#001B39" />
              </View>
              <ThemedText style={[styles.actionLabel, { color: '#001B39' }]}>Add Book</ThemedText>
            </Pressable>
            
            <Pressable style={[styles.actionCard, { backgroundColor: '#F1F4F7' }]}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
                <Ionicons name="gift-outline" size={24} color="#10B981" />
              </View>
              <ThemedText style={[styles.actionLabel, { color: '#001B39' }]}>My Gifts</ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: '#1A1A1A' }]}>Account Settings</ThemedText>
          <View style={[styles.accountCard, { backgroundColor: '#F1F4F7' }]}>
            <Pressable
              style={styles.accountItem}
              onPress={() => router.push('/change-password')}
            >
              <View style={styles.accountItemLeft}>
                <Ionicons name="lock-closed-outline" size={20} color="#001B39" />
                <ThemedText style={[styles.accountItemText, { color: '#1A1A1A' }]}>Change Password</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8E9BAE" />
            </Pressable>

            <View style={[styles.itemDivider, { backgroundColor: '#E5E7EB' }]} />

            <Pressable
              style={styles.accountItem}
              onPress={() => router.push('/verify-phone')}
            >
              <View style={styles.accountItemLeft}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#001B39" />
                <ThemedText style={[styles.accountItemText, { color: '#1A1A1A' }]}>Security & Verification</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8E9BAE" />
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.logoutBtn,
              { backgroundColor: 'rgba(239,68,68,0.1)' },
              pressed && { opacity: 0.8 }
            ]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" style={styles.logoutIcon} />
            <ThemedText style={styles.logoutText}>Sign Out</ThemedText>
          </Pressable>
        </View>

        <View style={styles.footerSpace} />
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
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: -0.5,
  },
  welcomeInfo: {
    marginTop: 5,
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
