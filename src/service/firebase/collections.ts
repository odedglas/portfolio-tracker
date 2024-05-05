import {
  collection,
  CollectionReference,
  doc,
  getDocs,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { firestore } from './core';
import { Portfolio, AppCollections, AppCollectionsNames } from './types';

const createCollection = <CollectionName extends AppCollectionsNames>(
  collectionName: CollectionName
) =>
  collection(firestore, collectionName) as CollectionReference<
    AppCollections[CollectionName]
  >;

export const collections = {
  portfolio: createCollection('portfolios'),
} as const;

const firestoreAPI = {
  getAll: async <T>(collection: CollectionReference<T>) => {
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
};

export default {
  portfolio: {
    all: () => firestoreAPI.getAll(collections.portfolio),
    get: async (portfolioId: string) =>
      firestoreAPI.getDocument(collections.portfolio, portfolioId),
    update: async (portfolioId: string, data: Partial<Portfolio>) =>
      firestoreAPI.updateDocument(portfolioId, collections.portfolio, data),
  },
};
