import {
  collection,
  query,
  where,
  CollectionReference,
  Query,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { AppCollections, AppCollectionsNames } from 'app/shared/types';
import { firestore } from './core';
import { authentication } from './authentication';

const createCollection = <CollectionName extends AppCollectionsNames>(
  collectionName: CollectionName
) =>
  collection(firestore, collectionName) as CollectionReference<
    AppCollections[CollectionName]
  >;

/**
 * Returns available application collections
 */
export const getCollections = () => ({
  portfolio: createCollection('portfolios'),
  portfolioHistory: createCollection('portfolioHistory'),
  transaction: createCollection('transactions'),
  holding: createCollection('holdings'),
  user: createCollection('users'),
  notifications: createCollection('notifications'),
  alerts: createCollection('alerts'),
  insights: createCollection('insights'),
});

/**
 * List of pre-defined queries to fetch upon available applicative collections.
 */
export const queries = {
  listUserPortfolios: async () => {
    const portfoliosCollection = getCollections().portfolio;
    const portfoliosQuery = query(
      portfoliosCollection,
      where('owner', '==', authentication.currentUser.uid)
    );

    const portfolios = await firestoreAPI.getAll(portfoliosQuery);

    return portfolios.sort((p1, p2) => (p1.createdAt < p2.createdAt ? -1 : 1));
  },

  listPortfolioTransactions: async (portfolioId: string) => {
    const transactionsCollection = getCollections().transaction;

    const transactionsQuery = query(
      transactionsCollection,
      where('portfolioId', '==', portfolioId)
    );

    const transactions = await firestoreAPI.getAll(transactionsQuery);

    return transactions.sort((t1, t2) => (t1.date < t2.date ? 1 : -1));
  },
  getPortfolioHoldings: async (portfolioId: string) => {
    const holdingsCollection = getCollections().holding;

    const holdingsQuery = query(
      holdingsCollection,
      where('portfolioId', '==', portfolioId)
    );

    return firestoreAPI.getAll(holdingsQuery);
  },
  listPortfoliosHoldings: async (portfoliosIds: string[]) => {
    if (!portfoliosIds.length) {
      return [];
    }

    const holdingsCollection = getCollections().holding;

    const holdingsQuery = query(
      holdingsCollection,
      where('portfolioId', 'in', portfoliosIds)
    );

    return firestoreAPI.getAll(holdingsQuery);
  },
  listPortfolioInsights: async (portfoliosIds: string[]) => {
    if (!portfoliosIds.length) {
      return [];
    }

    const insightsCollection = getCollections().insights;

    const insightsQuery = query(
      insightsCollection,
      where('portfolioId', 'in', portfoliosIds)
    );

    return await firestoreAPI.getAll(insightsQuery);
  },
  getPortfolioHistory: async (portfolioId: string) => {
    const historyCollection = getCollections().portfolioHistory;

    const portfolioHistoryQuery = query(
      historyCollection,
      where('portfolioId', '==', portfolioId)
    );

    return firestoreAPI.getAll(portfolioHistoryQuery);
  },
  getUserNotifications: async (ownerId: string) => {
    const notificationsCollection = getCollections().notifications;

    const notificationsQuery = query(
      notificationsCollection,
      where('owner', '==', ownerId)
    );

    return firestoreAPI.getAll(notificationsQuery);
  },
  getUserAlerts: async (ownerId: string) => {
    const alertsCollection = getCollections().alerts;

    const alertsQuery = query(alertsCollection, where('owner', '==', ownerId));

    return firestoreAPI.getAll(alertsQuery);
  },
};

/**
 * The Firestore API for document manipulations.
 */
export const firestoreAPI = {
  getAll: async <T>(collection: CollectionReference<T> | Query<T>) => {
    const { docs } = await getDocs(collection);

    return docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  },
  getDocument: async <T>(
    collection: CollectionReference<T>,
    ...segments: string[]
  ) => {
    const docReference = doc(collection, ...segments);

    const document = await getDoc(docReference);

    if (document.exists()) {
      return { ...document.data(), id: document.id };
    }

    throw new Error(`Entity not found ${segments.join('-')}`);
  },
  updateDocument: async <T>(
    identifier: string,
    collection: CollectionReference<T>,
    data: Partial<T>
  ) => {
    const docReference = doc(collection, identifier);

    await setDoc(docReference, { ...data }, { merge: true });
  },
  addDocument: <T>(collection: CollectionReference<T>, data: T) => {
    return addDoc(collection, data);
  },
  deleteDocument: async <T>(
    identifier: string,
    collection: CollectionReference<T>
  ) => {
    const docReference = doc(collection, identifier);

    await deleteDoc(docReference);
  },
};
