import { initializeApp } from 'firebase/app';
import { getFirestore, collectionGroup, getDocs, doc, updateDoc, getDoc }  from 'firebase/firestore';

// Initialize Firebase app
const firebaseConfig = {
  apiKey: "AIzaSyAI3ubU7Cy0kZdqpTHlD7OM6dLdDJGjymk",
  authDomain: "music-form-4cfd6.firebaseapp.com",
  projectId: "music-form-4cfd6",
  storageBucket: "music-form-4cfd6.firebasestorage.app",
  messagingSenderId: "331873655169",
  appId: "1:331873655169:web:d3e4c7ebb042daa1573080"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setSongTitleForOccurrences() {
  try {
    // Query all occurrences
    const occurrencesQuery = collectionGroup(db, 'occurrences');
    const occurrencesSnapshot = await getDocs(occurrencesQuery);

    for (const occurrenceDoc of occurrencesSnapshot.docs) {
      const occurrenceData = occurrenceDoc.data();
      const songId = occurrenceDoc.ref.parent.parent.id;

      // Fetch the corresponding song document to get the title
      const songDocRef = doc(db, 'songs', songId);
      const songDoc = await getDoc(songDocRef);
      if (songDoc.exists()) {
        const songTitle = songDoc.data().title;

        // Update the occurrence document with the song title
        await updateDoc(occurrenceDoc.ref, { songTitle });
        console.log(`Updated occurrence ${occurrenceDoc.id} with song title: ${songTitle}`);
      } else {
        console.log(`Song document for song ID ${songId} does not exist`);
      }
    }

    console.log('Finished updating all occurrences with song titles');
  } catch (error) {
    console.error('Error setting song title for occurrences:', error);
  }
}

// Run the script
setSongTitleForOccurrences();