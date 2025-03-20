const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { BigQuery } = require('@google-cloud/bigquery');
const cors = require('cors');
const express = require('express');
require('dotenv').config();

admin.initializeApp();

const app = express();

// Use CORS middleware
app.use(cors({ origin: true }));

// Initialize BigQuery
const bigqueryConfig = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT || 'music-form-4cfd6'
};

if (process.env.NODE_ENV !== 'production') {
    bigqueryConfig.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
}

const bigquery = new BigQuery(bigqueryConfig);

// Test connection endpoint
exports.testConnection = functions.https.onCall(async (data, context) => {
    return {
        message: 'Connection successful!',
        timestamp: new Date().toISOString()
    };
});

exports.createNewSong = functions.https.onCall(async (data, context) => {
    // Log the request
    console.log('CreateNewSong function called', {
        auth: context.auth ? 'authenticated' : 'not authenticated',
        data: data
    });

    // Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Must be logged in to create songs'
        );
    }

    try {
        // Test BigQuery connectivity
        const [datasets] = await bigquery.getDatasets();
        console.log('BigQuery connected, datasets:', datasets.map(d => d.id));

        const row = {
            id: require('uuid').v4(),
            title: data.title,
            created_by: context.auth.uid,
            created_at: new Date().toISOString()
        };

        // Insert the row
        await bigquery
            .dataset(process.env.BIGQUERY_DATASET_ID)
            .table('app_songs')
            .insert([row]);

        return { 
            success: true, 
            message: 'Song created successfully!',
            songId: row.id
        };
    } catch (error) {
        console.error('Error in createNewSong:', error);
        throw new functions.https.HttpsError(
            'internal',
            `Failed to create song: ${error.message}`
        );
    }
});