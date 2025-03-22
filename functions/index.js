const { https } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const { BigQuery } = require('@google-cloud/bigquery');
const cors = require('cors')({ origin: true });
require('dotenv').config();

admin.initializeApp();

const bigqueryConfig = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT 
};

if (process.env.NODE_ENV !== 'production') {
    bigqueryConfig.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
}

const bigquery = new BigQuery(bigqueryConfig);
const dataset = bigquery.dataset(process.env.BIGQUERY_DATASET_ID);

// Create new song endpoint
exports.createNewSong = https.onCall({
    minInstances: 0,
    maxInstances: 10,
    memory: "256MiB",
    cors: true,
    enforceAppCheck: false,
}, async (data, context) => {
    if (!context.auth) {
        throw new Error('Must be logged in to create songs');
    }

    if (!data.title) {
        throw new Error('Title is required');
    }

    try {
        const row = {
            id: require('uuid').v4(),
            title: data.title
        };

        // Insert into app_songs table
        const table = dataset.table('app_songs');
        await table.insert([row]);

        return {
            success: true,
            message: 'Song created successfully!',
            songId: row.id
        };
    } catch (error) {
        console.error('Error creating song:', error);
        throw new Error(`Failed to create song: ${error.message}`);
    }
});

// Submit occurrences endpoint
exports.submitOccurrences = https.onCall({
    minInstances: 0,
    maxInstances: 10,
    memory: "256MiB",
    cors: true,
    enforceAppCheck: false,
}, async (data, context) => {
    if (!context.auth) {
        throw new Error('Must be logged in to submit occurrences');
    }

    const rows = data.rows;
    if (!rows || !Array.isArray(rows)) {
        throw new Error('Invalid rows data');
    }

    try {
        // Format the rows for BigQuery
        const formattedRows = rows.map(row => ({
            id: require('uuid').v4(),
            song_id: row.songId,
            occurrence_date: row.date
        }));

        // Insert into app_song_occurrences table
        const table = dataset.table('app_song_occurrences');
        await table.insert(formattedRows);

        return { 
            success: true,
            message: 'Occurrences submitted successfully',
            count: formattedRows.length
        };
    } catch (error) {
        console.error('Error submitting occurrences:', error);
        throw new Error(`Failed to submit occurrences: ${error.message}`);
    }
});