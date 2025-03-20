const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { BigQuery } = require('@google-cloud/bigquery');
require('dotenv').config();

admin.initializeApp();

const bigqueryConfig = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT || 'music-form-4cfd6'
};

if (process.env.NODE_ENV !== 'production') {
    bigqueryConfig.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
}

const bigquery = new BigQuery(bigqueryConfig);

// Change to callable function
exports.testConnection = functions.https.onCall((data, context) => {
    return {
        message: 'Connection successful!',
        timestamp: new Date().toISOString(),
        userId: context.auth?.uid || 'not authenticated'
    };
});

exports.createNewSong = functions.https.onCall(async (data, context) => {
    // Log the request
    console.log('CreateNewSong function called', {
        auth: context.auth,
        data: data
    });

    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Must be logged in to create songs'
        );
    }

    if (!data.title) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Title is required'
        );
    }

    try {
        const row = {
            id: require('uuid').v4(),
            title: data.title,
            created_by: context.auth.uid,
            created_at: new Date().toISOString()
        };

        // For testing, just return success
        return { 
            success: true, 
            message: 'Song created successfully!',
            songId: row.id
        };
    } catch (error) {
        console.error('Error:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Failed to create song: ' + error.message
        );
    }
});