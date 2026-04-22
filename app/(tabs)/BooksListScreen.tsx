import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getDatabase, onValue, ref } from 'firebase/database';

type BookType = {
  id: string;
  title: string;
  courseName?: string;
  facultyName?: string;
  condition?: string;
  imageUrl?: string;
  donorName?: string;
  status?: string;
};

export default function BooksListScreen() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase();
    const booksRef = ref(db, 'Books');

    const unsubscribe = onValue(
      booksRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();

          const booksArray: BookType[] = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));

          setBooks(booksArray.reverse());
        } else {
          setBooks([]);
        }

        setLoading(false);
      },
      (error) => {
        console.error('Error fetching books:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const renderBookCard = ({ item }: { item: BookType }) => {
    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: '/BookDetailsScreen',
            params: { id: item.id },
          })
        }
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{
              uri:
                item.imageUrl?.trim()
                  ? item.imageUrl
                  : 'https://via.placeholder.com/300x200?text=Book',
            }}
            style={styles.bookImage}
          />

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {item.status === 'available' ? 'AVAILABLE' : 'BOOK'}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.tagsRow}>
            <View style={styles.tagBlue}>
              <Text style={styles.tagBlueText}>
                {item.facultyName || 'Faculty'}
              </Text>
            </View>

            <View style={styles.tagGray}>
              <Text style={styles.tagGrayText}>
                {item.condition || 'Unknown'}
              </Text>
            </View>
          </View>

          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.courseName} numberOfLines={1}>
            {item.courseName || 'No course name'}
          </Text>

          <View style={styles.footerRow}>
            <View style={styles.donorRow}>
              <Ionicons name="person-outline" size={15} color="#64748B" />
              <Text style={styles.donorName} numberOfLines={1}>
                {item.donorName || 'Unknown User'}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#0A3D78" />
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#0A3D78" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Books</Text>
        <Text style={styles.headerSubTitle}>
          {books.length} {books.length === 1 ? 'book' : 'books'} found
        </Text>
      </View>

      {books.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="book-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No books yet</Text>
          <Text style={styles.emptyText}>
            Add your first book and it will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          renderItem={renderBookCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubTitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748B',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  imageWrapper: {
    position: 'relative',
  },
  bookImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB',
  },
  badge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#FACC15',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
  },
  cardContent: {
    padding: 14,
  },
  tagsRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 8,
  },
  tagBlue: {
    backgroundColor: '#DDF2FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagBlueText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#355C9B',
  },
  tagGray: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagGrayText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  courseName: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 14,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  donorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  donorName: {
    marginLeft: 6,
    fontSize: 13,
    color: '#475569',
    flexShrink: 1,
  },
  centered: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyText: {
    marginTop: 6,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});