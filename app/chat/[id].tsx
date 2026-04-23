import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/hooks/use-i18n';
import { ref, onValue, push, set, serverTimestamp } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { ThemedText } from '@/components/themed-text';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export default function ChatScreen() {
  const router = useRouter();
  const { id: chatId, otherName, otherId, bookTitle } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { t, isRTL } = useI18n();
  const currentUser = FIREBASE_AUTH.currentUser;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

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
      
      // Update Chat Metadata
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

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.senderId === currentUser?.uid;
    return (
      <View style={[
        styles.messageWrapper, 
        { flexDirection: isMine ? (isRTL ? 'row-reverse' : 'row') : (isRTL ? 'row' : 'row-reverse') }
      ]}>
        <View style={[
          styles.bubble, 
          isMine ? styles.myBubble : styles.theirBubble,
          isMine ? { backgroundColor: theme.primary } : { backgroundColor: '#F1F5F9' }
        ]}>
          <ThemedText style={[
            styles.messageText, 
            { color: isMine ? '#FFF' : '#1E293B', textAlign }
          ]}>
            {item.text}
          </ThemedText>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Chat Header */}
      <View style={[styles.header, { flexDirection, borderBottomColor: '#F1F5F9' }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.primary} />
        </Pressable>
        <View style={styles.headerInfo}>
          <ThemedText style={[styles.headerName, { textAlign }]}>{otherName || 'Academic Contributor'}</ThemedText>
          <ThemedText style={[styles.headerSub, { textAlign }]} numberOfLines={1}>
            {bookTitle ? `${t('bookDetails.title')}: ${bookTitle}` : 'Chat'}
          </ThemedText>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {/* Input Bar */}
        <View style={[styles.inputBar, { flexDirection, backgroundColor: theme.card }]}>
          <TextInput
            style={[styles.textInput, { textAlign }]}
            placeholder={isRTL ? 'اكتب رسالة...' : 'Type a message...'}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <Pressable 
            style={[styles.sendBtn, { backgroundColor: theme.primary }]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name={isRTL ? "send" : "send"} size={20} color="#FFF" style={isRTL ? { transform: [{ rotate: '180deg' }] } : null} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 17, fontWeight: '800' },
  headerSub: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  listContent: { padding: 16, paddingBottom: 32 },
  messageWrapper: {
    marginBottom: 12,
    width: '100%',
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myBubble: {
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  inputBar: {
    padding: 12,
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
