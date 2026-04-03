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

export const deleteDocumentsByPortfolioId = async (
  db: FirebaseFirestore.Firestore,
  collection: AppCollectionsNames,
  portfolioId: string
): Promise<number> => {
  const snap = await db
    .collection(collection)
    .where('portfolioId', '==', portfolioId)
    .get();

  if (snap.empty) return 0;

  const BATCH_SIZE = 499;
  const docs = snap.docs;
  let deleted = 0;

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    docs.slice(i, i + BATCH_SIZE).forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    deleted += Math.min(BATCH_SIZE, docs.length - i);
  }

  return deleted;
};
