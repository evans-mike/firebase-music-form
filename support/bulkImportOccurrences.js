import fs from 'fs';
import csv from 'csv-parser';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const serviceAccount = './serviceAccountKey.json';
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const importOccurrences = async (csvFilePath) => {
  try {
    const occurrences = [];
    const songsMap = new Map();

    // Step 1: Read and parse the CSV file
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        occurrences.push(row);
      })
      .on('end', async () => {
        console.log(`CSV file successfully processed. ${occurrences.length} occurrences found.`);

        // Step 2: Fetch all songs and map them by title
        const songsSnapshot = await db.collection('songs').get();
        songsSnapshot.docs.forEach(doc => {
          const songData = doc.data();
          songsMap.set(songData.title, doc.id);
        });

        console.log(`Fetched ${songsMap.size} songs.`);

        // Step 3: Create occurrences subcollections within songs
        const batch = db.batch();

        occurrences.forEach(occurrence => {
          const songId = songsMap.get(occurrence.title);

          if (songId) {
            const occurrenceRef = db.collection('songs').doc(songId).collection('occurrences').doc();
            batch.set(occurrenceRef, {
              date: occurrence.date,
              service: occurrence.service,
              closer_flag: occurrence.closer_flag === 'true', // Convert to boolean
              createdAt: new Date(),
              createdBy: 'csv_import', // Indicate this was imported
              updatedAt: new Date(),
              updatedBy: 'csv_import' // Indicate this was imported
            });
          } else {
            console.error(`Song not found for title: ${occurrence.title}`);
          }
        });

        // Step 4: Commit batch
        await batch.commit();
        console.log('Import completed successfully.');
      });
  } catch (error) {
    console.error('Error importing occurrences:', error);
  }
};

// Replace 'path/to/your/occurrences.csv' with the actual path to your CSV file
importOccurrences('song_occurrences.csv');