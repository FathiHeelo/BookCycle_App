import React from 'react';
import { StyleSheet, View, ScrollView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <ThemedText style={styles.headerTitle}>Explore Books</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Discover hidden gems in your campus community</ThemedText>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Placeholder */}
        <View style={[styles.searchBar, { backgroundColor: '#F1F3F5' }]}>
          <Ionicons name="search-outline" size={20} color={theme.textSecondary} />
          <ThemedText style={[styles.searchText, { color: theme.textSecondary }]}>Search by title, author, or ISBN...</ThemedText>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Categories</ThemedText>
          <View style={styles.categoryGrid}>
            <View style={[styles.categoryCard, { backgroundColor: '#fff' }]}>
              <Ionicons name="calculator-outline" size={24} color={theme.primary} />
              <ThemedText style={styles.categoryLabel}>Engineering</ThemedText>
            </View>
            <View style={[styles.categoryCard, { backgroundColor: '#fff' }]}>
              <Ionicons name="medkit-outline" size={24} color="#10B981" />
              <ThemedText style={styles.categoryLabel}>Medicine</ThemedText>
            </View>
            <View style={[styles.categoryCard, { backgroundColor: '#fff' }]}>
              <Ionicons name="brush-outline" size={24} color="#F59E0B" />
              <ThemedText style={styles.categoryLabel}>Arts</ThemedText>
            </View>
            <View style={[styles.categoryCard, { backgroundColor: '#fff' }]}>
              <Ionicons name="business-outline" size={24} color="#6366F1" />
              <ThemedText style={styles.categoryLabel}>Business</ThemedText>
            </View>
          </View>
        </View>

        {/* Featured Section */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Recently Added</ThemedText>
          <View style={[styles.emptyState, { backgroundColor: '#fff' }]}>
            <Ionicons name="book-outline" size={48} color={theme.textSecondary + '40'} />
            <ThemedText style={[styles.emptyStateText, { color: theme.textSecondary }]}>No books found in your area yet.</ThemedText>
            <ThemedText style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>Be the first to gift a book!</ThemedText>
          </View>
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
    paddingBottom: 30,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    marginBottom: Spacing.xl,
  },
  searchText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    padding: 20,
    borderRadius: Radius.lg,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  categoryLabel: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    padding: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  footerSpace: {
    height: 40,
  },
});
