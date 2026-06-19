import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Text,
  Alert,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useI18n } from '@/hooks/use-i18n';
import { ref, get, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import RatingModal from '@/src/components/RatingModal';

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
  facultyId?: string;
  facultyIds?: string[];
  status?: string;
  imageUrl?: string;
  image?: string;
}

export default function PublicProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme: themeKey, isAccessible, colors: themeColors } = useAppTheme();
  const theme = themeColors;
  const { t, isRTL } = useI18n();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [books, setBooks] = useState<BookItem[]>([]);
  const [stats, setStats] = useState({ rating: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);
  const [ratingVisible, setRatingVisible] = useState(false);

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

    // Stats Listener
    const statsRef = ref(FIREBASE_DB, `Users/${id}/stats`);
    const unsubStats = onValue(statsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setStats({
          rating: data.rating || 0,
          totalRatings: data.totalRatings || 0
        });
      }
    });

    return () => unsubStats();
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('profile.contributorProfile')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.card, shadowColor: themeKey === 'dark' ? '#000' : '#000', elevation: themeKey === 'dark' ? 0 : 5 }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: themeKey === 'dark' ? 'rgba(245, 158, 11, 0.1)' : theme.primary + '10' }]}>
              <Ionicons name="person" size={50} color={theme.primary} />
            </View>
            <View style={[styles.verifiedBadge, { backgroundColor: themeKey === 'dark' ? theme.card : '#FFF', borderWidth: isAccessible ? 1.5 : 0, borderColor: theme.success }]}>
              <Ionicons name="checkmark-circle" size={20} color={isAccessible ? theme.success : "#10B981"} />
            </View>
          </View>

          <Text style={[styles.userName, { color: theme.text }]}>{user?.fullName || t('explore.contributor')}</Text>
          <Text style={[styles.userSub, { color: theme.textSecondary }]}>{user?.faculty ? t(`faculties.${user.faculty}`) : t('profile.card.university')}</Text>

          <View style={[styles.statsRow, { flexDirection, borderTopColor: theme.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>{books.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('profile.resources')}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>{stats.rating > 0 ? stats.rating.toFixed(1) : '0.0'}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('profile.rating')}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.rateBtn, { backgroundColor: theme.primary, borderWidth: isAccessible ? 2 : 0, borderColor: '#FFF' }]}
            onPress={() => {
              const currentUser = FIREBASE_AUTH.currentUser;
              if (!currentUser) {
                Alert.alert(t('common.error'), t('auth.errors.mustBeLoggedIn'));
                return;
              }
              if (currentUser.uid === id) {
                Alert.alert(t('common.sorry'), t('profile.cannotRateSelf'));
                return;
              }
              setRatingVisible(true);
            }}
          >
            <Ionicons name="star" size={18} color={themeKey === 'dark' ? '#0B1020' : '#FFF'} />
            <Text style={[styles.rateBtnText, { color: themeKey === 'dark' ? '#0B1020' : '#FFF', fontWeight: isAccessible ? '900' : '800' }]}>{t('profile.rateContributor')}</Text>
          </TouchableOpacity>
        </View>

        {/* Books List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign, color: theme.text }]}>
            {t('profile.availableResources')}
          </Text>
          
          {books.length === 0 ? (
            <Text style={[styles.emptyText, { textAlign, color: theme.textSecondary }]}>{t('profile.noResources')}</Text>
          ) : (
            <View style={styles.booksGrid}>
              {books.map((book) => {
                const isUnavailable = book.status === 'requested' || book.status === 'received' || book.status === 'completed';
                const statusText = book.status === 'requested' ? t('explore.status.requested') : t('explore.status.given');

                return (
                  <Pressable 
                    key={book.id} 
                    style={[styles.bookCard, { backgroundColor: theme.card, opacity: isUnavailable ? 0.7 : 1 }]}
                    onPress={() => router.push(`../book-details/${book.id}`)}
                  >
                    <View style={{ position: 'relative' }}>
                      <Image 
                        source={{ uri: book.imageUrl || book.image || 'https://via.placeholder.com/150' }} 
                        style={styles.bookImage} 
                      />
                      {isUnavailable && (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 10 }]}>
                          <View style={{ 
                            backgroundColor: book.status === 'requested' ? (isAccessible ? theme.accent : '#F59E0B') : (isAccessible ? theme.success : '#10B981'), 
                            paddingHorizontal: 12, 
                            paddingVertical: 6, 
                            borderRadius: 12, 
                            transform: [{ rotate: '-10deg' }],
                            borderWidth: isAccessible ? 1.5 : 0,
                            borderColor: '#FFF'
                          }}>
                            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>{statusText}</Text>
                          </View>
                        </View>
                      )}
                    </View>
                    <View style={styles.bookInfo}>
                      <Text style={[styles.bookTitle, { color: theme.text, fontWeight: isAccessible ? '900' : '800' }]} numberOfLines={1}>{book.title}</Text>
                      <View style={[styles.facultyBadge, { backgroundColor: themeKey === 'dark' ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7', borderWidth: isAccessible ? 1 : 0, borderColor: theme.primary }]}>
                        <Text style={[styles.facultyText, { color: theme.primary, fontWeight: isAccessible ? '900' : '800' }]}>
                          {book.facultyIds ? t(`faculties.${book.facultyIds[0]}`).toUpperCase() : (book.facultyId ? t(`faculties.${book.facultyId}`).toUpperCase() : 'GENERAL')}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <RatingModal
        visible={ratingVisible}
        onClose={() => setRatingVisible(false)}
        targetUid={id as string}
        targetName={user?.fullName || 'Contributor'}
      />
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
  userSub: { fontSize: 14, fontWeight: '600', marginBottom: 20 },
  statsRow: {
    width: '100%',
    paddingTop: 20,
    borderTopWidth: 1,
    justifyContent: 'center',
    gap: 40,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '700' },
  statDivider: { width: 1, height: 30 },
  rateBtn: {
    marginTop: 24,
    width: '100%',
    height: 48,
    borderRadius: Radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  rateBtnText: {
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
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
  emptyText: { fontSize: 14, marginTop: 10, fontStyle: 'italic' },
});
