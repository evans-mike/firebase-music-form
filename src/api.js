import { db } from './firebase';

// Create a new song
export const createSong = async (songData) => {
  const songRef = await db.collection('songs').add(songData);
  return songRef.id;
};

// Get all songs
export const getSongs = async () => {
  const snapshot = await db.collection('songs').get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Create song occurrences for a specific song
export const createSongOccurrences = async (songId, occurrences) => {
  const batch = db.batch();
  occurrences.forEach(occurrence => {
    const occurrenceRef = db.collection('songs').doc(songId).collection('occurrences').doc();
    batch.set(occurrenceRef, occurrence);
  });
  await batch.commit();
};