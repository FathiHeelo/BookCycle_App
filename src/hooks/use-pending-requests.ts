import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';

export const usePendingRequests = () => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) return;

    const requestsRef = ref(FIREBASE_DB, 'Requests');
    const unsubscribe = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const count = Object.values(data).filter((req: any) => 
          req.donorUid === user.uid && req.status === 'pending'
        ).length;
        setPendingCount(count);
      } else {
        setPendingCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  return pendingCount;
};
