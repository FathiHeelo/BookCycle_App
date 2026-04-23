import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ref, get } from 'firebase/database';
import { FIREBASE_DB } from '@/firebaseConfig';
import { useI18n } from '@/hooks/use-i18n';

interface Book {
  title: string;
  courseName: string;
  facultyId: string;
  major: string;
  conditionId: string;
  description: string;
  pages: string;
  price: string;
  imageUrl?: string;
  image?: string;
  donorName: string;
  [key: string]: any;
}

export default function BookDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { t } = useI18n();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const bookImageUri = book?.imageUrl || book?.image;
  const bookAuthor = book?.author || book?.donorName || '';
  const bookCondition = book?.conditionId ? t(`conditions.${book.conditionId}`) : book?.condition || '';
  const bookFaculty = book?.facultyId ? t(`faculties.${book.facultyId}`) : book?.faculty || '';
  const bookEdition = book?.edition || '';
  const bookCourse = book?.courseName || '';
  const bookDescription = book?.description || t('bookDetails.noDescription');
  const bookPrice = book?.price || t('bookDetails.free');
  const bookDonor = book?.donorName || '';

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        setError('No book ID provided');
        setLoading(false);
        return;
      }

      try {
        const bookRef = ref(FIREBASE_DB, `Books/${id}`);
        const snapshot = await get(bookRef);
        
        if (snapshot.exists()) {
          setBook(snapshot.val() as Book);
        } else {
          setError('Book not found');
        }
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Failed to load book details');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  if (error || !book) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.error, fontSize: 16, fontWeight: '600' }}>{error || 'Book not found'}</Text>
        <Pressable style={[styles.actionButton, { backgroundColor: theme.primary, width: 200 }]} onPress={() => router.back()}>
          <Text style={styles.actionText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}> 
      <View style={[styles.header, { backgroundColor: theme.background }]}> 
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>{t('bookDetails.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {bookImageUri ? (
          <Pressable style={styles.imageWrapper} onPress={() => setDetailsVisible(true)}>
            <Image source={{ uri: bookImageUri }} style={styles.bookImage} />
            {!detailsVisible && (
              <View style={styles.imageOverlay}>
                <Text style={styles.imageOverlayText}>{t('bookDetails.tapToView', { defaultValue: 'Tap the image to show book details' })}</Text>
              </View>
            )}
          </Pressable>
        ) : null}

        {detailsVisible ? (
          <View style={[styles.card, { backgroundColor: theme.card }]}> 
            <Text style={[styles.bookTitle, { color: theme.primary }]}>{book.title || 'Untitled Book'}</Text>
            <Text style={[styles.bookSubtitle, { color: theme.textSecondary }]}>{bookAuthor ? `${t('bookDetails.by')} ${bookAuthor}` : ''}</Text>
            <View style={styles.badgeRow}>
              {bookCourse ? <View style={[styles.badge, { backgroundColor: theme.primary + '15' }]}><Text style={[styles.badgeText, { color: theme.primary }]}>{bookCourse}</Text></View> : null}
              {bookFaculty ? <View style={[styles.badge, { backgroundColor: theme.primary + '15' }]}><Text style={[styles.badgeText, { color: theme.primary }]}>{bookFaculty}</Text></View> : null}
            </View>
            <View style={styles.metaContainer}>
              <MetaItem label={t('auth.signup.courseNameLabel', { defaultValue: 'Course' })} value={bookCourse} theme={theme} />
              <MetaItem label={t('auth.signup.facultyLabel')} value={bookFaculty} theme={theme} />
              {bookEdition ? <MetaItem label={t('bookDetails.edition', { defaultValue: 'Edition' })} value={bookEdition} theme={theme} /> : null}
              <MetaItem label={t('auth.signup.majorLabel')} value={book.major} theme={theme} />
              <MetaItem label={t('bookDetails.condition')} value={bookCondition} theme={theme} />
              <MetaItem label={t('bookDetails.pages')} value={book.pages} theme={theme} />
              <MetaItem label={t('bookDetails.donor')} value={bookDonor} theme={theme} />
            </View>

          <View style={styles.divider} />
          
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>{t('bookDetails.description')}</Text>
          <Text style={[styles.description, { color: theme.text }]}>
            {bookDescription}
          </Text>
          
          <View style={[styles.priceTag, { backgroundColor: theme.primary }]}> 
            <Text style={styles.priceText}>{bookPrice}</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.promptCard, { backgroundColor: theme.card }]}> 
          <Text style={[styles.promptTitle, { color: theme.primary }]}>{t('bookDetails.tapImageToReveal', { defaultValue: 'Tap the book image to reveal the details.' })}</Text>
        </View>
      )}

        <Pressable style={[styles.actionButton, { backgroundColor: theme.primary }]} onPress={() => router.replace('/')}>
          <Text style={styles.actionText}>Go Home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaItem({ label, value, theme }: { label: string; value?: string; theme: any }) {
  if (!value) return null;
  return (
    <Text style={[styles.bookMeta, { color: theme.textSecondary }]}>
      <Text style={{ fontWeight: '800' }}>{label}:</Text> {value}
    </Text>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  bookImage: {
    width: '100%',
    height: 250,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
    resizeMode: 'cover',
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: Spacing.md,
  },
  bookSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  badge: {
    borderRadius: Radius.md,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  promptCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  promptTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    padding: Spacing.md,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
  },
  imageOverlayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  metaContainer: {
    marginBottom: Spacing.sm,
  },
  bookMeta: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  priceTag: {
    alignSelf: 'flex-start',
    borderRadius: Radius.md,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  priceText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  actionButton: {
    marginTop: Spacing.xl,
    height: 56,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});
