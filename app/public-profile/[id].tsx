import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/hooks/use-i18n';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { FIREBASE_DB } from '@/firebaseConfig';
import { ThemedText } from '@/components/themed-text';

const { width } = Dimensions.get('window');

interface UserProfile {
  fullName: string;
  faculty: string;
  major: string;
  universityId: string;
}

interface BookItem {
  id: string;
  title: string;
  facultyId: string;
  imageUrl?: string;
  image?: string;
}

export default function PublicProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { t, isRTL } = useI18n();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);

  const textAlign = isRTL ? 'right' : 'left';
  const flexDirection = isRTL ? 'row-reverse' : 'row';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch User Info
        const userRef = ref(FIREBASE_DB, `Users/${id}`);
        const userSnap = await get(userRef);
        if (userSnap.exists()) {
          setUser(userSnap.val());
        }

        // Fetch User Books
        const booksRef = ref(FIREBASE_DB, 'Books');
        const userBooksQuery = query(booksRef, orderByChild('donorUid'), equalTo(id as string));
        const booksSnap = await get(userBooksQuery);
        if (booksSnap.exists()) {
          const data = booksSnap.val();
          const list = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setBooks(list);
        }
      } catch (e) {
        console.error('Error fetching public profile:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { flexDirection }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.primary} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>{isRTL ? 'ملف المساهم' : 'Contributor Profile'}</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: theme.primary + '10' }]}>
              <Ionicons name="person" size={50} color={theme.primary} />
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
          </View>

          <ThemedText style={styles.userName}>{user?.fullName || 'Academic Contributor'}</ThemedText>
          <ThemedText style={styles.userSub}>{user?.faculty ? t(`faculties.${user.faculty}`) : t('profile.card.university')}</ThemedText>

          <View style={[styles.statsRow, { flexDirection }]}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{books.length}</ThemedText>
              <ThemedText style={styles.statLabel}>{isRTL ? 'كتب' : 'Books'}</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>4.9</ThemedText>
              <ThemedText style={styles.statLabel}>{isRTL ? 'تقييم' : 'Rating'}</ThemedText>
            </View>
          </View>
        </View>

        {/* Books List */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { textAlign }]}>
            {isRTL ? 'الكتب المتوفرة' : 'Available Books'}
          </ThemedText>
          
          {books.length === 0 ? (
            <ThemedText style={[styles.emptyText, { textAlign }]}>{isRTL ? 'لا توجد كتب معروضة حالياً' : 'No books available at the moment'}</ThemedText>
          ) : (
            <View style={styles.booksGrid}>
              {books.map((book) => (
                <Pressable 
                  key={book.id} 
                  style={[styles.bookCard, { backgroundColor: theme.card }]}
                  onPress={() => router.push(`../book-details/${book.id}`)}
                >
                  <Image 
                    source={{ uri: book.imageUrl || book.image || 'https://via.placeholder.com/150' }} 
                    style={styles.bookImage} 
                  />
                  <View style={styles.bookInfo}>
                    <ThemedText style={styles.bookTitle} numberOfLines={1}>{book.title}</ThemedText>
                    <View style={[styles.facultyBadge, { backgroundColor: theme.primary + '10' }]}>
                      <ThemedText style={[styles.facultyText, { color: theme.primary }]}>
                        {book.facultyId ? t(`faculties.${book.facultyId}`).toUpperCase() : 'GENERAL'}
                      </ThemedText>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 4 },
  scrollContent: { padding: 20 },
  profileCard: {
    padding: 30,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  userName: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  userSub: { fontSize: 14, color: '#64748B', fontWeight: '600', marginBottom: 20 },
  statsRow: {
    width: '100%',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    justifyContent: 'center',
    gap: 40,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '700' },
  statDivider: { width: 1, height: 30, backgroundColor: '#E2E8F0' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16 },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  bookCard: {
    width: (width - 56) / 2,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  bookImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  bookInfo: { padding: 12 },
  bookTitle: { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  facultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  facultyText: { fontSize: 9, fontWeight: '800' },
  emptyText: { fontSize: 14, color: '#94A3B8', marginTop: 10, fontStyle: 'italic' },
});
