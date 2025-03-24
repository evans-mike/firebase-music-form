import { db } from './firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Create a new song
export const createSong = async (songData) => {
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

// Create song occurrences for a specific song
export const createSongOccurrences = async (songId, occurrences) => {
  const batch = db.batch();
  const occurrencesCollection = collection(db, 'songs', songId, 'occurrences');
  occurrences.forEach(occurrence => {
    const occurrenceRef = doc(occurrencesCollection);
    batch.set(occurrenceRef, occurrence);
  });
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