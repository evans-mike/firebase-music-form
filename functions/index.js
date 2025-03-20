const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { BigQuery } = require('@google-cloud/bigquery');
const cors = require('cors');
require('dotenv').config();

admin.initializeApp();

// Initialize BigQuery with explicit credentials for local development
const bigqueryConfig = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT
};

// Only add keyFilename in development
if (process.env.NODE_ENV !== 'production') {
    bigqueryConfig.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
}

const bigquery = new BigQuery(bigqueryConfig);

// Create a CORS middleware
const corsHandler = cors({ 
    origin: true, // Allow all origins in development
    methods: ['POST', 'OPTIONS'],
    credentials: true
});

exports.createNewSong = functions.https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in to create songs');
    }

    console.log('Function called by user:', context.auth.uid);
    console.log('Creating song with title:', data.title);

    const title = data.title;
    const tableId = 'app_songs';
    
    try {
        // Test BigQuery connectivity first
        const [datasets] = await bigquery.getDatasets();
        console.log('Connected to BigQuery, available datasets:', 
            datasets.map(dataset => dataset.id));

        const row = {
            id: require('uuid').v4(),
            title: title,
            created_by: context.auth.uid,
            created_at: new Date().toISOString()
        };

        await bigquery.dataset(process.env.BIGQUERY_DATASET_ID)
            .table(tableId)
            .insert(row);
            
        return { success: true, message: 'Song created successfully!' };
    } catch (error) {
        console.error('BigQuery Error:', error);
        throw new functions.https.HttpsError('internal', 
            `BigQuery Error: ${error.message}`);
    }
});

// Add a test endpoint
exports.testConnection = functions.https.onCall(async (data, context) => {
    return { message: 'Connection successful!' };
});