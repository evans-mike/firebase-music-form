import { db } from './firebase';

export const getSongs = async () => {
  const snapshot = await db.collection('songs').get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};