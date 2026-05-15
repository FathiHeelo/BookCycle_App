import { ref, set } from 'firebase/database';
import { FIREBASE_DB } from './firebaseConfig';

export const seedSponsors = async () => {
  const sponsors = {
    'sp1': {
      name: 'Najah Coffee House',
      logo: 'https://res.cloudinary.com/demo/image/upload/v1625126154/sample.jpg',
      description: 'Get a free coffee of your choice.',
      discountPercentage: 100,
      pointsRequired: 500,
      expiryDate: '2026-12-31',
      category: 'cafe'
    },
    'sp2': {
      name: 'Modern Printing Center',
      logo: 'https://res.cloudinary.com/demo/image/upload/v1625126154/sample.jpg',
      description: '20% discount on all book printing.',
      discountPercentage: 20,
      pointsRequired: 300,
      expiryDate: '2026-12-31',
      category: 'printing'
    },
    'sp3': {
      name: 'University Library Store',
      logo: 'https://res.cloudinary.com/demo/image/upload/v1625126154/sample.jpg',
      description: '5 JOD discount on any stationery.',
      discountPercentage: 0,
      pointsRequired: 1000,
      expiryDate: '2026-12-31',
      category: 'stationery'
    }
  };

  await set(ref(FIREBASE_DB, 'Sponsors'), sponsors);
  console.log('Sponsors seeded!');
};
