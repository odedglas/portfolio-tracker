import { getFirestore } from 'firebase-admin/firestore';
import { AppCollectionsNames } from '../../../shared/types';

export const getCollection = async <Entity>(
  collection: AppCollectionsNames
) => {
  const collectionRef = getFirestore().collection(collection);
  const querySnapshot = await collectionRef.get();

  return querySnapshot.docs.map(
    (doc) =>
      ({
        ...doc.data(),
        id: doc.id,
      } as Entity)
  );
};

export const saveDocuments = async <Entity extends object>(
  collection: AppCollectionsNames,
  entities: Entity[]
) => {
  const collectionRef = getFirestore().collection(collection);

  entities.forEach(async (entity) => {
    await collectionRef.add(entity);
  });
};

export const updateDocuments = async <Entity extends { id: string }>(
  collection: AppCollectionsNames,
  entities: Entity[]
) => {
  const collectionRef = getFirestore().collection(collection);

  entities.forEach(async (entity) => {
    await collectionRef.doc(entity.id).update(entity);
  });
};
