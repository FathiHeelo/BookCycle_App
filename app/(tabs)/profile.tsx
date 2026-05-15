import React from 'react';
import { ScrollView, StatusBar, StyleSheet, useWindowDimensions, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useI18n } from '@/hooks/use-i18n';
import { ThemedText } from '@/components/themed-text';
import { CustomHeader } from '@/src/components/shared/CustomHeader';
import {
  ProfileCardUI,
  TotalBookCardUI,
  ContributorCardUI,
  BooksGivenUI,
  BooksReceivedUI,
  useProfileData,
} from '@/src/features/profile';

export default function Profile() {
  const { width } = useWindowDimensions();
  const horizontalPadding = Math.min(width * 0.05, 20);
  const { stats, userProfile, loading } = useProfileData();
  const { theme: themeKey } = useAppTheme();
  const themeColors = Colors[themeKey];
  const { isRTL } = useI18n();

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={themeKey === 'dark' ? "light-content" : "dark-content"} backgroundColor={themeColors.background} />
      <CustomHeader 
        title={isRTL ? 'ملفي الشخصي' : 'Profile'}
        leftMode="none"
        rightIcons={['search']}
        hideSafeArea={true}
      />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.cardWrapper}>
          <ProfileCardUI stats={stats} userProfile={userProfile ?? undefined} />
          <TotalBookCardUI stats={stats} />
          <ContributorCardUI stats={stats} />
          <BooksGivenUI />
          <BooksReceivedUI />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  scrollContent: { flexGrow: 1, paddingVertical: 24 },
  cardWrapper: { width: '100%' },
});
