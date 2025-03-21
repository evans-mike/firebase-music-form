import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export const createSong = async (title) => {
  try {
    const createSongFunction = httpsCallable(functions, 'createNewSong');
    const result = await createSongFunction({ title });
    return result.data;
  } catch (error) {
    console.error('Error creating song:', error);
    throw error;
  }
};

export const submitOccurrences = async (occurrences) => {
  try {
    const submitOccurrencesFunction = httpsCallable(functions, 'submitOccurrences');
    const result = await submitOccurrencesFunction({ rows: occurrences });
    return result.data;
  } catch (error) {
    console.error('Error submitting occurrences:', error);
    throw error;
  }
};