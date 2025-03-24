import { initializeApp } from 'firebase/app';
import { getFirestore, collectionGroup, getDocs, doc, updateDoc, getDoc }  from 'firebase/firestore';

// Initialize Firebase app
const firebaseConfig = {
  ...
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