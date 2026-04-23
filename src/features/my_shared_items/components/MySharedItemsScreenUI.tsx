import React from 'react';
import {
  StyleSheet, Text, View, FlatList, Image,
  TouchableOpacity, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { CustomHeader } from '@/src/components/shared/CustomHeader';
import { useMySharedItems, SharedBookItem } from '../hooks/useMySharedItems';

export const MySharedItemsScreenUI = () => {
  const { books, loading, handleDelete, getStatusLabel, getStatusColor, t, isRTL } = useMySharedItems();
  const router = useRouter();
  const { theme: themeKey } = useAppTheme();
  const theme = Colors[themeKey];
  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  const renderItem = ({ item }: { item: SharedBookItem }) => {
    const isUnavailable = item.status === 'requested' || item.status === 'received' || item.status === 'completed';
    const overlayText = item.status === 'requested' ? (isRTL ? 'قيد الطلب' : 'Requested') : (isRTL ? 'تم التسليم' : 'Given');

    return (
      <View style={[styles.bookCard, { opacity: isUnavailable ? 0.75 : 1 }]}>
        <View style={{ flexDirection, alignItems: 'center', padding: 16 }}>
          <View style={{ position: 'relative' }}>
            <Image source={{ uri: item.imageUrl || item.image || 'https://via.placeholder.com/150' }} style={styles.bookImage} />
            {isUnavailable && (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 10, borderRadius: 12 }]}>
                <View style={{ backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8, transform: [{ rotate: '-10deg' }] }}>
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 10, textAlign: 'center' }}>{overlayText}</Text>
                </View>
              </View>
            )}
          </View>
          <View style={[styles.contentContainer, isRTL ? { marginRight: 16 } : { marginLeft: 16 }]}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15', alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusLabel(item.status)}</Text>
            </View>
            <Text style={[styles.bookTitle, { textAlign }]} numberOfLines={2}>{item.title}</Text>
            <Text style={[styles.dateText, { textAlign }]}>
              {new Date(item.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
            </Text>
          </View>
        </View>

        <View style={[styles.actionRow, { flexDirection }]}>
          <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => router.push({ pathname: '/(tabs)/Add_Books', params: { editId: item.id } })}>
            <Ionicons name="pencil" size={18} color="#4B5563" />
            <Text style={styles.editButtonText}>{isRTL ? 'تعديل' : 'Edit'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <Text style={styles.deleteButtonText}>{isRTL ? 'حذف' : 'Delete'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader 
        title={isRTL ? 'مصادري المشتركة' : 'My Shared Materials'}
        leftMode="back"
        hideSafeArea
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#001B39" />
        </View>
      ) : (
        <FlatList
          data={books}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={64} color="#E2E8F0" />
              <Text style={styles.emptyText}>{isRTL ? 'لا يوجد مصادر حالياً' : 'No materials found'}</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#001B39' },
  backButton: { padding: 8 },
  listContent: { padding: 16, paddingBottom: 120 },
  bookCard: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, overflow: 'hidden' },
  bookImage: { width: 80, height: 100, borderRadius: 12, backgroundColor: '#F1F5F9' },
  contentContainer: { flex: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 8, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  bookTitle: { fontSize: 16, fontWeight: '800', color: '#001B39', marginBottom: 4 },
  dateText: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  actionRow: { borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FAFBFC' },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, gap: 8 },
  editButton: { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: '#E2E8F0' },
  deleteButton: {},
  editButtonText: { fontSize: 14, fontWeight: '700', color: '#4B5563' },
  deleteButtonText: { fontSize: 14, fontWeight: '700', color: '#EF4444' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100, gap: 16 },
  emptyText: { fontSize: 16, color: '#94A3B8', fontWeight: '600' },
});
