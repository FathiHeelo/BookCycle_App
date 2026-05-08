import { useState, useEffect, useMemo } from 'react';
import { ref, onValue } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { useI18n } from '@/hooks/use-i18n';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { MOCK_SOURCES } from '@/src/constants/mockData';
import { Resource, MainPageHook } from '../types';
import { FIREBASE_PATHS, STATIC_VALUES, TITLES } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_CUSTOM_FACULTIES = 'bookcycle_main_faculties';
const DEFAULT_FACULTIES = ['all', 'eng', 'med', 'bus'];

export const useMainPage = (): MainPageHook & { 
  customizedFacultyIds: string[]; 
  updateCustomizedFaculties: (ids: string[]) => Promise<void>;
  isAccessible: boolean;
} => {
  const { theme: themeKey, colors: theme, isAccessible } = useAppTheme();
  const router = useRouter();
  const { t, isRTL } = useI18n();

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<string[]>(['all']);
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [customizedFacultyIds, setCustomizedFacultyIds] = useState<string[]>(DEFAULT_FACULTIES);

  // Load customized faculties from storage
  useEffect(() => {
    const loadCustomFaculties = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY_CUSTOM_FACULTIES);
        if (saved) {
          setCustomizedFacultyIds(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load customized faculties', e);
      }
    };
    loadCustomFaculties();
  }, []);

  const updateCustomizedFaculties = async (ids: string[]) => {
    try {
      const limitedIds = ids.slice(0, TITLES.MAX_FACULTIES_LIMIT);
      await AsyncStorage.setItem(STORAGE_KEY_CUSTOM_FACULTIES, JSON.stringify(limitedIds));
      setCustomizedFacultyIds(limitedIds);
    } catch (e) {
      console.error('Failed to save customized faculties', e);
    }
  };

  useEffect(() => {
    const resourcesRef = ref(FIREBASE_DB, FIREBASE_PATHS.BOOKS);
    
    const unsubscribe = onValue(resourcesRef, (snapshot) => {
      const data = snapshot.val();
      let firebaseList: Resource[] = [];
      
      if (data) {
        firebaseList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
      }

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
      setResources(MOCK_SOURCES as Resource[]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter(item => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        (item.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.titleAr?.includes(searchQuery));

      // Faculty filter
      const itemFaculties = item.facultyIds || (item.facultyId ? [item.facultyId] : []);
      const matchesFaculty = selectedFacultyIds.length === 0 || 
        itemFaculties.some(fId => selectedFacultyIds.includes(fId));

      // Major filter
      const matchesMajor = selectedMajors.length === 0 || 
        selectedMajors.includes('all') ||
        (item.majors?.some(m => selectedMajors.includes(m)));

      return matchesSearch && matchesFaculty && matchesMajor;
    });
  }, [resources, searchQuery, selectedFacultyIds, selectedMajors]);

  const predictions = useMemo(() => {
    if (searchQuery.length < 2) return [];
    
    const availableTitles = resources
      .filter(item => {
        const itemFaculties = item.facultyIds || (item.facultyId ? [item.facultyId] : []);
        const matchesFaculty = selectedFacultyIds.length === 0 || 
          itemFaculties.some(fId => selectedFacultyIds.includes(fId));
        return matchesFaculty;
      })
      .map(item => isRTL ? (item.titleAr || item.title) : (item.title || item.titleAr))
      .filter((title): title is string => !!title);

    const uniqueTitles = Array.from(new Set(availableTitles));
    return uniqueTitles
      .filter(title => title.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5);
  }, [resources, searchQuery, selectedFacultyIds, isRTL]);

  const handlePress = (id: string) => {
    router.push(`/book-details/${id}`);
  };

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    resources,
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
    selectedMajors,
    setSelectedMajors,
    predictions,
    handleLogout,
    currentUser: FIREBASE_AUTH.currentUser,
    customizedFacultyIds,
    updateCustomizedFaculties,
    isAccessible,
  };
};
