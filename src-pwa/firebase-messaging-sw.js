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

  // Transmit into foreground application if listening so app notification can actually be shown.
  swMessagingChannel.postMessage(payload);
});
