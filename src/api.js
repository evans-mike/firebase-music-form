import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, writeBatch, doc } from 'firebase/firestore';

// Create a new song with uniqueness check
export const createSong = async (songData) => {
  // Check for duplicate song title
  const q = query(collection(db, 'songs'), where('title', '==', songData.title));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    throw new Error('A song with this title already exists.');
  }

  const songRef = await addDoc(collection(db, 'songs'), songData);
  return songRef.id;
};

// Get all songs
export const getSongs = async () => {
  const songsSnapshot = await getDocs(collection(db, 'songs'));
  return songsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Create song occurrences for a specific song with uniqueness check
export const createSongOccurrences = async (songId, occurrences) => {
  const batch = writeBatch(db);

  for (const occurrence of occurrences) {
    // Check for duplicate occurrence
    const q = query(
      collection(db, 'songs', songId, 'occurrences'),
      where('date', '==', occurrence.date),
      where('service', '==', occurrence.service)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new Error(`An occurrence for the date ${occurrence.date} and service ${occurrence.service} already exists.`);
    }

    const occurrenceRef = doc(collection(db, 'songs', songId, 'occurrences'));
    batch.set(occurrenceRef, occurrence);
  }

  await batch.commit();
};

// Helper function to format date to YYYY-MM-DD
export const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Helper function to validate occurrence data
export const validateOccurrence = (occurrence) => {
  if (!occurrence.songId) {
    throw new Error('Song ID is required');
  }
  if (!occurrence.date) {
    throw new Error('Date is required');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(occurrence.date)) {
    throw new Error('Date must be in YYYY-MM-DD format');
  }
  return true;
};