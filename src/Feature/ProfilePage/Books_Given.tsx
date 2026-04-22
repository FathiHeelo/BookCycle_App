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

interface BookItem {
  id: string;
  title: string;
  category: string;
  giverTo: string;
  timeAgo: string;
  condition: string;
  image: string;
  badgeColor: string;
}

const GIVEN_BOOKS: BookItem[] = [
  {
    id: '1',
    title: 'Organic Chemistry II',
    category: 'SCIENCE',
    giverTo: 'Sarah J.',
    timeAgo: '2 weeks ago',
    condition: 'Excellent condition',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1000',
    badgeColor: '#FDE68A', // Yellowish
  },
  {
    id: '2',
    title: 'Microeconomics',
    category: 'BUSINESS',
    giverTo: 'Omar T.',
    timeAgo: '1 month ago',
    condition: 'Minimal highlighting',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000',
    badgeColor: '#CFE2FF', // Light blue
  },
];

export default function Books_Given() {
  const { width } = useWindowDimensions();
  const { t, isRTL } = useI18n();
  const cardPadding = Math.min(width * 0.04, 16);

  const textAlign = isRTL ? 'right' : 'left';

  return (
    <View style={styles.container}>
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={[styles.headerTitle, { textAlign }]}>{t('profile.history.booksGiven')}</Text>
        <Link href="/profile" asChild>
          <Pressable>
            <Text style={[styles.viewAllText, { textAlign }]}>{t('profile.history.viewAll')}</Text>
          </Pressable>
        </Link>
      </View>

      {GIVEN_BOOKS.map((book) => (
        <View key={book.id} style={[styles.bookCard, { padding: cardPadding, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: book.image }} style={styles.bookImage} />
          </View>
          
          <View style={[styles.contentContainer, { marginLeft: isRTL ? 0 : 16, marginRight: isRTL ? 16 : 0 }]}>
            <View style={[styles.categoryBadge, { backgroundColor: book.badgeColor, alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Text style={styles.categoryText}>{book.category}</Text>
            </View>
            
            <Text style={[styles.bookTitle, { textAlign }]} numberOfLines={1}>{book.title}</Text>
            
            <Text style={[styles.subtitle, { textAlign }]}>
              {t('profile.history.givenTo')}: {book.giverTo} • {book.timeAgo}
            </Text>
            
            <View style={[styles.conditionRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Ionicons name="star" size={14} color="#85700D" />
              <Text style={[styles.conditionText, { marginLeft: isRTL ? 0 : 4, marginRight: isRTL ? 4 : 0 }]}>{book.condition}</Text>
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
});