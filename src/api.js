import { db } from './firebase';

// Create a new song
export const createSong = async (songData) => {
  const songRef = await db.collection('songs').add(songData);
  return songRef.id;
};

// Get all songs
export const getSongs = async () => {
  console.log('Fetching songs from the database');
  const snapshot = await db.collection('songs').get();
  console.log('Songs fetched:', snapshot.docs.length);
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