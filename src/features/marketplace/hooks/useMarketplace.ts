import { useState, useEffect, useMemo } from 'react';
import { ref, onValue } from 'firebase/database';
import { FIREBASE_DB } from '@/firebaseConfig';
import { Store, Offer, OfferCategory } from '../types';
import { MOCK_STORES, MOCK_OFFERS } from '../mockData';
import { filterByUniversity } from '@/src/utils/universityFilter';
import { DEFAULT_UNIVERSITY_ID } from '@/src/config/universities';

export const useMarketplace = (universityId: string = DEFAULT_UNIVERSITY_ID) => {
  const [allStores, setAllStores] = useState<Store[]>(MOCK_STORES);
  const [allOffers, setAllOffers] = useState<Offer[]>(MOCK_OFFERS);
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
        setAllStores(approvedList.length > 0 ? approvedList : MOCK_STORES);
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
        setAllOffers(activeList.length > 0 ? activeList : MOCK_OFFERS);
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

  // Filter all data to the current university (with backward-compat fallback)
  const stores = useMemo(
    () => filterByUniversity(allStores, universityId),
    [allStores, universityId]
  );

  const offers = useMemo(
    () => filterByUniversity(allOffers, universityId),
    [allOffers, universityId]
  );

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

  const getOfferById = (id: string) => allOffers.find((o) => o.id === id);
  const getStoreById = (id: string) => allStores.find((s) => s.id === id);
  const getOffersByStore = (storeId: string) =>
    offers.filter((o) => o.storeId === storeId);

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
