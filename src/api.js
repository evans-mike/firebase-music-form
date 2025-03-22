import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const functions = getFunctions(getApp());

export const createSong = async (title) => {
  const auth = getAuth();
  
  console.log('Auth State:', {
    isAuthenticated: !!auth.currentUser,
    uid: auth.currentUser?.uid,
    emailVerified: auth.currentUser?.emailVerified
  });

  try {
    console.log('Creating song with title:', title);
    
    const createSongFunction = httpsCallable(functions, 'createNewSong');
    console.log('Calling Cloud Function createNewSong...');
    
    const result = await createSongFunction({ title });
    console.log('Cloud Function Response:', result);
    
    return {
      data: {
        message: result.data.message,
        success: result.data.success,
        songId: result.data.songId
      }
    };
  } catch (error) {
    console.error('Error in createSong:', {
      code: error.code,
      message: error.message,
      details: error.details,
      stack: error.stack
    });
    
    if (error.code === 'functions/unauthenticated') {
      console.error('Authentication error - Current auth state:', {
        user: auth.currentUser ? {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          emailVerified: auth.currentUser.emailVerified
        } : 'No user'
      });
    }
    
    throw error;
  }
};

export const submitOccurrences = async (occurrences) => {
  const auth = getAuth();
  
  console.log('Auth State for submitOccurrences:', {
    isAuthenticated: !!auth.currentUser,
    uid: auth.currentUser?.uid,
    emailVerified: auth.currentUser?.emailVerified
  });

  try {
    console.log('Submitting occurrences:', occurrences);
    
    // Validate occurrences format
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
    
    const createOccurrencesFunction = httpsCallable(functions, 'createSongOccurrences');
    console.log('Calling Cloud Function createSongOccurrences...');
    
    const result = await createOccurrencesFunction({ occurrences });
    console.log('Cloud Function Response:', result);
    
    return {
      data: {
        message: result.data.message,
        success: result.data.success,
        count: result.data.count,
        occurrenceIds: result.data.occurrenceIds
      }
    };
  } catch (error) {
    console.error('Error in submitOccurrences:', {
      code: error.code,
      message: error.message,
      details: error.details,
      stack: error.stack,
      occurrences: occurrences
    });
    
    if (error.code === 'functions/unauthenticated') {
      console.error('Authentication error - Current auth state:', {
        user: auth.currentUser ? {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          emailVerified: auth.currentUser.emailVerified
        } : 'No user'
      });
    }
    
    throw error;
  }
};

// Example usage:
/*
await submitOccurrences([
  {
    songId: "song-uuid-1",
    date: "2025-03-22" // YYYY-MM-DD format
  },
  {
    songId: "song-uuid-2",
    date: "2025-03-22"
  }
]);
*/

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