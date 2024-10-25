import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';
import { firebaseConfig } from 'src/service/firebase/config';

initializeApp(firebaseConfig);

const messaging = getMessaging();

// This handles messages when the app is in the background
onBackgroundMessage(messaging, (payload) => {
  console.log('Received background message ', payload);
  // You can customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
