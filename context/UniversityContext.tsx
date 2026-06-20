import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  University,
  UNIVERSITIES,
  DEFAULT_UNIVERSITY_ID,
  getUniversityById,
  isValidUniversityEmail,
} from '@/src/config/universities';
import { filterByUniversity, WithUniversityId } from '@/src/utils/universityFilter';

const STORAGE_KEY = 'selected-university-id';

interface UniversityContextType {
  /** The full university object for the currently selected university */
  selectedUniversity: University;
  /** True while loading the saved selection from AsyncStorage */
  loading: boolean;
  /** True if the user has already made a selection (i.e. AsyncStorage has a value) */
  hasSelected: boolean;
  /** Persist a new university selection */
  selectUniversity: (universityId: string) => Promise<void>;
  /** Validate whether an email matches the selected university domain */
  isValidEmail: (email: string) => boolean;
  /** Filter any array of records to only those belonging to the selected university */
  filterForCurrentUniversity: <T extends WithUniversityId>(records: T[]) => T[];
  /** Returns true if a single record belongs to the selected university */
  belongsToCurrentUniversity: (record: WithUniversityId) => boolean;
}

const UniversityContext = createContext<UniversityContextType | undefined>(undefined);

export function UniversityProvider({ children }: { children: React.ReactNode }) {
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>(DEFAULT_UNIVERSITY_ID);
  const [loading, setLoading] = useState(true);
  const [hasSelected, setHasSelected] = useState(false);

  // Load persisted selection on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((storedId) => {
        if (storedId) {
          // Validate it still exists in our config
          const exists = UNIVERSITIES.some((u) => u.id === storedId);
          if (exists) {
            setSelectedUniversityId(storedId);
            setHasSelected(true);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const selectUniversity = useCallback(async (universityId: string) => {
    setSelectedUniversityId(universityId);
    setHasSelected(true);
    await AsyncStorage.setItem(STORAGE_KEY, universityId);
  }, []);

  const selectedUniversity = getUniversityById(selectedUniversityId);

  const isValidEmail = useCallback(
    (email: string) => isValidUniversityEmail(email, selectedUniversity),
    [selectedUniversity]
  );

  const filterForCurrentUniversity = useCallback(
    <T extends WithUniversityId>(records: T[]) =>
      filterByUniversity(records, selectedUniversityId),
    [selectedUniversityId]
  );

  const belongsToCurrentUniversity = useCallback(
    (record: WithUniversityId) =>
      (record.universityId || DEFAULT_UNIVERSITY_ID) === selectedUniversityId,
    [selectedUniversityId]
  );

  return (
    <UniversityContext.Provider
      value={{
        selectedUniversity,
        loading,
        hasSelected,
        selectUniversity,
        isValidEmail,
        filterForCurrentUniversity,
        belongsToCurrentUniversity,
      }}
    >
      {children}
    </UniversityContext.Provider>
  );
}

export function useUniversity() {
  const ctx = useContext(UniversityContext);
  if (!ctx) throw new Error('useUniversity must be used within UniversityProvider');
  return ctx;
}
