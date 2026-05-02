import { Colors, Radius } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { FIREBASE_AUTH, FIREBASE_DB } from '@/firebaseConfig';
import { useI18n } from '@/hooks/use-i18n';
import { CustomHeader } from '@/src/components/shared/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

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
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredChats = chats.filter(chat =>
    chat.bookTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <View style={[styles.avatar, { backgroundColor: themeKey === 'dark' ? 'rgba(245, 158, 11, 0.1)' : theme.primary + '10' }]}>
          <Ionicons name="person" size={24} color={theme.primary} />
        </View>
        <View style={[styles.chatInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.bookTitle, { color: theme.text }]} numberOfLines={1}>{item.bookTitle || (isRTL ? 'استفسار عام' : 'General Inquiry')}</Text>
          <Text style={[styles.lastMessage, { color: theme.textSecondary }]} numberOfLines={1}>{item.lastMessage}</Text>
        </View>
        <View style={styles.metaInfo}>
          <Text style={[styles.timeText, { color: theme.textSecondary }]}>
            {new Date(item.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={16} color={theme.primary} />
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader
        title={isRTL ? 'الرسائل' : 'Messages'}
        leftMode="none"
        rightIcons={[isSearching ? 'menu' : 'search']}
        onRightIconPress={(icon) => {
          if (icon === 'search') setIsSearching(true);
          if (icon === 'menu') {
            setIsSearching(false);
            setSearchQuery('');
          }
        }}
        hideSafeArea
      />

      {isSearching && (
        <View style={[styles.searchBarContainer, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
          <View style={[styles.searchBar, { backgroundColor: themeKey === 'dark' ? theme.card : '#F1F5F9', flexDirection }]}>
            <Ionicons name="search" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}
              placeholder={isRTL ? 'بحث عن محادثة...' : 'Search chats...'}
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={theme.border} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{isRTL ? 'لا توجد محادثات بعد' : 'No messages yet'}</Text>
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
  searchBarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchBar: {
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },
});
