import {
  firestoreAPI,
  getCollections,
  queries,
} from 'src/service/firebase/collections';

const notificationCollection = () => getCollections().notifications;

const api = {
  list: queries.getUserNotifications,
  markRead: (notificationId: string, unread: boolean) => {
    return firestoreAPI.updateDocument(
      notificationId,
      notificationCollection(),
      { unread }
    );
  },
};

export default api;
