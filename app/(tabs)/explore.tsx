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
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { ThemedText } from '@/components/themed-text';
import { ref, onValue } from 'firebase/database';
import { FIREBASE_DB } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { useI18n } from '@/hooks/use-i18n';

interface Resource {
  id: string;
  title: string;
  imageUrl: string;
  image?: string;
  donorName: string;
  facultyId?: string;
  facultyIds?: string[];
  createdAt: string;
  status: string;
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
      if (data) {
        const list: Resource[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }))
        .filter(item => item.status === 'active' || item.title) 
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setResources(list);
      } else {
        setResources([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Firebase error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderResourceCard = ({ item }: { item: Resource }) => {
    const isNew = new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 * 60 * 24 * 3;
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
                <ThemedText style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>{statusText}</ThemedText>
              </View>
            </View>
          )}
          {isNew && !isUnavailable && (
            <View style={styles.newBadge}>
              <ThemedText style={styles.newBadgeText}>{isRTL ? 'جديد' : 'NEW'}</ThemedText>
            </View>
          )}
        </View>

        <View style={[styles.cardContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          {facultyId && (
            <View style={[styles.categoryBadge, { backgroundColor: '#E0F2FE' }]}>
              <ThemedText style={styles.categoryText}>
                {t(`faculties.${facultyId}`).toUpperCase()}
              </ThemedText>
            </View>
          )}
          
          <ThemedText style={[styles.resourceTitle, { color: theme.text, textAlign }]} numberOfLines={2}>
            {item.title || (isRTL ? 'مادة بدون عنوان' : 'Untitled Material')}
          </ThemedText>

          <View style={[styles.donorContainer, { flexDirection }]}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={10} color="#64748B" />
            </View>
            <ThemedText style={styles.donorText}>
              {t('profile.history.donor')}: <ThemedText style={styles.donorName}>{item.donorName}</ThemedText>
            </ThemedText>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={themeKey === 'dark' ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { flexDirection }]}>
        <ThemedText style={[styles.headerTitle, { color: theme.primary }]}>{isRTL ? 'المواد المتاحة' : 'Available Materials'}</ThemedText>
        <Pressable style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color={theme.textSecondary} />
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
              <Ionicons name="library-outline" size={64} color="#CBD5E1" />
              <ThemedText style={styles.emptyText}>{isRTL ? 'لا توجد مواد متاحة حالياً' : 'No materials available yet'}</ThemedText>
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
