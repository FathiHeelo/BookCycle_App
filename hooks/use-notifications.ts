import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { ref, onValue } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { NotificationService } from '@/src/services/notification.service';

export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [currentToast, setCurrentToast] = useState<{title: string, body: string, data: any} | null>(null);
  const user = FIREBASE_AUTH.currentUser;

  useEffect(() => {
    if (!user) return;

    // Listen for unread notifications
    const notifsRef = ref(FIREBASE_DB, `notifications/${user.uid}`);
    const unsubscribe = onValue(notifsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const unreadList = Object.values(data).filter((n: any) => !n.read);
        const newCount = unreadList.length;
        
        // If unread count increased, show our CUSTOM toast
        if (newCount > unreadCount) {
          const latestNotif: any = unreadList.sort((a: any, b: any) => b.createdAt - a.createdAt)[0];
          if (latestNotif) {
            setCurrentToast({
              title: latestNotif.title,
              body: latestNotif.body,
              data: latestNotif,
            });
            setToastVisible(true);
          }
        }
        
        setUnreadCount(newCount);
      } else {
        setUnreadCount(0);
      }
    });

    return () => unsubscribe();
  }, [user, unreadCount]);

  const hideToast = () => setToastVisible(false);

  const setupPushNotifications = async () => {
    if (!user) return;
    try {
      const token = await NotificationService.registerForPushNotificationsAsync();
      if (token) {
        await NotificationService.savePushToken(user.uid, token);
      }
    } catch (err) {
      console.warn('Notification setup handled:', err);
    }
  };

  return { unreadCount, setupPushNotifications, toastVisible, currentToast, hideToast };
};
