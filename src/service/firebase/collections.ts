import {
  collection,
  CollectionReference,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { firestore } from './core';
import { AppCollections, AppCollectionsNames } from './types';

const createCollection = <CollectionName extends AppCollectionsNames>(
  collectionName: CollectionName
) =>
  collection(firestore, collectionName) as CollectionReference<
    AppCollections[CollectionName]
  >;

export const collections = {
  portfolio: createCollection('portfolios'),
} as const;

export const firestoreAPI = {
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
  deleteDocument: async <T>(
    identifier: string,
    collection: CollectionReference<T>
  ) => {
    const docReference = doc(collection, identifier);

    await deleteDoc(docReference);
  },
};
