import { collection, getDocs, addDoc, doc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
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

export const createSong = async (title, attributes = '', authorGroup = '', authors = '', year = null) => {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to create a song');
  }

  try {
    const songId = uuidv4(); // Generate a unique ID for the song
    const songData = {
      title: title.trim(),
      attributes: attributes ? attributes.split(',').map(attr => attr.trim()) : [],
      author_group: authorGroup.trim() || "",
      authors: authors.trim() || "",
      year: year ? parseInt(year, 10) : "",
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser.uid,
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser.uid
    };

    await setDoc(doc(db, 'songs', songId), songData); // Use setDoc with a defined ID
    
    return {
      success: true,
      message: 'Song created successfully!',
      songId: songId,
      song: { id: songId, ...songData }
    };
  } catch (error) {
    handleError(error, 'createSong');
  }
};

export const createSongOccurrences = async (occurrences) => {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to create song occurrences');
  }

  // Validate occurrences
  if (!Array.isArray(occurrences)) {
    throw new Error('Occurrences must be an array');
  }

  // Validate each occurrence
  occurrences.forEach((occurrence, index) => {
    if (!occurrence.songId || !occurrence.date) {
      throw new Error(`Invalid occurrence at index ${index}: missing songId or date`);
    }
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(occurrence.date)) {
      throw new Error(`Invalid date format at index ${index}: ${occurrence.date}. Expected YYYY-MM-DD`);
    }
  });

  try {
    const batch = writeBatch(db);
    const timestamp = serverTimestamp();

    // Create references for all occurrences
    const occurrenceRefs = occurrences.map(occurrence => {
      const occurrenceRef = collection(db, 'song_occurrences');
      const data = {
        songId: occurrence.songId,
        date: occurrence.date,
        service: occurrence.service || 'AM',
        closerFlag: occurrence.closer_flag || false,
        createdAt: timestamp,
        createdBy: auth.currentUser.uid,
        updatedAt: timestamp,
        updatedBy: auth.currentUser.uid
      };
      
      const docRef = addDoc(occurrenceRef, data);
      return { ref: docRef, data };
    });

    // Commit the batch
    await batch.commit();

    return {
      success: true,
      message: 'Song occurrences created successfully!',
      count: occurrenceRefs.length,
      occurrences: occurrenceRefs.map(ref => ({ id: ref.id, ...ref.data }))
    };
  } catch (error) {
    handleError(error, 'createSongOccurrences');
  }
};

export const getSongs = async () => {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to get songs');
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'songs'));
    if (querySnapshot.empty) {
      // If the collection doesn't exist, create it with a default document
      const defaultSong = {
        title: 'Default Song',
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser.uid
      };
      await addDoc(collection(db, 'songs'), defaultSong);
    }
    const songs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return songs;
  } catch (error) {
    handleError(error, 'getSongs');
  }
};

export const getSongTitles = async () => {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to get song titles');
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'songs'));
    const songs = querySnapshot.docs.map(doc => ({ id: doc.id, title: doc.data().title }));
    return songs;
  } catch (error) {
    handleError(error, 'getSongTitles');
  }
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