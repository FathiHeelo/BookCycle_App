import React, { useRef } from 'react';
import {
  View, FlatList, TextInput, Pressable, KeyboardAvoidingView,
  Platform, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ChatStyles as styles } from '../styles';
import { useChat } from '../hooks/useChat';
import { Message } from '../types';

interface ChatScreenUIProps {
  chatId: string;
  otherName: string;
  otherId: string;
  bookTitle: string;
}

export const ChatScreenUI = ({ chatId, otherName, otherId, bookTitle }: ChatScreenUIProps) => {
  const {
    currentUser, messages, inputText, setInputText, loading,
    handleSend, t, isRTL
  } = useChat(chatId, otherId, bookTitle);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const flatListRef = useRef<FlatList>(null);

  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

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
      <View style={[styles.header, { flexDirection, borderBottomColor: '#F1F5F9' }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={theme.primary} />
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
            <Ionicons name={isRTL ? "send" : "send"} size={20} color="#FFF" style={isRTL ? { transform: [{ rotate: '180deg' }] } : undefined} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
