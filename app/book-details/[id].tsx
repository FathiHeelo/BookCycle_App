import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { BookDetailsFeature } from '@/src/features/book_details';

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams();
  return <BookDetailsFeature id={id as string} />;
}
