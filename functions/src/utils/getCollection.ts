import { getFirestore } from 'firebase-admin/firestore';
import { AppCollectionsNames } from '../../../shared/types';

export const getCollection = async <Entity>(
  collection: AppCollectionsNames
) => {
  const collectionRef = getFirestore().collection(collection);
  const querySnapshot = await collectionRef.get();

  return querySnapshot.docs.map((doc) => doc.data() as Entity);
};

export const saveDocument = async <Entity extends object>(
  collection: AppCollectionsNames,
  entities: Entity[]
) => {
  const collectionRef = getFirestore().collection(collection);

  entities.forEach(async (entity) => {
    await collectionRef.add(entity);
  });
};
