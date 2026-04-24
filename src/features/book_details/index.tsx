import React from 'react';
import { useBookDetails } from './hooks/useBookDetails';
import { BookDetailsUI } from './components/BookDetailsUI';

export const BookDetailsFeature = ({ id }: { id?: string }) => {
  const hookData = useBookDetails(id);
  return <BookDetailsUI {...hookData} />;
};

export * from './types';
