import { collection, getDocs, doc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { v4 as uuidv4 } from 'uuid'; // Import UUID library

const handleError = (error, functionName) => {
  console.error(`Error in ${functionName}:`, {
    code: error.code,
    message: error.message,
    details: error.details,
    authState: {
      isAuthenticated: !!auth.currentUser,
      uid: auth.currentUser?.uid,
      email: auth.currentUser?.email
    }
  });
  throw error;
};

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