import { Ionicons } from '@expo/vector-icons';

export interface EmptyStateProps {
  iconName: keyof typeof Ionicons.glyphMap;
  message: string;
}

export interface StatusBadgeProps {
  status: string;
  isRTL?: boolean;
}

export interface BookCardProps {
  id: string;
  title: string;
  imageUrl?: string;
  image?: string;
  status: string;
  facultyId?: string;
  facultyIds?: string[];
  isRTL?: boolean;
  onPress: (id: string) => void;
  showNewBadge?: boolean;
  createdAt?: string;
}
