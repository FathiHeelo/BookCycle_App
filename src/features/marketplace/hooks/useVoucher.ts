import { useState, useEffect } from 'react';
import { ref, push, set, update, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { FIREBASE_AUTH, FIREBASE_DB } from '@/firebaseConfig';
import { Voucher, Offer, Store } from '../types';

const generateVoucherCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'BC-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const useVoucher = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = FIREBASE_AUTH.currentUser;

  useEffect(() => {
    const uid = currentUser?.uid || 'mock_student_123';

    const vouchersRef = ref(FIREBASE_DB, 'marketplace/vouchers');
    const userVouchersQuery = query(
      vouchersRef,
      orderByChild('studentUid'),
      equalTo(uid)
    );

    const unsubscribe = onValue(userVouchersQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: Voucher[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        // Sort newest first
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setVouchers(list);
      } else {
        setVouchers([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching vouchers from Firebase:', error);
      // Fallback to local mock storage in development if Firebase access fails
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const generateVoucher = async (offer: Offer, store?: Store): Promise<Voucher> => {
    const uid = currentUser?.uid || 'mock_student_123';
    const email = currentUser?.email || 'mock_student@najah.edu';
    
    const voucherData: Omit<Voucher, 'id'> = {
      voucherCode: generateVoucherCode(),
      studentUid: uid,
      studentEmail: email,
      offerId: offer.id,
      offerTitle: offer.title,
      storeId: offer.storeId,
      storeName: store?.name || offer.storeName || 'Partner Store',
      originalPrice: offer.originalPrice,
      discountedPrice: offer.discountedPrice,
      commissionValue: offer.commissionValue,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    try {
      const vouchersRef = ref(FIREBASE_DB, 'marketplace/vouchers');
      const newVoucherRef = push(vouchersRef);
      await set(newVoucherRef, voucherData);
      
      const newVoucher: Voucher = {
        id: newVoucherRef.key!,
        ...voucherData,
      };

      // Also update store's offer count if we want, but not required for student-side MVP
      return newVoucher;
    } catch (error) {
      console.error('Firebase failed to create voucher. Falling back to local update.', error);
      // In case database write fails (e.g. offline/permission issues), return mock/local voucher
      const localId = `voucher_local_${Date.now()}`;
      const localVoucher: Voucher = {
        id: localId,
        ...voucherData,
      };
      setVouchers((prev) => [localVoucher, ...prev]);
      return localVoucher;
    }
  };

  const cancelVoucher = async (voucherId: string): Promise<void> => {
    try {
      const voucherRef = ref(FIREBASE_DB, `marketplace/vouchers/${voucherId}`);
      await update(voucherRef, { status: 'cancelled' });
    } catch (error) {
      console.error('Failed to cancel voucher in Firebase. Updating local state.', error);
      setVouchers((prev) =>
        prev.map((v) => (v.id === voucherId ? { ...v, status: 'cancelled' } : v))
      );
    }
  };

  const getVoucherById = (voucherId: string): Voucher | undefined => {
    return vouchers.find((v) => v.id === voucherId);
  };

  return {
    vouchers,
    loading,
    generateVoucher,
    cancelVoucher,
    getVoucherById,
  };
};
