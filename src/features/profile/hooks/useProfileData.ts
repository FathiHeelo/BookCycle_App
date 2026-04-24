import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { FIREBASE_DB } from '@/firebaseConfig';
import { UserStats, UserProfileInfo } from '../types';

export const useProfileData = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [stats, setStats] = useState<UserStats>({
    rating: 0, reliability: 0, impact: 0, totalGiven: 0, totalReceived: 0,
  });
  const [userProfile, setUserProfile] = useState<UserProfileInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const statsRef = ref(FIREBASE_DB, `Users/${user.uid}/stats`);
    const unsubStats = onValue(statsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setStats(prev => ({
          ...prev,
          ...data,
          rating: data.rating !== undefined ? data.rating : (data.averageRating || 0)
        }));
      }
    });

    const userRef = ref(FIREBASE_DB, `Users/${user.uid}`);
    const unsubProfile = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) setUserProfile(snapshot.val());
    });

    const booksRef = ref(FIREBASE_DB, 'Books');
    const { query: fbQuery, orderByChild: fbOBC, equalTo: fbEQ } = require('firebase/database');
    const userBooksQuery = fbQuery(booksRef, fbOBC('donorUid'), fbEQ(user.uid));

    const unsubBooks = onValue(userBooksQuery, (snapshot) => {
      if (snapshot.exists()) {
        setStats(prev => ({ ...prev, totalGiven: Object.keys(snapshot.val()).length }));
      } else {
        setStats(prev => ({ ...prev, totalGiven: 0 }));
      }
      setLoading(false);
    });

    return () => {
      unsubStats();
      unsubProfile();
      unsubBooks();
    };
  }, [user]);

  return { stats, userProfile, loading };
};
