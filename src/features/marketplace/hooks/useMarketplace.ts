import { useState, useEffect, useMemo } from 'react';
import { ref, onValue } from 'firebase/database';
import { FIREBASE_DB } from '@/firebaseConfig';
import { Store, Offer, OfferCategory } from '../types';
import { MOCK_STORES, MOCK_OFFERS } from '../mockData';

export const useMarketplace = () => {
  const [stores, setStores] = useState<Store[]>(MOCK_STORES);
  const [offers, setOffers] = useState<Offer[]>(MOCK_OFFERS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<OfferCategory | 'all'>('all');

  useEffect(() => {
    // Try to load from Firebase; fall back to mock data gracefully
    const storesRef = ref(FIREBASE_DB, 'marketplace/stores');
    const offersRef = ref(FIREBASE_DB, 'marketplace/offers');

    const unsubStores = onValue(storesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: Store[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        const approvedList = list.filter((s) => s.isApproved);
        setStores(approvedList.length > 0 ? approvedList : MOCK_STORES);
      }
    }, () => {
      // Firebase error – keep mock data
    });

    const unsubOffers = onValue(offersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: Offer[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        const activeList = list.filter((o) => o.isActive);
        setOffers(activeList.length > 0 ? activeList : MOCK_OFFERS);
      }
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    return () => {
      unsubStores();
      unsubOffers();
    };
  }, []);

  const featuredOffers = useMemo(
    () => offers.filter((o) => o.isFeatured && o.isActive),
    [offers]
  );

  const filteredOffers = useMemo(() => {
    let list = [...offers];
    if (selectedCategory !== 'all') {
      list = list.filter((o) => o.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.storeName?.toLowerCase().includes(q) ||
          o.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [offers, selectedCategory, searchQuery]);

  const getOfferById = (id: string) => offers.find((o) => o.id === id);
  const getStoreById = (id: string) => stores.find((s) => s.id === id);
  const getOffersByStore = (storeId: string) => offers.filter((o) => o.storeId === storeId);

  return {
    stores,
    offers,
    featuredOffers,
    filteredOffers,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    getOfferById,
    getStoreById,
    getOffersByStore,
  };
};
