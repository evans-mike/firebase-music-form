import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export const createSong = async (title) => {
  const createSongFunction = httpsCallable(functions, 'createNewSong');
  return createSongFunction({ title });
};

export const submitOccurrences = async (occurrences) => {
  const submitOccurrencesFunction = httpsCallable(functions, 'submitOccurrences');
  return submitOccurrencesFunction({ rows: occurrences });
};