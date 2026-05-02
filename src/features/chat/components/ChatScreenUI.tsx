import React, { useRef, useState } from 'react';
import {
  View, FlatList, TextInput, Pressable, KeyboardAvoidingView,
  Platform, SafeAreaView, ActivityIndicator, Image, Alert, Linking, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
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
    currentUser, currentUserProfile, messages, inputText, setInputText, loading,
    handleSend, handleSendImage, handleSendLocation, otherUser, t, isRTL
  } = useChat(chatId, otherId, bookTitle);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const flatListRef = useRef<FlatList>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const flexDirection = 'row';
  const textAlign = isRTL ? 'right' : 'left'; // Keep text alignment for Arabic text, but layout stays LTR

  const formatTime = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      handleSendImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.error'), isRTL ? 'نحتاج إذن الكاميرا لالتقاط الصور' : 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      handleSendImage(result.assets[0].uri);
    }
  };

  const shareLocation = async () => {
    Alert.alert(
      isRTL ? 'مشاركة الموقع الدقيق' : 'Share Exact Location',
      isRTL 
        ? 'سيتم إرسال موقعك الحالي بدقة لتحديد مكان تسليم الكتب. يرجى التأكد من تواجدك في النقطة التي تريد التقابل فيها.'
        : 'Your exact current location will be shared to determine the pickup point. Please ensure you are at the spot where you want to meet.',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: isRTL ? 'مشاركة الآن' : 'Share Now', 
          onPress: async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert(t('common.error'), isRTL ? 'نحتاج إذن الموقع لمشاركة موقعك' : 'Location permission is required');
              return;
            }

            const location = await Location.getCurrentPositionAsync({});
            handleSendLocation(location.coords.latitude, location.coords.longitude);
          }
        }
      ]
    );
  };

  const handleAttachPress = () => {
    Alert.alert(
      isRTL ? 'إضافة محتوى' : 'Add Content',
      isRTL ? 'اختر نوع المحتوى الذي تريد مشاركته' : 'Choose content type to share',
      [
        { text: isRTL ? 'الكاميرا' : 'Camera', onPress: takePhoto },
        { text: isRTL ? 'المعرض' : 'Gallery', onPress: pickImage },
        { text: isRTL ? 'الموقع' : 'Location', onPress: shareLocation },
        { text: t('common.cancel'), style: 'cancel' }
      ]
    );
  };

  const openMap = (lat: number, lon: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    Linking.openURL(url);
  };

  const navigateToProfile = (userId: string) => {
    router.push(`../public-profile/${userId}`);
  };

  const showChatInfo = () => {
    Alert.alert(
      isRTL ? 'معلومات الدردشة' : 'Chat Information',
      isRTL 
        ? '• حافظ على خصوصيتك ولا تشارك معلومات حساسة.\n• هذا الشات مخصص لتبادل الكتب والمصادر الأكاديمية فقط.\n• كن محترماً في تعاملك مع الآخرين.'
        : '• Keep your privacy and do not share sensitive information.\n• This chat is for book and academic resource exchange only.\n• Be respectful in your interactions.',
      [{ text: t('common.ok') }]
    );
  };

  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    const isMine = item.senderId === currentUser?.uid;
    // With inverted list, index + 1 is the older message. 
    // Show avatar if it's the first message of a group (topmost)
    const showAvatar = index === messages.length - 1 || messages[index + 1].senderId !== item.senderId;
    
    const avatarUri = isMine ? currentUserProfile?.photoURL : otherUser?.photoURL;
    
    return (
      <View style={[
        styles.messageWrapper, 
        { alignItems: isMine ? 'flex-end' : 'flex-start' }
      ]}>
        <View style={[
          styles.messageRow,
          { flexDirection: isMine ? 'row-reverse' : 'row' }
        ]}>
          <Pressable 
            onPress={() => navigateToProfile(isMine ? currentUser?.uid! : otherId)}
            style={styles.avatarMessage}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
            ) : (
              <Ionicons name="person" size={16} color={theme.textSecondary} />
            )}
          </Pressable>

          <View style={{ alignItems: isMine ? 'flex-end' : 'flex-start', flexShrink: 1 }}>
            <View style={[
              styles.bubble, 
              isMine ? styles.myBubble : styles.theirBubble,
              isMine 
                ? { backgroundColor: colorScheme === 'dark' ? theme.primary : '#001B39' } 
                : { backgroundColor: colorScheme === 'dark' ? theme.card : '#F1F5F9' }
            ]}>
              {item.imageUrl && (
                <Pressable onPress={() => setSelectedImage(item.imageUrl!)}>
                  <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
                </Pressable>
              )}
              {item.location && (
                <Pressable 
                  onPress={() => openMap(item.location!.latitude, item.location!.longitude)}
                  style={[styles.locationContainer, { backgroundColor: isMine ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                >
                  <Ionicons name="location" size={24} color={isMine ? (colorScheme === 'dark' ? '#000' : '#FFF') : theme.primary} />
                  <ThemedText style={[
                    styles.locationText, 
                    { color: isMine ? (colorScheme === 'dark' ? '#000' : '#FFF') : theme.text }
                  ]}>
                    {isRTL ? 'تمت مشاركة الموقع' : 'Location Shared'}
                  </ThemedText>
                  <View style={[styles.viewMapBtn, { backgroundColor: theme.primary }]}>
                    <ThemedText style={[styles.viewMapText, { color: colorScheme === 'dark' ? '#000' : '#FFF' }]}>
                      {isRTL ? 'عرض على الخريطة' : 'View on Map'}
                    </ThemedText>
                  </View>
                </Pressable>
              )}
              {item.text ? (
                <ThemedText style={[
                  styles.messageText, 
                  { 
                    color: isMine ? (colorScheme === 'dark' ? '#000' : '#FFF') : theme.text, 
                    textAlign 
                  }
                ]}>
                  {item.text}
                </ThemedText>
              ) : null}
            </View>
            
            <View style={[styles.metaRow, { flexDirection }]}>
              <ThemedText style={styles.timestamp}>{formatTime(item.timestamp)}</ThemedText>
              {isMine && (
                <Ionicons 
                  name="checkmark-done" 
                  size={14} 
                  color={item.isRead ? (colorScheme === 'dark' ? theme.primary : theme.primary) : '#94A3B8'} 
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
      <View style={[styles.header, { flexDirection: 'row', borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </Pressable>
        
        <Pressable onPress={() => navigateToProfile(otherId)} style={styles.headerInfoContainer}>
          <View style={styles.avatarSmall}>
            {otherUser?.photoURL ? (
              <Image source={{ uri: otherUser.photoURL }} style={styles.avatarImg} />
            ) : (
              <Ionicons name="person" size={24} color={theme.textSecondary} style={{ alignSelf: 'center', marginTop: 8 }} />
            )}
          </View>

          <View style={styles.headerInfo}>
            <ThemedText style={[styles.headerName, { textAlign: 'left', color: theme.text }]}>
              {otherUser?.fullName || otherUser?.displayName || otherUser?.name || otherName || 'Academic Contributor'}
            </ThemedText>
            <View style={[styles.headerSubRow, { flexDirection: 'row' }]}>
              <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
              <ThemedText style={[styles.headerSub, { textAlign: 'left', color: theme.textSecondary }]}>
                {isRTL ? 'نشط الآن' : 'Active now'}
              </ThemedText>
            </View>
          </View>
        </Pressable>

        <Pressable style={styles.backBtn} onPress={showChatInfo}>
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
            inverted
            ListFooterComponent={() => (
              <View style={styles.dateSeparator}>
                <View style={styles.dateBadge}>
                  <ThemedText style={styles.dateText}>{isRTL ? 'اليوم' : 'TODAY'}</ThemedText>
                </View>
              </View>
            )}
          />
        )}

        <View style={[styles.inputBarContainer, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
          <View style={[styles.inputBar, { backgroundColor: colorScheme === 'dark' ? theme.card : '#F1F5F9', flexDirection: 'row' }]}>
            <Pressable style={styles.attachBtn} onPress={handleAttachPress}>
              <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
            </Pressable>
            
            <TextInput
              style={[styles.textInput, { textAlign: 'left', color: theme.text }]}
              placeholder={isRTL ? 'اكتب رسالة...' : 'Type a message...'}
              placeholderTextColor={theme.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline={false}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
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
                name="send" 
                size={20} 
                color={inputText.trim() ? (colorScheme === 'dark' ? '#000' : '#FFF') : theme.textSecondary} 
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Full Screen Image Modal */}
      <Modal visible={!!selectedImage} transparent={true} animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <Pressable style={styles.fullImageOverlay} onPress={() => setSelectedImage(null)}>
          <Pressable style={styles.closeBtn} onPress={() => setSelectedImage(null)}>
            <Ionicons name="close" size={32} color="#FFF" />
          </Pressable>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
          )}
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

