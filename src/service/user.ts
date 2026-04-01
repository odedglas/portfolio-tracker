import { getCollections, firestoreAPI } from 'src/service/firebase/collections';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from 'app/shared/types';

const userCollection = () => getCollections().user;

const defaultSettings = () => ({
  notificationsEnabled: false,
});

const api = {
  get: async (userId: string) =>
    firestoreAPI.getDocument(userCollection(), userId),
  update: async (data: Partial<User>, userId?: string): Promise<User> => {
    if (!data.uid) {
      throw new Error('Cannot update/create a user without a valid uid');
    }

    if (!userId) {
      await firestoreAPI.addDocument(userCollection(), data);
    } else {
      await firestoreAPI.updateDocument(userId, userCollection(), data);
    }

    return await api.get(data.uid);
  },
  createAppUser: async (user: FirebaseUser) => {
    const existing = await api.get(user.uid).catch(() => null);

    if (existing) {
      return;
    }

    await api.update({ uid: user.uid, settings: defaultSettings() }, user.uid);
  },
};

export default api;
