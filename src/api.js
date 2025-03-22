import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const functions = getFunctions(getApp());

export const createSong = async (title) => {
  const auth = getAuth();
  
  // Log authentication state
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