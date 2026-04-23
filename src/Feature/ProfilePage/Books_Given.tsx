import React, { useState, useEffect } from 'react';
import { Link } from 'expo-router';
import {
  StyleSheet,
  Text,
  View,
  Image,
  useWindowDimensions,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/hooks/use-i18n';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';

interface BookItem {
  id: string;
  title: string;
  facultyId: string;
  donorName: string;
  createdAt: string;
  conditionId: string;
  imageUrl?: string;
  image?: string;
  status: string;
}

export default function Books_Given() {
  const { width } = useWindowDimensions();
  const { t, isRTL } = useI18n();
  const currentUser = FIREBASE_AUTH.currentUser;

  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);

  const cardPadding = Math.min(width * 0.04, 16);
  const textAlign = isRTL ? 'right' : 'left';

  useEffect(() => {
    if (!currentUser) return;

    const booksRef = ref(FIREBASE_DB, 'Books');
    const userBooksQuery = query(booksRef, orderByChild('donorUid'), equalTo(currentUser.uid));

    const unsubscribe = onValue(userBooksQuery, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list: BookItem[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBooks(list.slice(0, 3)); // Show top 3
      } else {
        setBooks([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={[styles.headerTitle, { textAlign }]}>{t('profile.history.booksGiven')}</Text>
        <Link href="/my-requests" asChild>
          <Pressable>
            <Text style={[styles.viewAllText, { textAlign }]}>{t('profile.history.viewAll')}</Text>
          </Pressable>
        </Link>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#001B39" />
      ) : (
        books.map((book) => (
          <View key={book.id} style={[styles.bookCard, { padding: cardPadding, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: book.imageUrl || book.image || 'https://via.placeholder.com/150' }} 
                style={styles.bookImage} 
              />
            </View>
            
            <View style={[styles.contentContainer, { marginLeft: isRTL ? 0 : 16, marginRight: isRTL ? 16 : 0 }]}>
              <View style={[styles.categoryBadge, { backgroundColor: '#FDE68A', alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={styles.categoryText}>
                  {book.facultyId ? t(`faculties.${book.facultyId}`).toUpperCase() : 'GENERAL'}
                </Text>
              </View>
              
              <Text style={[styles.bookTitle, { textAlign }]} numberOfLines={1}>{book.title}</Text>
              
              <Text style={[styles.subtitle, { textAlign }]}>
                {t('profile.history.status')}: {book.status}
              </Text>
              
              <View style={[styles.conditionRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Ionicons name="star" size={14} color="#85700D" />
                <Text style={[styles.conditionText, { marginLeft: isRTL ? 0 : 4, marginRight: isRTL ? 4 : 0 }]}>
                  {book.conditionId ? t(`conditions.${book.conditionId}`) : 'Good'}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
      
      {!loading && books.length === 0 && (
        <Text style={[styles.emptyText, { textAlign }]}>No books given yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#001B39',
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#001B39',
  },
  bookCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  imageContainer: {
    width: 90,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  bookImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#001B39',
    letterSpacing: 0.5,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#001B39',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '500',
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  conditionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#001B39',
  },
  emptyText: {
    color: '#94A3B8',
    marginTop: 10,
    fontStyle: 'italic',
  }
});