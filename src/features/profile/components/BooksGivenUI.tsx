import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ProfileStyles as styles } from '../styles';
import { useBooksGiven } from '../hooks/useBooksGiven';

export const BooksGivenUI = () => {
  const { books, loading, handleDelete, getStatusLabel, getStatusColor, t, isRTL } = useBooksGiven();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardPadding = Math.min(width * 0.04, 16);
  const textAlign = isRTL ? 'right' : 'left';
  const flexDirection = isRTL ? 'row-reverse' : 'row';

  return (
    <View style={styles.historyContainer}>
      <View style={styles.historyHeader}>
        <Text style={[styles.historyHeaderTitle, { textAlign }]}>{t('profile.history.booksGiven')}</Text>
        <TouchableOpacity
          style={[styles.viewAllButton, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}
          onPress={() => router.push('/my-shared-items')}
        >
          <Text style={styles.viewAllText}>{t('profile.history.viewAll')}</Text>
          <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={14} color="#64748B" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#001B39" />
      ) : (
        books.map((book) => {
          const isUnavailable = book.status === 'requested' || book.status === 'completed' || book.status === 'received';
          return (
            <View
              key={book.id}
              style={[styles.bookCard, { padding: cardPadding }, isUnavailable && { opacity: 0.75 }]}
            >
              <View style={{ flexDirection, alignItems: 'center', marginBottom: 12 }}>
                <View style={styles.bookImageContainer}>
                  <Image
                    source={{ uri: book.imageUrl || book.image || 'https://via.placeholder.com/150' }}
                    style={styles.bookImage}
                  />
                  {isUnavailable && (
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 10, borderRadius: 12 }]}>
                      <View style={{ backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8, transform: [{ rotate: '-10deg' }] }}>
                        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 10, textAlign: 'center' }}>
                          {book.status === 'requested' ? (isRTL ? 'قيد الطلب' : 'Requested') : (isRTL ? 'تم التسليم' : 'Given')}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                <View style={[styles.bookContentContainer, isRTL ? { marginRight: 16 } : { marginLeft: 16 }]}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(book.status) + '15', alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(book.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(book.status) }]}>
                      {getStatusLabel(book.status)}
                    </Text>
                  </View>
                  <Text style={[styles.bookTitle, { textAlign }]} numberOfLines={1}>{book.title}</Text>
                  <View style={[styles.metaRow, { flexDirection }]}>
                    <Ionicons name="school-outline" size={14} color="#6B7280" />
                    <Text style={[styles.metaText, { textAlign }]} numberOfLines={1}>
                      {book.facultyIds ? t(`faculties.${book.facultyIds[0]}`) : (book.facultyId ? t(`faculties.${book.facultyId}`) : 'General')}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.actionRow, { flexDirection }]}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => router.push({ pathname: '/(tabs)/Add_Books', params: { editId: book.id } })}
                >
                  <Ionicons name="pencil" size={16} color="#4B5563" />
                  <Text style={styles.editButtonText}>{isRTL ? 'تعديل' : 'Edit'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(book.id)}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  <Text style={styles.deleteButtonText}>{isRTL ? 'حذف' : 'Delete'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {!loading && books.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={40} color="#E2E8F0" />
          <Text style={styles.emptyText}>{isRTL ? 'لم تشارك أي مصادر بعد' : 'No materials shared yet'}</Text>
        </View>
      )}
    </View>
  );
};
