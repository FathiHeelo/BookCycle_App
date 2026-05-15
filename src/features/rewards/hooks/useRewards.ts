import { useState, useEffect, useCallback } from 'react';
import { RewardService } from '@/src/services/reward.service';
import { UserRewards, Sponsor, RedeemedReward } from '../types';
import { FIREBASE_AUTH, FIREBASE_DB } from '@/firebaseConfig';
import { Alert } from 'react-native';
import { ref, set, onValue } from 'firebase/database';

export const useRewards = () => {
  const user = FIREBASE_AUTH.currentUser;
  const [rewards, setRewards] = useState<UserRewards | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [coupons, setCoupons] = useState<RedeemedReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // 1. Real-time User Rewards
    const rewardsRef = ref(FIREBASE_DB, `UserRewards/${user.uid}`);
    const unsubRewards = onValue(rewardsRef, (snapshot) => {
      if (snapshot.exists()) {
        setRewards(snapshot.val());
      } else {
        // Initialize if doesn't exist
        RewardService.getUserRewards(user.uid).then(res => setRewards(res));
      }
    });

    // 2. Real-time Sponsors (with auto-seed logic)
    const sponsorsRef = ref(FIREBASE_DB, 'Sponsors');
    const unsubSponsors = onValue(sponsorsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setSponsors(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        // Auto-seed
        const mockSponsors = {
          'sp1': {
            name: 'Najah Coffee House',
            logo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
            description: 'Get a free coffee of your choice.',
            discountPercentage: 100,
            pointsRequired: 500,
            expiryDate: '2026-12-31',
            category: 'cafe'
          },
          'sp2': {
            name: 'Modern Printing Center',
            logo: 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=400',
            description: '20% discount on all book printing.',
            discountPercentage: 20,
            pointsRequired: 300,
            expiryDate: '2026-12-31',
            category: 'printing'
          },
          'sp3': {
            name: 'Library Store',
            logo: 'https://images.unsplash.com/photo-1526614185915-460bd367646d?w=400',
            description: '5 JOD discount on stationery.',
            discountPercentage: 0,
            pointsRequired: 1000,
            expiryDate: '2026-12-31',
            category: 'stationery'
          }
        };
        await set(sponsorsRef, mockSponsors);
      }
    });

    // 3. Real-time Coupons
    const couponsRef = ref(FIREBASE_DB, `UserRedeemedRewards/${user.uid}`);
    const unsubCoupons = onValue(couponsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] }))
          .filter(r => !r.isUsed && new Date(r.expiryDate) > new Date());
        setCoupons(list);
      } else {
        setCoupons([]);
      }
      setLoading(false);
    });

    return () => {
      unsubRewards();
      unsubSponsors();
      unsubCoupons();
    };
  }, [user]);

  const redeemReward = async (sponsor: Sponsor) => {
    if (!user) return;
    
    setRedeeming(sponsor.id);
    try {
      const coupon = await RewardService.redeemReward(user.uid, sponsor);
      if (coupon) {
        Alert.alert('Success! 🎉', `You've redeemed a reward from ${sponsor.name}. Check your coupons!`);
      }
    } catch (error: any) {
      if (error.message === 'INSUFFICIENT_POINTS') {
        Alert.alert('Insufficient Points', "You don't have enough points for this reward yet. Keep sharing!");
      } else {
        Alert.alert('Error', 'Failed to redeem reward. Please try again.');
      }
    } finally {
      setRedeeming(null);
    }
  };

  return {
    rewards,
    sponsors,
    coupons,
    loading,
    redeeming,
    redeemReward,
  };
};
