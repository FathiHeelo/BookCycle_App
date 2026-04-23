import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Pressable, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { ThemedText } from '@/components/themed-text';
import { ref, onValue } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { useI18n } from '@/hooks/use-i18n';
import { CustomHeader } from '@/src/components/shared/CustomHeader';

interface Chat {
  id: string;
  lastMessage: string;
  lastTimestamp: number;
  participants: string[];
  bookTitle: string;
  otherUser?: {
    id: string;
    fullName: string;
  };
}

export default function MessagesTab() {
  const { theme: themeKey } = useAppTheme();
  const theme = Colors[themeKey];
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const currentUser = FIREBASE_AUTH.currentUser;

  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const flexDirection = isRTL ? 'row-reverse' : 'row';

  useEffect(() => {
    if (!currentUser) return;
    const chatsRef = ref(FIREBASE_DB, 'Chats');
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: Chat[] = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(chat => chat.participants?.includes(currentUser.uid))
          .sort((a, b) => b.lastTimestamp - a.lastTimestamp);
        setChats(list);
      } else {
        setChats([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const renderChatItem = ({ item }: { item: Chat }) => {
    const otherId = item.participants?.find(p => p !== currentUser?.uid);
    return (
      <Pressable 
        style={[styles.chatCard, { backgroundColor: theme.card, flexDirection }]}
        onPress={() => router.push({
          pathname: `../chat/${item.id}`,
          params: { otherId: otherId, bookTitle: item.bookTitle }
        })}
      >
        <View style={[styles.avatar, { backgroundColor: theme.primary + '10' }]}>
          <Ionicons name="person" size={24} color={theme.primary} />
        </View>
        <View style={[styles.chatInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <ThemedText style={styles.bookTitle} numberOfLines={1}>{item.bookTitle || (isRTL ? 'استفسار عام' : 'General Inquiry')}</ThemedText>
          <ThemedText style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</ThemedText>
        </View>
        <View style={styles.metaInfo}>
          <ThemedText style={styles.timeText}>
            {new Date(item.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </ThemedText>
          <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={16} color="#CBD5E1" />
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader 
        title={isRTL ? 'الرسائل' : 'Messages'}
        leftMode="none"
        rightIcons={['search']}
        hideSafeArea
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color="#CBD5E1" />
              <ThemedText style={styles.emptyText}>{isRTL ? 'لا توجد محادثات بعد' : 'No messages yet'}</ThemedText>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 20, paddingBottom: 120 }, // Padding bottom 120 to prevent Tab Bar from hiding content
  chatCard: {
    padding: 16,
    borderRadius: Radius.lg,
    marginBottom: 12,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInfo: { flex: 1 },
  bookTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  lastMessage: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  metaInfo: { alignItems: 'flex-end', gap: 4 },
  timeText: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100, gap: 16 },
  emptyText: { fontSize: 16, color: '#94A3B8', fontWeight: '600' },
});
