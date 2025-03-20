const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { BigQuery } = require('@google-cloud/bigquery');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
require('dotenv').config();

admin.initializeApp();
const bigquery = new BigQuery();
const datasetId = process.env.BIGQUERY_DATASET_ID;

// Create a CORS middleware
const corsHandler = cors({ 
    origin: true, // Allow all origins in development
    methods: ['POST'], // Only allow POST method
    credentials: true 
});

exports.createNewSong = functions.https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in to create songs');
    }

    const title = data.title;
    const tableId = 'app_songs';
    const row = { 
        id: uuidv4(), 
        title: title,
        created_by: context.auth.uid,
        created_at: new Date().toISOString()
    };

    try {
        await bigquery.dataset(datasetId).table(tableId).insert(row);
        return { success: true, message: 'Song created successfully!' };
    } catch (error) {
        console.error('Error creating song:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

exports.submitOccurrences = functions.https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in to submit occurrences');
    }

    const rows = data.rows;
    const tableId = 'app_song_occurrences';

    const formattedRows = rows.map(row => ({
        id: uuidv4(),
        ...row,
        submitted_by: context.auth.uid,
        submitted_at: new Date().toISOString()
    }));

    try {
        await bigquery.dataset(datasetId).table(tableId).insert(formattedRows);
        return { success: true, message: 'Occurrences submitted successfully!' };
    } catch (error) {
        console.error('Error submitting occurrences:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});