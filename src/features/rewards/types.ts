export interface UserRewards {
  totalPoints: number;
  resourcesShared: number;
  successfulExchanges: number;
  currentLevel: number;
  badges: string[];
  unlockedRewards: string[]; // List of redeemed reward IDs
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  description: string;
  discountPercentage: number;
  pointsRequired: number;
  expiryDate: string;
  category: 'cafe' | 'printing' | 'library' | 'stationery' | 'space';
}

export interface RedeemedReward {
  id: string;
  sponsorId: string;
  couponCode: string;
  redeemedAt: string;
  expiryDate: string;
  isUsed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  milestone: number;
  points: number;
  type: 'share' | 'exchange' | 'rating' | 'help';
}

export const POINTS_CONFIG = {
  SHARE_RESOURCE: 50,
  COMPLETE_EXCHANGE: 100,
  POSITIVE_RATING: 20,
  HELP_STUDENT: 30,
};

export const LEVELS_CONFIG = [
  { level: 1, minPoints: 0, title: 'Novice Contributor' },
  { level: 2, minPoints: 500, title: 'Active Sharer' },
  { level: 3, minPoints: 1500, title: 'Academic Helper' },
  { level: 4, minPoints: 4000, title: 'Community Pillar' },
  { level: 5, minPoints: 10000, title: 'Guardian of Knowledge' },
];
