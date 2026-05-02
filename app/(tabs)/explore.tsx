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
  Text,
  Modal,
  TextInput,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'latest' | 'all'>('latest');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = React.useRef<TextInput>(null);

  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  // Load Preferences
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const savedFaculties = await AsyncStorage.getItem('explore_faculties');
        const savedSort = await AsyncStorage.getItem('explore_sort_v2');
        if (savedFaculties) setSelectedFaculties(JSON.parse(savedFaculties));
        if (savedSort) setSortBy(savedSort as 'latest' | 'all');
      } catch (e) {
        console.error('Error loading preferences:', e);
      }
    };
    loadPrefs();
  }, []);

  // Save Preferences
  const savePreferences = async (faculties: string[], sort: 'latest' | 'all') => {
    try {
      await AsyncStorage.setItem('explore_faculties', JSON.stringify(faculties));
      await AsyncStorage.setItem('explore_sort_v2', sort);
    } catch (e) {
      console.error('Error saving preferences:', e);
    }
  };

  const toggleFaculty = (facultyId: string) => {
    const newSelection = selectedFaculties.includes(facultyId)
      ? selectedFaculties.filter(id => id !== facultyId)
      : [...selectedFaculties, facultyId];
    setSelectedFaculties(newSelection);
    savePreferences(newSelection, sortBy);
  };

  const handleSortChange = (sort: 'latest' | 'all') => {
    setSortBy(sort);
    savePreferences(selectedFaculties, sort);
  };

  const clearFilters = () => {
    setSelectedFaculties([]);
    setSortBy('all');
    savePreferences([], 'all');
  };

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

  const filteredResources = React.useMemo(() => {
    let list = [...resources];

    // Filter by Faculty
    if (selectedFaculties.length > 0) {
      list = list.filter(item => {
        const itemFaculty = item.facultyIds?.[0] || item.facultyId;
        return itemFaculty && selectedFaculties.includes(itemFaculty);
      });
    }

    // Filter by Search Query
    if (searchQuery) {
      list = list.filter(item => {
        const title = isRTL ? (item.titleAr || item.title) : (item.title || '');
        return title.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Sort
    if (sortBy === 'latest') {
      list.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    return list;
  }, [resources, selectedFaculties, sortBy]);

  const faculties = [
    { id: 'med', icon: 'medical' },
    { id: 'eng', icon: 'construct' },
    { id: 'it', icon: 'code-working' },
    { id: 'bus', icon: 'business' },
    { id: 'sci', icon: 'flask' },
    { id: 'law', icon: 'briefcase' },
    { id: 'art', icon: 'color-palette' },
    { id: 'hum', icon: 'book' },
    { id: 'pha', icon: 'bandage' },
    { id: 'nur', icon: 'heart' },
    { id: 'den', icon: 'happy' },
    { id: 'vet', icon: 'paw' },
    { id: 'sha', icon: 'ribbon' },
  ];


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
            {isRTL ? (item.titleAr || item.title) : item.title || (isRTL ? 'مصدر بدون عنوان' : 'Untitled Resource')}
          </Text>

          {/* Price & Donor Info Row */}
          <View style={[styles.donorContainer, { flexDirection, justifyContent: 'space-between', width: '100%', marginTop: 8 }]}>
            <View style={{ flexDirection, alignItems: 'center', gap: 6, flex: 1 }}>
              <View style={[styles.avatarCircle, { backgroundColor: themeKey === 'dark' ? theme.background : '#E2E8F0' }]}>
                <Ionicons name="person" size={10} color={theme.textSecondary} />
              </View>
              <Text style={[styles.donorText, { color: theme.textSecondary }]} numberOfLines={1}>
                {item.donorName || (isRTL ? 'مساهم أكاديمي' : 'Academic Contributor')}
              </Text>
            </View>
            
            {item.price && !isUnavailable && (
              <View style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: 'rgba(16, 185, 129, 0.3)',
              }}>
                <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '800' }}>₪{item.price}</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={themeKey === 'dark' ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <View style={[styles.headerTop, { flexDirection }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: theme.text, textAlign }]}>{isRTL ? 'منصة المصادر' : 'Resource Hub'}</Text>
            <Text style={[styles.headerSubtitle, { color: theme.primary, textAlign }]}>{isRTL ? 'الأكاديمية المفتوحة' : 'Open Academic'}</Text>
          </View>
          <View style={[styles.headerActions, { flexDirection }]}>
            <Pressable 
              style={[styles.headerIconBtn, { backgroundColor: theme.card }]}
              onPress={() => searchInputRef.current?.focus()}
            >
              <Ionicons name="search-outline" size={20} color={theme.primary} />
            </Pressable>
            <Pressable 
              style={[styles.headerIconBtn, { backgroundColor: theme.card }]}
              onPress={() => setIsFilterModalVisible(true)}
            >
              <Ionicons name="options-outline" size={20} color={theme.primary} />
              {selectedFaculties.length > 0 && <View style={styles.filterBadge} />}
            </Pressable>
          </View>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: themeKey === 'dark' ? theme.card : '#F1F5F9', flexDirection }]}>
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput 
            ref={searchInputRef}
            style={[styles.searchInput, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}
            placeholder={isRTL ? 'عن أي مصدر أكاديمي تبحث؟' : 'What resource are you looking for?'}
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {selectedFaculties.length > 0 && (
          <View style={styles.activeFiltersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.activeFiltersList, { flexDirection }]}>
              {selectedFaculties.map(fid => (
                <Pressable 
                  key={fid} 
                  style={[styles.filterChip, { backgroundColor: theme.primary + '15' }]}
                  onPress={() => toggleFaculty(fid)}
                >
                  <Text style={[styles.filterChipText, { color: theme.primary }]}>{t(`faculties.${fid}`)}</Text>
                  <Ionicons name="close-circle" size={14} color={theme.primary} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredResources}
          renderItem={renderResourceCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={[styles.columnWrapper, { flexDirection }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={theme.border} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{isRTL ? 'لم نجد أي مصادر تطابق بحثك' : 'No resources match your search'}</Text>
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsFilterModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalHeader, { flexDirection }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{isRTL ? 'تصفية النتائج' : 'Filter Results'}</Text>
              <Pressable onPress={clearFilters}>
                <Text style={{ color: theme.primary, fontWeight: '700' }}>{isRTL ? 'مسح الكل' : 'Clear All'}</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Time Filter */}
              <Text style={[styles.filterSectionTitle, { color: theme.text, textAlign }]}>{isRTL ? 'الوقت' : 'Time'}</Text>
              <View style={[styles.filterOptions, { flexDirection }]}>
                <Pressable 
                  onPress={() => handleSortChange('latest')}
                  style={[styles.filterOption, sortBy === 'latest' && { backgroundColor: theme.primary }]}
                >
                  <Text style={[styles.filterOptionText, sortBy === 'latest' && { color: themeKey === 'dark' ? '#0B1020' : '#FFF' }]}>
                    {isRTL ? 'الأحدث' : 'Latest'}
                  </Text>
                </Pressable>
                <Pressable 
                  onPress={() => handleSortChange('all')}
                  style={[styles.filterOption, sortBy === 'all' && { backgroundColor: theme.primary }]}
                >
                  <Text style={[styles.filterOptionText, sortBy === 'all' && { color: themeKey === 'dark' ? '#0B1020' : '#FFF' }]}>
                    {isRTL ? 'مش مهم' : 'Anytime'}
                  </Text>
                </Pressable>
              </View>

              {/* Faculty Filter */}
              <Text style={[styles.filterSectionTitle, { color: theme.text, textAlign, marginTop: 24 }]}>{isRTL ? 'الكليات المفضلة' : 'Preferred Faculties'}</Text>
              <View style={[styles.facultyGrid, { flexDirection }]}>
                {faculties.map((f) => (
                  <Pressable 
                    key={f.id}
                    onPress={() => toggleFaculty(f.id)}
                    style={[
                      styles.facultyItem, 
                      selectedFaculties.includes(f.id) && { backgroundColor: theme.primary + '20', borderColor: theme.primary }
                    ]}
                  >
                    <Ionicons 
                      name={f.icon as any} 
                      size={18} 
                      color={selectedFaculties.includes(f.id) ? theme.primary : theme.textSecondary} 
                    />
                    <Text style={[
                      styles.facultyItemText, 
                      { color: selectedFaculties.includes(f.id) ? theme.text : theme.textSecondary }
                    ]}>
                      {t(`faculties.${f.id}`)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Pressable 
              style={[styles.applyBtn, { backgroundColor: theme.primary }]}
              onPress={() => setIsFilterModalVisible(false)}
            >
              <Text style={[styles.applyBtnText, { color: themeKey === 'dark' ? '#0B1020' : '#FFF' }]}>{isRTL ? 'تطبيق' : 'Apply'}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.md,
    gap: 16,
  },
  headerTop: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  headerSubtitle: { fontSize: 16, fontWeight: '800', marginTop: -4, letterSpacing: 1, textTransform: 'uppercase' },
  headerActions: {
    gap: 8,
    alignItems: 'center',
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    height: 50,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  activeFiltersContainer: {
    marginTop: 8,
  },
  activeFiltersList: {
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    gap: 6,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFF',
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  filterOptions: {
    gap: 12,
  },
  filterOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  facultyGrid: {
    flexWrap: 'wrap',
    gap: 10,
  },
  facultyItem: {
    width: '31%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
    padding: 8,
  },
  facultyItemText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  applyBtn: {
    height: 54,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
