const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { BigQuery } = require('@google-cloud/bigquery');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

admin.initializeApp();
const bigquery = new BigQuery();
const datasetId = process.env.BIGQUERY_DATASET_ID;

exports.createNewSong = functions.https.onCall(async (data, context) => {
    const title = data.title;
    const tableId = 'songs';
    const row = { _id: uuidv4(), title: title };

    try {
        await bigquery.dataset(datasetId).table(tableId).insert(row);
        return { success: true, message: 'Song created successfully!' };
    } catch (error) {
        return { success: false, message: `Error: ${error.message}` };
    }
});

exports.submitOccurrences = functions.https.onCall(async (data, context) => {
    const rows = data.rows;
    const datasetId = 'your_dataset_id';
    const tableId = 'song_occurrences';

    const formattedRows = rows.map(row => ({
        _id: uuidv4(),
        ...row
    }));

    try {
        await bigquery.dataset(datasetId).table(tableId).insert(formattedRows);
        return { success: true, message: 'Occurrences submitted successfully!' };
    } catch (error) {
        return { success: false, message: `Error: ${error.message}` };
    }
});