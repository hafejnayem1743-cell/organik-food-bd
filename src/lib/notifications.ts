import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  writeBatch 
} from 'firebase/firestore';
import { Notification } from '../types';

export interface CreateNotificationInput {
  title: string;
  message: string;
  type: 'welcome' | 'product' | 'offer' | 'order' | 'payment' | 'user' | 'stock' | 'system' | 'banner';
  icon?: string;
  userId?: string; // specific user UID, or 'admin', or 'all'
  link?: string;
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Creates and permanently stores a notification in Firestore
 */
export const sendNotification = async (input: CreateNotificationInput): Promise<string> => {
  try {
    const notifRef = doc(collection(db, 'notifications'));
    const notifId = notifRef.id;

    const newNotification: Notification = {
      id: notifId,
      notificationId: notifId,
      title: input.title,
      message: input.message,
      type: input.type,
      icon: input.icon || getDefaultIconForType(input.type),
      userId: input.userId || 'all',
      link: input.link || '',
      priority: input.priority || 'normal',
      isRead: false,
      read: false,
      createdAt: new Date().toISOString()
    };

    await setDoc(notifRef, newNotification);

    // Browser Web Notification API trigger if granted
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
      try {
        new window.Notification(input.title, {
          body: input.message,
          icon: '/favicon.ico'
        });
      } catch {
        // Fallback or ignored in sandboxed frames
      }
    }

    return notifId;
  } catch (error) {
    console.error('Error creating notification in Firestore:', error);
    return '';
  }
};

/**
 * Marks a notification as read permanently in Firestore
 */
export const markNotificationReadInFirestore = async (notifId: string): Promise<void> => {
  if (!notifId) return;
  try {
    const notifRef = doc(db, 'notifications', notifId);
    await updateDoc(notifRef, {
      isRead: true,
      read: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

/**
 * Marks all notifications for a user or admin as read in Firestore
 */
export const markAllUserNotificationsReadInFirestore = async (userId: string, isUserAdmin: boolean = false): Promise<void> => {
  try {
    const notifsRef = collection(db, 'notifications');
    const snap = await getDocs(notifsRef);
    const batch = writeBatch(db);
    let count = 0;

    snap.docs.forEach(docSnap => {
      const data = docSnap.data();
      const belongsToTarget = isUserAdmin 
        ? data.userId === 'admin' || data.userId === 'all' 
        : data.userId === userId || data.userId === 'all';

      if (belongsToTarget && (!data.isRead || !data.read)) {
        batch.update(docSnap.ref, { isRead: true, read: true });
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

/**
 * Subscribe to real-time notifications for current user or admin
 */
export const subscribeToNotifications = (
  userId: string | null,
  isAdmin: boolean,
  callback: (notifs: Notification[]) => void
) => {
  try {
    const notifsRef = collection(db, 'notifications');

    return onSnapshot(notifsRef, (snapshot) => {
      const list: Notification[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Notification;
        const item: Notification = {
          ...data,
          id: docSnap.id,
          notificationId: data.notificationId || docSnap.id,
          isRead: Boolean(data.isRead || data.read),
          read: Boolean(data.isRead || data.read)
        };

        // Filter relevant notifications
        if (isAdmin) {
          if (item.userId === 'admin' || item.userId === 'all' || item.userId === userId) {
            list.push(item);
          }
        } else if (userId) {
          if (item.userId === userId || item.userId === 'all') {
            list.push(item);
          }
        } else {
          // Guest user receives broadcast 'all'
          if (item.userId === 'all') {
            list.push(item);
          }
        }
      });

      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    }, (error) => {
      console.warn('Error listening to notifications snapshot:', error);
    });
  } catch (err) {
    console.error('Firestore listener error:', err);
    return () => {};
  }
};

/**
 * Request Browser Push Permission if supported
 */
export const requestPushNotificationPermission = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (window.Notification.permission === 'granted') return true;
    if (window.Notification.permission !== 'denied') {
      const permission = await window.Notification.requestPermission();
      return permission === 'granted';
    }
  }
  return false;
};

const getDefaultIconForType = (type: string): string => {
  switch (type) {
    case 'welcome': return '🎉';
    case 'product': return '🆕';
    case 'offer': return '🔥';
    case 'order': return '📦';
    case 'payment': return '💳';
    case 'stock': return '⚠️';
    case 'user': return '👤';
    case 'banner': return '🖼️';
    default: return '🔔';
  }
};
