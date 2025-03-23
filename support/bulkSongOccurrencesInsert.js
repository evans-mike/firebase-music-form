import fs from 'fs';
import csv from 'csv-parser';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const serviceAccount = './serviceAccountKey.json';
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const csvFilePath = './song_occurrences.csv';

// Function to insert data into Firestore
const insertData = async (data) => {
  const batch = db.batch();

  data.forEach((row) => {
    const docRef = db.collection('song_occurrences').doc(); // Automatically generate a unique ID for each document
    batch.set(docRef, row);
  });

  await batch.commit();
  console.log('Data inserted successfully');
};

// Read and parse the CSV file
const data = [];
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', async (row) => {
    // Map CSV data to Firestore document structure
    const songQuerySnapshot = await db.collection('songs').where('title', '==', row.title).get();
    if (!songQuerySnapshot.empty) {
      const songDoc = songQuerySnapshot.docs[0];
      const formattedRow = {
        songId: songDoc.id,
        date: new Date(row.date), // Convert date string to Date object
        service: row.service || 'AM',
        closerFlag: row.closer_flag === 'true',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: 'bulk_insert_script', // You can customize this field as needed
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: 'bulk_insert_script' // You can customize this field as needed
      };
      data.push(formattedRow);
    } else {
      console.error(`Song not found for title: ${row.title}`);
    }
  })
  .on('end', async () => {
    console.log('CSV file successfully processed');
    await insertData(data);
  });