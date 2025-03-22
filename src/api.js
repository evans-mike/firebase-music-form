import { httpsCallable } from 'firebase/functions';
import { auth, functions } from './firebase';

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

  if (error.code === 'functions/unauthenticated') {
    throw new Error('You must be logged in to perform this action');
  }
  
  throw error;
};

export const createSong = async (title) => {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to create a song');
  }

  try {
    const createSongFunction = httpsCallable(functions, 'createNewSong');
    const result = await createSongFunction({ title });
    return result.data;
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
    
    // Ensure date is in correct format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(occurrence.date)) {
      throw new Error(`Invalid date format at index ${index}: ${occurrence.date}. Expected YYYY-MM-DD`);
    }
  });

  try {
    const createOccurrencesFunction = httpsCallable(functions, 'createSongOccurrences');
    const result = await createOccurrencesFunction({ occurrences });
    return result.data;
  } catch (error) {
    handleError(error, 'createSongOccurrences');
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