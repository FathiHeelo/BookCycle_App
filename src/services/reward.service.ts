import { ref, get, update, set, push, increment } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { UserRewards, Sponsor, RedeemedReward, POINTS_CONFIG, LEVELS_CONFIG } from '../features/rewards/types';
import { NotificationService } from './notification.service';

export const RewardService = {
  /**
   * Get current user's reward statistics
   */
  async getUserRewards(userId: string): Promise<UserRewards> {
    const rewardsRef = ref(FIREBASE_DB, `UserRewards/${userId}`);
    const snapshot = await get(rewardsRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as UserRewards;
    }
    
    // Default initial state
    const initialState: UserRewards = {
      totalPoints: 0,
      resourcesShared: 0,
      successfulExchanges: 0,
      currentLevel: 1,
      badges: [],
      unlockedRewards: []
    };
    
    await set(rewardsRef, initialState);
    return initialState;
  },

  /**
   * Award points to a user for a specific action
   */
  async awardPoints(userId: string, action: keyof typeof POINTS_CONFIG, metadata?: any) {
    const points = POINTS_CONFIG[action];
    const rewardsRef = ref(FIREBASE_DB, `UserRewards/${userId}`);
    
    const currentRewards = await this.getUserRewards(userId);
    const newPoints = currentRewards.totalPoints + points;
    
    // Check for level up
    let newLevel = currentRewards.currentLevel;
    const nextLevel = LEVELS_CONFIG.find(l => l.level === currentRewards.currentLevel + 1);
    
    if (nextLevel && newPoints >= nextLevel.minPoints) {
      newLevel = nextLevel.level;
      
      // Notify Level Up
      await NotificationService.createNotification({
        recipientId: userId,
        senderId: 'system',
        senderName: 'BookCycle Rewards',
        type: 'reward',
        title: 'Level Up! 🎉',
        body: `Congratulations! You've reached Level ${newLevel}: ${nextLevel.title}`,
        actionTarget: 'rewards',
        read: false,
        createdAt: Date.now()
      });
    }

    const updates: any = {
      totalPoints: increment(points),
      currentLevel: newLevel,
    };

    if (action === 'SHARE_RESOURCE') {
      updates.resourcesShared = increment(1);
    } else if (action === 'COMPLETE_EXCHANGE') {
      updates.successfulExchanges = increment(1);
    }

    await update(rewardsRef, updates);

    // Notify Points Earned
    await NotificationService.createNotification({
      recipientId: userId,
      senderId: 'system',
      senderName: 'BookCycle Rewards',
      type: 'reward',
      title: 'Points Earned! ✨',
      body: `You just earned ${points} points for ${action.replace('_', ' ').toLowerCase()}!`,
      actionTarget: 'rewards',
      read: false,
      createdAt: Date.now()
    });
  },

  /**
   * Get all available sponsors and rewards
   */
  async getSponsors(): Promise<Sponsor[]> {
    const sponsorsRef = ref(FIREBASE_DB, 'Sponsors');
    const snapshot = await get(sponsorsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    
    return [];
  },

  /**
   * Redeem a reward from a sponsor
   */
  async redeemReward(userId: string, sponsor: Sponsor): Promise<RedeemedReward | null> {
    const rewardsRef = ref(FIREBASE_DB, `UserRewards/${userId}`);
    const userRewards = await this.getUserRewards(userId);

    if (userRewards.totalPoints < sponsor.pointsRequired) {
      throw new Error('INSUFFICIENT_POINTS');
    }

    // Generate a simple random coupon code
    const couponCode = `BC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1); // Valid for 1 month

    const redeemedReward: RedeemedReward = {
      id: push(ref(FIREBASE_DB, `UserRedeemedRewards/${userId}`)).key!,
      sponsorId: sponsor.id,
      couponCode,
      redeemedAt: new Date().toISOString(),
      expiryDate: expiryDate.toISOString(),
      isUsed: false
    };

    // Atomic-like update
    await update(rewardsRef, {
      totalPoints: increment(-sponsor.pointsRequired)
    });

    const userRedeemedRef = ref(FIREBASE_DB, `UserRedeemedRewards/${userId}/${redeemedReward.id}`);
    await set(userRedeemedRef, redeemedReward);

    // Record usage for analytics
    const sponsorAnalyticsRef = ref(FIREBASE_DB, `SponsorAnalytics/${sponsor.id}/redemptions`);
    await update(sponsorAnalyticsRef, {
      total: increment(1)
    });

    return redeemedReward;
  },

  /**
   * Get user's active coupons
   */
  async getUserCoupons(userId: string): Promise<RedeemedReward[]> {
    const ref_ = ref(FIREBASE_DB, `UserRedeemedRewards/${userId}`);
    const snapshot = await get(ref_);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })).filter(r => !r.isUsed && new Date(r.expiryDate) > new Date());
    }
    
    return [];
  }
};
