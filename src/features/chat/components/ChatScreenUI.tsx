import React, { useRef } from 'react';
import {
  View, FlatList, TextInput, Pressable, KeyboardAvoidingView,
  Platform, SafeAreaView, ActivityIndicator, Image,
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
    handleSend, otherUser, t, isRTL
  } = useChat(chatId, otherId, bookTitle);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const flatListRef = useRef<FlatList>(null);

  const flexDirection = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  const formatTime = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    const isMine = item.senderId === currentUser?.uid;
    const showAvatar = index === 0 || messages[index - 1].senderId !== item.senderId;
    
    return (
      <View style={[
        styles.messageWrapper, 
        { alignItems: isMine ? 'flex-end' : 'flex-start' }
      ]}>
        <View style={[
          styles.messageRow,
          { flexDirection: isMine ? (isRTL ? 'row' : 'row-reverse') : (isRTL ? 'row-reverse' : 'row') }
        ]}>
          {/* Avatar for other user */}
          {!isMine && (
            <View style={styles.avatarMessage}>
              {otherUser?.photoURL ? (
                <Image source={{ uri: otherUser.photoURL }} style={styles.avatarImg} />
              ) : (
                <Ionicons name="person" size={16} color={theme.textSecondary} />
              )}
            </View>
          )}

          {/* Avatar/Badge for "Me" */}
          {isMine && (
            <View style={styles.meBadge}>
              <ThemedText style={styles.meBadgeText}>ME</ThemedText>
            </View>
          )}

          <View style={{ alignItems: isMine ? 'flex-end' : 'flex-start', flexShrink: 1 }}>
            <View style={[
              styles.bubble, 
              isMine ? styles.myBubble : styles.theirBubble,
              isMine 
                ? { backgroundColor: colorScheme === 'dark' ? theme.primary : '#001B39' } 
                : { backgroundColor: colorScheme === 'dark' ? theme.card : '#F1F5F9' }
            ]}>
              {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
              )}
              <ThemedText style={[
                styles.messageText, 
                { 
                  color: isMine ? (colorScheme === 'dark' ? '#000' : '#FFF') : theme.text, 
                  textAlign 
                }
              ]}>
                {item.text}
              </ThemedText>
            </View>
            
            <View style={[styles.metaRow, { flexDirection }]}>
              <ThemedText style={styles.timestamp}>{formatTime(item.timestamp)}</ThemedText>
              {isMine && (
                <Ionicons 
                  name="checkmark-done" 
                  size={14} 
                  color={item.isRead ? theme.success : '#94A3B8'} 
                  style={styles.readReceipt}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { flexDirection, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={theme.primary} />
        </Pressable>
        
        <View style={styles.avatarSmall}>
          {otherUser?.photoURL ? (
            <Image source={{ uri: otherUser.photoURL }} style={styles.avatarImg} />
          ) : (
            <Ionicons name="person" size={24} color={theme.textSecondary} style={{ alignSelf: 'center', marginTop: 8 }} />
          )}
        </View>

        <View style={styles.headerInfo}>
          <ThemedText style={[styles.headerName, { textAlign, color: theme.text }]}>
            {otherUser?.fullName || otherName || 'Academic Contributor'}
          </ThemedText>
          <View style={[styles.headerSubRow, { flexDirection }]}>
            <View style={styles.statusDot} />
            <ThemedText style={[styles.headerSub, { textAlign }]}>
              {isRTL ? 'نشط الآن' : 'Active now'}
            </ThemedText>
          </View>
        </View>

        <Pressable style={styles.backBtn}>
          <Ionicons name="information-circle-outline" size={24} color={theme.primary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
            ListHeaderComponent={() => (
              <View style={styles.dateSeparator}>
                <View style={styles.dateBadge}>
                  <ThemedText style={styles.dateText}>{isRTL ? 'اليوم' : 'TODAY'}</ThemedText>
                </View>
              </View>
            )}
          />
        )}

        <View style={[styles.inputBarContainer, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
          <View style={[styles.inputBar, { backgroundColor: colorScheme === 'dark' ? theme.card : '#F1F5F9' }]}>
            <Pressable style={styles.attachBtn}>
              <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
            </Pressable>
            
            <TextInput
              style={[styles.textInput, { textAlign, color: theme.text }]}
              placeholder={isRTL ? 'اكتب رسالة...' : 'Type a message...'}
              placeholderTextColor={theme.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />

            <Pressable 
              style={[
                styles.sendBtn, 
                { backgroundColor: inputText.trim() ? theme.primary : 'transparent' }
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Ionicons 
                name={isRTL ? "send" : "send"} 
                size={20} 
                color={inputText.trim() ? (colorScheme === 'dark' ? '#000' : '#FFF') : theme.textSecondary} 
                style={isRTL ? { transform: [{ rotate: '180deg' }] } : undefined} 
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

