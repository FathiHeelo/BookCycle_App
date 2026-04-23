import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Platform, 
  StatusBar, 
  Image, 
  FlatList, 
  Pressable, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { ThemedText } from '@/components/themed-text';
import { ref, onValue } from 'firebase/database';
import { FIREBASE_DB } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { useI18n } from '@/hooks/use-i18n';

interface Book {
  id: string;
  title: string;
  imageUrl: string;
  donorName: string;
  facultyId: string;
  createdAt: string;
  status: string;
  [key: string]: any;
}

export default function ExploreScreen() {
  const { theme: themeKey } = useAppTheme();
  const theme = Colors[themeKey];
  const router = useRouter();
  const { t } = useI18n();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const booksRef = ref(FIREBASE_DB, 'Books');
    
    // Listen for real-time updates
    const unsubscribe = onValue(booksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const bookList: Book[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }))
        // Filter out books without titles if needed, or show all
        .filter(book => book.status !== 'pending_details' || book.title) 
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setBooks(bookList);
      } else {
        setBooks([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Firebase error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderBookCard = ({ item }: { item: Book }) => {
    const isNew = new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 * 60 * 24 * 3; // 3 days

    return (
      <Pressable 
        style={[styles.card, { backgroundColor: theme.card }]}
        onPress={() => router.push(`../book-details/${item.id}`)}
      >
        {/* Book Image & Badges */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image' }} 
            style={styles.bookImage} 
          />
          {isNew && (
            <View style={styles.newBadge}>
              <ThemedText style={styles.newBadgeText}>NEWLY ADDED</ThemedText>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          {item.facultyId && (
            <View style={[styles.categoryBadge, { backgroundColor: '#E0F2FE' }]}>
              <ThemedText style={styles.categoryText}>
                {t(`faculties.${item.facultyId}`).toUpperCase()}
              </ThemedText>
            </View>
          )}
          
          <ThemedText style={[styles.bookTitle, { color: theme.text }]} numberOfLines={2}>
            {item.title || 'Untitled Book'}
          </ThemedText>

          {/* Donor Info */}
          <View style={styles.donorContainer}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={12} color="#64748B" />
            </View>
            <ThemedText style={styles.donorText}>
              Gifted by <ThemedText style={styles.donorName}>{item.donorName}</ThemedText>
            </ThemedText>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={themeKey === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={[styles.headerTitle, { color: theme.primary }]}>Available Gifts</ThemedText>
        <Pressable style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={books}
          renderItem={renderBookCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={64} color="#CBD5E1" />
              <ThemedText style={styles.emptyText}>No gifts available yet</ThemedText>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  card: {
    width: '48%',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  bookImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FEF08A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#854D0E',
  },
  cardContent: {
    padding: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0369A1',
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
    marginBottom: 10,
    height: 36, // Max 2 lines
  },
  donorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatarCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donorText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  donorName: {
    fontWeight: '700',
    color: '#475569',
  },
  emptyState: {
    marginTop: 100,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  }
});
