import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ChatScreenUI } from '@/src/features/chat';

export default function ChatScreen() {
  const { id: chatId, otherName, otherId, bookTitle } = useLocalSearchParams();

  return (
    <ChatScreenUI 
      chatId={chatId as string}
      otherName={otherName as string}
      otherId={otherId as string}
      bookTitle={bookTitle as string}
    />
  );
}
