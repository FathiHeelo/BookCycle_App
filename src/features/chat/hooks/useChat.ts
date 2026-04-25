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
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (otherId) {
          const otherRef = ref(FIREBASE_DB, `Users/${otherId}`);
          const otherSnap = await get(otherRef);
          if (otherSnap.exists()) setOtherUser(otherSnap.val());
        }
        if (currentUser) {
          const currentRef = ref(FIREBASE_DB, `Users/${currentUser.uid}`);
          const currentSnap = await get(currentRef);
          if (currentSnap.exists()) setCurrentUserProfile(currentSnap.val());
        }
      } catch (e) {
        console.error('Error fetching users:', e);
      }
    };
    fetchUsers();
  }, [otherId, currentUser]);

  useEffect(() => {
    if (!chatId || !currentUser) return;

    const messagesRef = ref(FIREBASE_DB, `Messages/${chatId}`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: Message[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => b.timestamp - a.timestamp);
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
        isRead: false,
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

  const handleSendImage = async (imageUrl: string) => {
    if (!currentUser || !chatId) return;

    try {
      const messagesRef = ref(FIREBASE_DB, `Messages/${chatId}`);
      const newMessageRef = push(messagesRef);
      await set(newMessageRef, {
        senderId: currentUser.uid,
        imageUrl,
        text: '',
        timestamp: serverTimestamp(),
        isRead: false,
      });
      
      const chatMetaRef = ref(FIREBASE_DB, `Chats/${chatId}`);
      await set(chatMetaRef, {
        lastMessage: '📷 Image',
        lastTimestamp: serverTimestamp(),
        participants: [currentUser.uid, otherId],
        bookTitle: bookTitle || '',
      });
    } catch (e) {
      console.error('Send image error:', e);
    }
  };

  const handleSendLocation = async (latitude: number, longitude: number) => {
    if (!currentUser || !chatId) return;

    try {
      const messagesRef = ref(FIREBASE_DB, `Messages/${chatId}`);
      const newMessageRef = push(messagesRef);
      await set(newMessageRef, {
        senderId: currentUser.uid,
        location: { latitude, longitude },
        text: '',
        timestamp: serverTimestamp(),
        isRead: false,
      });
      
      const chatMetaRef = ref(FIREBASE_DB, `Chats/${chatId}`);
      await set(chatMetaRef, {
        lastMessage: '📍 Location',
        lastTimestamp: serverTimestamp(),
        participants: [currentUser.uid, otherId],
        bookTitle: bookTitle || '',
      });
    } catch (e) {
      console.error('Send location error:', e);
    }
  };

  return {
    currentUser,
    currentUserProfile,
    messages,
    inputText,
    setInputText,
    loading,
    handleSend,
    handleSendImage,
    handleSendLocation,
    otherUser,
    t,
    isRTL
  };
};
