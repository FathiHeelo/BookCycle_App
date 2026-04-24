import { useState, useEffect } from 'react';
import { ref, onValue, push, set, serverTimestamp, get } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { useI18n } from '@/hooks/use-i18n';
import { Message } from '../types';

export const useChat = (chatId: string | undefined, otherId: string | undefined, bookTitle: string | undefined) => {
  const { t, isRTL } = useI18n();
  const currentUser = FIREBASE_AUTH.currentUser;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<any>(null);

  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!otherId) return;
      try {
        const userRef = ref(FIREBASE_DB, `Users/${otherId}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setOtherUser(snapshot.val());
        }
      } catch (e) {
        console.error('Error fetching other user:', e);
      }
    };
    fetchOtherUser();
  }, [otherId]);


  useEffect(() => {
    if (!chatId || !currentUser) return;

    const messagesRef = ref(FIREBASE_DB, `Messages/${chatId}`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: Message[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(list);
      } else {
        setMessages([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    if (!inputText.trim() || !currentUser || !chatId) return;

    const messageText = inputText.trim();
    setInputText('');

    try {
      const messagesRef = ref(FIREBASE_DB, `Messages/${chatId}`);
      const newMessageRef = push(messagesRef);
      await set(newMessageRef, {
        senderId: currentUser.uid,
        text: messageText,
        timestamp: serverTimestamp(),
      });
      
      const chatMetaRef = ref(FIREBASE_DB, `Chats/${chatId}`);
      await set(chatMetaRef, {
        lastMessage: messageText,
        lastTimestamp: serverTimestamp(),
        participants: [currentUser.uid, otherId],
        bookTitle: bookTitle || '',
      });
    } catch (e) {
      console.error('Send message error:', e);
    }
  };

  return {
    currentUser,
    messages,
    inputText,
    setInputText,
    loading,
    handleSend,
    otherUser,
    t,
    isRTL
  };
};
