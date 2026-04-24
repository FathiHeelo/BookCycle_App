import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ProfileStyles as styles } from '../styles';
import { useBooksGiven } from '../hooks/useBooksGiven';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

export const BooksGivenUI = () => {
  const { books, loading, handleDelete, getStatusLabel, getStatusColor, t, isRTL } = useBooksGiven();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { theme: themeKey } = useAppTheme();
  const themeColors = Colors[themeKey];
  const cardPadding = Math.min(width * 0.04, 16);
  const textAlign = isRTL ? 'right' : 'left';
  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const isDark = themeKey === 'dark';

  return (
    <View style={styles.historyContainer}>
      <View style={styles.historyHeader}>
        <Text style={[styles.historyHeaderTitle, { textAlign, color: themeColors.text }]}>{t('profile.history.booksGiven')}</Text>
        <TouchableOpacity
          style={[styles.viewAllButton, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}
          onPress={() => router.push('/my-shared-items')}
        >
          <Text style={[styles.viewAllText, { color: themeColors.textSecondary }]}>{t('profile.history.viewAll')}</Text>
          <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={14} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={themeColors.primary} />
      ) : (
        books.map((book) => {
          const isUnavailable = book.status === 'requested' || book.status === 'completed' || book.status === 'received';
          return (
            <View
              key={book.id}
              style={[styles.bookCard, { padding: cardPadding, backgroundColor: themeColors.card, shadowColor: isDark ? '#000' : '#000', elevation: isDark ? 0 : 2 }, isUnavailable && { opacity: 0.75 }]}
            >
              <View style={{ flexDirection, alignItems: 'center', marginBottom: 12 }}>
                <View style={[styles.bookImageContainer, { backgroundColor: isDark ? themeColors.background : '#F3F4F6' }]}>
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
                  <Text style={[styles.bookTitle, { textAlign, color: themeColors.text }]} numberOfLines={1}>{book.title}</Text>
                  <View style={[styles.metaRow, { flexDirection }]}>
                    <Ionicons name="school-outline" size={14} color={themeColors.textSecondary} />
                    <Text style={[styles.metaText, { textAlign, color: themeColors.textSecondary }]} numberOfLines={1}>
                      {book.facultyIds ? t(`faculties.${book.facultyIds[0]}`) : (book.facultyId ? t(`faculties.${book.facultyId}`) : 'General')}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.actionRow, { flexDirection, borderTopColor: themeColors.border }]}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton, { backgroundColor: isDark ? themeColors.background : '#F3F4F6' }]}
                  onPress={() => router.push({ pathname: '/(tabs)/Add_Books', params: { editId: book.id } })}
                >
                  <Ionicons name="pencil" size={16} color={themeColors.textSecondary} />
                  <Text style={[styles.editButtonText, { color: themeColors.textSecondary }]}>{isRTL ? 'تعديل' : 'Edit'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton, { backgroundColor: themeColors.error + '15' }]}
                  onPress={() => handleDelete(book.id)}
                >
                  <Ionicons name="trash-outline" size={16} color={themeColors.error} />
                  <Text style={[styles.deleteButtonText, { color: themeColors.error }]}>{isRTL ? 'حذف' : 'Delete'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {!loading && books.length === 0 && (
        <View style={[styles.emptyContainer, { backgroundColor: isDark ? themeColors.background : '#F9FAFB', borderColor: themeColors.border }]}>
          <Ionicons name="book-outline" size={40} color={themeColors.textSecondary} />
          <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>{isRTL ? 'لم تشارك أي مصادر بعد' : 'No materials shared yet'}</Text>
        </View>
      )}
    </View>
  );
};
