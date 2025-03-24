import { db } from './firebase';
import { collectionGroup, collection, query, orderBy, limit, startAfter, getDocs, getDoc, doc, addDoc, deleteDoc, writeBatch, Timestamp } from 'firebase/firestore';

// Create a new song with uniqueness check
export const createSong = async (songData) => {
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

// Create song occurrences for a specific song with song title included
export const createSongOccurrences = async (songId, songTitle, occurrences) => {
  const batch = writeBatch(db);

  for (const occurrence of occurrences) {
    const occurrenceData = {
      ...occurrence,
      songTitle, // Include the song title in the occurrence document
      date: Timestamp.fromDate(new Date(occurrence.date)) // Ensure date is stored as Timestamp
    };

    const occurrenceRef = doc(collection(db, 'songs', songId, 'occurrences'));
    batch.set(occurrenceRef, occurrenceData);
  }

  await batch.commit();
};

// Get paginated occurrences with sorting
export const getOccurrences = async (lastVisible = null) => {
  let q = query(
    collectionGroup(db, 'occurrences'),
    orderBy('date', 'desc'),
    limit(25)
  );

  if (lastVisible) {
    q = query(
      collectionGroup(db, 'occurrences'),
      orderBy('date', 'desc'),
      startAfter(lastVisible),
      limit(25)
    );
  }

  const occurrencesSnapshot = await getDocs(q);
  const occurrences = occurrencesSnapshot.docs.map(doc => ({
    id: doc.id,
    songId: doc.ref.parent.parent.id,
    ...doc.data()
  }));

  // Update lastVisible for pagination
  const newLastVisible = occurrencesSnapshot.docs.length > 0 ? 
    occurrencesSnapshot.docs[occurrencesSnapshot.docs.length - 1] : null;

  return { occurrences, lastVisible: newLastVisible };
};

// Delete a song occurrence
export const deleteOccurrence = async (songId, occurrenceId) => {
  await deleteDoc(doc(db, 'songs', songId, 'occurrences', occurrenceId));
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