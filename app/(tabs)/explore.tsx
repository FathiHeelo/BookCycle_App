import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Platform, 
  StatusBar, 
  Image, 
  FlatList, 
  Pressable, 
  ActivityIndicator,
  Text 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { ref, onValue } from 'firebase/database';
import { FIREBASE_DB } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { useI18n } from '@/hooks/use-i18n';

import { MOCK_SOURCES } from '@/src/constants/mockData';

interface Resource {
  id: string;
  title: string;
  titleAr?: string;
  imageUrl?: string;
  image?: string;
  donorName?: string;
  facultyId?: string;
  facultyIds?: string[];
  createdAt?: string;
  status?: string;
  [key: string]: any;
}

export default function ExploreScreen() {
  const { theme: themeKey } = useAppTheme();
  const theme = Colors[themeKey];
  const router = useRouter();
  const { t, isRTL } = useI18n();

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  useEffect(() => {
    const resourcesRef = ref(FIREBASE_DB, 'Books');
    
    const unsubscribe = onValue(resourcesRef, (snapshot) => {
      const data = snapshot.val();
      let firebaseList: Resource[] = [];
      
      if (data) {
        firebaseList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
      }

      // Merge with MOCK_SOURCES
      const combinedList: Resource[] = [...firebaseList, ...MOCK_SOURCES]
        .filter(item => (item.title || item.titleAr) && (item.imageUrl || item.image))
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        
      setResources(combinedList);
      setLoading(false);
    }, (error) => {
      console.error('Firebase error:', error);
      // Even on error, show mock data
      setResources(MOCK_SOURCES as Resource[]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const renderResourceCard = ({ item }: { item: Resource }) => {
    const isNew = item.createdAt 
      ? (new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 * 60 * 24 * 3)
      : false;
    const facultyId = item.facultyIds?.[0] || item.facultyId;
    const isUnavailable = item.status === 'requested' || item.status === 'received' || item.status === 'completed';
    const statusText = item.status === 'requested' ? (isRTL ? 'قيد الطلب' : 'Requested') : (isRTL ? 'تم التسليم' : 'Given');

    return (
      <Pressable 
        style={[styles.card, { backgroundColor: theme.card, opacity: isUnavailable ? 0.75 : 1 }]}
        onPress={() => router.push(`../book-details/${item.id}`)}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.imageUrl || item.image || 'https://via.placeholder.com/300x400?text=No+Image' }} 
            style={styles.resourceImage} 
          />
          {isUnavailable && (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 10 }]}>
              <View style={{ backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, transform: [{ rotate: '-10deg' }] }}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>{statusText}</Text>
              </View>
            </View>
          )}
          {isNew && !isUnavailable && (
            <View style={[styles.newBadge, { backgroundColor: theme.primary }]}>
              <Text style={[styles.newBadgeText, { color: themeKey === 'dark' ? '#0B1020' : '#FFF' }]}>{isRTL ? 'جديد' : 'NEW'}</Text>
            </View>
          )}
        </View>

        <View style={[styles.cardContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          {facultyId && (
            <View style={[styles.categoryBadge, { backgroundColor: themeKey === 'dark' ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7' }]}>
              <Text style={[styles.categoryText, { color: theme.primary }]}>
                {t(`faculties.${facultyId}`).toUpperCase()}
              </Text>
            </View>
          )}
          
          <Text style={[styles.resourceTitle, { color: theme.text, textAlign }]} numberOfLines={2}>
            {isRTL ? (item.titleAr || item.title) : item.title || (isRTL ? 'مادة بدون عنوان' : 'Untitled Material')}
          </Text>

          <View style={[styles.donorContainer, { flexDirection }]}>
            <View style={[styles.avatarCircle, { backgroundColor: themeKey === 'dark' ? theme.background : '#E2E8F0' }]}>
              <Ionicons name="person" size={10} color={theme.textSecondary} />
            </View>
            <Text style={[styles.donorText, { color: theme.textSecondary }]}>
              {t('profile.history.donor')}: <Text style={[styles.donorName, { color: theme.primary }]}>{item.donorName || (isRTL ? 'مساهم أكاديمي' : 'Academic Contributor')}</Text>
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={themeKey === 'dark' ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { flexDirection }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{isRTL ? 'المواد المتاحة' : 'Available Materials'}</Text>
        <Pressable style={[styles.filterButton, { backgroundColor: theme.card }]}>
          <Ionicons name="options-outline" size={20} color={theme.primary} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={resources}
          renderItem={renderResourceCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={[styles.columnWrapper, { flexDirection }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="library-outline" size={64} color={theme.border} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{isRTL ? 'لا توجد مواد متاحة حالياً' : 'No materials available yet'}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.md,
  },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: Spacing.md, paddingBottom: 100 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: Spacing.lg },
  card: {
    width: '48%',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  imageContainer: { width: '100%', height: 180, position: 'relative' },
  resourceImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FEF08A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newBadgeText: { fontSize: 9, fontWeight: '900', color: '#854D0E' },
  cardContent: { padding: 12 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 8 },
  categoryText: { fontSize: 10, fontWeight: '800', color: '#0369A1' },
  resourceTitle: { fontSize: 14, fontWeight: '800', lineHeight: 18, marginBottom: 8, height: 36 },
  donorContainer: { alignItems: 'center', gap: 6 },
  avatarCircle: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  donorText: { fontSize: 10, color: '#64748B', fontWeight: '500' },
  donorName: { fontWeight: '700', color: '#475569' },
  emptyState: { marginTop: 100, alignItems: 'center', gap: 16 },
  emptyText: { fontSize: 16, color: '#94A3B8', fontWeight: '600' },
});
