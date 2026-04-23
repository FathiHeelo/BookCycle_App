import React, { useState, useEffect } from 'react';
import { Link, useRouter } from 'expo-router';
import {
  StyleSheet,
  Text,
  View,
  Image,
  useWindowDimensions,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/hooks/use-i18n';
import { ref, onValue, query, orderByChild, equalTo, remove } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';

interface BookItem {
  id: string;
  title: string;
  facultyId?: string;
  facultyIds?: string[];
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
  const router = useRouter();
  const currentUser = FIREBASE_AUTH.currentUser;

  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);

  const cardPadding = Math.min(width * 0.04, 16);
  const textAlign = isRTL ? 'right' : 'left';
  const flexDirection = isRTL ? 'row-reverse' : 'row';

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
        setBooks(list.slice(0, 3));
      } else {
        setBooks([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleDelete = (bookId: string) => {
    Alert.alert(
      isRTL ? 'حذف المصدر' : 'Delete Resource',
      isRTL ? 'هل أنت متأكد من حذف هذا المصدر نهائياً؟' : 'Are you sure you want to delete this resource permanently?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: isRTL ? 'حذف' : 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(ref(FIREBASE_DB, `Books/${bookId}`));
              Alert.alert(t('common.success'), isRTL ? 'تم الحذف بنجاح' : 'Deleted successfully');
            } catch (e) {
              Alert.alert(t('common.error'), 'Failed to delete');
            }
          }
        }
      ]
    );
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'requested':
        return isRTL ? 'تم الطلب منك' : 'Request received';
      case 'received':
      case 'completed':
        return isRTL ? 'تم التسليم' : 'Given away';
      default:
        return isRTL ? 'نشط (متوفر)' : 'Active (Available)';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return '#F59E0B';
      case 'received':
      case 'completed': return '#10B981';
      default: return '#3B82F6';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { textAlign }]}>{t('profile.history.booksGiven')}</Text>
        <TouchableOpacity 
          style={[styles.viewAllButton, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}
          onPress={() => router.push('/my-shared-items')}
        >
          <Text style={styles.viewAllText}>{t('profile.history.viewAll')}</Text>
          <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={14} color="#64748B" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#001B39" />
      ) : (
        books.map((book) => (
          <View 
            key={book.id} 
            style={[
              styles.bookCard, 
              { padding: cardPadding },
              (book.status === 'requested' || book.status === 'completed' || book.status === 'received') && { opacity: 0.75 }
            ]}
          >
            <View style={{ flexDirection, alignItems: 'center', marginBottom: 12 }}>
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: book.imageUrl || book.image || 'https://via.placeholder.com/150' }} 
                  style={styles.bookImage} 
                />
                {(book.status === 'requested' || book.status === 'completed' || book.status === 'received') && (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 10, borderRadius: 12 }]}>
                    <View style={{ backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8, transform: [{ rotate: '-10deg' }] }}>
                      <Text style={{ color: '#fff', fontWeight: '900', fontSize: 10, textAlign: 'center' }}>
                        {book.status === 'requested' ? (isRTL ? 'قيد الطلب' : 'Requested') : (isRTL ? 'تم التسليم' : 'Given')}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              
              <View style={[styles.contentContainer, isRTL ? { marginRight: 16 } : { marginLeft: 16 }]}>
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
        ))
      )}
      
      {!loading && books.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={40} color="#E2E8F0" />
          <Text style={styles.emptyText}>{isRTL ? 'لم تشارك أي مصادر بعد' : 'No materials shared yet'}</Text>
        </View>
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
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#001B39',
    marginBottom: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  bookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    width: 70,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  bookImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#001B39',
    marginBottom: 4,
  },
  metaRow: {
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  actionRow: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 10,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#F3F4F6',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#94A3B8',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  }
});