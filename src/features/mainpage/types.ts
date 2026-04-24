import { ReactNode } from 'react';

export interface Resource {
  id: string;
  title: string;
  titleAr?: string;
  imageUrl?: string;
  image?: string;
  donorName?: string;
  facultyId?: string;
  facultyIds?: string[];
  majors?: string[];
  createdAt?: string;
  status?: string;
  [key: string]: any;
}

export interface MainPageHook {
  resources: Resource[];
  filteredResources: Resource[];
  loading: boolean;
  isRTL: boolean;
  t: (key: string, options?: any) => string;
  handlePress: (id: string) => void;
  theme: any;
  themeKey: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFacultyIds: string[];
  setSelectedFacultyIds: (ids: string[]) => void;
  selectedMajors: string[];
  setSelectedMajors: (majors: string[]) => void;
  predictions: string[];
  handleLogout: () => Promise<void>;
  currentUser: any;
}

export interface BookCardProps {
  item: Resource;
  onPress: (id: string) => void;
  theme: any;
  themeKey: string;
  isRTL: boolean;
  t: (key: string) => string;
}

export interface HeaderProps {
  title: string;
  subtitle?: string;
  isRTL: boolean;
  theme: any;
  onFilterPress?: () => void;
}

export interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  predictions: string[];
  onPredictionSelect: (prediction: string) => void;
  isRTL: boolean;
  theme: any;
  placeholder: string;
}

export interface FacultyScrollerProps {
  faculties: any[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  isRTL: boolean;
  theme: any;
  t: (key: string) => string;
}
