import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';
import { firebaseConfig } from 'src/service/firebase/config';

const swMessagingChannel = new BroadcastChannel('firebase-sw-messages');

initializeApp(firebaseConfig);

const messaging = getMessaging();

// This handles messages when the app is in the background
onBackgroundMessage(messaging, async (payload) => {
  console.log(
    '****** [Messaging SW] ********* Background message received',
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon:
      payload.notification.icon ?? 'https://eodhd.com/img/logos/US/PLTR.png',
  };

  // TODO - Figure why this doesnt work yet.
  try {
    console.log('****** [Messaging SW] ********* Showing notification', {
      notificationOptions,
      notificationTitle,
    });
    await self.registration.showNotification(
      notificationTitle,
      notificationOptions
    );
  } catch (e) {
    console.log(
      '****** [Messaging SW] ********* Failed to show notification',
      e
    );
  }

  // Transmit into foreground application if listening so app notification can actually be shown.
  swMessagingChannel.postMessage(payload);
});
