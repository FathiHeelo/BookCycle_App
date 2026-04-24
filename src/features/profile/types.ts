export interface UserStats {
  rating: number;
  reliability: number;
  impact: number;
  totalGiven: number;
  totalReceived: number;
}

export interface UserProfileInfo {
  role?: 'student' | 'professor';
  fullName?: string;
  facultyName?: string;
  photoURL?: string;
}

export interface ProfileCardProps {
  stats: UserStats;
  userProfile?: UserProfileInfo;
}

export interface HistoryBookItem {
  id: string;
  title: string;
  facultyId?: string;
  facultyIds?: string[];
  donorName?: string;
  createdAt: string;
  conditionId?: string;
  imageUrl?: string;
  image?: string;
  status: string;
  bookId?: string; // For requests
  bookTitle?: string; // For requests
  bookImage?: string; // For requests
}
