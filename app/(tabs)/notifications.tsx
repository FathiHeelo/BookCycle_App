import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useI18n } from '@/hooks/use-i18n';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { router } from 'expo-router';
import { NotificationService } from '@/src/services/notification.service';
import { Notification } from '@/src/services/notification.types';

export default function NotificationsScreen() {
  const { theme } = useAppTheme();
  const themeColors = Colors[theme];
  const { t, isRTL } = useI18n();
  const currentUser = FIREBASE_AUTH.currentUser;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const notifsRef = ref(FIREBASE_DB, `notifications/${currentUser.uid}`);
    const notifsQuery = query(notifsRef, orderByChild('createdAt'));

    const unsubscribe = onValue(notifsQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: Notification[] = Object.keys(data)
          .map((key) => ({ ...data[key], id: key }))
          .sort((a, b) => b.createdAt - a.createdAt);
        setNotifications(list);
      } else {
        setNotifications([]);
      }
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const onRefresh = () => {
    setRefreshing(true);
  };

  const handleNotificationPress = async (item: Notification) => {
    if (!currentUser || !item.id) return;

    // Mark as read
    await NotificationService.markAsRead(currentUser.uid, item.id);

    // Navigate based on actionTarget
    if (item.actionTarget === 'chat' && item.chatId) {
      router.push({
        pathname: '/chat/[id]',
        params: { 
            id: item.chatId, 
            otherId: item.senderId,
            bookTitle: item.resourceTitle || ''
        }
      });
    } else if (item.actionTarget === 'resource_requests') {
      router.push('/(tabs)/my-requests');
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    await NotificationService.markAllAsRead(currentUser.uid);
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'resource_request':
        return <Ionicons name="book" size={24} color={themeColors.primary} />;
      case 'message':
        return <Ionicons name="chatbubble" size={24} color="#10B981" />;
      default:
        return <Ionicons name="notifications" size={24} color={themeColors.textSecondary} />;
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const date = item.createdAt ? new Date(item.createdAt) : new Date();
    const timeString = format(date, 'p', { locale: isRTL ? ar : enUS });
    const dateString = format(date, 'MMM d', { locale: isRTL ? ar : enUS });

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          { backgroundColor: themeColors.card },
          !item.read && styles.unreadItem,
          !item.read && { borderLeftColor: themeColors.primary }
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme === 'dark' ? '#1A1A1A' : '#F3F4F6' }]}>
          {renderIcon(item.type)}
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: themeColors.text }]}>{item.title}</Text>
            <Text style={[styles.time, { color: themeColors.textSecondary }]}>{timeString}</Text>
          </View>
          <Text 
            style={[styles.body, { color: themeColors.textSecondary }]} 
            numberOfLines={2}
          >
            {item.body}
          </Text>
          <Text style={[styles.date, { color: themeColors.textSecondary, opacity: 0.6 }]}>
            {dateString}
          </Text>
        </View>
        
        {!item.read && <View style={[styles.unreadDot, { backgroundColor: themeColors.primary }]} />}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          {isRTL ? 'التنبيهات' : 'Notifications'}
        </Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={[styles.markReadText, { color: themeColors.primary }]}>
              {isRTL ? 'تمييز الكل كمقروء' : 'Mark all as read'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: theme === 'dark' ? '#1A1A1A' : '#F3F4F6' }]}>
            <Ionicons name="notifications-off-outline" size={64} color={themeColors.textSecondary} />
          </View>
          <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
            {isRTL ? 'لا توجد تنبيهات' : 'No notifications yet'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
            {isRTL ? 'سنخطرك هنا عندما يحدث شيء جديد!' : "We'll notify you here when something new happens!"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.primary} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: Platform.OS === 'android' ? 30 : 0,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  markReadText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 0,
  },
  unreadItem: {
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    fontWeight: '500',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  date: {
    fontSize: 11,
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
