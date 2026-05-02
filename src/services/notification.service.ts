import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { ref, push, set, serverTimestamp, update, get } from 'firebase/database';
import { FIREBASE_DB } from '@/firebaseConfig';
import { Notification } from './notification.types';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false, // We use our custom Toast for in-app
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: false,
    shouldShowList: true,
  }),
});

export class NotificationService {
  /**
   * Request permissions and get Expo Push Token
   */
  static async registerForPushNotificationsAsync(): Promise<string | undefined> {
    if (Platform.OS === 'web') return undefined;

    let token;
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return undefined;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return undefined;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId) {
        console.log('Skipping push token fetch: No projectId found. This is expected in development without EAS.');
        return undefined;
      }

      token = (await Notifications.getExpoPushTokenAsync({
          projectId
      })).data;

      console.log('Push Token:', token);

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    } catch (error: any) {
      if (error.message?.includes('projectId')) {
        console.log('Push notification setup skipped: Project not yet registered with EAS.');
      } else {
        console.warn('Error setting up push notifications:', error);
      }
    }

    return token;
  }

  /**
   * Save push token to Firebase user profile
   */
  static async savePushToken(uid: string, token: string) {
    try {
      const userRef = ref(FIREBASE_DB, `Users/${uid}`);
      await update(userRef, {
        pushToken: token,
        notificationsEnabled: true,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  /**
   * Create an in-app notification in Firebase
   */
  static async createNotification(notification: Notification) {
    try {
      const notificationsRef = ref(FIREBASE_DB, `notifications/${notification.recipientId}`);
      const newNotifRef = push(notificationsRef);
      
      const notifData = {
        ...notification,
        id: newNotifRef.key,
        createdAt: serverTimestamp(),
        read: false,
      };

      await set(newNotifRef, notifData);

      // If recipient has a push token, send push notification
      const recipientRef = ref(FIREBASE_DB, `Users/${notification.recipientId}`);
      const snap = await get(recipientRef);
      if (snap.exists()) {
        const userData = snap.val();
        if (userData.pushToken && userData.notificationsEnabled !== false) {
            await this.sendPushNotification(userData.pushToken, notification.title, notification.body, {
                type: notification.type,
                chatId: notification.chatId,
                resourceId: notification.resourceId,
                actionTarget: notification.actionTarget
            });
        }
      }

      return newNotifRef.key;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  /**
   * Send push notification via Expo API
   */
  static async sendPushNotification(expoPushToken: string, title: string, body: string, data: any = {}) {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: title,
      body: body,
      data: data,
    };

    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(uid: string, notificationId: string) {
    try {
      const notifRef = ref(FIREBASE_DB, `notifications/${uid}/${notificationId}`);
      await update(notifRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(uid: string) {
    try {
      const notifsRef = ref(FIREBASE_DB, `notifications/${uid}`);
      const snap = await get(notifsRef);
      if (snap.exists()) {
        const updates: any = {};
        Object.keys(snap.val()).forEach(key => {
          updates[`${key}/read`] = true;
        });
        await update(notifsRef, updates);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }
}
