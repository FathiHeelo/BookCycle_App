import React from 'react';
import { Link } from 'expo-router';
import {
  StyleSheet,
  Text,
  View,
  Image,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useI18n } from '@/hooks/use-i18n';

interface ReceivedBookItem {
  id: string;
  title: string;
  donor: string;
  image: string;
  receivedDate: string;
}

const RECEIVED_BOOKS: ReceivedBookItem[] = [
  {
    id: '1',
    title: 'Intro to Psychology',
    donor: 'Prof. Khalid',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000',
    receivedDate: 'Dec 10',
  },
  {
    id: '2',
    title: 'Linear Algebra',
    donor: 'Engineering Dept',
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000',
    receivedDate: 'Nov 25',
  },
];

export default function Books_Received() {
  const { width } = useWindowDimensions();
  const { t, isRTL } = useI18n();
  const cardPadding = Math.min(width * 0.04, 16);

  const textAlign = isRTL ? 'right' : 'left';

  return (
    <View style={styles.container}>
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={[styles.headerTitle, { textAlign }]}>{t('profile.history.booksReceived')}</Text>
        <Link href="/profile" asChild>
          <Pressable>
            <Text style={[styles.viewHistoryText, { textAlign }]}>{t('profile.history.viewHistory')}</Text>
          </Pressable>
        </Link>
      </View>

      {RECEIVED_BOOKS.map((book) => (
        <View key={book.id} style={[styles.bookCard, { padding: cardPadding, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: book.image }} style={styles.bookImage} />
          </View>
          
          <View style={[styles.contentContainer, { marginLeft: isRTL ? 0 : 16, marginRight: isRTL ? 16 : 0 }]}>
            <View style={[styles.titleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.bookTitle, { textAlign }]} numberOfLines={1}>{book.title}</Text>
              <Pressable style={styles.moreBtn}>
                <Ionicons name="ellipsis-vertical" size={20} color="#001B39" />
              </Pressable>
            </View>
            
            <Text style={[styles.donorText, { textAlign }]}>{t('profile.history.donor')}: {book.donor}</Text>
            
            <View style={[styles.statusBadge, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Text style={styles.statusText}>{t('profile.history.received')}: {book.receivedDate}</Text>
            </View>
          </View>
        </View>
      ))}
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
  viewHistoryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#001B39',
  },
  bookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: 80,
    height: 100,
    borderRadius: 12,
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#001B39',
    flex: 1,
  },
  moreBtn: {
    padding: 4,
  },
  donorText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#001B39',
  },
});
