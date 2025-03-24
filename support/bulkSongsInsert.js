import fs from 'fs';
import csv from 'csv-parser';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const serviceAccount = './serviceAccountKey.json';
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const csvFilePath = './songs.csv';

// Function to insert data into Firestore
const insertData = async (data) => {
  const batch = db.batch();

  data.forEach((row) => {
    const docRef = db.collection('songs').doc(); // Automatically generate a unique ID for each document
    batch.set(docRef, row);
  });

  await batch.commit();
  console.log('Data inserted successfully');
};

// Read and parse the CSV file
const data = [];
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    // Map CSV data to Firestore document structure
    const formattedRow = {
      title: row.title,
      attributes: row.attributes ? row.attributes.split(',').map(attr => attr.trim()) : [],
      author_group: row.author_group || null,
      authors: row.authors ? row.authors.split(',').map(author => author.trim()) : [],
      year: row.year ? parseInt(row.year, 10) : null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'bulk_insert_script', // You can customize this field as needed
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'bulk_insert_script' // You can customize this field as needed
    };
    data.push(formattedRow);
  })
  .on('end', async () => {
    console.log('CSV file successfully processed');
    await insertData(data);
  });