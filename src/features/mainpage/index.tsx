import React, { useMemo, useState } from 'react';
import { View, FlatList, ActivityIndicator, StatusBar, Text, StyleSheet, Modal, TouchableOpacity, Pressable, Dimensions } from 'react-native';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useMainPage } from './hooks/useMainPage';
import { BookCard } from './components/BookCard';
import { SearchBar } from './components/SearchBar';
import { FacultyScroller } from './components/FacultyScroller';
import { GiveBookFAB } from './components/GiveBookFAB';
import { CustomHeader } from '@/src/components/shared/CustomHeader';
import { FACULTIES } from '@/src/constants/faculties';
import { MainStyles } from './styles';
import { TITLES, COLORS } from './constants';
import { Spacing, Radius } from '@/constants/theme';
import { useNotifications } from '@/hooks/use-notifications';
import { usePendingRequests } from '@/src/hooks/use-pending-requests';
import { useRouter } from 'expo-router';

const MainPage: React.FC = () => {
  const { 
    filteredResources, 
    loading, 
    isRTL, 
    t, 
    handlePress, 
    theme, 
    themeKey,
    searchQuery,
    setSearchQuery,
    selectedFacultyIds,
    setSelectedFacultyIds,
    predictions,
    currentUser,
    customizedFacultyIds,
    updateCustomizedFaculties,
    isAccessible
  } = useMainPage();

  const [isModalVisible, setModalVisible] = useState(false);
  const { unreadCount } = useNotifications();
  const pendingRequestsCount = usePendingRequests();
  const router = useRouter();

  const allAvailableFaculties = useMemo(() => [
    { id: 'all', icon: 'school-outline', color: theme.primary },
    ...FACULTIES.map(f => ({ ...f, color: theme.primary }))
  ], [theme.primary]);

  const visibleFaculties = useMemo(() => {
    return allAvailableFaculties.filter(f => customizedFacultyIds.includes(f.id));
  }, [allAvailableFaculties, customizedFacultyIds]);

  const toggleFacultyFilter = (id: string) => {
    let current = [...selectedFacultyIds];
    const index = current.indexOf(id);
    
    if (index > -1) {
      // Remove if selected
      current.splice(index, 1);
      // Ensure at least one is selected if we want, or allow empty (depends on UX)
      // If we want 'all' to be default when empty:
      if (current.length === 0) current = ['all'];
    } else {
      // Add if not selected
      current.push(id);
      // If we added 'all', maybe we want to keep others? User said 'treat it as regular'
    }
    setSelectedFacultyIds(current);
  };

  const handleToggleCustomFaculty = (id: string) => {
    let current = [...customizedFacultyIds];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      if (current.length < TITLES.MAX_FACULTIES_LIMIT) {
        current.push(id);
      }
    }
    updateCustomizedFaculties(current);
  };

  const listHeader = useMemo(() => (
    <View style={styles.headerContent}>
      <View style={styles.topSection}>
        <View style={styles.titleSection}>
          <Text style={[styles.mainTitle, { color: theme.text, textAlign: isRTL ? 'right' : 'left', fontWeight: isAccessible ? '900' : '900' }]}>
            {isRTL ? TITLES.GIVING_HUB_AR : TITLES.GIVING_HUB_EN}
          </Text>
          <Text style={[styles.subtitle, { color: theme.primary, textAlign: isRTL ? 'right' : 'left', fontWeight: isAccessible ? '900' : '800' }]}>
            {isRTL ? TITLES.SUBTITLE_AR : TITLES.SUBTITLE_EN}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, zIndex: 1000, marginBottom: 20 }}>
          <SearchBar 
            query={searchQuery}
            onQueryChange={setSearchQuery}
            predictions={predictions}
            onPredictionSelect={(p) => setSearchQuery(p)}
            isRTL={isRTL}
            theme={theme}
            placeholder={isRTL ? TITLES.SEARCH_PLACEHOLDER_AR : TITLES.SEARCH_PLACEHOLDER_EN}
            isAccessible={isAccessible}
          />
        </View>
      </View>

      <View style={[styles.facultySection, { backgroundColor: themeKey === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
        <View style={styles.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: theme.text, textAlign: isRTL ? 'right' : 'left', fontWeight: isAccessible ? '900' : '800' }]}>
              {isRTL ? TITLES.BROWSE_FACULTY_AR : TITLES.BROWSE_FACULTY_EN}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary, textAlign: isRTL ? 'right' : 'left', fontWeight: isAccessible ? '700' : '600' }]}>
              {isRTL ? TITLES.BROWSE_FACULTY_SUBTITLE_AR : TITLES.BROWSE_FACULTY_SUBTITLE_EN}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => setModalVisible(true)}
            style={[styles.customizeBtn, { borderColor: theme.primary, borderWidth: isAccessible ? 2 : 1.5 }]}
          >
            <Text style={[styles.viewAll, { color: theme.primary, fontWeight: isAccessible ? '900' : '800' }]}>
              {isRTL ? TITLES.VIEW_ALL_AR : TITLES.VIEW_ALL_EN}
            </Text>
          </TouchableOpacity>
        </View>

        <FacultyScroller 
          faculties={visibleFaculties}
          selectedIds={selectedFacultyIds}
          onToggle={toggleFacultyFilter}
          isRTL={isRTL}
          theme={theme}
          t={t}
          isAccessible={isAccessible}
        />
      </View>

      <View style={styles.featuredHeader}>
        <View style={[styles.line, { backgroundColor: theme.border }]} />
        <View style={[styles.featuredBadge, { backgroundColor: theme.card, borderColor: theme.primary, borderWidth: isAccessible ? 2 : 1 }]}>
          <Ionicons name="sparkles" size={14} color={theme.primary} />
          <Text style={[styles.featuredTitle, { color: theme.text, fontWeight: isAccessible ? '900' : '800' }]}>
            {isRTL ? TITLES.FEATURED_GIFTS_AR : TITLES.FEATURED_GIFTS_EN}
          </Text>
        </View>
        <View style={[styles.line, { backgroundColor: theme.border }]} />
      </View>
    </View>
  ), [theme, isRTL, searchQuery, predictions, visibleFaculties, selectedFacultyIds, themeKey]);

  const onGestureEvent = (event: any) => {
    const { translationX } = event.nativeEvent;
    // If user swipes significantly from right to left (in RTL) or left to right (in LTR)
    const threshold = 150;
    if (isRTL) {
      if (translationX > threshold) {
        router.push('/my-requests' as any);
      }
    } else {
      if (translationX < -threshold) {
        router.push('/my-requests' as any);
      }
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        activeOffsetX={[-20, 20]} // Sensitivity
        failOffsetY={[-20, 20]} // Allow vertical scrolling
      >
        <View style={[MainStyles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={themeKey === 'dark' ? 'light-content' : 'dark-content'} />
      
      <CustomHeader 
        title="BookCycle"
        leftMode="avatar"
        avatarUrl={currentUser?.photoURL || undefined}
        rightIcons={['requests', 'notification']}
        notificationCount={pendingRequestsCount || unreadCount}
        onRightIconPress={(icon) => {
          if (icon === 'notification') {
            router.push('/notifications');
          } else if (icon === 'requests') {
            router.push('/my-requests');
          }
        }}
        hideSafeArea
      />

      {loading ? (
        <View style={MainStyles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredResources}
          renderItem={({ item }) => (
            <BookCard 
              item={item} 
              onPress={handlePress} 
              theme={theme} 
              themeKey={themeKey} 
              isRTL={isRTL} 
              t={t} 
              isAccessible={isAccessible}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          ListHeaderComponent={listHeader}
          contentContainerStyle={MainStyles.listContent}
          columnWrapperStyle={[MainStyles.columnWrapper, { flexDirection: isRTL ? 'row-reverse' : 'row', paddingHorizontal: 20 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={MainStyles.emptyState}>
              <Ionicons name="library-outline" size={64} color={theme.border} />
              <Text style={[MainStyles.emptyText, { color: theme.textSecondary }]}>
                {isRTL ? 'لا توجد هدايا متاحة تطابق بحثك' : 'No gifts available matching your search'}
              </Text>
            </View>
          }
        />
      )}

      <GiveBookFAB isRTL={isRTL} theme={theme} isAccessible={isAccessible} />

      {/* Faculty Customization Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {isRTL ? 'تخصيص الكليات المعروضة' : 'Customize Faculties'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSubtitle, { color: theme.primary, fontWeight: '700', textAlign: isRTL ? 'right' : 'left', marginBottom: 8 }]}>
              {isRTL ? `اختر حتى ${TITLES.MAX_FACULTIES_LIMIT} كليات لعرضها` : `Select up to ${TITLES.MAX_FACULTIES_LIMIT} faculties`}
            </Text>
            <Text style={[styles.modalDescription, { color: theme.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL ? TITLES.CUSTOMIZE_DESCRIPTION_AR : TITLES.CUSTOMIZE_DESCRIPTION_EN}
            </Text>
            
            <FlatList
              data={allAvailableFaculties}
              keyExtractor={(item) => item.id}
              style={{ marginTop: 16 }}
              renderItem={({ item }) => {
                const isSelected = customizedFacultyIds.includes(item.id);
                return (
                  <TouchableOpacity 
                    style={[styles.modalItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                    onPress={() => handleToggleCustomFaculty(item.id)}
                  >
                    <Ionicons name={item.icon as any} size={22} color={isSelected ? theme.primary : theme.textSecondary} />
                    <Text style={[styles.modalItemText, { color: theme.text, flex: 1, textAlign: isRTL ? 'right' : 'left', marginHorizontal: 12 }]}>
                      {item.id === 'all' ? (isRTL ? 'إجباري جامعة' : 'University Requirements') : t(`faculties.${item.id}`)}
                    </Text>
                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                    ) : (
                      <View style={[styles.checkbox, { borderColor: theme.border }]} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={[styles.divider, { backgroundColor: theme.border }]} />}
            />
          </View>
        </Pressable>
      </Modal>
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  headerContent: {
    paddingTop: 10,
  },
  topSection: {
    marginBottom: 10,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: -2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  facultySection: {
    paddingVertical: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    opacity: 0.8,
  },
  customizeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
  },
  viewAll: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
    gap: 8,
  },
  featuredTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 14,
  },
  modalDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  modalItem: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  divider: {
    height: 1,
  },
});

export default MainPage;
